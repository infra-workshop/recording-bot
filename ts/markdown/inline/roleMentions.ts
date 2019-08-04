import {InlineParser} from "../InlineParser";
import {snowflakeToken} from "../Tokens";

const roleMentions: InlineParser = function roleMentions(state, env): boolean {
    const match = state.match(/^<@&([0-9]+)>/);
    if (match == null) return false;

    state.goCursor(match.groups![0].length);

    const id = match.groups![1];

    state.pushToken(snowflakeToken("role", match.groups![0], id));
    return true;
};

export = roleMentions;
