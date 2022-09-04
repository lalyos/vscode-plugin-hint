import * as vscode from 'vscode';
import fetch from 'node-fetch';

function ensureTerminalExists(): boolean {
	if ((<any>vscode.window).terminals.length === 0) {
		vscode.window.showErrorMessage('No active terminals');
		return false;
	}
	return true;
}

function selectTerminal(): Thenable<vscode.Terminal | undefined> {
	interface TerminalQuickPickItem extends vscode.QuickPickItem {
		terminal: vscode.Terminal;
	}
	const terminals = <vscode.Terminal[]>(<any>vscode.window).terminals;
	const items: TerminalQuickPickItem[] = terminals.map(t => {
		return {
			label: `name: ${t.name}`,
			terminal: t
		};
	});

	return vscode.window.showQuickPick(items).then(item => {
		return item ? item.terminal : undefined;
	});
}

function hintWithNewline(newLine: boolean = false) {
	var command = "echo 'Hello world!'" + newLine;

	(async () => {
		const response = await fetch("http://hint.grok.lalyo.sh:8888/.history");
		command = await response.text();
		const lastLine = command.trim().split("\n").pop()
		console.log("Last line:", lastLine);
		command = lastLine || "#ooops";

		if (ensureTerminalExists()) {

			const terminals = <vscode.Terminal[]>(<any>vscode.window).terminals;
			if (terminals.length == 1) {
				terminals[0].sendText(command,newLine)
			} else {
				selectTerminal().then(terminal => {
					if (terminal) {
						terminal.sendText(command, newLine);
					}
				});
			}
		}


	})();


}

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "hint" is now active!');

	let disposable = vscode.commands.registerCommand('hint.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from Hint!');
	});
	context.subscriptions.push(disposable);

	context.subscriptions.push(vscode.commands.registerCommand('hint.version', () => {
		vscode.window.showInformationMessage('Version 0.0.1-p1');
	}));

	context.subscriptions.push(vscode.commands.registerCommand('hint.hint', () => {
		hintWithNewline(false);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('hint.lazy', () => {
		hintWithNewline(true);
	}));
}

export function deactivate() {}
