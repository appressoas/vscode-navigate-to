import * as TreeSitterParser from 'tree-sitter';
//@ts-ignore
import * as JavaScriptLanguage from 'tree-sitter-javascript';
import BaseParser from './BaseParser';
import BlockInfo from '../BlockInfo';


export default class JavaScriptParser extends BaseParser {
    initializeParser(parser: TreeSitterParser) {
        parser.setLanguage(JavaScriptLanguage);
    }

    postProcessBlockInfo(blockInfo: BlockInfo, cursor: TreeSitterParser.TreeCursor, type: string) {
        super.postProcessBlockInfo(blockInfo, cursor, type);
        // Prefix definition with export, export default, export const, ...
        if (cursor.currentNode.parent) {
            let prefixStartNode = null;
            const parentType = cursor.currentNode.parent.type;
            if (parentType === 'lexical_declaration' || parentType === 'variable_declaration') {
                if (cursor.currentNode.parent.parent && cursor.currentNode.parent.parent.type === 'export_statement') {
                    prefixStartNode = cursor.currentNode.parent.parent;
                } else {
                    prefixStartNode = cursor.currentNode.parent;
                }
            } else if (parentType === 'export_statement') {
                prefixStartNode = cursor.currentNode.parent;
            }
            if (prefixStartNode) {
                const prefix = this.sourceCode.substring(prefixStartNode.startIndex, cursor.currentNode.startIndex);
                blockInfo.definition = prefix + blockInfo.definition;
            }
        }
    }

    isGenericAtCursor(cursor: TreeSitterParser.TreeCursor) {
        const nodeType = cursor.nodeType;
        return nodeType === 'program' || nodeType === 'export_statement' 
            || nodeType === 'lexical_declaration' || nodeType === 'variable_declaration';
    }

    isClassAtCursor(cursor: TreeSitterParser.TreeCursor) {
        const nodeType = cursor.nodeType;
        return nodeType === 'class_declaration' || nodeType === 'class';
    }

    isClassBodyAtCursor(cursor: TreeSitterParser.TreeCursor) {
        return cursor.nodeType === 'class_body';
    }

    isClassNameAtCursor(cursor: TreeSitterParser.TreeCursor) {
        return cursor.nodeType === 'identifier';
    }

    isFunctionAtCursor(cursor: TreeSitterParser.TreeCursor) {
        return cursor.nodeType === 'function_declaration' || cursor.nodeType === 'function' || cursor.nodeType === 'method_definition';
    }

    isFunctionBodyAtCursor(cursor: TreeSitterParser.TreeCursor) {
        return cursor.nodeType === 'statement_block';
    }

    isFunctionNameAtCursor(cursor: TreeSitterParser.TreeCursor) {
        return cursor.nodeType === 'identifier' || cursor.nodeType === 'property_identifier';
    }

    isVariableAtCursor(cursor: TreeSitterParser.TreeCursor) {
        return cursor.nodeType === 'variable_declarator' || cursor.nodeType === 'public_field_definition';
    }

    isVariableNameAtCursor(cursor: TreeSitterParser.TreeCursor) {
        return cursor.nodeType === 'identifier' || cursor.nodeType === 'property_identifier';
    }

    isVariableValueAtCursor(cursor: TreeSitterParser.TreeCursor) {
        return (!cursor.currentNode.nextSibling);
    }

    variableValueIsFunction (cursor: TreeSitterParser.TreeCursor) {
        return cursor.nodeType === 'arrow_function';
    }

    makePrettyFunctionVariableValue (cursor: TreeSitterParser.TreeCursor) {
        if (cursor.currentNode.firstChild) {
            return this.sourceCode.substring(cursor.currentNode.firstChild.startIndex, cursor.currentNode.firstChild.endIndex);
        }
        return '';
    }
}
