import {Message, MessageReaction} from "../common-objects/constant-discord-elements";
import {Snowflake} from "discord.js";

export default undefined;

declare global {
    interface Window {
        playAudio(buffer: ArrayBuffer): Promise<void>;
        addMessage(messageInfo: Message): void

        removeMessage(messageInfo: Message): void

        editMessage(newMessage: Message): void

        updateReaction(messageId: Snowflake, newReaction: MessageReaction): void
    }
}
