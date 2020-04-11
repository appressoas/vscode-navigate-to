// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import NavigateTo from './NavigateTo';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "nagivateto" is now active!');

	let navigator = new NavigateTo();
	context.subscriptions.push(vscode.commands.registerCommand('nagivateto.rebuildIndex', () => {
		navigator.rebuildIndex();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('nagivateto.navigateToClass', () => {
		navigator.navigateToClass();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('nagivateto.navigateToMethod', () => {
		navigator.navigateToMethod();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('nagivateto.navigateToFunction', () => {
		navigator.navigateToFunction();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('nagivateto.navigateToVariable', () => {
		navigator.navigateToVariable();
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {}
