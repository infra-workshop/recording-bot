import {Message, MessageReaction} from "../common-objects/constant-discord-elements";
import {Snowflake} from "discord.js";

export default undefined;

declare global {
    interface Window {
        startAudio(user: Snowflake): void;
        playAudio(user: Snowflake, buffer: ArrayBuffer): Promise<void>;
        endAudio(user: Snowflake): void;

        addMessage(messageInfo: Message): void

        removeMessage(messageInfo: Message): void

        editMessage(newMessage: Message): void

        updateReaction(messageId: Snowflake, newReaction: MessageReaction): void
    }
}
