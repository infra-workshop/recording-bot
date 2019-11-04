import {Message as DiscordMessage} from "discord.js";
import {markdown, MarkdownOptions} from "../markdown";
import {discordInlineParsers, discordWriters} from "../markdown/discord";

class MessageFormatter {
    public format(msg: DiscordMessage): string {
        const options: MarkdownOptions = {
            inlineParsers: discordInlineParsers,
            writers: discordWriters,
            env: {
                message: msg
            }
        };
        let result = markdown(msg.content, options);

        if (msg.embeds.length != 0) {
            // with embed
            const append = "<span class='gray'>&lt;ambeds&gt;</span>";
            result = result == "" ? append : `${result}\n${append}`;
        }

        if (msg.attachments.size != 0) {
            let isFile = false;
            let isImage = false;
            for (let value of msg.attachments.values()) {
                if (value.height) {
                    isImage = true
                } else {
                    isFile = true
                }
                if (isImage && isFile) break
            }
            const fileTypes: string[] = [];
            if (isFile) fileTypes.push("files");
            if (isImage) fileTypes.push("images", "videos");

            const append = `<span class='gray'>&lt;${makeAOrB(fileTypes)}&gt;</span>`;
            result = result == "" ? append : `${result}\n${append}`;
        }

        return result;
    }
}

function makeAOrB(values: string[]): string {
    if (values.length == 1) return values[0];
    const rest = values.pop();
    return values.join(", ") + ", or " + rest
}

export default new MessageFormatter();
