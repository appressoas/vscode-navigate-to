import * as TreeSitterParser from 'tree-sitter';
import BlockInfo from '../BlockInfo';

function blockInfoMapToPlainObject (map: Map<string, BlockInfo>) {
    let output: { [key: string]: any; } = {};
    for (let [key, blockInfo] of map.entries()) {
        output[key] = blockInfo.toPlainObject();
    }
    return output;
}

export default abstract class BaseParser {
    sourceCode: string;
    currentBlockPath: Array<string>;
    _currentBlockPathString: string|null;
    isWithinClass: boolean;
    classes: Map<string, BlockInfo>;
    functions: Map<string, BlockInfo>;
    methods: Map<string, BlockInfo>;
    variables: Map<string, BlockInfo>;

    // functionTypes: Set<string>;
    abstract initializeParser(parser: TreeSitterParser): void;

    abstract isGenericAtCursor(cursor: TreeSitterParser.TreeCursor): boolean;

    abstract isClassAtCursor(cursor: TreeSitterParser.TreeCursor): boolean;
    abstract isClassBodyAtCursor(cursor: TreeSitterParser.TreeCursor): boolean;
    abstract isClassNameAtCursor(cursor: TreeSitterParser.TreeCursor): boolean;

    abstract isFunctionAtCursor(cursor: TreeSitterParser.TreeCursor): boolean;
    abstract isFunctionBodyAtCursor(cursor: TreeSitterParser.TreeCursor): boolean;
    abstract isFunctionNameAtCursor(cursor: TreeSitterParser.TreeCursor): boolean;

    abstract isVariableAtCursor(cursor: TreeSitterParser.TreeCursor): boolean;
    abstract isVariableValueAtCursor(cursor: TreeSitterParser.TreeCursor): boolean;
    abstract isVariableNameAtCursor(cursor: TreeSitterParser.TreeCursor): boolean;

    constructor (sourceCode: string) {
        this.sourceCode = sourceCode;
        this.currentBlockPath = [];
        this._currentBlockPathString = null;
        this.isWithinClass = false;
        this.classes = new Map<string, BlockInfo>();
        this.functions = new Map<string, BlockInfo>();
        this.methods = new Map<string, BlockInfo>();
        this.variables = new Map<string, BlockInfo>();
    }

    makeParser () {
        const parser = new TreeSitterParser();
        this.initializeParser(parser);
        return parser;
    }

    get currentBlockPathString(): string {
        if (this._currentBlockPathString === null) {
            this._currentBlockPathString = this.currentBlockPath.join('.');
        }
        return <string>this._currentBlockPathString;
    }

    addToCurrentBlockPath (pathElement: string) {
        this._currentBlockPathString = null;
        this.currentBlockPath.push(pathElement);
    }

    removeLastCurrentBlockPath () {
        this._currentBlockPathString = null;
        this.currentBlockPath.pop();
    }

    postProcessBlockInfo (blockInfo: BlockInfo, cursor: TreeSitterParser.TreeCursor, type: string) {
        blockInfo.type = type;
        if (this.currentBlockPath.length > 0) {
            blockInfo.setPath(this.currentBlockPathString);
        }
    }

    normalizeWhiteSpaceIntoSingleLine (stringToNormalize: string) {
        return stringToNormalize.replace(/\\n/g, " ").replace(/\s+/g, " ");
    }

    //
    // Handle classes
    //

    includeInClassDefinition (cursor: TreeSitterParser.TreeCursor, code: string) {
        return true;
    }

    collectClassDefinition (cursor: TreeSitterParser.TreeCursor, blockInfo: BlockInfo) {
        const code = this.sourceCode.substring(cursor.startIndex, cursor.endIndex);
        const isClassName = this.isClassNameAtCursor(cursor);
        if (!isClassName && !this.includeInClassDefinition(cursor, code)) {
            return;
        }
        if (blockInfo.definition !== '') {
            blockInfo.definition += ' ';
        }
        blockInfo.definition += code;
        if (isClassName) {
            blockInfo.name = code;
        }
    }

