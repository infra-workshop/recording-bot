import {EventEmitter} from "events";
import {
    Client,
    MessageReaction as DiscordMessageReaction,
    User as DiscordUser,
    Message as DiscordMessage,
    Channel, Snowflake, VoiceChannel, TextChannel
} from "discord.js";
import {Message, MessageReaction, newMessage, newMessageReaction} from "../common-objects/constant-discord-elements";

interface DiscordControllerEvents {
    "add-message": [Message]
    "delete-message": [Message]
    "update-message": [Message]
    "update-reaction": [Snowflake, MessageReaction]
}

export class DiscordController extends EventEmitter {
    static async create(message: DiscordMessage): Promise<DiscordController>
    static async create(channel: TextChannel, voiceChannel: VoiceChannel): Promise<DiscordController>
    static async create(messageOrChannel: DiscordMessage|TextChannel, voiceChannelIn?: VoiceChannel): Promise<DiscordController> {
        let textChannel: TextChannel;
        let voiceChannel: VoiceChannel;
        if (messageOrChannel instanceof TextChannel) {
            textChannel = messageOrChannel;
            voiceChannel = voiceChannelIn!;
        } else {
            const msg = messageOrChannel as DiscordMessage;
            if (!(msg.channel instanceof TextChannel))
                throw TypeError("base message is not TextChannel");
            if (!msg.member!.voice.channel)
                throw TypeError("the use don't connected to voice channel.");
            textChannel = msg.channel;
            voiceChannel = msg.member!.voice.channel;
        }


        console.log("connect voice");
        const connection = await voiceChannel.join();
        connection.on("authenticated", () => { console.log("authenticated"); });
        // create our voice receiver
        const receiver = connection.receiver;
        return new DiscordController(textChannel.client, textChannel);
    }

    client: Client;
    eventHandlers: {[event: string]: (...args: any)=>void} = {};
    channel: TextChannel;

    private constructor(client: Client, channel: TextChannel) {
        super();

        const channelId = channel.id;
        this.channel = channel;
        this.client = client;

        this.eventHandlers["message"] = async (message: DiscordMessage) => {
            if (message.channel.id == channelId) {
                this.emit("add-message", newMessage(message))
            }
        };

        this.eventHandlers["messageDelete"] = async (message: DiscordMessage) => {
            if (message.channel.id == channelId) {
                this.emit("delete-message", newMessage(message))
            }
        };

        this.eventHandlers["messageUpdate"] = async (oldMessage: DiscordMessage, new_Message: DiscordMessage) => {
            if (new_Message.channel.id == channelId) {
                this.emit("update-message", newMessage(new_Message))
            }
        };

        this.eventHandlers["messageReactionAdd"] = async (messageReaction: DiscordMessageReaction, user: DiscordUser) => {
            if (messageReaction.message.channel.id == channelId) {
                this.emit("update-reaction", messageReaction.message.id, newMessageReaction(messageReaction))
            }
        };

        this.eventHandlers["messageReactionRemove"] = async (messageReaction: DiscordMessageReaction, user: DiscordUser) => {
            if (messageReaction.message.channel.id == channelId) {
                this.emit("update-reaction", messageReaction.message.id, newMessageReaction(messageReaction))
            }
        };

        for (let event in this.eventHandlers) {
            client.on(event, this.eventHandlers[event])
        }
    }

    emit<E extends keyof DiscordControllerEvents>(event: E | symbol, ...args: DiscordControllerEvents[E]): boolean {
        return super.emit(event, ...args)
    }

    on<E extends keyof DiscordControllerEvents>(event: E | symbol, listener: (...args: DiscordControllerEvents[E])=>void): this {
        return super.on(event, listener)
    }

    once<E extends keyof DiscordControllerEvents>(event: E | symbol, listener: (...args: DiscordControllerEvents[E])=>void): this {
        return super.once(event, listener)
    }

    destroy() {
        for (let event in this.eventHandlers) {
            this.client.removeListener(event, this.eventHandlers[event])
        }
    }
}
