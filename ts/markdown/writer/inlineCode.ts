import {CustomWriter} from "./CustomWriter";
import {InlineCodeToken} from "../Tokens";
import {Writer} from "./Writer";
import {escapeHtml} from "../util";

const inline_code: CustomWriter<InlineCodeToken> = function inline_code(writer: Writer, token: InlineCodeToken) {
    const content = token.content;

    return `<code class="hljs">${escapeHtml(content)}</code>`;
};

export = inline_code;
