import {Message} from "discord.js";
import {markdown, MarkdownOptions} from "./markdown";
import {discordInlineParsers, discordWriters} from "./markdown/discord";

function escapeHTMLRegex(regex: RegExp): RegExp {
    const source = regex.source;
    const newSource = source.replace('&', "(?:&amp;)")
        .replace('<', "(?:&lt;)")
        .replace('>', "(?:&gt;)")
        .replace('"', "(?:&quot;)");

    return new RegExp(newSource, regex.flags);
}

const wrapWithSpan = (mkMsg: (arg0: string) => string|[string, number]) => (msg: string) => {
    const result = mkMsg(msg);
    if (Array.isArray(result)) {
        const colorInt = result[1];
        const red = (colorInt >> 16) & 0xFF;
        const green = (colorInt >> 8) & 0xFF;
        const blue = (colorInt >> 0) & 0xFF;
        return `<span class="mention" style="color: rgb(${red}, ${green}, ${blue}); background-color: rgba(${red}, ${green}, ${blue}, .1)">${result[0]}</span>`
    } else {
        return `<span class="mention">${result}</span>`
    }
};

class MessageFormatter {
    public format(msg: Message): string {
        const options: MarkdownOptions = {
            inlineParsers: discordInlineParsers,
            writers: discordWriters,
            env: {
                message: msg
            }
        };
        return markdown(msg.content, options);
    }
}

export default new MessageFormatter();
