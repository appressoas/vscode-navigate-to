import * as TreeSitterParser from 'tree-sitter';
//@ts-ignore
import * as PythonLanguage from 'tree-sitter-python';
import BaseParser from './BaseParser';
import BlockInfo from '../BlockInfo';

export default class PythonParser extends BaseParser {
    initializeParser(parser: TreeSitterParser) {
        parser.setLanguage(PythonLanguage);
    }

    postProcessBlockInfo(blockInfo: BlockInfo, cursor: TreeSitterParser.TreeCursor, type: string) {
        super.postProcessBlockInfo(blockInfo, cursor, type);
        // Prefix definition with export, export default, export const, ...
        if (cursor.currentNode.parent) {
            const parentType = cursor.currentNode.parent.type;
            if (parentType === 'decorated_definition') {
                const prefixStartNode = cursor.currentNode.parent;
                const prefix = this.normalizeWhiteSpaceIntoSingleLine(
                    this.sourceCode.substring(prefixStartNode.startIndex, cursor.currentNode.startIndex));
                blockInfo.definition = prefix + blockInfo.definition;
            }
        }
    }

    isGenericAtCursor(cursor: TreeSitterParser.TreeCursor) {
        const nodeType = cursor.nodeType;
        return nodeType === 'module' || nodeType === 'decorated_definition' || nodeType === 'expression_statement';
    }

    isClassAtCursor(cursor: TreeSitterParser.TreeCursor) {
        return cursor.nodeType === 'class_definition';
    }

    isClassBodyAtCursor(cursor: TreeSitterParser.TreeCursor) {
        return cursor.nodeType === 'block';
    }

    isClassNameAtCursor(cursor: TreeSitterParser.TreeCursor) {
        return cursor.nodeType === 'identifier';
    }

    includeInClassDefinition(cursor: TreeSitterParser.TreeCursor, code: string) {
        return code !== ':';
    }

    isFunctionAtCursor(cursor: TreeSitterParser.TreeCursor) {
        return cursor.nodeType === 'function_definition';
    }

    isFunctionBodyAtCursor(cursor: TreeSitterParser.TreeCursor) {
        return cursor.nodeType === 'block';
    }

    isFunctionNameAtCursor(cursor: TreeSitterParser.TreeCursor) {
        return cursor.nodeType === 'identifier';
    }

    includeInFunctionDefinition(cursor: TreeSitterParser.TreeCursor, code: string) {
        return code !== ':';
    }

    isVariableAtCursor(cursor: TreeSitterParser.TreeCursor) {
        return cursor.nodeType === 'assignment';
    }

    isVariableNameAtCursor(cursor: TreeSitterParser.TreeCursor) {
        // console.log(cursor.nodeType === 'expression_list', !cursor.currentNode.previousSibling)
        return (cursor.nodeType === 'expression_list' && !cursor.currentNode.previousSibling);
    }

    isVariableValueAtCursor(cursor: TreeSitterParser.TreeCursor) {
        return (!cursor.currentNode.nextSibling);
    }
}
