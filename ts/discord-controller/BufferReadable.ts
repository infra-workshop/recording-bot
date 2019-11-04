import {Readable} from "stream";

export class BufferReadable extends Readable {
    private pushed = false;
    private readonly data: Buffer;

    constructor(data: Buffer) {
        super({objectMode: true});
        this.data = data;
    }

    _read(size: number): void {
        if (!this.pushed) this.push(this.data);
        this.pushed = true;
        this.push(null);
    }
}
