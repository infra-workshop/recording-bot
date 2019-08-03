import {BlockState} from "./BlockState";
import {blockquote} from "./block/blockquote";
import {Writer} from "./writer/Writer";


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

function markdown(markdown: string): string {
    const state = new BlockState(markdown);
    state.addParser(blockquote);
    const blocktokens = state.parseAll();
    const writer = new Writer(blocktokens);
    return writer.writeAll();
}

export = markdown;

//console.log(markdown(test));
