import {CustomWriter} from "./CustomWriter";
import inline = require("./inline");
import code = require("./code");
import inline_code = require("./inlineCode");
import link = require("./link");

export const defaultWriters: [string, CustomWriter<any>][] = [
    ["inline", inline],
    ["code", code],
    ["inline_code", inline_code],
    ["link", link]
];
