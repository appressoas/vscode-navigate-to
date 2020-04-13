import * as vscode from 'vscode';
import SearchIndex from './SearchIndex';
import SearchResult from './SearchResult';
import WorkspaceFolderSettings from './WorkspaceFolderSettings';

export class SearchResultQuickPickItem implements vscode.QuickPickItem {
	label: string;
    detail: string;
    description: string;
	
	constructor(public searchResult: SearchResult) {
		this.label = searchResult.blockInfo.name;
		this.description = searchResult.blockInfo.definition;
		this.detail = `${searchResult.workspaceFolder.name}: ${searchResult.workspaceRelativePath}`;
	}
}

export default class NavigateTo {
    index: SearchIndex;
    saveListener: vscode.Disposable;
    deleteListener: vscode.Disposable;
    renameListener: vscode.Disposable;

    constructor () {
        this.onDidSaveTextDocument = this.onDidSaveTextDocument.bind(this);
        this.onDidDeleteFiles = this.onDidDeleteFiles.bind(this);
        this.onDidRenameFiles = this.onDidRenameFiles.bind(this);
        this.index = new SearchIndex();
        this.saveListener = vscode.workspace.onDidSaveTextDocument(this.onDidSaveTextDocument);
        this.deleteListener = vscode.workspace.onDidDeleteFiles(this.onDidDeleteFiles);
        this.renameListener = vscode.workspace.onDidRenameFiles(this.onDidRenameFiles);
    }

    onDidDeleteFiles(event : vscode.FileDeleteEvent) {
        this.index.removeFiles(event.files);
        // console.log('REMOVED', event.files);
    }

    onDidRenameFiles(event : vscode.FileRenameEvent) {
        const urisToRemove = [];
        const urisToAdd = [];
        for (let newAndOldUri of event.files) {
            urisToRemove.push(newAndOldUri.oldUri);
            urisToAdd.push(newAndOldUri.newUri);
        }
        // console.log('RENAMED', urisToRemove, '->', urisToAdd);
        this.index.removeFiles(urisToRemove);
        this.index.addOrUpdateFiles(urisToAdd);
    }

    onDidSaveTextDocument(textDocument: vscode.TextDocument) {
        // console.log('SAVED', textDocument.uri.path);
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(textDocument.uri);
        if (workspaceFolder) {
            const settings = new WorkspaceFolderSettings(workspaceFolder);
            if (settings.updateIndexOnSave) {
                this.index.addOrUpdateFile(workspaceFolder, textDocument.uri);
            }
        } else {
            console.warn(`Could not find workspace folder for ${textDocument.uri.toString()}`);
        }
    }

    async openAndShow(searchResult: SearchResult) {
        const document = await vscode.workspace.openTextDocument(searchResult.uri);
        await vscode.window.showTextDocument(document);
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            let position = editor.document.positionAt(searchResult.blockInfo.startIndex);
            let range = editor.document.lineAt(position).range;
            editor.selection = new vscode.Selection(position, position);
            editor.revealRange(range);
        }
    }

    async pickSearchResult(types: Array<string>|null = null) {
        const disposables: vscode.Disposable[] = [];
        if (!types) {
            types = ['classes', 'methods', 'functions', 'variables'];
        }
        try {
            return await new Promise<SearchResult | null>((resolve, reject) => {
                const input = vscode.window.createQuickPick<SearchResultQuickPickItem>();
                input.placeholder = `Search for ${types?.join(', ')}`;
                disposables.push(input.onDidChangeValue((value: string) => {
                    if (!value) {
                        input.items = [];
                        return;
                    }
                    const items = new Array<SearchResultQuickPickItem>();
                    this.index.search(value, <Array<string>>types).then((searchResults: Array<SearchResult>) => {
                        console.log('SEARCH DONE');
                        for (let searchResult of searchResults) {
                            items.push(new SearchResultQuickPickItem(searchResult));
                        }
                        input.items = items;
                    });
                }), input.onDidChangeSelection(items => {
                    const item = items[0];
                    resolve(item.searchResult);
                    input.hide();
                }), input.onDidHide(() => {
                    resolve(null);
                    input.dispose();
                }));
                input.show();
            });
        }
        finally {
            disposables.forEach(d => d.dispose());
        }
    }

    pickAndOpenSearchResult (types: Array<string>|null = null) {
        this.pickSearchResult(types).then((searchResult: SearchResult|null) => {
            if (searchResult) {
                this.openAndShow(searchResult);
            }
        });
    }

    rebuildIndex () {
        const workspaceFolder = vscode.workspace.rootPath;
        if (!workspaceFolder) {
            return;
        }
        this.index.rebuildIndex();
    }
    navigateToClass () {
        this.pickAndOpenSearchResult(['classes']);
    }
    navigateToMethod () {
        this.pickAndOpenSearchResult(['methods']);
    }
    navigateToFunction () {
        this.pickAndOpenSearchResult(['functions']);
    }
    navigateToVariable () {
        this.pickAndOpenSearchResult(['variables']);
    }
}