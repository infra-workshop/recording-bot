import {InlineParser} from "../InlineParser";

const strikethrough: InlineParser = function strikethrough(state, env): boolean {
    if (!state.startsWith("~~")) return false;
    const closeIndex = state.indexOf("~~", 3);
    if (closeIndex == -1) return false;

    state.goCursor(2);

    state.pushToken({
        name: "s_open",
        tag: "s",
        indent: 1
    });

    state.parseUntil(closeIndex - 2, env);


    state.pushToken({
        name: "s_close",
        tag: "s",
        indent: -1
    });

    state.goCursor(2);

    return true;
};

export = strikethrough;
