// Process *this* and _that_
//
'use strict';

import StateInline = require("../types/markdown-it/lib/rules_inline/state_inline");


// Walk through delimiter list and replace text tokens with tags
//
export = function emphasis_with_underlines_postProcess(state: StateInline) {
  let i;
  let startDelim;
  let endDelim;
  let token;
  let ch;
  let isStrong;
  let delimiters = state.delimiters;
  let max = state.delimiters.length;

  for (i = max - 1; i >= 0; i--) {
    startDelim = delimiters[i];

    if (startDelim.marker !== 0x5F/* _ */ && startDelim.marker !== 0x2A/* * */) {
      continue;
    }

    // Process only opening markers
    if (startDelim.end === -1) {
      continue;
    }

    endDelim = delimiters[startDelim.end];

    // If the previous delimiter has the same marker and is adjacent to this one,
    // merge those into one strong delimiter.
    //
    // `<em><em>whatever</em></em>` -> `<strong>whatever</strong>`
    //
    isStrong = i > 0 &&
               delimiters[i - 1].end === startDelim.end + 1 &&
               delimiters[i - 1].token === startDelim.token - 1 &&
               delimiters[startDelim.end + 1].token === endDelim.token + 1 &&
               delimiters[i - 1].marker === startDelim.marker;

    ch = String.fromCharCode(startDelim.marker);

    let kind: string;
    if (!isStrong) {
      kind = "em"
    } else {
      if (startDelim.marker === 0x5F /* _ */) {
        kind = "u"
      } else {
        kind = "strong"
      }
    }

    token         = state.tokens[startDelim.token];
    token.type    = kind + '_open';
    token.tag     = kind;
    token.nesting = 1;
    token.markup  = isStrong ? ch + ch : ch;
    token.content = '';

    token         = state.tokens[endDelim.token];
    token.type    = kind + '_close';
    token.tag     = kind;
    token.nesting = -1;
    token.markup  = isStrong ? ch + ch : ch;
    token.content = '';

    if (isStrong) {
      state.tokens[delimiters[i - 1].token].content = '';
      state.tokens[delimiters[startDelim.end + 1].token].content = '';
      i--;
    }
  }
};
