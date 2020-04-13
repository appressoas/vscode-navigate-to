import * as vscode from 'vscode';

export default class WorkspaceFolderSettings {
    settings: vscode.WorkspaceConfiguration;

    constructor (public workspaceFolder: vscode.WorkspaceFolder) {
        this.settings = vscode.workspace.getConfiguration('navigateTo', workspaceFolder);
        // console.log(this.settings)
    }

    get ignorePatterns(): Array<string> {
        const ignorePatterns: Array<string> | undefined = this.settings.get('ignore');
        // console.log('navigateTo.ignore', ignorePatterns);
        if (ignorePatterns === undefined) {
            return []
        }
        return ignorePatterns;
    }
    
    get ignoreFileNames(): Array<string> {
        const ignoreFileNames: Array<string> | undefined = this.settings.get('ignoreFileNames');
        // console.log('ignoreFileNames', ignoreFileNames);
        if (ignoreFileNames === undefined) {
            return ['.gitignore']
        }
        return ignoreFileNames;
    }

    get exclude(): string|null {
        const exclude: string|undefined = this.settings.get('exclude');
        if (exclude === undefined) {
            return null
        }
        return exclude;
    }

    get updateIndexOnSave (): boolean {
        return <boolean>this.settings.get('updateIndexOnSave');
    }
}
