import {Readable} from "stream";

export const ZeroStream: Readable = (() => {

    class ZeroStream extends Readable {
        constructor() {
            super({objectMode: true});
        }

        _read(size: number): void {
            while (this.push(Buffer.alloc(size))) {
            }
        }
    }

    return new ZeroStream();
})();
