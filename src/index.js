require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const { DateTime } = require('luxon');
const { fetchWorldCupData } = require('./api/espn');
const { fetchWorldCupOdds } = require('./api/odds');
const { createMatchEmbed, createScheduleEmbed, createOddsEmbed, translateTeam } = require('./utils/embeds');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const tz = process.env.TIMEZONE || 'UTC';

// --- Command Definitions ---
const commands = [
    new SlashCommandBuilder()
        .setName('schedule')
        .setDescription('Xem lịch thi đấu World Cup sắp tới'),
    new SlashCommandBuilder()
        .setName('results')
        .setDescription('Xem kết quả các trận đấu World Cup gần đây'),
    new SlashCommandBuilder()
        .setName('live')
        .setDescription('Xem tỷ số trực tiếp các trận đang diễn ra'),
    new SlashCommandBuilder()
        .setName('odds')
        .setDescription('Xem tỷ lệ kèo các trận đấu World Cup sắp tới'),
].map(command => command.toJSON());

// --- Slash Command Registration ---
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

async function registerCommands() {
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
}

// --- Odds API Caching ---
let oddsCache = null;
let oddsCacheTime = 0;
const ODDS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// --- Interaction Handling ---
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    try {
        if (commandName === 'schedule') {
            await interaction.deferReply();
            
            const now = DateTime.now().setZone(tz);
            const startDateStr = now.toFormat('yyyyMMdd');
            const endDateStr = now.plus({ days: 7 }).toFormat('yyyyMMdd');
            
            const data = await fetchWorldCupData(`${startDateStr}-${endDateStr}`);
            if (!data || !data.events) {
                return interaction.editReply('Không thể tải lịch thi đấu từ ESPN. Vui lòng thử lại sau.');
            }

            const upcoming = data.events.filter(e => e.status.type.state === 'pre');
            if (upcoming.length === 0) {
                return interaction.editReply('Không tìm thấy trận đấu sắp tới nào trong 7 ngày tới.');
            }
            
            const { embed, banner } = createScheduleEmbed(upcoming, tz);
            await interaction.editReply({ embeds: [embed], files: [banner] });
        }

        if (commandName === 'results') {
            await interaction.deferReply();
            
            const now = DateTime.now().setZone(tz);
            const startDateStr = now.minus({ days: 7 }).toFormat('yyyyMMdd');
            const endDateStr = now.toFormat('yyyyMMdd');
            
            const data = await fetchWorldCupData(`${startDateStr}-${endDateStr}`);
            if (!data || !data.events) {
                return interaction.editReply('Không thể tải kết quả từ ESPN. Vui lòng thử lại sau.');
            }

            const finished = data.events.filter(e => e.status.type.state === 'post');
            if (finished.length === 0) {
                return interaction.editReply('Không tìm thấy kết quả trận đấu nào trong 7 ngày qua.');
            }
            
            // Sort by date descending (most recent first)
            finished.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            const recentFinished = finished.slice(0, 5);
            const embeds = recentFinished.map(event => createMatchEmbed(event, tz));
            await interaction.editReply({ embeds });
        }

        if (commandName === 'live') {
            await interaction.deferReply();
            
            const data = await fetchWorldCupData();
            if (!data || !data.events) {
                return interaction.editReply('Không thể tải tỷ số trực tiếp từ ESPN. Vui lòng thử lại sau.');
            }

            const live = data.events.filter(e => e.status.type.state === 'in');
            if (live.length === 0) {
                return interaction.editReply('Hiện tại không có trận đấu nào đang diễn ra trực tiếp.');
            }
            
            const embeds = live.map(event => createMatchEmbed(event, tz));
            await interaction.editReply({ embeds });
        }

        if (commandName === 'odds') {
            await interaction.deferReply();
            
            const apiKey = process.env.THE_ODDS_API_KEY;
            if (!apiKey || apiKey === 'your_odds_api_key_here') {
                return interaction.editReply('❌ Khóa API The Odds chưa được cấu hình. Vui lòng thiết lập `THE_ODDS_API_KEY` hợp lệ trong tệp `.env`.');
            }
            
            const nowTime = Date.now();
            let oddsData = null;
            
            // 5-minute Cache Check
            if (oddsCache && (nowTime - oddsCacheTime < ODDS_CACHE_DURATION)) {
                console.log('Serving odds data from cache.');
                oddsData = oddsCache;
            } else {
                try {
                    oddsData = await fetchWorldCupOdds(apiKey, process.env.THE_ODDS_REGION || 'us');
                    oddsCache = oddsData;
                    oddsCacheTime = nowTime;
                } catch (err) {
                    return interaction.editReply(`❌ Không thể tải tỷ lệ kèo: ${err.message}`);
                }
            }
            
            if (!oddsData || oddsData.length === 0) {
                return interaction.editReply('Không tìm thấy trận đấu sắp tới nào có sẵn tỷ lệ kèo.');
            }
            
            // Show odds for the next 3 upcoming matches to prevent character/embed limit issues
            const upcomingOdds = oddsData.slice(0, 3);
            const embeds = upcomingOdds.map(event => createOddsEmbed(event, tz));
            await interaction.editReply({ embeds });
        }
    } catch (error) {
        console.error(`Error handling command /${commandName}:`, error);
        if (interaction.deferred) {
            await interaction.editReply('Đã xảy ra lỗi khi thực hiện lệnh này.');
        } else {
            await interaction.reply({ content: 'Đã xảy ra lỗi khi thực hiện lệnh này.', ephemeral: true });
        }
    }
});

