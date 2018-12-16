import { Injectable } from '@angular/core';
import { isNullOrUndefined } from 'util';
import { TreeNode, Token } from '../shared/shared';

const tokensRegex = [
  { regex: /true|false/, tokenType: Token.BOOLEAN },
  { regex: /\[/, tokenType: Token.START_SQUARE_BRACE },
  { regex: /]/, tokenType: Token.END_SQUARE_BRACE },
  { regex: /"/, tokenType: Token.QUOTE },
  { regex: /=/, tokenType: Token.EQUALS },
  { regex: /{/, tokenType: Token.START_BRACE },
  { regex: /[\+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][\+\-]?\d+)?/, tokenType: Token.NUMBER },
  { regex: /}/, tokenType: Token.END_BRACE },
  { regex: /,/, tokenType: Token.COMMA },
  { regex: /[a-zA-Z]+/, tokenType: Token.STRING },
  { regex: /;/, tokenType: Token.SEMICOLON }
];
const symbolTable = [
  { tokenType: Token.STRING, potentialNext: [Token.EQUALS, Token.START_SQUARE_BRACE, Token.QUOTE]},
  { tokenType: Token.EQUALS, potentialNext: [Token.STRING, Token.START_BRACE, Token.QUOTE, Token.NUMBER, Token.BOOLEAN]},
  { tokenType: Token.START_BRACE, potentialNext: [Token.STRING, Token.END_BRACE, Token.QUOTE, Token.NUMBER, Token.BOOLEAN, Token.CLASS]},
  { tokenType: Token.END_BRACE, potentialNext: [Token.SEMICOLON]},
  { tokenType: Token.START_SQUARE_BRACE, potentialNext: [Token.END_SQUARE_BRACE]},
  { tokenType: Token.END_SQUARE_BRACE, potentialNext: [Token.EQUALS]},
  { tokenType: Token.SEMICOLON, potentialNext: [Token.STRING, Token.END_BRACE]},
  { tokenType: Token.COMMA, potentialNext: [Token.QUOTE, Token.NUMBER, Token.BOOLEAN]},
  { tokenType: Token.QUOTE, potentialNext: [Token.STRING, Token.END_BRACE, Token.SEMICOLON, Token.COMMA, Token.QUOTE]},
  { tokenType: Token.NUMBER, potentialNext: [Token.SEMICOLON, Token.COMMA]},
  { tokenType: Token.BOOLEAN, potentialNext: [Token.SEMICOLON, Token.COMMA]},
  { tokenType: Token.CLASS, potentialNext: [Token.STRING, Token.START_BRACE]}
];
@Injectable({
  providedIn: 'root'
})
export class ParserService {
  /**
   * Main method execution function for ParserService
   */
  generateTree(inputFile: string[]) {
    const tree: TreeNode[] = [];
    for (const inputString of inputFile) {
      const grammar = this.parser(inputString);
      if (!isNullOrUndefined(grammar.value)) {
        tree.push(grammar);
      }
    }
    return tree;
  }

  /**
   * Splits the input string into an array, tests Lexeme regex against it
   * if successful, set the type
   * Compilers: Principles, Techniques, and Tools (2nd Edition) pp.79-80. Accessed 21st November 2018
   */
  parser(inputString: string) {
    const lexemes = this.splitString(inputString);
    let index = 0;
    const containingTypes: Token[] = [];
    const parseType = () => {
      const newNode = new TreeNode(lexemes[index], Token.DEFAULT, undefined);
      for (const tokenRegex of tokensRegex) {
        if (tokenRegex.regex.test(lexemes[index])) {
          if (lexemes[index] === 'class') {
            newNode.value += ' ';
            newNode.nodeType = Token.CLASS;
          } else {
            newNode.nodeType = tokenRegex.tokenType;
          }
          containingTypes.push(newNode.nodeType);
          break;
        }
      }
      index++;
      while (lexemes[index]) {
        newNode.innerNode = parseType();
      }
      return newNode;
    };
    const node = parseType();
    node.containingTypes = containingTypes;
    return node;
  }

  removeNode(index: number, missionTree: TreeNode[]) {
    return missionTree.slice(index, (index + 1));
  }

  addNode(index: number, missionTree: TreeNode[], nodeToAdd: TreeNode) {
    return missionTree.splice(index, 1, nodeToAdd);
  }

  parseAndAddNode(index: number, missionTree: TreeNode[], inputString: string) {
    const nodeToAdd = this.parser(inputString);
    return this.addNode(index, missionTree, nodeToAdd);
  }

  /**
   * Traverse a passed tree, return a string of the value of each node traversed
   * Compilers: Principles, Techniques, and Tools (2nd Edition) pp.56-68. Accessed 21st November 2018
   */
  traverseNodeValue(nodeToTraverse: TreeNode) {
    if (isNullOrUndefined(nodeToTraverse)) {
      return '';
    }
    let str = '';
    const traverse = (node: TreeNode) => {
      if (node) {
        str += node.value;
        traverse(node.innerNode);
      }
    };
    traverse(nodeToTraverse);
    return str;
  }

  /**
   * Find missing semicolons and braces in a given missionTree
   */
  findErrors(missionTree: TreeNode[], startIndex: number, endIndex: number) {
    for (startIndex; startIndex < endIndex; startIndex++) {
      const first = missionTree[startIndex].containingTypes[0];
      const last = missionTree[startIndex].containingTypes[(missionTree[startIndex].containingTypes.length - 1)];
      if (first !== Token.CLASS) {
        if (last !== Token.START_BRACE && last !== Token.COMMA) {
          if (last !== Token.SEMICOLON && missionTree[startIndex].containingTypes[1] !== Token.START_SQUARE_BRACE) {
            missionTree[startIndex].error = 'Missing: ' + Token.SEMICOLON + ' at the end of line ' + (startIndex + 1) + '!';
          }
        }
      } else {
        if (!isNullOrUndefined(missionTree[(startIndex + 1)])) {
          if (missionTree[(startIndex + 1)].containingTypes[0] !== Token.START_BRACE) {
            missionTree[startIndex].error = 'Missing: ' + Token.START_BRACE + ' at the start of line ' + (startIndex + 2) + '!';
          }
        }
      }
      if (missionTree[startIndex].containingTypes.includes(Token.DEFAULT)) {
        missionTree[startIndex].error = 'Unrecognised Token on line ' + (startIndex + 1) + '!';
      }
    }
    return missionTree;
  }

  /**
   * Produces tokens to lexically analyse
   * Split the input string on terminals [ \s\t\n\r\[\]"={},;] globally with a positive lookahead
   * then map the results by trimming and filterting by length.
   */
  splitString(inputString: string) {
    return inputString.split(/(?=[ \s\t\n\r\[\]\"\=\{\}\,\;]+)/g).map(str => str.trim()).filter(str => str.length);
  }
}
