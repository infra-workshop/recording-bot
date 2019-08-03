import MarkdownIt from 'markdown-it';
import * as hljs from 'highlight.js';
import nop_paragraph from './nop_paragraph';
import emphasis_with_underlines_postProcess from './emphasis_with_underlines_postProcess';
import costumed_blockquote from './costumed_blockquote';

var options = {
    linkify: true,
    breaks: true,
    highlight: function (str: string, lang: string) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return '<pre><code class="hljs">' +
                    hljs.highlight(lang, str, true).value +
                    '</code></pre>';
            } catch (__) {}
        }
        return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
    }
}
var md = MarkdownIt(options)
    .disable(['link',
        'image',
        'heading',
        'paragraph',
        'lheading',
        'table',
        'html_block',
        'html_inline',
        'reference']);
md.block.ruler.push('nop_paragraph', nop_paragraph);
md.block.ruler.at('blockquote', costumed_blockquote);
md.inline.ruler2.at('emphasis', emphasis_with_underlines_postProcess);
md.linkify.set({fuzzyLink: false, fuzzyEmail: false});

export = md;
console.log(md.render(`
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

> yes block
> yes block l2
>noblock

========

> as
aa

`));
