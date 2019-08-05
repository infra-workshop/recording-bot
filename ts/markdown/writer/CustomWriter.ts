import {Writer} from "./Writer";
import {Token} from "../Token";
import {Env} from "../env";

export interface CustomWriter<T extends Token = Token> {
    (writer: Writer, token: T, env: Env): void
}
