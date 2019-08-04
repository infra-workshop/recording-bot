import {BlockState} from "./BlockState";
import {Writer} from "./writer/Writer";
import {Token} from "./Token";
import {InlineState} from "./InlineState";
import {InlineToken} from "./Tokens";
import {InlineParser} from "./InlineParser";
import {CustomWriter} from "./writer/CustomWriter";
import {Env} from "./env";
import {BlockParser} from "./BlockParser";


const test = `
# hello world!
google.com 
anatawa12@icloud.com
![test](http://google.com/)
__test1*test2**test3*test4__

\`\`\`kotlin

fun TEST() { 
    println("line")
}

\`\`\`
<
hallo >&

\\*: *a*
\\_: _a_
\\*\\*: **a**
\\_\\_: __a__
\\~: ~a~
\\~\\~: ~~a~~

msg
> yes block
> yes block l2
>noblock

========

> as
aa

======

test
\`\`\`kotlin
fun test() {
    println("hallo")
   return

}
\`\`\`

    kotlin
    fun test() {
        println("hallo")
       return
    
    }
\`\`\`
`;

interface MarkdownOptions {
    inlineDefaultParsers?: boolean
    inlineParsers?: InlineParser[]
    blockDefaultParsers?: boolean
    blockParsers?: BlockParser[]
    defaultWriters?: boolean
    writers?: [string, CustomWriter<any>][]
    env?: Env
}

function replaceInline(blockTokens: Token[], options: MarkdownOptions) {
    const inlineTokens: Token[] = [];
    for (let blockToken of blockTokens) {
        if (blockToken.name == "inline") {
            const token = blockToken as InlineToken;
            const inlineState = new InlineState(token.content);
            if (options.inlineDefaultParsers == undefined || options.inlineDefaultParsers)
                inlineState.addDefaultParsers();
            if (options.inlineParsers)
                for (let inlineParser of options.inlineParsers)
                    inlineState.addParser(inlineParser);
            inlineTokens.push(...inlineState.parseAll(options.env));
        } else {
            inlineTokens.push(blockToken)
        }
    }
    return inlineTokens
}

function markdown(markdown: string, options: MarkdownOptions = {}): string {
    const state = new BlockState(markdown);
    if (options.blockDefaultParsers == undefined || options.blockDefaultParsers)
        state.addDefaultParsers();
    if (options.blockParsers)
        for (let blockParser of options.blockParsers)
            state.addParser(blockParser);
    const blockTokens = state.parseAll();
    const inlineTokens = replaceInline(blockTokens, options);
    const writer = new Writer(inlineTokens);
    if (options.defaultWriters == undefined || options.defaultWriters)
        writer.addDefaultWriters();
    if (options.writers)
        for (let [name, customWriter] of options.writers)
            writer.addWriter(name, customWriter);
    return writer.writeAll(options.env);
}

export = markdown;

//console.log(markdown(test));
