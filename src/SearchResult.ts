import * as vscode from 'vscode';
import * as path from 'path';
import BlockInfo from './BlockInfo';

export default class SearchResult {
    constructor(public workspaceFolder: vscode.WorkspaceFolder, public uri: vscode.Uri, public blockInfo: BlockInfo) {
    }

    get workspaceRelativePath (): string {
        return path.relative(
            path.normalize(this.workspaceFolder.uri.path),
            path.normalize(this.uri.path)
        );
    }
}
