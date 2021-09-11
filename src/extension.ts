// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
/// <reference path = "yume.d.ts" />
import * as vscode from 'vscode';
import path = require("path");

import { ControlCenter } from "./ControlCenter"
import { log } from './log';

export function getWebviewContent(uri: vscode.Uri, webview: vscode.Webview): Thenable<string>{
	return new Promise((resolve, reject)=>{
		let root = uri.path.substring(0, uri.path.lastIndexOf("/"));
		vscode.workspace.fs.readFile(uri).then((value)=>{
			let html = value.toString().replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (match, m1, m2) => {
					return m1 + webview.asWebviewUri(vscode.Uri.parse(root + m2)).toString() + '"';
				});
			resolve(html);
		},(reason)=>{
			reject(reason);
		});
	});
}

export var yume:ControlCenter;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated

	yume = new ControlCenter(context);
	console.log('Yume运行成功！');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	// 注册命令
	context.subscriptions.push(vscode.commands.registerCommand('yume.jpdict',()=>{yume.jpdict();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.searchMydict",()=>{yume.searchMydict();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.addToMydict",()=>{yume.addToMydict();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.editMydict",()=>{yume.editMydict();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.deleteFromMydict",()=>{yume.deleteFromMydict();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.translate",()=>{yume.translate();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.reload",()=>{
		yume.unregisterAll();
		yume = new ControlCenter(context);
		log.show("Yume重新加载成功！");
	}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.init",()=>{yume.init();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.scenario",()=>{yume.scenarioManage();}));
	// 注册事件
	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((e)=>{yume.changeConfig(e);}));
	// 注册webview
	context.subscriptions.push(yume.scnManager.panel as vscode.WebviewPanel);
	
}

// this method is called when your extension is deactivated
export function deactivate() {
}
