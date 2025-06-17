require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');

const { Partials } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

let proposalCount = 0;
if (fs.existsSync('proposals.json')) {
  try {
    const proposals = JSON.parse(fs.readFileSync('proposals.json'));
    proposalCount = proposals.length;
  } catch (e) {
    console.error("⚠️ Failed to parse proposals.json. Starting count at 0.");
  }
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageDelete', async (message) => {
  if (!message.guild || !message.id) return;
  if (!fs.existsSync('proposals.json')) return;

  let proposals = [];
  try {
    proposals = JSON.parse(fs.readFileSync('proposals.json'));
  } catch (e) {
    console.error("⚠️ Failed to parse proposals.json.");
    return;
  }

  const beforeCount = proposals.length;
  const updated = proposals.filter(p => p.messageId !== message.id);

  if (updated.length < beforeCount) {
    fs.writeFileSync('proposals.json', JSON.stringify(updated, null, 2));
    console.log(`🗑️ Proposal ${message.id} was deleted and removed from proposals.json`);
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // 🆘 Help Command
  if (message.content === '!help') {
    return message.reply(`
🗳️ **WeVote Bot Commands**

**!propose [your idea]** – Start a new proposal  
> Example: \`!propose Should we fund a community solar panel?\`

**How voting works:**
- The bot adds ✅ and ❌ reactions
- Voting lasts **24 hours**
- Results are posted automatically

📌 To vote: click the ✅ or ❌ on a proposal.  
Only 1 vote per user. Voting is anonymous.

Need more help? See the #start-here channel for full instructions.
    `);
  }

  // 📜 View Open Proposals
if (message.content === '!openproposals') {
  if (!fs.existsSync('proposals.json')) {
    return message.reply('No proposals found.');
  }

  let proposals = [];
  try {
    proposals = JSON.parse(fs.readFileSync('proposals.json'));
  } catch (e) {
    console.error("⚠️ Failed to parse proposals.json. Resetting to empty.");
    proposals = [];
  }

  const now = Date.now();
  const open = proposals.filter(p => now - p.timestamp < 24 * 60 * 60 * 1000);

  if (open.length === 0) {
    return message.reply('There are no open proposals right now.');
  }

  const serverId = message.guild.id;

  const reply = open
    .map(p => {
      const link = `https://discord.com/channels/${serverId}/${p.channelId}/${p.messageId}`;
      return `🟢 **${p.id}** – [View Proposal](${link})\n${p.text}`;
    })
    .join('\n\n');

  return message.reply({ content: `🗳️ **Open Proposals:**\n\n${reply}`, allowedMentions: { parse: [] } });
}

  // 📊 View Results of Closed Proposals
  if (message.content === '!results') {
    if (!fs.existsSync('proposals.json')) {
      return message.reply('No proposals found.');
    }

    const proposals = JSON.parse(fs.readFileSync('proposals.json'));
    const now = Date.now();
    const closed = proposals.filter(p => now - p.timestamp >= 24 * 60 * 60 * 1000);

    if (closed.length === 0) {
      return message.reply('No closed proposals yet. Check back later.');
    }

    const reply = closed.map(p => `🔒 **${p.id}** – ${p.text}`).join('\n\n');
    return message.reply(`📊 **Closed Proposals:**\n\n${reply}`);
  }

  // 🗳️ Proposal Command
  if (!message.content.startsWith('!propose')) return;

  const proposalText = message.content.slice(9).trim();
  if (!proposalText) {
    return message.reply('❗ Usage: `!propose Should we do X?`');
  }

  proposalCount += 1;
  const proposalId = `P${proposalCount.toString().padStart(3, '0')}`;
  const proposalMsg = await message.channel.send(
    `🗳️ **Proposal ${proposalId}**\n${proposalText}\n\nReact with ✅ or ❌ to vote. Voting ends in 24 hours.`
  );

  await proposalMsg.react('✅');
  await proposalMsg.react('❌');

  const proposalData = {
    id: proposalId,
    text: proposalText,
    messageId: proposalMsg.id,
    channelId: message.channel.id,
    timestamp: Date.now(),
  };

  let proposals = [];
  if (fs.existsSync('proposals.json')) {
    proposals = JSON.parse(fs.readFileSync('proposals.json'));
  }

  proposals.push(proposalData);
  fs.writeFileSync('proposals.json', JSON.stringify(proposals, null, 2));

  setTimeout(async () => {
    const channel = await client.channels.fetch(proposalData.channelId);
    const msg = await channel.messages.fetch(proposalData.messageId);
    const reactions = msg.reactions.cache;

    const yes = (await reactions.get('✅')?.users.fetch())?.size - 1 || 0;
    const no = (await reactions.get('❌')?.users.fetch())?.size - 1 || 0;

    msg.reply(
      `🗳️ **Voting Closed for ${proposalId}**\n✅ Yes: ${yes}\n❌ No: ${no}\n${
        yes === no ? '⚖️ Tie!' : yes > no ? '✅ Passed!' : '❌ Rejected.'
      }`
    );
  }, 24 * 60 * 60 * 1000); // 24 hours
});

client.login(process.env.DISCORD_TOKEN);