import {CustomWriter} from "./CustomWriter";
import {LinkToken} from "../Tokens";
import {escapeHtml} from "../util";

const link: CustomWriter<LinkToken> = function link(writer, token) {
    writer.append(`<a href="${escapeHtml(token.link)}">${escapeHtml(token.link)}</a>`)
};

export = link;
