import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import BlockInfo from "../../../BlockInfo";
import PythonParser from "../../../parsers/PythonParser";

suite('PythonParser Test Suite', () => {
	vscode.window.showInformationMessage('Start PythonParser tests.');

	// test('Sample test', () => {
	// 	assert.equal(-1, [1, 2, 3].indexOf(5));
	// 	assert.equal(-1, [1, 2, 3].indexOf(0));
	// });

	test('python simple class detected', () => {
		const sourceCode = `
class Stuff:
	pass
`;
		const parser = new PythonParser(sourceCode);
		parser.parse();
		assert.equal(parser.classes.size, 1);
		const stuffBlockInfo = <BlockInfo>parser.classes.get('Stuff');
		assert(stuffBlockInfo);
		assert.equal(stuffBlockInfo.definition, 'class Stuff');
	});

	test('python class within class', () => {
		const sourceCode = `
class Stuff:
	class WithinStuff:
		pass
`;
		const parser = new PythonParser(sourceCode);
		parser.parse();
		assert.equal(parser.classes.size, 2);

		const stuffBlockInfo = <BlockInfo>parser.classes.get('Stuff');
		assert(stuffBlockInfo);
		assert.equal(stuffBlockInfo.definition, 'class Stuff');

		const withinStuffBlockInfo = <BlockInfo>parser.classes.get('Stuff.WithinStuff');
		assert(withinStuffBlockInfo);
		assert.equal(withinStuffBlockInfo.definition, 'class WithinStuff');
	});

	test('python multiple classes detected', () => {
		const sourceCode = `
class Stuff:
	pass

class Stuff2(Stuff):
	pass

class OtherStuff:
	pass

class Stuff3(Stuff, OtherStuff):
	pass
`;
		const parser = new PythonParser(sourceCode);
		parser.parse();
		assert.equal(parser.classes.size, 4);
		assert(parser.classes.has('Stuff'));
		assert(parser.classes.has('Stuff2'));
		assert(parser.classes.has('OtherStuff'));
		assert(parser.classes.has('Stuff3'));
	});

	test('python decorated class detected', () => {
		const sourceCode = `
@mydecorator
class Stuff:
	pass
`;
		const parser = new PythonParser(sourceCode);
		parser.parse();
		assert.equal(parser.classes.size, 1);
		const stuffBlockInfo = <BlockInfo>parser.classes.get('Stuff');
		assert(stuffBlockInfo);
		assert.equal(stuffBlockInfo.definition, '@mydecorator class Stuff');
	});

	test('python multiple decorated class detected', () => {
		const sourceCode = `
@mydecorator
@my_second_decorator
class Stuff:
	pass
`;
		const parser = new PythonParser(sourceCode);
		parser.parse();
		assert.equal(parser.classes.size, 1);
		const stuffBlockInfo = <BlockInfo>parser.classes.get('Stuff');
		assert(stuffBlockInfo);
		assert.equal(stuffBlockInfo.definition, '@mydecorator @my_second_decorator class Stuff');
	});

	test('python method detected', () => {
		const sourceCode = `
class Stuff:
	def hello_world(self, a, b):
		pass
`;
		const parser = new PythonParser(sourceCode);
		parser.parse();
		assert.equal(parser.methods.size, 1);
		const helloWorldBlockInfo = <BlockInfo>parser.methods.get('Stuff.hello_world');
		assert(helloWorldBlockInfo);
		assert.equal(helloWorldBlockInfo.definition, 'def hello_world(self, a, b)');
	});	

	test('python decorated method detected', () => {
		const sourceCode = `
class Stuff:
	@staticmethod
	def hello_world(a, b):
		pass
`;
		const parser = new PythonParser(sourceCode);
		// parser.prettyLogParsingTree();
		parser.parse();
		assert.equal(parser.methods.size, 1);
		const helloWorldBlockInfo = <BlockInfo>parser.methods.get('Stuff.hello_world');
		assert(helloWorldBlockInfo);
		assert.equal(helloWorldBlockInfo.definition, '@staticmethod def hello_world(a, b)');
	});	

	test('python multiple decorated method detected', () => {
		const sourceCode = `
class Stuff:
	@firstdecorator
	@second_decorator(10, True)
	def hello_world(a, b):
		pass
`;
		const parser = new PythonParser(sourceCode);
		// parser.prettyLogParsingTree();
		parser.parse();
		assert.equal(parser.methods.size, 1);
		const helloWorldBlockInfo = <BlockInfo>parser.methods.get('Stuff.hello_world');
		assert(helloWorldBlockInfo);
		assert.equal(helloWorldBlockInfo.definition, '@firstdecorator @second_decorator(10, True) def hello_world(a, b)');
	});	

	test('python class variable detected', () => {
		const sourceCode = `
class Stuff:
	size = 10
`;
		const parser = new PythonParser(sourceCode);
		// parser.prettyLogParsingTree();
		parser.parse();
		// console.log(parser.toPlainObject());
		assert.equal(parser.variables.size, 1);
		const helloWorldBlockInfo = <BlockInfo>parser.variables.get('Stuff.size');
		assert(helloWorldBlockInfo);
		assert.equal(helloWorldBlockInfo.definition, 'size = 10');
	});	

	test('python function detected', () => {
		const sourceCode = `
def stuff(a, b):
	pass
`;
		const parser = new PythonParser(sourceCode);
		parser.parse();
		assert.equal(parser.functions.size, 1);
		const stuffBlockInfo = <BlockInfo>parser.functions.get('stuff');
		assert(stuffBlockInfo);
		assert.equal(stuffBlockInfo.definition, 'def stuff(a, b)');
	});

	test('python variable detected', () => {
		const sourceCode = `
stuff = 10
`;
		const parser = new PythonParser(sourceCode);
		parser.parse();
		assert.equal(parser.variables.size, 1);
		const stuffBlockInfo = <BlockInfo>parser.variables.get('stuff');
		assert(stuffBlockInfo);
		assert.equal(stuffBlockInfo.definition, 'stuff = 10');
	});

	test('python variable redefinition', () => {
		const sourceCode = `
stuff = 10
stuff = 20
`;
		const parser = new PythonParser(sourceCode);
		parser.parse();
		assert.equal(parser.variables.size, 1);
		const stuffBlockInfo = <BlockInfo>parser.variables.get('stuff');
		assert(stuffBlockInfo);
		assert.equal(stuffBlockInfo.definition, 'stuff = 20');
	});

	test('python variable with long definition', () => {
		const sourceCode = `
stuff = {
	"value one": {"label": "Hello world 1", "value": 1},
	"value two": {"label": "Hello world 2", "value": 2},
	"value three": {"label": "Hello world 3", "value": 3}
}
`;
		const parser = new PythonParser(sourceCode);
		parser.parse();
		assert.equal(parser.variables.size, 1);
		const stuffBlockInfo = <BlockInfo>parser.variables.get('stuff');
		assert(stuffBlockInfo);
		assert.equal(stuffBlockInfo.definition, 'stuff = { "value one": {"l... 3", "value": 3} }');
	});
});
