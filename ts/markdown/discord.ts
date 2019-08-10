import {CustomWriter} from "./writer/CustomWriter";
import {mask_close, mask_open} from "./writer/mask";
import {
    snowflake_channel,
    snowflake_emoji,
    snowflake_global,
    snowflake_role,
    snowflake_user
} from "./writer/snowflakes";
import {InlineParser} from "./InlineParser";
import channelMentions from "./inline/channelMentions";
import globalMentions from "./inline/globalMentions";
import mask from "./inline/mask";
import roleMentions from "./inline/roleMentions";
import userMentions from "./inline/userMentions";

export const discordWriters: [string, CustomWriter<any>][] = [
    ["mask_open", mask_open],
    ["mask_close", mask_close],
    ["snowflake_global", snowflake_global],
    ["snowflake_user", snowflake_user],
    ["snowflake_channel", snowflake_channel],
    ["snowflake_role", snowflake_role],
    ["snowflake_emoji", snowflake_emoji],
];

export const discordInlineParsers: InlineParser[] = [
    mask,
    roleMentions,
    globalMentions,
    channelMentions,
    userMentions,
];
