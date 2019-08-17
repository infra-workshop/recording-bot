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
        return markdown(msg.content, options);
    }
}

export default new MessageFormatter();