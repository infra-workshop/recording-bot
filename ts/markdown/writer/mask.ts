import {CustomWriter} from "./CustomWriter";
import {Writer} from "./Writer";
import {Token} from "../Token";

export const mask_open: CustomWriter<Token> = function mask_open(writer: Writer, token: Token) {
    writer.append(`<span class="mask-span"><span class="masked-text">`)
};

export const mask_close: CustomWriter<Token> = function mask_close(writer: Writer, token: Token) {
    writer.append(`</span></span>`)
};
