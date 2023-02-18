const { Client, GatewayIntentBits } = require('discord.js');
const Channel = require("./settings.json")
const emojiRegex = require('emoji-regex');

const client = new Client({
    restRequestTimeout: 60000,
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    intents: [
        GatewayIntentBits.DirectMessages, 
        GatewayIntentBits.DirectMessageReactions, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.Guilds
    ],
    presence: {
        status: 'online',
        activities: [{ name: '/help', }]
    }
});

client.on('messageCreate', async (message) => {
    if (message.channelId != Channel.channel_id) return
    if (message.author.bot) return false; 

    msg = message.content.trim();

    if(!(msg.startsWith("<:") && msg.endsWith(">") || msg.length === 1 && emojiRegex().test(msg))) {
        message.reply({ content: ':x: Vous pouvez uniquement envoyer des emojis dans ce salon !', ephemeral: true, duration: 200 }).then((msg) => {
            message.delete();
            setTimeout(() => {
                msg.delete();
            }, 3000)
        })
    }
});

client.once("ready", () => {
    console.log("Connecté !")
    console.log(`Channel: ${client.channels.cache.get(Channel.channel_id).name}`)
})

client.login(process.env.DISCORD_CLIENT_TOKEN);
