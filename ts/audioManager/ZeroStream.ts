import {Readable} from "stream";

export class ZeroStream extends Readable {
    private closed = false;
    constructor() {
        super({objectMode: true});
    }

    _read(size: number): void {
        if (this.closed) {
            this.push(null);
            return
        }
        while (this.push(Buffer.alloc(size))) {
        }
    }

    requestClose() {
        this.closed = true
    }
}
