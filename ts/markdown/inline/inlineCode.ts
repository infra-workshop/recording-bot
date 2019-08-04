import {InlineParser} from "../InlineParser";
import {Token} from "../Token";

const inlineCode: InlineParser = function inlineCode(state): boolean {
    if (state.get() !== "`") return false;
    let maxQuoteSize = 0;
    while (state.get() === "`") {
        state.goCursor(1);
        maxQuoteSize++;
    }
    if (maxQuoteSize >= 3) return false;
    let closeIndex: number;
    let searchIndex = 0;
    do {
        closeIndex = state.indexOf("`", searchIndex);
        if (closeIndex == -1) return false;
        // redo if  ```
        if (state.charAt(closeIndex + 1) == "`" && state.charAt(closeIndex + 2) == "`") {
            searchIndex = closeIndex + 3;
            continue;
        }
        // redo if `` with `
        if (maxQuoteSize == 1 && state.charAt(closeIndex + 1) == "`") {
            searchIndex = closeIndex + 2;
            continue;
        }
        break;
    } while (true);
    let realQuoteSize: number;

    if (state.charAt(closeIndex + 1) == "`") {
        realQuoteSize = 2;
    } else {
        realQuoteSize = 1;
    }

    const content = (realQuoteSize == 1 && maxQuoteSize == 2) ? "`" + state.get(closeIndex) : state.get(closeIndex);

    state.goCursor(closeIndex);
    state.goCursor(realQuoteSize);

    state.pushToken(codeToken(content));

    return true;
};

export = inlineCode;

function codeToken(content: string): InlineCodeToken {
    return {
        name: "inline_code",
        tag: undefined,
        indent: 0,
        content: content
    }
}

interface InlineCodeToken extends Token {
    readonly name: "inline_code";
    readonly tag?: undefined;
    readonly indent: 0;
    readonly content: string;
}
