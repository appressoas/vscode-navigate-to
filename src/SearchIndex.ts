import * as Fuse from 'fuse.js';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import ignore, {Ignore} from 'ignore'
import { DISTINCT_PARSER_EXTENSIONS } from './parsers/parsers';
import SearchIndexFile from "./SearchIndexFile";
import WorkspaceFolderSettings from './WorkspaceFolderSettings';
import { performance } from 'perf_hooks';


class WorkspaceIgnore {
    ignore: Ignore;
    settings: WorkspaceFolderSettings;

    constructor (public workspaceFolder: vscode.WorkspaceFolder) {
        this.ignore = ignore();
        this.settings = new WorkspaceFolderSettings(workspaceFolder);
        this.addIgnorePatternsFromGitIgnoreFile();
        this.addIgnorePatternsFromSettings();
    }

    getIgnoreFilePaths (): Array<string> {
        const ignorePaths: Array<string> = [];
        for (let ignoreFileName of this.settings.ignoreFileNames) {
            const gitIgnorePath = path.join(this.workspaceFolder.uri.path, ignoreFileName);
            if (fs.existsSync(gitIgnorePath)) {
                ignorePaths.push(gitIgnorePath);
            }
        }
        return ignorePaths
    }

    addIgnorePatternsFromGitIgnoreFile () {
        for (let ignoreFilePath of this.getIgnoreFilePaths()) {
            this.ignore.add(fs.readFileSync(ignoreFilePath).toString());
        }
    }

    addIgnorePatternsFromSettings () {
        for (let ignorePattern of this.settings.ignorePatterns) {
            this.ignore.add(ignorePattern);
        }
    }

    shouldIgnoreUri (uri: vscode.Uri) {
        const relativePath = path.relative(
            path.normalize(this.workspaceFolder.uri.path),
            path.normalize(uri.path)
        );
        return this.ignore.ignores(relativePath);
    }

    get includeGlobPattern () {
        const extensions = DISTINCT_PARSER_EXTENSIONS.join(',');
        return `**/*{${extensions}}`;
    }

    get includePattern () {
        return new vscode.RelativePattern(this.workspaceFolder, this.includeGlobPattern);
    }

    get excludePattern () {
        if (this.settings.exclude) {
            return new vscode.RelativePattern(this.workspaceFolder, this.settings.exclude);
        }
        return null;
    }

    async findFiles () {
        const includedUris = await vscode.workspace.findFiles(this.includePattern, this.excludePattern);
        const filteredUris: Array<vscode.Uri> = [];
        for (let uri of includedUris) {
            if (!this.shouldIgnoreUri(uri)) {
                // console.debug('Added:', uri.path)
                filteredUris.push(uri);
            // } else {
            //     console.debug('Ignored:', uri.path);
            }
        }
        return filteredUris;
    }
}


export default class SearchIndex {
    files: Map<string, SearchIndexFile>;
    hasIndex: boolean;
    isIndexing: boolean;
    constructor() {
        this.files = new Map<string, SearchIndexFile>();
        this.hasIndex = false;
        this.isIndexing = false;
    }

    private async setFile(workspaceFolder: vscode.WorkspaceFolder, uri: vscode.Uri) {
        const indexFile = new SearchIndexFile(workspaceFolder, uri);
        await indexFile.parse();
        this.files.set(uri.path, indexFile);
    }

    private async setFiles(workspaceFolder: vscode.WorkspaceFolder, uris: ReadonlyArray<vscode.Uri>, progress: vscode.Progress<{increment: number, message: string}>|null) {
        let uriIndex = 0;
        for (let uri of uris) {
            const increment = 100 / uris.length;
            progress?.report({
                increment: increment,
                message: `Parsing file ${uriIndex + 1}/${uris.length}`
            });
            await this.setFile(workspaceFolder, uri);
            uriIndex ++;
        }
    }

    async addOrUpdateFile(workspaceFolder: vscode.WorkspaceFolder, uri: vscode.Uri) {
        await this.setFile(workspaceFolder, uri);
    }

    async addOrUpdateFiles(uris: ReadonlyArray<vscode.Uri>) {
        for (let uri of uris) {
            const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
            if (workspaceFolder) {
                await this.addOrUpdateFile(workspaceFolder, uri);
            }
        }
    }

    removeFile (uri: vscode.Uri) {
        this.files.delete(uri.path);
    }

    removeFiles (uris: ReadonlyArray<vscode.Uri>) {
        for (let uri of uris) {
            this.removeFile(uri);
        }
    }

    private async buildIndexForWorkspaceFolder (workspaceFolder: vscode.WorkspaceFolder) {
        return vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Rebuilding navigate-to search index for ${workspaceFolder.name}.`,
            cancellable: false
        }, (progress: vscode.Progress<{increment: number, message: string}>, token: vscode.CancellationToken) => {
            return new Promise ((resolve, reject) => {
                console.log(`navigate-to: Rebuild index for ${workspaceFolder.name} starting.`);
                const startTime = performance.now();
                const workspaceIgnore = new WorkspaceIgnore(workspaceFolder);
                workspaceIgnore.findFiles()
                .then((uris) => {
                    this.setFiles(workspaceFolder, uris, progress)
                    .then(() => {
                        const endTime = performance.now();
                        const totalSeconds = (endTime - startTime) / 1000;
                        console.log(
                            `navigate-to: Rebuild index for ${workspaceFolder.name} done. ` + 
                            `Indexed ${this.files.size} files. ` + 
                            `Total seconds used: ${totalSeconds}.`);
                        resolve();
                    })
                    .catch((error: any) => {
                        reject(error);
                    });
                })
                .catch((error: any) => {
                    reject(error);
                });
            });
        });
    }

    async rebuildIndex() {
        if (vscode.workspace.workspaceFolders) {
            if (this.isIndexing) {
                console.warn('navigate-to: Already rebuilding the search index. Refusing to start another rebuild-index while one is already running.');
                return;
            }
            this.isIndexing = true;
            this.files = new Map<string, SearchIndexFile>();
            for (let workspaceFolder of vscode.workspace.workspaceFolders) {
                await this.buildIndexForWorkspaceFolder(workspaceFolder);
            }
            this.hasIndex = true;
            this.isIndexing = false;    
        } else {
            console.warn('navigate-to: No workspace folders, so nothing to index.');
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
