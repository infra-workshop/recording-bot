import {AudioMixer} from "./index";
import {MAX_INT16, MIN_INT16} from "./util";

export class LittleEndianAudioMixer implements AudioMixer{
    mix(audios: Buffer[], pcmSize: number): Buffer {
        const sampleCount = pcmSize / 2;
        const values = new Int32Array(sampleCount);
        for (let audio of audios) {
            const i16s = new Int16Array(audio.buffer);
            for (let i = 0; i < i16s.length; i++) {
                values[i] += i16s[i]
            }
        }
        const result = new Int16Array(sampleCount);
        for (let i = 0; i < values.length; i++) {
            const v = values[i];
            if (v > MAX_INT16)
                result[i] = MAX_INT16;
            else if (v < MIN_INT16)
                result[i] = MIN_INT16;
            else
                result[i] = v;
        }
        return Buffer.from(result.buffer);
    }
}
