// オーディオはchrome上で動かせないのでnode用のスクリプト

const {Client} = require("discord.js");
const {onConnectCommand} = require("./dist/audioManager");
const {WavCreator} = require("./dist/audioManager/WavCreator");
const fs = require('fs');

const client = new Client();
const tokens = require("./tokens.json");

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

(async () => {
    let manager;
    let wav;

    await client.login(tokens.discord);
    console.log(`login success!`);

    client.on('message', async (message) => {
        if (message.type == "DEFAULT") {
            if (message.content === 'ping') {
                await message.reply('Pong!');
            } else if (message.content == 'connect') {
                manager = await onConnectCommand(message);
                wav = new WavCreator();
                manager.on('audio', (audio) => { wav.onPCM(audio); });
            } else if (message.content == 'dis') {
                manager.destroy();
                fs.writeFileSync("./audio.wav", wav.make());
            }
        } else {
            console.warn("unknown type message");
            console.warn(message);
        }
    });
})();

setTimeout(() => {}, 10);
