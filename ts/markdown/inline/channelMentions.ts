import {InlineParser} from "../InlineParser";
import {snowflakeToken} from "../Tokens";

const channelMentions: InlineParser = function channelMentions(state, env): boolean {
    const match = state.match(/^<@#([0-9]+)>/);
    if (match == null) return false;

    state.goCursor(match[0].length);

    const id = match[1];

    state.pushToken(snowflakeToken("channel", match[0], id));
    return true;
};

export default channelMentions;
