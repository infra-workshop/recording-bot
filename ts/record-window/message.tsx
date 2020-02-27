///<reference path="../types/react-html-parser.d.ts"/>


import {Emoji, isEmoji, Message, MessageReaction, User} from "../common-objects/constant-discord-elements";
import * as React from "react";

interface MessageDataProps {
    isFirsInGroup: boolean
    messageInfo: Message
}

export function MessageData({isFirsInGroup, messageInfo}: MessageDataProps) {
    return (
        <div className='message-data'>
            {isFirsInGroup && <UserInfo userInfo={messageInfo.author}/>}
            <div className="message">
                <div className="message-body" dangerouslySetInnerHTML={{__html: messageInfo.contentHtml}}/>
                <div className="reactions-div">
                    <Reactions reactions={messageInfo.reactions}/>
                </div>
            </div>
        </div>
    )
}

const getAvatar = (user: User) => {
    if (user.avatar) {
        return (`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=40`);
    } else {
        return (`https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator.substr(-1)) % 5}.png?size=40`);
    }
};

interface ReactionsProps {
    reactions: MessageReaction[]
}

function Reactions({reactions}: ReactionsProps) {
    if (reactions.length == 0) return null;

    return (
        <span className='reactions'>
            {reactions.map(e => <Reaction reaction={e} key={e.emoji.identifier}/>)}
        </span>
    );
}

interface ReactionProps {
    reaction: MessageReaction
}

/**
 * 文字列を16進数に変換する
 * 16進数ひとけたの場合は01 02 03と表記する
 */
function hex(s: string): string {
    let result = "";
    for(let i=0; i<s.length; ++i){
        result += ("0"+s.charCodeAt(i).toString(16)).substr(-2);
    }
    return result;
}

function Reaction({reaction}: ReactionProps) {
    return (
        <div className="reaction">
            <div className="reaction-inner">
                {isEmoji(reaction.emoji) ?
                    <img src={reaction.emoji.url} alt="azasu" draggable={false} className="emoji"/> :
                    <span className="emoji-text">{reaction.emoji.name}</span>}
                <div className="reactionCount">{reaction.count}</div>
            </div>
        </div>
    );
}

interface UserInfoProps {
    userInfo: User
}

function UserInfo({userInfo}: UserInfoProps) {
    return (
        <h2 className='user-info'>
            <img className='icon' src={getAvatar(userInfo)}/>
            <span className='user-name'>{userInfo.nickname}</span>
        </h2>
    );
}
