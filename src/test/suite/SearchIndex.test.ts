import * as assert from 'assert';

import * as vscode from 'vscode';
import SearchIndex from '../../SearchIndex';

suite('SearchIndex Test Suite', () => {
	vscode.window.showInformationMessage('Start SearchIndex tests.');

	test('rebuildIndex', () => {
		const searchIndex = new SearchIndex();
		return searchIndex.rebuildIndex().then(() => {
			assert(searchIndex.files.size > 0);
		});
	});

	test('search sanity', () => {
		const searchIndex = new SearchIndex();
		return searchIndex.search('DemoClass', ['classes']).then((searchResults: Array<any>) => {
			assert(searchResults.length > 0);
		});
	});

	test('search javascript', () => {
		const searchIndex = new SearchIndex();
		return searchIndex.search('JsDemoClass', ['classes']).then((searchResults: Array<any>) => {
			assert.equal(searchResults[0].blockInfo.name, 'JsDemoClass');
		});
	});

	test('search python', () => {
		const searchIndex = new SearchIndex();
		return searchIndex.search('PyDemoClass', ['classes']).then((searchResults: Array<any>) => {
			assert.equal(searchResults[0].blockInfo.name, 'PyDemoClass');
		});
	});
});
