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

	test('search javascript class sanity', () => {
		const searchIndex = new SearchIndex();
		return searchIndex.search('JsDemoClass', ['classes']).then((searchResults: Array<any>) => {
			assert.equal(searchResults[0].blockInfo.name, 'JsDemoClass');
		});
	});

	test('search javascript method sanity', () => {
		const searchIndex = new SearchIndex();
		return searchIndex.search('JsDemoClass.hell', ['methods']).then((searchResults: Array<any>) => {
			assert.equal(searchResults[0].blockInfo.name, 'JsDemoClass.hello');
		});
	});

	test('search javascript function sanity', () => {
		const searchIndex = new SearchIndex();
		return searchIndex.search('myDemoFunc', ['functions']).then((searchResults: Array<any>) => {
			assert.equal(searchResults[0].blockInfo.name, 'myDemoFunction');
		});
	});

	test('search javascript variable sanity', () => {
		const searchIndex = new SearchIndex();
		return searchIndex.search('JsDemoClass.STATIC', ['variables']).then((searchResults: Array<any>) => {
			assert.equal(searchResults[0].blockInfo.name, 'JsDemoClass.MY_STATIC_VAR');
		});
	});

	test('search python class sanity', () => {
		const searchIndex = new SearchIndex();
		return searchIndex.search('PyDemoClass', ['classes']).then((searchResults: Array<any>) => {
			assert.equal(searchResults[0].blockInfo.name, 'PyDemoClass');
		});
	});

	test('search python method sanity', () => {
		const searchIndex = new SearchIndex();
		return searchIndex.search('PyDemoClass.hell', ['methods']).then((searchResults: Array<any>) => {
			assert.equal(searchResults[0].blockInfo.name, 'PyDemoClass.hello');
		});
	});

	test('search python function sanity', () => {
		const searchIndex = new SearchIndex();
		return searchIndex.search('my_demo_func', ['functions']).then((searchResults: Array<any>) => {
			assert.equal(searchResults[0].blockInfo.name, 'my_demo_function');
		});
	});

	test('search python variable sanity', () => {
		const searchIndex = new SearchIndex();
		return searchIndex.search('PyDemoClass.STATIC', ['variables']).then((searchResults: Array<any>) => {
			assert.equal(searchResults[0].blockInfo.name, 'PyDemoClass.MY_STATIC_VAR');
		});
	});

	test('search ignore OK', () => {
		const searchIndex = new SearchIndex();
		return searchIndex.search('ignored', ['functions']).then((searchResults: Array<any>) => {
			assert.equal(searchResults.length, 0);
		});
	});
});
