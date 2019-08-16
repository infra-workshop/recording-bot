import {EventEmitter} from "events";
import {
    Client,
    MessageReaction as DiscordMessageReaction,
    User as DiscordUser,
    Message as DiscordMessage,
    Channel, Snowflake, VoiceChannel, TextChannel
} from "discord.js";
import {Message, MessageReaction, newMessage, newMessageReaction} from "../common-objects/constant-discord-elements";
import {AudioManager} from "../audioManager";

interface DiscordControllerEvents {
    "add-message": [Message]
    "delete-message": [Message]
    "update-message": [Message]
    "update-reaction": [Snowflake, MessageReaction]
    "on-voice": [Buffer]
}

export class DiscordController extends EventEmitter {
    private manager: AudioManager;

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
            if (!msg.member.voiceChannel)
                throw TypeError("the use don't connected to voice channel.");
            textChannel = msg.channel;
            voiceChannel = msg.member.voiceChannel;
        }


        console.log("connect voice");
        const connection = await voiceChannel.join();
        connection.on("authenticated", () => { console.log("authenticated"); });
        // create our voice receiver
        const receiver = connection.createReceiver();
        const manager = new AudioManager(receiver);
        return new DiscordController(manager, textChannel.client, textChannel);
    }

    private constructor(manager: AudioManager, client: Client, channel: TextChannel) {
        super();

        this.manager = manager;

        manager.on("audio", buffer => {
            this.emit("on-voice", buffer);
        });

        const channelId = channel.id;

        client.on('message', async (message: DiscordMessage) => {
            if (message.channel.id == channelId) {
                this.emit("add-message", newMessage(message))
            }
        });

        client.on('messageDelete', async (message: DiscordMessage) => {
            if (message.channel.id == channelId) {
                this.emit("delete-message", newMessage(message))
            }
        });

        client.on("messageUpdate", async (oldMessage: DiscordMessage, new_Message: DiscordMessage) => {
            if (new_Message.channel.id == channelId) {
                this.emit("update-message", newMessage(new_Message))
            }
        });

        client.on("messageReactionAdd", async (messageReaction: DiscordMessageReaction, user: DiscordUser) => {
            if (messageReaction.message.channel.id == channelId) {
                this.emit("update-reaction", messageReaction.message.id, newMessageReaction(messageReaction))
            }
        });

        client.on("messageReactionRemove", async (messageReaction: DiscordMessageReaction, user: DiscordUser) => {
            if (messageReaction.message.channel.id == channelId) {
                this.emit("update-reaction", messageReaction.message.id, newMessageReaction(messageReaction))
            }
        });
    }

    emit<E extends keyof DiscordControllerEvents>(event: E | symbol, ...args: DiscordControllerEvents[E]): boolean {
        return super.emit(event, args)
    }

    on<E extends keyof DiscordControllerEvents>(event: E | symbol, listener: (...args: DiscordControllerEvents[E])=>void): this {
        return super.on(event, listener)
    }

    once<E extends keyof DiscordControllerEvents>(event: E | symbol, listener: (...args: DiscordControllerEvents[E])=>void): this {
        return super.once(event, listener)
    }

    destroy() {
        this.manager.destroy();
    }
}
