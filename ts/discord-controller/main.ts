///<reference path="../types/window.d.ts"/>


import {Client, RichEmbed, TextChannel} from "discord.js";
import * as puppeteer from "puppeteer";
import * as path from "path";
import {DiscordController} from "./DiscordController";
import {trimMargin} from "trim-margin";
import {WavCreator} from "../audioManager/WavCreator";
import {RecorderController} from "./RecorderController";
import * as fs from "fs";

const rootDir = path.join(__dirname, "../../");

const tokens = require(path.join(rootDir, "resources/tokens.json"));

const client = new Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

function pad(number: number) {
    if (number < 10) {
        return '0' + number;
    }
    return number;
}

function formatDate(date: Date) {
    return date.getFullYear() +
        '-' + pad(date.getMonth() + 1) +
        '-' + pad(date.getDate()) +
        '-' + pad(date.getHours()) +
        '-' + pad(date.getMinutes()) +
        '-' + pad(date.getSeconds());
}

(async () => {
    await client.login(tokens.discord);
    console.log(`login success!`);

    const browser = await puppeteer.launch({
        headless: false,
        userDataDir: path.join(__dirname, "../../../chrome-user-dir"),
        ignoreDefaultArgs: ["--disable-extensions"],
        defaultViewport: null,
        args: ["--whitelisted-extension-id=onodnlhadbmnlkmhamaoeefkoecledbm", '--window-size=1500,1200', '--disable-web-security','--disable-infobars'],
    });

    await Promise.all((await browser.pages()).map(page => page.close()));

    console.log(`launching browser success!`);

    let screenUrl: string;
    let recorderController: RecorderController;

    client.on("message", async message => {
        if (message.content.startsWith("?record")) {
            if (!(message.channel instanceof TextChannel)) {
                await message.reply("you must not send from DM!");
                return;
            }

            const [record, subCommand, args] = message.content.split(/\s+/, 3);
            if (record != "?record") return;

            switch (subCommand) {
                case "screen":
                case "url":{
                    if (recorderController) {
                        recorderController.setScreenUrl(args);
                    } else {
                        screenUrl = args;
                    }
                    await message.reply("screen url successfully set!");
                    break;
                }
                case "start": {
                    let errored = false;
                    if (recorderController) {
                        errored = true;
                        await message.reply("now recording");
                    }
                    if (!message.member.voiceChannel) {
                        errored = true;
                        await message.reply("please connect to voice channel");
                    }
                    if (errored) return;
                    const page = await browser.newPage();
                    const controller = await DiscordController.create(message.channel, message.member.voiceChannel);
                    const connection = await message.member.voiceChannel.join();
                    recorderController = new RecorderController(
                        page,
                        controller,
                        connection,
                        screenUrl
                    );
                    screenUrl = undefined;
                    await recorderController.start();

                    await message.reply("recorder successfully launched!");
                    break;
                }

                case "stop": {
                    let errored = false;
                    if (!recorderController) {
                        errored = true;
                        await message.reply("not now recording");
                    }
                    if (errored) return;

                    const data = await recorderController.stop();
                    recorderController = null;

                    await message.reply("recorder successfully stopped!");

                    const filePath = path.join(rootDir, "../video/" +formatDate(new Date()) + ".webm");

                    fs.existsSync(path.join(rootDir, "../video/")) || await fs.promises.mkdir(path.join(rootDir, "../video/"));
                    await fs.promises.writeFile(filePath, data);

                    await message.reply(`record file is saved to ${filePath}`);

                    break;
                }

                case "take": {
                    let errored = false;
                    if (!recorderController) {
                        errored = true;
                        await message.reply("not now recording");
                    }
                    if (errored) return;

                    const data = await recorderController.takeShot();

                    message.channel.send({ file: { attachment: data } });

                    break;
                }

                case "debug": {
                    let errored = false;
                    if (!recorderController) {
                        errored = true;
                        await message.reply("not now recording");
                    }
                    if (errored) return;

                    await recorderController.toggleDebug();

                    await message.reply("toggled");

                    break;
                }

                case "help":
                case undefined:
                case null: {
                    const dm = await message.member.createDM();

                    const embed = new RichEmbed({ title: "infra workshop recorder v0.0" });

                    embed.addField("?record screen <url>\n?record url <url>",
                        "sets url for screen shareing");
                    embed.addField("?record start",
                        "start recording");
                    embed.addField("?record stop",
                        "stop recording and save webm");
                    embed.addField("?record take",
                        "take a picture of the canvas");
                    embed.addField("?record debug",
                        "toggle debug mode. this will reset when stop the recording.");

                    dm.send({ embed });
                    break;
                }

                default: {
                    await message.reply("invalid command");
                }
            }
        }
    })

})();