// --- Livescore Tracking Loop ---
let lastUpdate = new Map(); // To prevent spamming the same score updates
let hasWarnedInvalidChannel = false;

async function trackLiveScores() {
    const channelId = process.env.LIVE_CHANNEL_ID;
    if (!channelId) {
        if (!hasWarnedInvalidChannel) {
            console.warn('Warning: LIVE_CHANNEL_ID is not configured in .env. Live tracking is disabled.');
            hasWarnedInvalidChannel = true;
        }
        return;
    }

    if (!/^\d+$/.test(channelId)) {
        if (!hasWarnedInvalidChannel) {
            console.warn(`Warning: LIVE_CHANNEL_ID "${channelId}" is not a valid Discord channel ID (snowflake). Live tracking is disabled.`);
            hasWarnedInvalidChannel = true;
        }
        return;
    }

    try {
        const channel = await client.channels.fetch(channelId);
        if (!channel) {
            if (!hasWarnedInvalidChannel) {
                console.warn(`Warning: Channel with ID ${channelId} not found.`);
                hasWarnedInvalidChannel = true;
            }
            return;
        }

        const data = await fetchWorldCupData();
        if (!data || !data.events) return;

        const liveMatches = data.events.filter(e => e.status.type.state === 'in');

        for (const match of liveMatches) {
            const matchId = match.id;
            const scoreKey = `${match.competitions[0].competitors[0].score}-${match.competitions[0].competitors[1].score}`;
            
            // Only post if the score has changed
            if (lastUpdate.get(matchId) !== scoreKey) {
                const isGoal = lastUpdate.has(matchId);
                const embed = createMatchEmbed(match, tz);
                
                const teamName1 = translateTeam(match.competitions[0].competitors[0].team.displayName);
                const teamName2 = translateTeam(match.competitions[0].competitors[1].team.displayName);

                if (isGoal) {
                    embed.setTitle(`⚽ CẬP NHẬT BÀN THẮNG: ${teamName1} vs ${teamName2}`);
                } else {
                    embed.setTitle(`🔴 TRẬN ĐẤU BẮT ĐẦU: ${teamName1} vs ${teamName2}`);
                }

                await channel.send({ embeds: [embed] });
                lastUpdate.set(matchId, scoreKey);
            }
        }

        // Clean up finished matches from the tracker
        const finishedMatches = data.events.filter(e => e.status.type.state === 'post');
        for (const match of finishedMatches) {
            if (lastUpdate.has(match.id)) {
                const embed = createMatchEmbed(match, tz);
                const teamName1 = translateTeam(match.competitions[0].competitors[0].team.displayName);
                const teamName2 = translateTeam(match.competitions[0].competitors[1].team.displayName);
                embed.setTitle(`🏁 TRẬN ĐẤU KẾT THÚC: ${teamName1} vs ${teamName2}`);
                await channel.send({ embeds: [embed] });
                lastUpdate.delete(match.id);
            }
        }
        
        hasWarnedInvalidChannel = false;
    } catch (error) {
        if (!hasWarnedInvalidChannel) {
            console.error('Error fetching/sending to live channel:', error.message || error);
            hasWarnedInvalidChannel = true;
        }
    }
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    registerCommands();
    
    // Start tracking loop
    setInterval(trackLiveScores, parseInt(process.env.UPDATE_INTERVAL) || 60000);
    // Run once immediately on start
    trackLiveScores();
});

client.login(process.env.DISCORD_TOKEN);
