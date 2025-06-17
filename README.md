# WeVote Bot

WeVote is a simple off-chain voting bot for Discord. It lets any community run transparent emoji-based votes using the `!propose` command — no crypto or wallet needed.

Built with love by PneumEvolve DAO.

---

## Features

- `!propose` to start a new vote
- Automatically adds ✅ and ❌ reactions
- Closes votes after 24 hours and posts results
- `!openproposals` shows all active proposals with links
- `!results` lists closed proposals
- `!help` explains how to use the bot
- Automatically removes proposals from history if deleted

---

## How to Set It Up

1. Clone this repo:
git clone https://github.com/PneumEvolve/We-Vote-Bot.git
cd We-Vote-Bot

2. Install dependencies:
npm install

3. Create a file named `.env` in the root folder with this inside:
DISCORD_TOKEN=your-bot-token-here

4. Start the bot:
node index.js

You should see "Logged in as WeVote Bot#1234" in your terminal.

---

## Editing or Running on a Phone?

- You can **view and edit the code** on your phone using the GitHub mobile app or in a browser.
- You **cannot run the bot** directly from a phone.
- To test remotely, use a cloud IDE like Replit, GitHub Codespaces, or host it on a small VPS.

---

## Bot Commands

- `!propose [your idea]` — starts a new proposal
- `!openproposals` — shows current open votes with links
- `!results` — shows past closed proposals
- `!help` — shows instructions

---

## Notes

- All votes are stored in `proposals.json` (locally)
- The `.env` file and `proposals.json` are ignored in the repo to keep your data safe
- The bot does not require any database or server — just Node.js

---

## Contributing

If you want to suggest changes, fork the repo or open an issue.

---

## Join Us

We're building tools for community-powered decisions.  
Learn more: https://pneumevolve.com