'use strict';

import StateBlock = require("../types/markdown-it/lib/rules_block/state_block");

export = function paragraph(state: StateBlock, startLine: number/*, endLine*/) {
  let content;
  let terminate;
  let i;
  let l;
  let token;
  let nextLine = startLine + 1;
  let terminatorRules = state.md.block.ruler.getRules('paragraph');
  let endLine = state.lineMax;

  let oldParentType = state.parentType;
  state.parentType = 'paragraph';

  // jump line-by-line until empty one or EOF
  for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
    // this would be a code block normally, but after paragraph
    // it's considered a lazy continuation regardless of what's there
    if (state.sCount[nextLine] - state.blkIndent > 3) { continue; }

    // quirk for blockquotes, this line should already be checked by that rule
    if (state.sCount[nextLine] < 0) { continue; }

    // Some tags can terminate paragraph without empty line.
    terminate = false;
    for (i = 0, l = terminatorRules.length; i < l; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) { break; }
  }

  content = state.getLines(startLine, nextLine, state.blkIndent, false).trim();

  state.line = nextLine;

  token          = state.push('inline', '', 0);
  token.content  = content;
  token.map      = [ startLine, state.line ];
  token.children = [];

  state.parentType = oldParentType;

  return true;
};
