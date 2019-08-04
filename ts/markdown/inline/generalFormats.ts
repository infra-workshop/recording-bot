import {InlineParser} from "../InlineParser";
import {InlineState} from "../InlineState";
import {Env} from "../env";

const generalFormats: InlineParser = function generalFormats(state: InlineState, env: Env): boolean {
    if (state.get() !== '*' &&
        state.get() !== '_') return false;
    const char = state.get();
    let kind = state.get();
    if (state.charAt(1) == char) {
        kind += char;
    }

    let tagName: string = "";

    switch (kind) {
        case '*':
        case '_':
            tagName = "em";
            break;
        case '**':
            tagName = "strong";
            break;
        case '__':
            tagName = "u";
            break;
    }
    const envKey = "disallow_" + tagName;
    if (env[envKey]) return false;

    state.goCursor(kind.length);

    let searchIndex = 0;
    let close: number;
    do {
        close = state.indexOf(kind, searchIndex);
        if (close == -1) return false;
        if (state.charAt(close + kind.length) == char) {
            if (kind.length == 1) {
                // skip **
                searchIndex = close + 2;
            } else {
                // skip cuurent only
                searchIndex = close + 1;
            }
        } else break
    } while (true);

    state.pushToken({
        name: tagName + "_open",
        tag: tagName,
        indent: 1
    });

    env[envKey] = true;

    state.parseUntil(close, env);

    env[envKey] = false;

    state.pushToken({
        name: tagName + "_close",
        tag: tagName,
        indent: -1
    });

    // go close
    state.goCursor(kind.length);

    return true
};

export = generalFormats
