import * as assert from 'assert';
import * as path from 'path';

import * as vscode from 'vscode';
import SearchIndexFile from '../../SearchIndexFile';

suite('SearchIndexFile Test Suite', () => {
	vscode.window.showInformationMessage('Start SearchIndexFile tests.');

	test('Parsing python works', () => {
		const demoClassPath = path.join(<string>vscode.workspace.rootPath, 'python/pydemoclass.py');
		const searchIndexFile = new SearchIndexFile(vscode.Uri.file(demoClassPath));
		return searchIndexFile.parse().then(() => {
			assert.equal(searchIndexFile.classes.length, 1);
			assert.equal(searchIndexFile.classes[0].name, 'PyDemoClass');
		}).catch((error) => {
			throw error;
		});
	});

	test('Parsing javascript works', (done) => {
		const demoClassPath = path.join(<string>vscode.workspace.rootPath, 'javascript/JsDemoClass.js');
		const searchIndexFile = new SearchIndexFile(vscode.Uri.file(demoClassPath));
		searchIndexFile.parse().then(() => {
			assert.equal(searchIndexFile.classes.length, 1);
			assert.equal(searchIndexFile.classes[0].name, 'JsDemoClass');
			done();
		});
	});
});
