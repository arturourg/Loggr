# BackloggdBot

Discord bot to connect Backloggd accounts and share gaming activity. Similar to FilmLinkd for Letterboxd.

## Features

- **Account Linking**: Connect your Backloggd account to Discord
- **Profile Viewing**: View any Backloggd profile with stats
- **Game Lists**: See playing, played, and wishlist games
- **Reviews**: Browse user reviews with ratings
- **Game Search**: Search for games on Backloggd
- **Activity Notifications**: Get notified when followed users update their gaming activity

## Commands

| Command | Description |
|---------|-------------|
| `/connect [username]` | Link your Backloggd account |
| `/disconnect` | Unlink your account |
| `/profile [user?]` | View a Backloggd profile |
| `/playing [user?]` | Games currently playing |
| `/played [user?]` | Played/completed games |
| `/wishlist [user?]` | View wishlist |
| `/reviews [user?]` | View user reviews |
| `/lastreview [user?]` | Most recent review |
| `/game [name]` | Search for a game |
| `/setchannel #channel` | Set notification channel (Admin) |
| `/follow @user` | Follow user activity |
| `/unfollow @user` | Stop following |
| `/help` | Show all commands |

## Installation

### Prerequisites

- Node.js v18+
- npm or yarn
- Discord Bot Token

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/backloggdbot.git
cd backloggdbot
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables:
```env
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_application_id
DATABASE_PATH=./data/backloggdbot.db
SCRAPE_DELAY_MS=3000
CACHE_TTL_MINUTES=10
POLL_INTERVAL_MINUTES=30
```

5. Initialize the database:
```bash
npm run db:init
```

6. Register slash commands:
```bash
npm run register
```

7. Start the bot:
```bash
npm start
```

### Development

Run with auto-reload:
```bash
npm run dev
```

## Docker

Build and run with Docker:

```bash
docker build -t backloggdbot .
docker run -d \
  --name backloggdbot \
  -v backloggdbot-data:/app/data \
  -e DISCORD_TOKEN=your_token \
  -e DISCORD_CLIENT_ID=your_client_id \
  backloggdbot
```

Or with docker-compose:

```yaml
version: '3.8'
services:
  backloggdbot:
    build: .
    restart: unless-stopped
    volumes:
      - backloggdbot-data:/app/data
    environment:
      - DISCORD_TOKEN=your_token
      - DISCORD_CLIENT_ID=your_client_id
```

## Creating a Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Enable "Message Content Intent" and "Server Members Intent" if needed
5. Copy the bot token
6. Go to "OAuth2" > "URL Generator"
7. Select `bot` and `applications.commands` scopes
8. Select required permissions (Send Messages, Embed Links, Use Slash Commands)
9. Use the generated URL to invite the bot to your server

## Project Structure

```
backloggdbot/
├── src/
│   ├── index.js           # Main entry point
│   ├── config.js          # Configuration
│   ├── deploy-commands.js # Command registration
│   ├── commands/          # Slash commands
│   ├── database/          # SQLite database
│   ├── scrapers/          # Backloggd scrapers
│   ├── services/          # Activity polling
│   └── utils/             # Utilities
├── data/                  # Database files (created on first run)
├── .env.example           # Environment template
├── package.json
├── Dockerfile
└── README.md
```

## Notes

- This bot uses web scraping as Backloggd has no public API
- Requests are rate-limited to respect the website
- Responses are cached for 10 minutes by default
- Activity polling runs every 30 minutes by default

## License

MIT
