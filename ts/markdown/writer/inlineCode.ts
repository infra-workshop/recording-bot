import {CustomWriter} from "./CustomWriter";
import {InlineCodeToken} from "../Tokens";
import {Writer} from "./Writer";
import {escapeHtml} from "../util";

const inlineCode: CustomWriter<InlineCodeToken> = function inlineCode(writer: Writer, token: InlineCodeToken) {
    const content = token.content;

    return `<code class="hljs">${escapeHtml(content)}</code>`;
};

export = inlineCode;
