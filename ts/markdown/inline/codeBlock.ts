import {InlineParser} from "../InlineParser";
import {InlineState} from "../InlineState";
import {codeToken} from "../Tokens";

const codeBlock: InlineParser = function codeBlock(state: InlineState): boolean {
    if (!state.startsWith("```")) return false;
    // ignore `````` allow ``` ```(no newlines) so 4
    const closeIndex = state.indexOf("```", 4);
    if (closeIndex == -1) return false;
    const bodyString = state.get(closeIndex).substr(3);
    state.goCursor(closeIndex + 3/* closing ``` */);
    const bodyLines = bodyString.split('\n');

    let lang: string | null = null;
    let content: string;
    if (bodyLines.length === 0) {
        // 一行
        content = bodyString
    } else if (bodyLines[0].match(/^[a-zA-Z]+$/) != null) {
        // 言語指定付き
        lang = bodyLines.shift()!;
        content = bodyLines.join("\n")
    } else {
        // 複数行
        content = bodyLines.join("\n")
    }

    state.pushToken(codeToken(lang, content));

    return true;
};

export = codeBlock

