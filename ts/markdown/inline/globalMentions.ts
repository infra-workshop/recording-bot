import {InlineParser} from "../InlineParser";
import {snowflakeToken} from "../Tokens";

const globalMentions: InlineParser = function globalMentions(state, env): boolean {
    if (state.startsWith("@everyone")) {
        state.goCursor("@everyone".length);
        state.parseAll(snowflakeToken("global", "everyone", ""));
        return true
    }
    if (state.startsWith("@here")) {
        state.goCursor("@here".length);
        state.parseAll(snowflakeToken("global", "here", ""));
        return true
    }
    return false
};

export default globalMentions;
