
export type Endian = "little" | "big" | "unknowm"

export function getEndian(): Endian {
    let uInt32 = new Uint32Array([0x11223344]);
    let uInt8 = new Uint8Array(uInt32.buffer);

    if(uInt8[0] === 0x44) {
        return "little";
    } else if (uInt8[0] === 0x11) {
        return "big";
    } else {
        return "unknowm";
    }
}

export const MIN_INT16 = -32768;
export const MAX_INT16 = 32767;
