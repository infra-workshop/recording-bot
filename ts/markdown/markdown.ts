import MarkdownIt from 'markdown-it';
import * as hljs from 'highlight.js';
import nop_paragraph from './nop_paragraph';

var options = {
    linkify: true,
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
        'reference']);
md.block.ruler.push('nop_paragraph', nop_paragraph);
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
`));
