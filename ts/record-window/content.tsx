import {Message as DiscordMessage, MessageReaction as DiscordMessageReaction} from "discord.js";
import {Message, MessageReaction, User} from "./constant-discord-elements";
import * as React from "react";
import {MessageData} from "./message";
import * as ReactDOM from "react-dom";

interface MessageGroupProps {
    userInfo: User
    messages: Message[]
}

function MessageGroup({userInfo, messages}: MessageGroupProps) {
    return (
        <div className={`message-group message-by-${userInfo.id}`}>
            {messages.map((message, i) => <MessageData isFirsInGroup={i == 0} messageInfo={message} key={message.id}/>)}
            <hr className="divider-end-msg"/>
        </div>
    );
}

interface ContentProps {
}

interface ContentState {
    messages: Message[];
}

export class Content extends React.Component<ContentProps, ContentState> {
    constructor(props: ContentProps) {
        super(props);
        this.state = {messages:[]};
    }
    private endOfMsg: HTMLDivElement;

    render() {
        const groupedMessages = this.createGroupedMessages();

        return (
            <div className="content">
                {groupedMessages.map(([user, messages]) => <MessageGroup userInfo={user} messages={messages} key={user.id+(messages.length + "")}/>)}
                <div ref={(ref) => this.endOfMsg = ref}/>
            </div>
        );
    }

    createGroupedMessages(): [User, Message[]][] {
        const {messages} = this.state;
        const groupedMessages: [User, Message[]][] = [];
        let prevPair: [User, Message[]]|null = null;

        for (let message of messages) {
            if (!prevPair || prevPair[0].id != message.author.id) {
                if (prevPair)groupedMessages.push(prevPair);
                prevPair = [message.author, [message]]
            } else {
                prevPair[1].push(message)
            }
        }
        if (prevPair) groupedMessages.push(prevPair);
        return groupedMessages
    }

    addMessage(messageInfo: DiscordMessage) {
        this.setState((prev) => ({
            messages: prev.messages.concat(new Message(messageInfo))
        }))
    }

    removeMessage(messageInfo: DiscordMessage) {
        this.setState((prev) => ({
            messages: prev.messages.filter(msg => msg.id != messageInfo.id)
        }))
    }

    editMessage(newMessage: DiscordMessage) {
        this.setState((prev) => {
            const messages = prev.messages.slice();
            const idx = messages.findIndex(msg => msg.id == newMessage.id);
            if (idx == -1) return null;
            messages[idx] = new Message(newMessage);
            return {
                messages: messages
            }
        })
    }

    updateReaction(newReaction: DiscordMessageReaction) {
        this.setState((prev) => {
            const messages = prev.messages.slice();
            const idx = messages.findIndex(msg => msg.id == newReaction.message.id);
            if (idx == -1) return null;
            const reactions = messages[idx].reactions.slice();
            const rIdx = reactions.findIndex(it => it.emoji.identifier == newReaction.emoji.identifier);
            if (rIdx == -1) {
                reactions.push(new MessageReaction(newReaction));
            } else {
                reactions[rIdx] = new MessageReaction(newReaction);
            }
            messages[idx] = messages[idx].copy({reactions});
            return {
                messages: messages
            }
        })
    }

    componentDidUpdate() {
        const node = ReactDOM.findDOMNode(this.endOfMsg) as Element;
        node.scrollIntoView({behavior: "smooth"});
    }
}