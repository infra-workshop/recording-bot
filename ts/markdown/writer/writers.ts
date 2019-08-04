import {CustomWriter} from "./CustomWriter";
import {mask_close, mask_open} from "./mask";
import {snowflake_channel, snowflake_emoji, snowflake_global, snowflake_role, snowflake_user} from "./snowflakes";
import inline = require("./inline");
import code = require("./code");
import inline_code = require("./inlineCode");

const writers: [string, CustomWriter<any>][] = [
    ["inline", inline],
    ["code", code],
    ["inline_code", inline_code],
    ["mask_open", mask_open],
    ["mask_close", mask_close],
    ["snowflake_global", snowflake_global],
    ["snowflake_user", snowflake_user],
    ["snowflake_channel", snowflake_channel],
    ["snowflake_role", snowflake_role],
    ["snowflake_emoji", snowflake_emoji],
];

export = writers
