# FIFA World Cup Discord Bot

A production-ready Discord bot to track FIFA World Cup matches, live scores, and results using the ESPN API.

## Features

- 📅 **/schedule**: View upcoming matches with dates and times.
- 🔴 **/live**: Get real-time scores for ongoing matches.
- 🏁 **/results**: View final scores and stats of recently completed matches.
- 📡 **Live Tracking**: Automatically posts live score updates and match conclusions to a designated channel.

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
   - Fill in your `DISCORD_TOKEN`, `CLIENT_ID`, and `LIVE_CHANNEL_ID`.

   ```env
   DISCORD_TOKEN=your_bot_token
   CLIENT_ID=your_client_id
   LIVE_CHANNEL_ID=your_channel_id_for_live_updates
   UPDATE_INTERVAL=60000
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
│   │   └── embeds.js     # Beautiful Discord Embed formatting
│   └── index.js          # Main bot logic & command handlers
├── .env                  # Configuration (ignored by git)
├── .env.example          # Template for environment variables
├── package.json          # Dependencies and scripts
└── README.md             # This guide
```

## How it Works

### ESPN Data Fetching
The bot uses the semi-public ESPN Scoreboard API:
`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard`

This endpoint returns a JSON payload containing all events (matches) for the current day/period, including status (pre/in/post), scores, and team details.

### Live Tracking Logic
The bot runs a periodic loop (default: every 60 seconds). It compares the current live scores with the last known state stored in memory. If a goal is scored or a match finishes, it sends an update to the `LIVE_CHANNEL_ID`.

## Customization

- **Timezones**: The bot uses `luxon` for time handling. You can adjust the default timezone in `src/utils/embeds.js`.
- **Colors**: Change the embed colors in `src/utils/embeds.js` to match your server's theme.
- **Embed Content**: Add more details (like goal scorers or yellow cards) by fetching additional data from `event.links[0].href` or using the ESPN `summary` endpoint.

## License
MIT
