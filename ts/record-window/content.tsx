import {Message as DiscordMessage, MessageReaction as DiscordMessageReaction, Snowflake} from "discord.js";
import {copyMessage, Message, MessageReaction, User} from "../common-objects/constant-discord-elements";
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
                {groupedMessages.map(([user, messages]) => <MessageGroup userInfo={user} messages={messages} key={user.id+"-"+(messages[0].id)}/>)}
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

    addMessage(messageInfo: Message) {
        this.setState((prev) => ({
            messages: prev.messages.concat(messageInfo)
        }))
    }

    removeMessage(messageInfo: Message) {
        this.setState((prev) => ({
            messages: prev.messages.filter(msg => msg.id != messageInfo.id)
        }))
    }

    editMessage(newMessage: Message) {
        this.setState((prev) => {
            const messages = prev.messages.slice();
            const idx = messages.findIndex(msg => msg.id == newMessage.id);
            if (idx == -1) return null;
            messages[idx] = newMessage;
            return {
                messages: messages
            }
        })
    }

    updateReaction(messageId: Snowflake, newReaction: MessageReaction) {
        this.setState((prev) => {
            const messages = prev.messages.slice();
            const idx = messages.findIndex(msg => msg.id == messageId);
            if (idx == -1) return null;
            const reactions = messages[idx].reactions.slice();
            const rIdx = reactions.findIndex(it => it.emoji.identifier == newReaction.emoji.identifier);
            if (rIdx == -1) {
                reactions.push(newReaction);
            } else {
                reactions[rIdx] = newReaction;
            }
            messages[idx] = copyMessage(messages[idx], {reactions});
            return {
                messages: messages
            }
        })
    }

    componentDidUpdate() {
        const node = ReactDOM.findDOMNode(this.endOfMsg) as Element;
        node.scrollIntoView({behavior: "smooth", block: "end"});
    }
}
