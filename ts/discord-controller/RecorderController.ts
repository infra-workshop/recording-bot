import * as path from "path";
import {DiscordController} from "./DiscordController";
import {WavCreator} from "../audioManager/WavCreator";
import {Page} from "puppeteer";
import {VoiceConnection} from "discord.js";
import {EventEmitter} from "events";

export class RecorderController {
    private readonly page: Page;
    private readonly controller: DiscordController;
    private readonly voiceConnection: VoiceConnection;
    private readonly emitter = new EventEmitter();
    private screenUrl: string;

    constructor (page: Page, controller: DiscordController, voiceConnection: VoiceConnection, screenUrl: string) {
        this.page = page;
        this.controller = controller;
        this.voiceConnection = voiceConnection;
        this.screenUrl = screenUrl;
    }

    setScreenUrl(screenUrl: string) {
        this.screenUrl = screenUrl;
        this.emitter.emit("set-screen-url", screenUrl);
    }

    async start() {
        const page = this.page;
        await page.goto("file://" + path.join(__dirname, "../../../html/electron.html"), {waitUntil: "domcontentloaded"});

        const controller = this.controller;

        this.emitter.on("set-screen-url", async (screenUrl: string) => {
            await page.evaluate((screenUrl) => {
                (document.getElementById("screen") as HTMLIFrameElement).src = screenUrl
            }, this.screenUrl);
        });

        this.setScreenUrl(this.screenUrl);

        controller.on("add-message", async (msg) => {
            await page.evaluate((msg) => { window.addMessage(msg) }, msg);
        });

        controller.on("delete-message", async (msg) => {
            await page.evaluate((msg) => { window.removeMessage(msg) }, msg);
        });

        controller.on("update-message", async (msg) => {
            await page.evaluate((msg) => { window.editMessage(msg) }, msg);
        });

        controller.on("update-reaction", async (msgId, reaction) => {
            await page.evaluate((msgId, reaction) => { window.updateReaction(msgId, reaction) }, msgId, reaction);
        });

        const connection = this.voiceConnection;
        // create our voice receiver
        const receiver = connection.createReceiver();

        connection.on('speaking', async (user, speaking) => {
            if (speaking) {
                const stream = receiver.createPCMStream(user);
                stream.on("data", async (data: Buffer) => {
                    await page.evaluate(async (user: string, binary: string) => {
                        // @ts-ignore
                        await window.playAudio(user, base64js.toByteArray(binary).buffer);
                    }, user.id, new WavCreator().onPCM(data).make().toString("base64"));
                });

                stream.on("close", async () => {
                    await page.evaluate(async (user: string) => {
                        window.endAudio(user);
                    }, user.id);
                });

                await page.evaluate(async (user: string) => {
                    window.startAudio(user);
                }, user.id);
                console.log(`start listen: ${user.username}`)
            }
        });
    }
}

