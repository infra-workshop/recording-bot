import {CustomWriter} from "./CustomWriter";
import inline from "./inline";
import code from "./code";
import inline_code from "./inlineCode";
import link from "./link";

export const defaultWriters: [string, CustomWriter<any>][] = [
    ["inline", inline],
    ["code", code],
    ["inline_code", inline_code],
    ["link", link]
];
