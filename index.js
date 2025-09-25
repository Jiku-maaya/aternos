require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const Aternos = require("aternos-unofficial-api");
const puppeteer = require("puppeteer");

// Tell Puppeteer to use your installed Chrome
process.env.PUPPETEER_EXECUTABLE_PATH = process.env.PUPPETEER_EXECUTABLE_PATH || 
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"; // adjust if your path is different

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const prefix = "!";

// Helper: get first server from your Aternos account
async function getServer() {
    // Puppeteer browser path will be used automatically by aternos-unofficial-api
    await Aternos.loginToAternos(process.env.ATERNOS_USER, process.env.ATERNOS_PASS);
    const servers = await Aternos.getServerList();
    if (!servers || servers.length === 0) {
        throw new Error("No servers found on this Aternos account.");
    }
    return servers[0];
}

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "startserver") {
        await message.channel.send("🔑 Logging into Aternos...");
        try {
            const server = await getServer();
            await Aternos.manageServer(server, "start");
            message.channel.send(`🚀 Starting **${server.name || server.id}**...`);
        } catch (err) {
            console.error(err);
            message.channel.send("❌ Could not start the server.");
        }
    }

    if (command === "stopserver") {
        await message.channel.send("🔑 Logging into Aternos...");
        try {
            const server = await getServer();
            await Aternos.manageServer(server, "stop");
            message.channel.send(`🛑 Stopping **${server.name || server.id}**...`);
        } catch (err) {
            console.error(err);
            message.channel.send("❌ Could not stop the server.");
        }
    }

    if (command === "status") {
        await message.channel.send("🔑 Checking server status...");
        try {
            const server = await getServer();
            message.channel.send(`📡 **${server.name || server.id}** status: **${server.status || "unknown"}**`);
        } catch (err) {
            console.error(err);
            message.channel.send("❌ Could not fetch server status.");
        }
    }
});

client.once("clientReady", () => {
    console.log(`✅ Logged into Discord as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
