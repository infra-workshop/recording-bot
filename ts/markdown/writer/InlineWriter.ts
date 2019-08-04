import {CustomWriter} from "./CustomWriter";
import {InlineToken} from "../Tokens";
import {Writer} from "./Writer";

const inline: CustomWriter<InlineToken> = function inline(writer: Writer, token: InlineToken) {
    writer.append(token.content.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;"));
};

export = inline;
