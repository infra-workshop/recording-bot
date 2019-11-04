///<reference path="../types/window.d.ts"/>


import * as crypto from "crypto";
import {Client, RichEmbed, TextChannel} from "discord.js";
import * as puppeteer from "puppeteer";
import * as path from "path";
import {DiscordController} from "./DiscordController";
import {trimMargin} from "trim-margin";
import {WavCreator} from "../audioManager/WavCreator";
import {RecorderController} from "./RecorderController";
import * as fs from "fs";
import * as child_process from "child_process";
import {Readable} from "stream";
import {platform} from "os";
import {Browser, LaunchOptions} from "puppeteer";
import * as os from "os";
import * as util from "util";

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

function formatDateForFileName(date: Date) {
    return date.getFullYear() +
        '-' + pad(date.getMonth() + 1) +
        '-' + pad(date.getDate()) +
        '-' + pad(date.getHours()) +
        '-' + pad(date.getMinutes()) +
        '-' + pad(date.getSeconds());
}

const hexadecimalToIDAlphabetMap: { [key: string]: string } = {};

for (let char of "0123456789abcdef") {
    hexadecimalToIDAlphabetMap[char] = "abcdefghijklmnop".charAt(parseInt(char, 16))
    hexadecimalToIDAlphabetMap[char.toUpperCase()] = "abcdefghijklmnop".charAt(parseInt(char, 16))
}

function convertHexadecimalToIDAlphabet(hex: string): string {
    return hex.split("").map(it => hexadecimalToIDAlphabetMap[it]).join("")
}

function generateExtensionIdByPath(path: string) {
    return convertHexadecimalToIDAlphabet(crypto.createHash("sha256").update(path).digest("hex")).substr(0, 32)
}

(async () => {
    await client.login(tokens.discord);
    console.log(`login success!`);

    const extensionPath = path.join(__dirname, "../../chrome");
    const extensionId = generateExtensionIdByPath(extensionPath);

    console.log(`extension-path: ${extensionPath}`);
    console.log(`extension-id: ${extensionId}`);

    const options: LaunchOptions = {
        headless: false,
        ignoreDefaultArgs: ["--disable-extensions"],
        defaultViewport: null,
        env: {},//docker.for.mac.localhost:0
        args: [`--whitelisted-extension-id=${extensionId}`, `--load-extension=${extensionPath}`, '--window-size=1500,1200', '--disable-web-security','--disable-infobars', '--no-sandbox', '--disable-setuid-sandbox'],
    };

    if (process.argv[2]) {
        options.env["DISPLAY"] = process.argv[2]
    }

    const browser = await puppeteer.launch(options);

    if (os.platform() == 'darwin')
        await Promise.all((await browser.pages()).map(page => page.close()));

    console.log(`launching browser success!`);

    browser.on('disconnected', () => {
        console.log("disconnected IDK why");
        process.exit(1);
    });

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
                    console.log(`screen url is now ${args}`);
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
                    console.log(`recorder launching...`);
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

                    console.log(`recorder successfully launched`);
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

                    console.log(`recorder stopping...`);
                    const data = await recorderController.stop();
                    const date = recorderController.startAt;
                    recorderController = null;

                    console.log(`recorder stopped.`);
                    await message.reply("recorder successfully stopped!");

                    const filePath = path.join(rootDir, "../video/" +formatDateForFileName(date) + ".webm");
                    console.log(`saving video to ${filePath}.`);

                    fs.existsSync(path.join(rootDir, "../video/")) || await util.promisify(fs.mkdir)(path.join(rootDir, "../video/"));
                    await util.promisify(fs.writeFile)(filePath, data);

                    console.log(`saved.`);
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

                    console.log(`taking screen shot...`);
                    const data = await recorderController.takeShot();
                    console.log(`took`);

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

                    console.log(`toggle debug on/off`);
                    await recorderController.toggleDebug();

                    await message.reply("toggled");

                    break;
                }

                case "help":
                case undefined:
                case null: {
                    console.log(`showing help to ${message.member.user.username}`);
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
