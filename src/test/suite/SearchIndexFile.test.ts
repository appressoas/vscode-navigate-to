import * as assert from 'assert';
import * as path from 'path';

import * as vscode from 'vscode';
import SearchIndexFile from '../../SearchIndexFile';

suite('SearchIndexFile Test Suite', () => {
	vscode.window.showInformationMessage('Start SearchIndexFile tests.');

	test('Parsing python works', () => {
		// assert(vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0);
		const workspaceFolder = vscode.workspace!.workspaceFolders![0];
		const demoClassPath = path.posix.join(workspaceFolder.uri.path, 'python/pydemoclass.py');
		const searchIndexFile = new SearchIndexFile(workspaceFolder, vscode.Uri.file(demoClassPath));
		return searchIndexFile.parse().then(() => {
			assert.equal(searchIndexFile.classes.length, 1);
			assert.equal(searchIndexFile.classes[0].name, 'PyDemoClass');
		});
	});

	test('Parsing javascript works', () => {
		const workspaceFolder = vscode.workspace!.workspaceFolders![0];
		const demoClassPath = path.posix.join(workspaceFolder.uri.path, 'javascript/JsDemoClass.js');
		const searchIndexFile = new SearchIndexFile(workspaceFolder, vscode.Uri.file(demoClassPath));
		return searchIndexFile.parse().then(() => {
			assert.equal(searchIndexFile.classes.length, 1);
			assert.equal(searchIndexFile.classes[0].name, 'JsDemoClass');
		});
	});
});
