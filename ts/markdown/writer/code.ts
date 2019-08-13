import {CustomWriter} from "./CustomWriter";
import {CodeToken} from "../Tokens";
import {Writer} from "./Writer";
import {getLanguage, highlight} from "highlight.js";
import {escapeHtml} from "../util";

const code: CustomWriter<CodeToken> = function code(writer: Writer, token: CodeToken) {
    const lang = token.lang;
    const content = token.content;

    if (lang && getLanguage(lang)) {
        try {
            writer.append(`<pre><code class="hljs">${highlight(lang, content, true).value}</code></pre>`);
            return;
        } catch (__) {
        }
    }
    writer.append(`<pre><code class="hljs">${escapeHtml(content)}</code></pre>`);
};

export default code;
