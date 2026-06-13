const { EmbedBuilder } = require('discord.js');
const { DateTime } = require('luxon');

/**
 * Creates a beautiful embed for a match or list of matches.
 * @param {Object} event - The ESPN match event object.
 */
function createMatchEmbed(event) {
    const competition = event.competitions[0];
    const status = event.status.type.shortDetail;
    const isLive = event.status.type.state === 'in';
    const isFinished = event.status.type.state === 'post';
    
    const team1 = competition.competitors[0];
    const team2 = competition.competitors[1];

    const embed = new EmbedBuilder()
        .setTitle(`${team1.team.displayName} vs ${team2.team.displayName}`)
        .setURL(event.links[0].href)
        .setColor(isLive ? 0xFF0000 : (isFinished ? 0x808080 : 0x00FF00))
        .setThumbnail(team1.team.logo)
        .setTimestamp(new Date(competition.date));

    let scoreText = 'Not Started';
    if (isLive || isFinished) {
        scoreText = `**${team1.score} - ${team2.score}**`;
    }

    embed.addFields(
        { name: 'Status', value: status, inline: true },
        { name: 'Score', value: scoreText, inline: true },
        { name: 'Venue', value: competition.venue?.fullName || 'TBD', inline: true }
    );
    
    return embed;
}

/**
 * Formats a list of upcoming matches.
 */
function createScheduleEmbed(events) {
    const embed = new EmbedBuilder()
        .setTitle('📅 FIFA World Cup Schedule')
        .setColor(0x0099FF)
        .setDescription('Upcoming matches and group stages.')
        .setTimestamp();

    const tz = process.env.TIMEZONE || 'UTC';

    events.slice(0, 10).forEach(event => {
        const date = DateTime.fromISO(event.date).setZone(tz).toFormat('LLL dd, HH:mm');
        const team1 = event.competitions[0].competitors[0].team.displayName;
        const team2 = event.competitions[0].competitors[1].team.displayName;
        embed.addFields({ name: `${date} (${tz})`, value: `${team1} vs ${team2}` });
    });

    return embed;
}

module.exports = { createMatchEmbed, createScheduleEmbed };
