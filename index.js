const { Client, GatewayIntentBits, Emoji } = require('discord.js');
const Channel = require("./settings.json")


// -- Regex -- //
const emojiRegex = require('emoji-regex');
const discordEmojiRegex = /<@[0-9]{18}>|<:[a-zA-Z0-9.]{2,32}:[0-9]{19}>|<a{0,1}:[a-zA-Z0-9.]{2,32}:[0-9]{18,19}>/gm
const secondDiscordEmojiRegex = /^<.*>$/gm


function onlyEmoji(message) {
    // Extracts custom emojis and non-emoji text from a given string
    function extractCustomEmojis(text) {
        const regExp = /(<.*?>)|([^<>]+)/g;
        return text.match(regExp);
    }

    // Extracts emojis from a given string while preserving the order of non-emoji text
    function extractEmojis(text) {
        const regExp = /\p{Emoji}/gu;
        let parts = text.split(regExp);
        let emojis = Array.from(text.matchAll(regExp), (match) => match[0]);
        return parts.reduce((result, part, index) => {
        if (part !== "") {
            result.push(part);
        }
        if (index < emojis.length) {
            result.push(emojis[index]);
        }
        return result;
        }, []);
    }

    const customEmojis = extractCustomEmojis(message.content.replaceAll(" ", ""));

    // Checks for invalid text in each text segment other than custom emojis and deletes the message if this is the case.
    customEmojis.forEach(emoji => {
        if (!(discordEmojiRegex.test(emoji) && secondDiscordEmojiRegex.test(emoji))) {
        extractEmojis(emoji).forEach(e => {
            if (!emojiRegex().test(e)) {
                message.delete();
            }
        });
        }
    });
}


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


client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (newMessage.channelId != Channel.channel_id) return
    if (newMessage.author.bot) return false;
        
    onlyEmoji(newMessage);
});

client.on('messageCreate', async (message) => {
    if (message.channelId != Channel.channel_id) return
    if (message.author.bot) return false;   
    
    onlyEmoji(message);
});

client.once("ready", () => {
    console.log("Connected !")
    console.log(`Channel: ${client.channels.cache.get(Channel.channel_id).name}`)
})

client.login(process.env.DISCORD_CLIENT_TOKEN);

