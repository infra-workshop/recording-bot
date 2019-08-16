import {Message, MessageReaction} from "../common-objects/constant-discord-elements";
import {Snowflake} from "ts/markdown/discord.js";

export default undefined;

declare global {
    interface Window {
        addMessage(messageInfo: Message): void

        removeMessage(messageInfo: Message): void

        editMessage(newMessage: Message): void

        updateReaction(messageId: Snowflake, newReaction: MessageReaction): void
    }
}
