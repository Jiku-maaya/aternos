require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const Aternos = require("aternos-unofficial-api");

// Puppeteer Chromium path handling
// For Render (Linux), it defaults to /usr/bin/chromium-browser
// For Windows local testing, use your .env variable
process.env.PUPPETEER_EXECUTABLE_PATH = process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium-browser";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const prefix = "!";

// Helper function to get the first Aternos server
async function getServer() {
  try {
    await Aternos.loginToAternos(process.env.ATERNOS_USER, process.env.ATERNOS_PASS);
    const servers = await Aternos.getServerList();
    if (!servers || servers.length === 0) throw new Error("No Aternos servers found!");
    return servers[0];
  } catch (err) {
    console.error("Error logging into Aternos:", err);
    throw err;
  }
}

// Discord command handler
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  try {
    if (command === "startserver") {
      const server = await getServer();
      await Aternos.manageServer(server, "start");
      message.channel.send(`🚀 Starting server: **${server.name || server.id}**`);
    }

    if (command === "stopserver") {
      const server = await getServer();
      await Aternos.manageServer(server, "stop");
      message.channel.send(`🛑 Stopping server: **${server.name || server.id}**`);
    }

    if (command === "status") {
      const server = await getServer();
      message.channel.send(`📡 Server **${server.name || server.id}** status: **${server.status || "unknown"}**`);
    }
  } catch (err) {
    message.channel.send("❌ There was an error processing your command.");
    console.error(err);
  }
});

client.once("clientReady", () => {
  console.log(`✅ Logged into Discord as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
