import {Writer} from "./Writer";
import {Token} from "../Token";

export interface CustomWriter<T extends Token = Token> {
    (writer: Writer, token: T): void
}
