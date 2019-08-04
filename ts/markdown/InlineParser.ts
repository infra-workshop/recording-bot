import {InlineState} from "./InlineState";
import {Env} from "./env";

export interface InlineParser {
    (state: InlineState, env: Env): boolean
}
