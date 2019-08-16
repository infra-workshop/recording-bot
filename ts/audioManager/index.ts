import {AudioPlayer, Message, User, VoiceReceiver} from "discord.js";
import {getEndian} from "./util";
import {LittleEndianAudioMixer} from "./littleEndianAudioMixer";
import {NonLittleEndianAudioMixer} from "./nonLittleEndianAudioMixer";
import {EventEmitter} from "events";
import {ZeroStream} from "./ZeroStream";
import {clearTimeout} from "timers";

export async function onConnectCommand(msg: Message) {
    console.log("connect voice");
    const connection = await msg.member.voiceChannel.join();
    //connection.sendVoiceStateUpdate({ self_mute: true });
    connection.on("authenticated", () => { console.log("authenticated"); });
    // create our voice receiver
    const receiver = connection.createReceiver();
    const manager = new AudioManager(receiver);

    connection.on('speaking', (user, speaking) => {
        if (speaking) {
            msg.channel.send(`I'm listening to ${user}`);
        }
    });

    return manager;
}

type ObjMap<V> = { [key: string]: V }

export interface AudioMixer {
    /**
     * PCM 16bit stereo
     */
    mix(audios: Buffer[], bufferSize: number): Buffer
}

setInterval(()=>{},1);

const mixer: AudioMixer = getEndian() == "little" ? new LittleEndianAudioMixer() : new NonLittleEndianAudioMixer();

const pcmSize = 2 /* byte */ * 2 /* channel */ * 48 * 1000 /* Hz */ * 0.02 /* seconds */;

const nullBuff = Buffer.alloc(pcmSize);

export class AudioManager extends EventEmitter {
    private readonly receiver: VoiceReceiver;

    constructor(receiver: VoiceReceiver) {
        super();
        this.receiver = receiver;
        receiver.voiceConnection.playConvertedStream(ZeroStream);
        receiver.on("pcm", this.onPCM.bind(this));
        this.boundOnTime();
    }

    private readonly audios: ObjMap<[number, Buffer][]> = {};

    private getAudiosOrPut(user: User) {
        const now = Date.now();
        return this.audios[user.id] || (this.audios[user.id] = [[now + 80, nullBuff], [now + 60, nullBuff], [now + 40, nullBuff], [now + 20, nullBuff]])
    }

    private onPCM(user: User, buffer: Buffer) {
        console.log("onPCM");
        this.getAudiosOrPut(user).push([Date.now(), buffer])
    }

    on(event: "audio", listener: (pcm: Buffer)=>void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this { return super.on(event, listener) }

    once(event: "audio", listener: (pcm: Buffer)=>void): this;
    once(event: string | symbol, listener: (...args: any[]) => void): this { return super.on(event, listener) }

    // @ts-ignore
    timeout: NodeJS.Timeout;

    boundOnTime = this.onTime.bind(this);

    private onTime() {
        this.timeout = setTimeout(this.boundOnTime, 20);
        const audios: Buffer[] = [];
        const nowUnix = Date.now();
        for (let value of Object.values(this.audios)) {
            while (value.length != 0) {
                const [time, audio] = value.shift()!;
                if ((nowUnix - time) > 100) continue;
                audios.push(audio);
                break;
            }
        }
        console.log("onTime");
        if (audios.length == 0)
            this.emit("audio", nullBuff);
        else
            //this.emit("audio", audios[0]);
            this.emit("audio", mixer.mix(audios, pcmSize));
    }

    destroy() {
        clearTimeout(this.timeout);
        this.receiver.voiceConnection.disconnect();
    }
}