    parseClass (cursor: TreeSitterParser.TreeCursor) {
        // Walk through all children
        const blockInfo = new BlockInfo(cursor.startIndex, cursor.endIndex);
        let foundBody = false;
        if (cursor.gotoFirstChild()) {
            // Collect definition - parse until we find the body of the class
            this.collectClassDefinition(cursor, blockInfo);
            while (cursor.gotoNextSibling()) {
                if (cursor.nodeIsNamed && this.isClassBodyAtCursor(cursor)) {
                    foundBody = true;
                    break;
                } else {
                    this.collectClassDefinition(cursor, blockInfo);
                }
            }
            if (blockInfo.name && foundBody) {
                this.addToCurrentBlockPath(blockInfo.name);

                
                // We are currently on the class body cursor!
                // Parse the class body
                this.isWithinClass = true;
                this.parseGeneric(cursor);
                this.isWithinClass = false;

                // Set cursor back to class, and finish up
                cursor.gotoParent();
                this.removeLastCurrentBlockPath();
                this.postProcessBlockInfo(blockInfo, cursor, 'class');
                this.classes.set(blockInfo.name, blockInfo);
            } else {
                cursor.gotoParent(); // Set cursor back to class
            }
        }
    }

    //
    // Handle functions
    //

    includeInFunctionDefinition (cursor: TreeSitterParser.TreeCursor, code: string) {
        return true;
    }
    
    collectFunctionDefinition (cursor: TreeSitterParser.TreeCursor, blockInfo: BlockInfo) {
        const code = this.sourceCode.substring(cursor.startIndex, cursor.endIndex);
        const isFunctionName = this.isFunctionNameAtCursor(cursor);
        if (!isFunctionName && !this.includeInFunctionDefinition(cursor, code)) {
            return;
        }
        if (isFunctionName && blockInfo.definition !== '') {
            blockInfo.definition += ' ';
        }
        blockInfo.definition += code;
        if (isFunctionName) {
            blockInfo.name = code;
        }
    }

    functionIsMethod (cursor: TreeSitterParser.TreeCursor) {
        return this.isWithinClass;
    }

    parseFunction (cursor: TreeSitterParser.TreeCursor) {
        // Walk through all children
        const blockInfo = new BlockInfo(cursor.startIndex, cursor.endIndex);
        let foundBody = false;
        if (cursor.gotoFirstChild()) {
            // Collect definition - parse until we find the body of the function
            this.collectFunctionDefinition(cursor, blockInfo);
            while (cursor.gotoNextSibling()) {
                if (cursor.nodeIsNamed && this.isFunctionBodyAtCursor(cursor)) {
                    foundBody = true;
                    break;
                } else {
                    this.collectFunctionDefinition(cursor, blockInfo);
                }
            }
            if (blockInfo.name && foundBody) {
                this.addToCurrentBlockPath(blockInfo.name);

                // Note: We do not parse into function/method "body" since we limit ourselves
                // to classes, functions, class variables and global variables.

                // Set cursor back to function, and finish up
                cursor.gotoParent();
                this.removeLastCurrentBlockPath();

                if (this.isWithinClass) {
                    this.postProcessBlockInfo(blockInfo, cursor, 'method');
                    this.methods.set(blockInfo.name, blockInfo);
                } else {
                    this.postProcessBlockInfo(blockInfo, cursor, 'function');
                    this.functions.set(blockInfo.name, blockInfo);
                }
            } else {
                cursor.gotoParent(); // Set cursor back to function
            }
        }
    }

    //
    // Handle variables
    //

    includeInVariableDefinition (cursor: TreeSitterParser.TreeCursor, code: string) {
        return true;
    }
    
    collectVariableDefinition (cursor: TreeSitterParser.TreeCursor, blockInfo: BlockInfo) {
        const code = this.sourceCode.substring(cursor.startIndex, cursor.endIndex);
        const isVariableName = this.isVariableNameAtCursor(cursor);
        if (!isVariableName && !this.includeInVariableDefinition(cursor, code)) {
            return;
        }
        blockInfo.definition += code;
        if (!blockInfo.definition.endsWith(' ')) {
            blockInfo.definition += ' ';
        }
        if (isVariableName) {
            blockInfo.name = code;
        }
    }

    makePrettyVariableValue (cursor: TreeSitterParser.TreeCursor) {
        const variableValue = this.normalizeWhiteSpaceIntoSingleLine(
            this.sourceCode.substring(cursor.currentNode.startIndex, cursor.currentNode.endIndex));
        const maxLength = 40;
        if (variableValue.length > maxLength) {
            const halfLengts = maxLength/2 - 2;
            return `${variableValue.substring(0, halfLengts)}...${variableValue.substring(variableValue.length - halfLengts, variableValue.length)}`;
        }
        return variableValue;
    }

    variableValueIsFunction (cursor: TreeSitterParser.TreeCursor) {
        return false;
    }

    makePrettyFunctionVariableValue (cursor: TreeSitterParser.TreeCursor) {
        return '';
    }

