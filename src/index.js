require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, Collection } = require('discord.js');
const { fetchWorldCupData } = require('./api/espn');
const { createMatchEmbed, createScheduleEmbed } = require('./utils/embeds');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// --- Command Definitions ---
const commands = [
    new SlashCommandBuilder()
        .setName('schedule')
        .setDescription('View upcoming World Cup matches'),
    new SlashCommandBuilder()
        .setName('results')
        .setDescription('View recent World Cup match results'),
    new SlashCommandBuilder()
        .setName('live')
        .setDescription('Get current live scores'),
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
        console.error(error);
    }
}

// --- Interaction Handling ---
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;
    const data = await fetchWorldCupData();

    if (!data) {
        return interaction.reply({ content: 'Failed to fetch data from ESPN. Please try again later.', ephemeral: true });
    }

    if (commandName === 'schedule') {
        const upcoming = data.events.filter(e => e.status.type.state === 'pre');
        if (upcoming.length === 0) return interaction.reply('No upcoming matches found.');
        
        const embed = createScheduleEmbed(upcoming);
        await interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'results') {
        const finished = data.events.filter(e => e.status.type.state === 'post').slice(0, 5);
        if (finished.length === 0) return interaction.reply('No recent results found.');
        
        const embeds = finished.map(event => createMatchEmbed(event));
        await interaction.reply({ embeds });
    }

    if (commandName === 'live') {
        const live = data.events.filter(e => e.status.type.state === 'in');
        if (live.length === 0) return interaction.reply('There are no matches currently live.');
        
        const embeds = live.map(event => createMatchEmbed(event));
        await interaction.reply({ embeds });
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

    // Discord snowflake IDs consist only of digits
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
        if (!data) return;

        const liveMatches = data.events.filter(e => e.status.type.state === 'in');

        for (const match of liveMatches) {
            const matchId = match.id;
            const scoreKey = `${match.competitions[0].competitors[0].score}-${match.competitions[0].competitors[1].score}`;
            
            // Only post if the score has changed
            if (lastUpdate.get(matchId) !== scoreKey) {
                const embed = createMatchEmbed(match);
                embed.setTitle(`🔴 LIVE UPDATE: ${embed.data.title}`);
                await channel.send({ embeds: [embed] });
                lastUpdate.set(matchId, scoreKey);
            }
        }

        // Clean up finished matches from the tracker
        const finishedMatches = data.events.filter(e => e.status.type.state === 'post');
        for (const match of finishedMatches) {
            if (lastUpdate.has(match.id)) {
                const embed = createMatchEmbed(match);
                embed.setTitle(`🏁 MATCH FINISHED: ${embed.data.title}`);
                await channel.send({ embeds: [embed] });
                lastUpdate.delete(match.id);
            }
        }
        
        // Reset warning flag if everything succeeded
        hasWarnedInvalidChannel = false;
    } catch (error) {
        if (!hasWarnedInvalidChannel) {
            console.error('Error fetching/sending to live channel:', error.message || error);
            hasWarnedInvalidChannel = true; // Prevent spamming console logs on every tick
        }
    }
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    registerCommands();
    
    // Start tracking loop
    setInterval(trackLiveScores, parseInt(process.env.UPDATE_INTERVAL) || 60000);
});

client.login(process.env.DISCORD_TOKEN);
