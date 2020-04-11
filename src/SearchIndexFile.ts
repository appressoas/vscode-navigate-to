import { promises as fsPromises } from 'fs';
import * as Fuse from 'fuse.js';
import * as vscode from 'vscode';
import * as path from 'path';
import BlockInfo from './BlockInfo';
import SearchResult from "./SearchResult";
import { PARSERS } from './parsers/parsers';

export default class SearchIndexFile {
    classes: Array<BlockInfo>;
    methods: Array<BlockInfo>;
    functions: Array<BlockInfo>;
    variables: Array<BlockInfo>;
    parserClass: any;

    constructor(public uri: vscode.Uri) {
        const extension = path.extname(this.uri.path);
        const parserClass = PARSERS.get(extension);
        if (!parserClass) {
            throw new Error(`Unsupported extension: ${extension}`);
        }
        this.parserClass = parserClass;
        this.classes = [];
        this.methods = [];
        this.functions = [];
        this.variables = [];
    }


    async parse(): Promise<any> {
        const data = await fsPromises.readFile(this.uri.path, { encoding: 'utf-8' });
        const parser = new this.parserClass(<string>data);
        parser.parse();
        // console.log(this.uri.path, Array.from(parser.classes.keys()));
        for (let blockInfo of parser.classes.values()) {
            this.classes.push(<BlockInfo>blockInfo);
        }
        for (let blockInfo of parser.methods.values()) {
            this.methods.push(<BlockInfo>blockInfo);
        }
        for (let blockInfo of parser.functions.values()) {
            this.functions.push(<BlockInfo>blockInfo);
        }
        for (let blockInfo of parser.variables.values()) {
            this.variables.push(<BlockInfo>blockInfo);
        }
    }

    async search(query: string, typesSet: Set<string>) {
        let searchArray: Array<BlockInfo> = [];
        if (typesSet.has('classes')) {
            Array.prototype.push.apply(searchArray, this.classes);
        }
        if (typesSet.has('methods')) {
            Array.prototype.push.apply(searchArray, this.methods);
        }
        if (typesSet.has('functions')) {
            Array.prototype.push.apply(searchArray, this.functions);
        }
        if (typesSet.has('variables')) {
            Array.prototype.push.apply(searchArray, this.variables);
        }
        const fuse = new Fuse(searchArray, {
            includeScore: true,
            keys: ['name'],
            isCaseSensitive: true
        });
        let searchResults = new Array<SearchResult>();
        for (let searchItem of fuse.search(query)) {
            searchResults.push(new SearchResult(this.uri, searchItem.item));
        }
        return searchResults;
    }
}
