import { Injectable } from '@angular/core';
import { isNullOrUndefined } from 'util';
import { ASTNode, Lexeme, LexemeRegex } from '../shared/ast';

const tokensRegex = [
  { regex: /true|false/, tokenType: Lexeme.BOOLEAN },
  { regex: /[ \s\t\n\r]+/, tokenType: Lexeme.WHITESPACE },
  { regex: /\[/, tokenType: Lexeme.START_SQUARE_BRACE },
  { regex: /]/, tokenType: Lexeme.END_SQUARE_BRACE },
  { regex: /"/, tokenType: Lexeme.QUOTE },
  { regex: /=/, tokenType: Lexeme.EQUALS },
  { regex: /{/, tokenType: Lexeme.START_BRACE },
  { regex: /[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/, tokenType: Lexeme.NUMBER },
  { regex: /}/, tokenType: Lexeme.END_BRACE },
  { regex: /,/, tokenType: Lexeme.COMMA },
  { regex: /^(?!class)([a-zA-Z]+)/, tokenType: Lexeme.STRING },
  { regex: /class/, tokenType: Lexeme.CLASS },
  { regex: /;/, tokenType: Lexeme.SEMICOLON }
];
@Injectable({
  providedIn: 'root'
})
export class ParserService {
  /**
   * Main method execution function for ParserService
   */
  generateAST(inputFile: string[]) {
    const ast = [];
    for (const inputString of inputFile) {
      const grammar = this.parser(inputString);
      if (!isNullOrUndefined(grammar.value)) {
        ast.push(grammar);
      }
    }
    return ast;
  }

  parser(inputString: string) {
    const lexemes = this.splitString(inputString);
    let index = 0;
    const parseType = () => {
      const node = new ASTNode(lexemes[index], Lexeme.DEFAULT, []);
      for (const tokenRegex of tokensRegex) {
        if (tokenRegex.regex.exec(lexemes[index])) {
          node.type = tokenRegex.tokenType;
        }
      }
      index++;
      while (lexemes[index]) {
        node.data.push(parseType());
      }
      return node;
    };

    return parseType();
  }

  /**
   * Split inputString and trim each item
   */
  splitString(inputString: string) {
    return inputString.split(' ').map(str => str.trim()).filter(str => str.length);
  }

  /**
   * Removes first occurrence of a string from a given string
   * Based on:
   * https://www.w3resource.com/javascript-exercises/javascript-string-exercise-26.php [Online] Accessed 12th November 2018
   */
  removeOccurrence(str: string, stringToFind: string) {
    const strIndex = str.indexOf(stringToFind);
    // if there is no occurrences
    if (strIndex === -1) {
      return str;
    }
    return str.slice(0, strIndex) + str.slice(strIndex + stringToFind.length);
  }
}
