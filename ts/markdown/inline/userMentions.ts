import {InlineParser} from "../InlineParser";
import {snowflakeToken} from "../Tokens";

const userMentions: InlineParser = function userMentions(state, env): boolean {
    const match = state.match(/^<@!?([0-9]+)>/);
    if (match == null) return false;

    state.goCursor(match.groups![0].length);

    const id = match.groups![1];

    state.pushToken(snowflakeToken("user", match.groups![0], id));
    return true;
};

export default userMentions;
