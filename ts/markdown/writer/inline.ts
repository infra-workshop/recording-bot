import {CustomWriter} from "./CustomWriter";
import {InlineToken} from "../Tokens";
import {Writer} from "./Writer";
import {escapeHtml} from "../util";

const inline: CustomWriter<InlineToken> = function inline(writer: Writer, token: InlineToken) {
    writer.append(escapeHtml(token.content));
};

export default inline;
