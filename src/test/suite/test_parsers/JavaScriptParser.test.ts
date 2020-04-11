import * as assert from 'assert';
import * as vscode from 'vscode';
import BlockInfo from "../../../BlockInfo";
import JavaScriptParser from "../../../parsers/JavaScriptParser";


suite('JavaScriptParser Test Suite', () => {
	vscode.window.showInformationMessage('Start JavaScriptParser tests.');

	test('javascript class detected', () => {
		const sourceCode = `
class Stuff { }
`;
		const parser = new JavaScriptParser(sourceCode);
		parser.parse();
		assert.equal(parser.classes.size, 1);
		const stuffBlockInfo = <BlockInfo>parser.classes.get('Stuff');
		assert(stuffBlockInfo);
		assert.equal(stuffBlockInfo.definition, 'class Stuff');
	});

	test('javascript export class detected', () => {
		const sourceCode = `
export class Stuff {}
`;
		const parser = new JavaScriptParser(sourceCode);
		parser.parse();
		assert.equal(parser.classes.size, 1);
		const stuffBlockInfo = <BlockInfo>parser.classes.get('Stuff');
		assert(stuffBlockInfo);
		assert.equal(stuffBlockInfo.definition, 'export class Stuff');
	});

	test('javascript export default class detected', () => {
		const sourceCode = `
export default class Stuff {}
`;
		const parser = new JavaScriptParser(sourceCode);
		parser.parse();
		assert.equal(parser.classes.size, 1);
		const stuffBlockInfo = <BlockInfo>parser.classes.get('Stuff');
		assert(stuffBlockInfo);
		assert.equal(stuffBlockInfo.definition, 'export default class Stuff');
	});

	test('javascript multiple classes detected', () => {
		const sourceCode = `
export class Stuff { 
	helloWorld() {
		console.log("Hello world");
	}
}
class Stuff2 extends Stuff { 
	helloWorld2() {
		console.log("Hello world2");
	}
}
export default class Stuff3 extends Stuff2 { 
	helloWorld2() {
		console.log("Hello world3");
	}
}
`;
		const parser = new JavaScriptParser(sourceCode);
		parser.parse();
		assert.equal(parser.classes.size, 3);
		assert(parser.classes.has('Stuff'));
		assert(parser.classes.has('Stuff2'));
		assert(parser.classes.has('Stuff3'));
	});

	test('javascript decorated class detected', () => {
		const sourceCode = `
@mydecorator
class Stuff { }
`;
		const parser = new JavaScriptParser(sourceCode);
		parser.parse();
		assert.equal(parser.classes.size, 1);
		const stuffBlockInfo = <BlockInfo>parser.classes.get('Stuff');
		assert(stuffBlockInfo);
		assert.equal(stuffBlockInfo.definition, '@mydecorator class Stuff');
	});

	test('javascript multiple decorated class detected', () => {
		const sourceCode = `
@mydecorator
@mySecondDecorator
class Stuff { }
`;
		const parser = new JavaScriptParser(sourceCode);
		parser.parse();
		assert.equal(parser.classes.size, 1);
		const stuffBlockInfo = <BlockInfo>parser.classes.get('Stuff');
		assert(stuffBlockInfo);
		assert.equal(stuffBlockInfo.definition, '@mydecorator @mySecondDecorator class Stuff');
	});

	test('javascript method detected', () => {
		const sourceCode = `
class Stuff {
	helloWorld (a, b) {}
}
`;
		const parser = new JavaScriptParser(sourceCode);
		// parser.prettyLogParsingTree();
		parser.parse();
		assert.equal(parser.methods.size, 1);
		const stuffBlockInfo = <BlockInfo>parser.methods.get('Stuff.helloWorld');
		assert(stuffBlockInfo);
		assert.equal(stuffBlockInfo.definition, 'helloWorld(a, b)');
	});	

	test('javascript static method detected', () => {
		const sourceCode = `
class Stuff {
	static helloWorld (a, b) {}
}
`;
		const parser = new JavaScriptParser(sourceCode);
		parser.parse();
		assert.equal(parser.methods.size, 1);
		const stuffBlockInfo = <BlockInfo>parser.methods.get('Stuff.helloWorld');
		assert(stuffBlockInfo);
		assert.equal(stuffBlockInfo.definition, 'static helloWorld(a, b)');
	});	

	test('javascript decorated method detected', () => {
		const sourceCode = `
class Stuff {
	@mydecorator
	helloWorld (a, b) {}
}
`;
		const parser = new JavaScriptParser(sourceCode);
		// parser.prettyLogParsingTree();
		parser.parse();
		assert.equal(parser.methods.size, 1);
		const stuffBlockInfo = <BlockInfo>parser.methods.get('Stuff.helloWorld');
		assert(stuffBlockInfo);
		assert.equal(stuffBlockInfo.definition, '@mydecorator helloWorld(a, b)');
	});	

	test('javascript multiple decorated method detected', () => {
		const sourceCode = `
class Stuff {
	@mydecorator
	@mysecondDecorator
	helloWorld (a, b) {}
}
`;
		const parser = new JavaScriptParser(sourceCode);
		// parser.prettyLogParsingTree();
		parser.parse();
		assert.equal(parser.methods.size, 1);
		const stuffBlockInfo = <BlockInfo>parser.methods.get('Stuff.helloWorld');
		assert(stuffBlockInfo);
		assert.equal(stuffBlockInfo.definition, '@mydecorator@mysecondDecorator helloWorld(a, b)');
	});

	test('javascript class variable detected', () => {
		const sourceCode = `
class Stuff {
	size = 10;
}
`;
		const parser = new JavaScriptParser(sourceCode);
		parser.parse();
		assert.equal(parser.variables.size, 1);
		const stuffBlockInfo = <BlockInfo>parser.variables.get('Stuff.size');
		assert(stuffBlockInfo);
		assert.equal(stuffBlockInfo.definition, 'size = 10');
	});

	test('javascript static class variable detected', () => {
		const sourceCode = `
class Stuff {
	static size = 10;
}
`;
		const parser = new JavaScriptParser(sourceCode);
		// parser.prettyLogParsingTree();
		parser.parse();
		console.log(parser.toPlainObject());
		assert.equal(parser.variables.size, 1);
		const stuffBlockInfo = <BlockInfo>parser.variables.get('Stuff.size');
		assert(stuffBlockInfo);
		assert.equal(stuffBlockInfo.definition, 'static size = 10');
	});

	test('javascript function detected', () => {
		const sourceCode = `
function stuff (a, b) {
	console.log(a, b);
}
`;
		const parser = new JavaScriptParser(sourceCode);
		parser.parse();
		assert.equal(parser.functions.size, 1);
		const stuffBlockInfo = <BlockInfo>parser.functions.get('stuff');
		assert(stuffBlockInfo);
		assert.equal(stuffBlockInfo.definition, 'function stuff(a, b)');
	});

	test('javascript export function detected', () => {
		
		const sourceCode = `
export function stuff (a, b) {
	console.log(a, b);
}
`;
		const parser = new JavaScriptParser(sourceCode);
		parser.parse();
		assert.equal(parser.functions.size, 1);
		const stuffBlockInfo = <BlockInfo>parser.functions.get('stuff');
		assert(stuffBlockInfo);
		assert.equal(stuffBlockInfo.definition, 'export function stuff(a, b)');
	});

	test('javascript export default function detected', () => {
		
		const sourceCode = `
export default function stuff (a, b) {
	console.log(a, b);
}
`;
		const parser = new JavaScriptParser(sourceCode);
		parser.parse();
		assert.equal(parser.functions.size, 1);
		const stuffBlockInfo = <BlockInfo>parser.functions.get('stuff');
		assert(stuffBlockInfo);
		assert.equal(stuffBlockInfo.definition, 'export default function stuff(a, b)');
	});

	test('javascript variable detected const', () => {
		
		const sourceCode = `
const stuff = 10;
`;
		const parser = new JavaScriptParser(sourceCode);
		// parser.prettyLogParsingTree();
		parser.parse();
		assert.equal(parser.variables.size, 1);
		const stuffBlockInfo = <BlockInfo>parser.variables.get('stuff');
		assert(stuffBlockInfo);
		assert.equal(stuffBlockInfo.definition, 'const stuff = 10');
	});

	test('javascript variable detected let', () => {
		
		const sourceCode = `
let stuff = 10;
`;
		const parser = new JavaScriptParser(sourceCode);
		parser.parse();
		assert.equal(parser.variables.size, 1);
		const stuffBlockInfo = <BlockInfo>parser.variables.get('stuff');
		assert(stuffBlockInfo);
		assert.equal(stuffBlockInfo.definition, 'let stuff = 10');
	});

	test('javascript variable detected var', () => {
		
		const sourceCode = `
var stuff = 10;
`;
		const parser = new JavaScriptParser(sourceCode);
		parser.parse();
		assert.equal(parser.variables.size, 1);
		const stuffBlockInfo = <BlockInfo>parser.variables.get('stuff');
		assert(stuffBlockInfo);
		assert.equal(stuffBlockInfo.definition, 'var stuff = 10');
	});

	test('javascript variable redefinition', () => {
		
		const sourceCode = `
let stuff = 10;
stuff = 20;
`;
		const parser = new JavaScriptParser(sourceCode);
		parser.parse();
		assert.equal(parser.variables.size, 1);
		const stuffBlockInfo = <BlockInfo>parser.variables.get('stuff');
		assert(stuffBlockInfo);
		assert.equal(stuffBlockInfo.definition, 'let stuff = 10');
	});

	test('javascript variable with long definition', () => {
		
		const sourceCode = `
const stuff = {
	"value one": {"label": "Hello world 1", "value": 1},
	"value two": {"label": "Hello world 2", "value": 2},
	"value three": {"label": "Hello world 3", "value": 3}
}
`;
		const parser = new JavaScriptParser(sourceCode);
		parser.parse();
		assert.equal(parser.variables.size, 1);
		const stuffBlockInfo = <BlockInfo>parser.variables.get('stuff');
		assert(stuffBlockInfo);
		assert.equal(stuffBlockInfo.definition, 'const stuff = { "value one": {"l... 3", "value": 3} }');
	});

	test('javascript export variable detected', () => {
		
		const sourceCode = `
export const stuff1 = 10;
export let stuff2 = 20;
`;
		const parser = new JavaScriptParser(sourceCode);
		parser.parse();
		assert.equal(parser.variables.size, 2);
		const stuff1BlockInfo = <BlockInfo>parser.variables.get('stuff1');
		assert(stuff1BlockInfo);
		assert.equal(stuff1BlockInfo.definition, 'export const stuff1 = 10');
		const stuff2BlockInfo = <BlockInfo>parser.variables.get('stuff2');
		assert(stuff2BlockInfo);
		assert.equal(stuff2BlockInfo.definition, 'export let stuff2 = 20');
	});

	test('javascript variable anonymous function detected', () => {		
		const sourceCode = `
const stuff = (a, b) => {
	console.log(a, b);
}
`;
		const parser = new JavaScriptParser(sourceCode);
		parser.parse();
		assert.equal(parser.functions.size, 1);
		const stuffBlockInfo = <BlockInfo>parser.functions.get('stuff');
		assert(stuffBlockInfo);
		assert.equal(stuffBlockInfo.definition, 'const stuff = (a, b)');
	});

	test('javascript export variable anonymous function detected', () => {		
		const sourceCode = `
export const stuff = (a, b) => {
	console.log(a, b);
}
`;
		const parser = new JavaScriptParser(sourceCode);
		parser.parse();
		assert.equal(parser.functions.size, 1);
		const stuffBlockInfo = <BlockInfo>parser.functions.get('stuff');
		assert(stuffBlockInfo);
		assert.equal(stuffBlockInfo.definition, 'export const stuff = (a, b)');
	});
});
