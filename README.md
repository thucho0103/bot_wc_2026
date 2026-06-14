# FIFA World Cup Discord Bot

A production-ready Discord bot to track FIFA World Cup matches, live scores, and results using the ESPN API.

## Features

- 📅 **/schedule**: View upcoming matches for the next 7 days, localized to your configured timezone, showing group stages and venues.
- 🏁 **/results**: View final scores and goal scorers of recently completed matches from the last 7 days.
- 🔴 **/live**: Get real-time scores and goal scorers for ongoing matches.
- 📡 **Live Tracking**: Automatically posts live match starts (`🔴 MATCH STARTED`), score updates (`⚽ GOAL UPDATE`), and match conclusions (`🏁 MATCH FINISHED`) to a designated channel.
- 🏳️ **Flag Emojis**: Uses a comprehensive country-code-to-flag mapper covering all FIFA federations.
- ⏱️ **Timezone Handling**: Supports local time offsets (e.g., `UTC+7`) or IANA identifiers (e.g., `America/New_York`) dynamically parsed using Luxon.

## Prerequisites

- **Node.js**: v16.11.0 or higher.
- **Discord Bot Token**: Create one at the [Discord Developer Portal](https://discord.com/developers/applications).
- **Client ID**: Your bot's Application ID.

## Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd wc-bot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Create a `.env` file in the root directory (copy from `.env.example`).
   - Fill in your configuration.

   ```env
   DISCORD_TOKEN=your_bot_token
   CLIENT_ID=your_client_id
   LIVE_CHANNEL_ID=your_channel_id_for_live_updates
   UPDATE_INTERVAL=60000
   TIMEZONE=UTC+7
   ```

4. **Run the bot:**
   ```bash
   node src/index.js
   ```

## Project Structure

```text
wc-bot/
├── src/
│   ├── api/
│   │   └── espn.js       # ESPN API communication
│   ├── utils/
│   │   └── embeds.js     # Beautiful Discord Embed formatting and flag logic
│   └── index.js          # Main bot logic & command handlers
├── .env                  # Configuration (ignored by git)
├── .env.example          # Template for environment variables
├── package.json          # Dependencies and scripts
└── README.md             # This guide
```

## How it Works

### ESPN Data Fetching
The bot uses the ESPN Scoreboard API:
`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard`

This endpoint returns a JSON payload containing all events (matches) for the current day/period. By appending `?dates=YYYYMMDD-YYYYMMDD`, we query specific dates or ranges dynamically to cover schedules and historical results.

### Live Tracking Logic
The bot runs a periodic loop (default: every 60 seconds). It compares the current live scores with the last known state stored in memory. If a match kickoff is detected, a goal is scored, or a match finishes, it sends an update to the `LIVE_CHANNEL_ID`.

## Customization

- **Timezones**: The bot uses `luxon` for time handling. You can adjust the default timezone in your `.env` file using the `TIMEZONE` variable.
- **Scorers**: Goal scorers are parsed dynamically from the ESPN scoring play details, automatically identifying penalty kicks (`pen`) and own goals (`OG`).

## License
MIT
