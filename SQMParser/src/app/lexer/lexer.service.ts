import { Injectable } from '@angular/core';

const tokens = [
  { regex: /^\s+/, tokenType: 'WHITESPACE' },
  { regex: /[\r\n]+/, tokenType: 'EOL' },
  { regex: /^[{]/, tokenType: 'START_BRACE' },
  { regex: /^[}]/, tokenType: 'END_BRACE' },
  { regex: /^[\[\]]/, tokenType: 'BRACKET' },
  { regex: /;$/, tokenType: 'SEMICOLON' },
  { regex: /=/, tokenType: 'EQUALS' },
  { regex: /^,/, tokenType: 'COMMA' },
  { regex: /,$/, tokenType: 'TRAILING_COMMA' },
  // { regex: /[0-9]/, tokenType: 'MISSION'},
  { regex: /(version\s*=\s*)[0-99]/, tokenType: 'VERSION'},
  // { regex: /[0-9]/, tokenType: 'VARIABLE'},
  // { regex: /[0-9]/, tokenType: 'CLASS'},
  // { regex: /[0-9]/, tokenType: 'ARRAY'},
  // { regex: /[0-9]/, tokenType: 'IMPORT'},
  // { regex: /[0-9]/, tokenType: 'DATA_TYPE'},
  // { regex: /[0-9]/, tokenType: 'PRIMITIVE'},
  // { regex: /[0-9]/, tokenType: 'VARIABLE_NAME'},
  { regex: /[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/, tokenType: 'NUMBER'},
  { regex: /^true|false/, tokenType: 'BOOLEAN'},
  { regex: /^"(?:\\.|[^"])*"/, tokenType: 'STRING'}
];
@Injectable({
  providedIn: 'root'
})
export class LexerService {
  /**
   * Returns {type: x, value: y} found by the 'tokens' regex
   * Based on:
   * http://www.thinksincode.com/2016/10/30/create-a-basic-lexer.html Accessed 16th October 2018
  */
  getTokens(input: string[]) {
    const foundTokens = [];
    input.forEach(inputElement => {
      tokens.forEach(token => {
        if (token.regex.test(inputElement)) {
          foundTokens.push({ type: token.tokenType, value: inputElement });
        }
      });
    });
    return foundTokens;
  }

  /**
   * Outputs tokens found by the token regex to the console
   * Based on:
   * http://www.thinksincode.com/2016/10/30/create-a-basic-lexer.html Accessed 16th October 2018
  */
  async getTokensToConsole(input: string[]) {
    input.forEach(inputElement => {
      tokens.forEach(token => {
        if (token.regex.test(inputElement)) {
          console.log('Found: ' + inputElement + ' Matching: ' + token.tokenType);
        }
      });
    });
  }

  /**
   * Checks input to see if it matches version regex
   */
  async hasVersion(input: string[]) {
    const regex = /(version\s*=\s*)[0-99]/;
    return regex.test(input[0]);
  }
}
