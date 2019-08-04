import {CustomWriter} from "./CustomWriter";
import inline = require("./inline");
import code = require("./code");
import inline_code = require("./inlineCode");

export const defaultWriters: [string, CustomWriter<any>][] = [
    ["inline", inline],
    ["code", code],
    ["inline_code", inline_code],
];
