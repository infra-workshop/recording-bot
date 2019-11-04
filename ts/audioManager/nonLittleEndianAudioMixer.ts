import {AudioMixer} from "./index";
import {MAX_INT16, MIN_INT16} from "./util";

export class NonLittleEndianAudioMixer implements AudioMixer{
    mix(audios: Buffer[], pcmSize: number): Buffer {
        const sampleCount = pcmSize / 2;
        const values = new Int32Array(sampleCount);
        for (let audio of audios) {
            const i16s = new DataView(audio);
            for (let i = 0; i < sampleCount; i++) {
                values[i] += i16s.getInt16(i * 2, true);
            }
        }
        const resultBuff = Buffer.allocUnsafe(sampleCount * 2);
        const result = new DataView(resultBuff);
        for (let i = 0; i < values.length; i++) {
            const v = values[i];
            if (v > MAX_INT16)
                result.setInt16(i * 2, MAX_INT16, true);
            else if (v < MIN_INT16)
                result.setInt16(i * 2, MIN_INT16, true);
            else
                result.setInt16(i * 2, v, true);
        }
        return Buffer.from(result.buffer);
    }
}
