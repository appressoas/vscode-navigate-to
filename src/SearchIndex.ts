import * as Fuse from 'fuse.js';
import * as vscode from 'vscode';
import { DISTINCT_PARSER_EXTENSIONS } from './parsers/parsers';
import SearchIndexFile from "./SearchIndexFile";


export default class SearchIndex {
    files: Map<string, SearchIndexFile>;
    hasIndex: boolean;
    isIndexing: boolean;
    constructor() {
        this.files = new Map<string, SearchIndexFile>();
        this.hasIndex = false;
        this.isIndexing = false;
    }
    async setFile(workspaceFolder: vscode.WorkspaceFolder, uri: vscode.Uri) {
        const indexFile = new SearchIndexFile(workspaceFolder, uri);
        await indexFile.parse();
        this.files.set(uri.path, indexFile);
    }

    get findFilesIncludeGlob () {
        const extensions = DISTINCT_PARSER_EXTENSIONS.join(',');
        return `**/*{${extensions}}`;
    }

    async collectFilesForIndex (workspaceFolder: vscode.WorkspaceFolder) {
        const uris = await vscode.workspace.findFiles(this.findFilesIncludeGlob, null);
        for (let uri of uris) {
            // TODO: .gitignore etc.
            await this.setFile(workspaceFolder, uri);
        }
    }

    async rebuildIndex() {
        this.files = new Map<string, SearchIndexFile>();
        if (vscode.workspace.workspaceFolders) {
            for (let workspaceFolder of vscode.workspace.workspaceFolders) {
                await this.collectFilesForIndex(workspaceFolder)
            }
            this.hasIndex = true;
        }
    }

    async getIndexedFiles() {
        if (!this.hasIndex) {
            await this.rebuildIndex();
        }
        return this.files;
    }

    async search(query: string, types: Array<string>) {
        const indexedFiles = await this.getIndexedFiles();
        let keys = [];
        for (let type of types) {
            keys.push(`${type}.name`);
        }
        const fuse = new Fuse(Array.from(indexedFiles.values()), {
            includeScore: true,
            keys: keys,
            isCaseSensitive: true
        });
        const matchedIndexFiles = fuse.search(query, { limit: 30 });
        let searchResults = new Array<any>();
        const typesSet = new Set(types);
        for (let indexFile of matchedIndexFiles) {
            // console.log(indexFile);
            let item = <SearchIndexFile>indexFile.item;
            let fileSearchResults = await item.search(query, typesSet);
            Array.prototype.push.apply(searchResults, fileSearchResults);
        }
        // console.log(searchResults);
        return searchResults;
    }
}
