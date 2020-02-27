import * as path from "path";
import {DiscordController} from "./DiscordController";
import {WavCreator} from "../audioManager/WavCreator";
import {Page} from "puppeteer";
import {VoiceConnection} from "discord.js";
import {EventEmitter} from "events";
import {ZeroStream} from "../audioManager/ZeroStream";

declare var base64js: {
    toByteArray(binary: string): Uint8Array;
    fromByteArray(voice: Uint8Array): string;
};
declare function sendDebugVoice_internal(user: string, voices: string[]): Promise<string>;

export class RecorderController {
    private readonly page: Page;
    private readonly controller: DiscordController;
    private readonly voiceConnection: VoiceConnection;
    private readonly emitter = new EventEmitter();
    private readonly PCMStream = new ZeroStream();
    private screenUrl: string;
    public readonly startAt: Date;

    constructor (page: Page, controller: DiscordController, voiceConnection: VoiceConnection, screenUrl: string) {
        this.page = page;
        this.controller = controller;
        this.voiceConnection = voiceConnection;
        this.screenUrl = screenUrl;
        this.startAt = new Date();
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
            }, screenUrl);
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

        await page.exposeFunction("sendDebugVoice_internal", async (user: string, voices: string[]) => {
            const creator = new WavCreator();
            voices.map(it => Buffer.from(it, "base64")).forEach(it => creator.onWav(it));
            const member = controller.channel.guild.member(user);
            await controller.channel.send(`your voice here!`, {
                reply: user,
                files: [{attachment: creator.make(), name: member.displayName + ".wav"}],
            })
        });
        await page.evaluate(() => {
            window.sendDebugVoice = async (user: string, voices: Uint8Array[]) => {
                sendDebugVoice_internal(user, voices.map(voice => base64js.fromByteArray(voice)));
            }
        });

        const connection = this.voiceConnection;

        const receiver = connection.receiver;
        connection.play(this.PCMStream, { type: "converted" });

        connection.on('speaking', async (user, speaking) => {
            if (speaking.has("SPEAKING")) {
                const stream = receiver.createStream(user, {mode: "pcm", end: "silence"});
                stream.on("data", async (data: Buffer) => {
                    await page.evaluate(async (user: string, binary: string) => {
                        await window.playAudio(user, base64js.toByteArray(binary).buffer);
                    }, user.id, new WavCreator().onPCM(data).make().toString("base64"));
                });

                stream.on("end", async () => {
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

    isValid(): boolean {
        if (!this.page) return false;
        if (this.page.isClosed()) return false;
        return true;
    }

    async stop(): Promise<Buffer> {
        const dataUrl =await this.page.evaluate(async () => {
            const readAsDataUrl = (blob: Blob) => new Promise<string>((resolve, reject) => {
                const fr = new FileReader();
                fr.onload = e => {
                    resolve(fr.result as string);
                };
                fr.onerror = e => {
                    reject(fr.error)
                };
                fr.readAsDataURL(blob);
            });
            const blob = await window.stopRecording();
            return await readAsDataUrl(blob);
        });

        this.controller.destroy();
        this.voiceConnection.disconnect();
        await this.page.close();
        this.PCMStream.requestClose();

        return Buffer.from(dataUrl.split(",")[1], 'base64')
    }

    private debug = false;
    async toggleDebug(): Promise<boolean> {
        this.debug = !this.debug;
        await this.page.evaluate((debug) => { window.debug(debug) }, this.debug);
        return this.debug;
    }

    async takeShot(): Promise<Buffer> {
        const dataUrl =await this.page.evaluate(async () => {
            const readAsDataUrl = (blob: Blob) => new Promise<string>((resolve, reject) => {
                const fr = new FileReader();
                fr.onload = e => {
                    resolve(fr.result as string);
                };
                fr.onerror = e => {
                    reject(fr.error)
                };
                fr.readAsDataURL(blob);
            });
            const blob = await window.takeShot();
            return await readAsDataUrl(blob);
        });

        return Buffer.from(dataUrl.split(",")[1], 'base64')
    }
}

