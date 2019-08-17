
export class WavCreator {
    static header = Buffer.from(
        "RIFF" +
        "size" +
        "WAVE" +
        "fmt " +
        "\x10\x00\x00\x00" + // 16
        "\x01\x00" + //format id 1 == PCM
        "\x02\x00" + // 2 == stereo
        "\x80\xBB\x00\x00" + // 48kHz = 48000Hz = 0x0000BB80
        "\x00\xEE\x02\x00" + // 48000[Hz]x2[ch]x2[byte] = 192000 = 0x0002EE00
        "\x04\x00" + // 2[ch] * 2 [byte] = 4
        "\x10\x00" + // 16[bit]
        "data" +
        "size",
        "binary");

    parts = [WavCreator.header];

    constructor () {}

    onPCM(buffer: Buffer): this {
        this.parts.push(buffer);
        return this
    }

    make(): Buffer {
        const wave = Buffer.concat(this.parts);
        // riff size
        wave.writeUInt32LE(wave.length - 8, 4);
        // data size
        wave.writeUInt32LE(wave.length - 44, 40);
        this.parts = [wave];
        return wave
    }
}
