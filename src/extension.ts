import * as vscode from 'vscode';
import NavigateTo from './NavigateTo';

export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('"navigateto" extension is active');

	let navigator = new NavigateTo();
	context.subscriptions.push(vscode.commands.registerCommand('navigateto.rebuildIndex', () => {
		navigator.rebuildIndex();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('navigateto.navigateToClass', () => {
		navigator.navigateToClass();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('navigateto.navigateToMethod', () => {
		navigator.navigateToMethod();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('navigateto.navigateToFunction', () => {
		navigator.navigateToFunction();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('navigateto.navigateToVariable', () => {
		navigator.navigateToVariable();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('navigateto.navigateToAny', () => {
		navigator.navigateToAny();
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {}