    parseVariable (cursor: TreeSitterParser.TreeCursor) {
        // Walk through all children
        const blockInfo = new BlockInfo(cursor.startIndex, cursor.endIndex);
        let foundValue = false;
        if (cursor.gotoFirstChild()) {
            // Collect definition - parse until we find the body of the variable
            this.collectVariableDefinition(cursor, blockInfo);
            while (cursor.gotoNextSibling()) {
                if (cursor.nodeIsNamed && this.isVariableValueAtCursor(cursor)) {
                    foundValue = true;
                    break;
                } else {
                    this.collectVariableDefinition(cursor, blockInfo);
                }
            }
            if (blockInfo.name && foundValue) {
                this.addToCurrentBlockPath(blockInfo.name);

                // We are currently on the variable body cursor!
                // Parse the variable body
                const valueIsFunction = this.variableValueIsFunction(cursor);
                if (valueIsFunction) {
                    blockInfo.definition += this.makePrettyFunctionVariableValue(cursor);
                } else {
                    blockInfo.definition += this.makePrettyVariableValue(cursor);
                }
                // this.parseGeneric(cursor);

                // Set cursor back to variable, and finish up
                cursor.gotoParent();
                this.removeLastCurrentBlockPath();
                if (valueIsFunction) {
                    this.postProcessBlockInfo(blockInfo, cursor, 'function_as_variable');
                    this.functions.set(blockInfo.name, blockInfo);
                } else {
                    this.postProcessBlockInfo(blockInfo, cursor, 'variable');
                    this.variables.set(blockInfo.name, blockInfo);
                }
            } else {
                cursor.gotoParent(); // Set cursor back to variable
            }
        }
    }

    //
    // Handle generic (e.g. things to traverse into, but ignore)
    //

    parseGeneric (cursor: TreeSitterParser.TreeCursor) {
        if (cursor.gotoFirstChild()) {
            this.parseBlockAndGoToNextSibling(cursor);
            cursor.gotoParent(); // Go back up to the place we started when entering the method
        }        
    }

    //
    // Parsing
    //

    parseBlockAndGoToNextSibling (cursor: TreeSitterParser.TreeCursor) {
        // this.prettyLogCursor(cursor, 'parseBlockAndGoToNextSibling: ');
        if (this.isClassAtCursor(cursor)) {
            this.parseClass(cursor);
        } else if (this.isFunctionAtCursor(cursor)) {
            this.parseFunction(cursor);
        } else if (this.isVariableAtCursor(cursor)) {
            this.parseVariable(cursor);
        } else if (this.isGenericAtCursor(cursor)) {
            this.parseGeneric(cursor);
        // } else {
        //     console.log('Skipping unknown node type:', cursor.nodeType, ' isNamed:', cursor.currentNode.isNamed);
        }
        if (cursor.gotoNextSibling()) {
            this.parseBlockAndGoToNextSibling(cursor);
        }
    }

    parse () {
        const parser = this.makeParser();
        const tree = parser.parse(this.sourceCode);
        const cursor = tree.walk();
        this.parseBlockAndGoToNextSibling(cursor);
    }

    //
    // Debugging / development helpers
    // - mostly useful when adding support for more languages,
    //   or fixing issues with currently supported languages.
    //

    prettyFormatCursor (cursor: TreeSitterParser.TreeCursor) {
        return JSON.stringify({
            nodeIsNamed: cursor.nodeIsNamed,
            nodeType: cursor.nodeType,
            startIndex: cursor.startIndex,
            endIndex: cursor.endIndex
        });
    }

    prettyLogCursor (cursor: TreeSitterParser.TreeCursor, prefix: string = '') {
        console.log(`${prefix}${this.prettyFormatCursor(cursor)}`);
    }

    prettyFormatNode (node: TreeSitterParser.SyntaxNode, level: number) {
        let output = new Array<string>();
        output.push(
            ' '.repeat(level * 3) +
            `${node.type} (isNamed: ${node.isNamed}) ` +
            `[l:${node.startPosition.row},c:${node.startPosition.column}]->[l:${node.endPosition.row},c:${node.endPosition.column}]`
        );
        for (let childNode of node.children) {
            Array.prototype.push.apply(output, this.prettyFormatNode(childNode, level + 1));
        }
        return output;
    }

    prettyFormatParsingTree () {
        const parser = this.makeParser();
        const tree = parser.parse(this.sourceCode);
        return this.prettyFormatNode(tree.rootNode, 0);
    }

    prettyLogParsingTree () {
        console.log(this.prettyFormatParsingTree().join('\n'));
    }

    toPlainObject () {
        return {
            classes: blockInfoMapToPlainObject(this.classes),
            functions: blockInfoMapToPlainObject(this.functions),
            methods: blockInfoMapToPlainObject(this.methods),
            variables: blockInfoMapToPlainObject(this.variables),
        };
    }
}
