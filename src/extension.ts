// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
/// <reference path = "yume.d.ts" />
import * as vscode from 'vscode';
import {Config} from "./config";
import {Baidu} from "./baiduAPI";
import {JPdict, Mydict} from "./dictionary";

class ControlCenter{

	config: Config;
	channel: vscode.OutputChannel;
	initialled: boolean;
	baidu:BaiduFanyi;
	_jpdict:JPdict;
	_mydict:Mydict;

	constructor(){
		this.config = new Config();
		this.channel = vscode.window.createOutputChannel("Yume");
		this.baidu = new Baidu(this.config.baiduAPI);
		this._jpdict = new JPdict();
		this._mydict = new Mydict();
		if(vscode.workspace.workspaceFolders && this.config.initialled){
			this.initialled = true;
		}
		else{
			this.initialled = false;
		}
	}

	translate(){
		this.baidu.search(this.selectedText()).then((res: string) => {
			this.channel.appendLine(res);
			this.channel.show();
		}).catch((e: Error) => {
			vscode.window.showErrorMessage("查询失败！请检查错误日志！");
			console.error(e);
		});
	}

	jpdict() {
		this._jpdict.search(this.selectedText()).then((res : string|JPdata)=>{
			this.channel.appendLine(res as string);
			this.channel.show();
		}).catch((e : Error)=>{
			vscode.window.showErrorMessage("查询失败！请检查错误日志");
			console.error(e);
		});
	}

	searchMydict(){
		try{
			this.channel.appendLine(this._mydict.search(this.selectedText()));
			this.channel.show();
		}
		catch(e){
			vscode.window.showErrorMessage("未知错误！");
			console.error(e);
		}
	}

	// addToMydict(){
	// 	if(this.initialled){
	// 		this._mydict.add(this.selectedText()).then((res : string)=>{
	// 		this.channel.appendLine(res);
	// 		}).catch((e: Error)=>{
	// 			vscode.window.showErrorMessage("未知错误！");
	// 			console.error(e);
	// 		});
	// 	}
	// 	else{
	// 		this.channel.appendLine("请先初始化项目！");
	// 	}
	// }

	// 获取待查询文本
	selectedText() {
		let editor = vscode.window.activeTextEditor;
		if (!editor) {
			return "";
		}
		let selection = editor.selection;
		return editor.document.getText(selection);
	}
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Yume运行成功！');
	vscode.window.showInformationMessage("插件加载成功！");

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	
	let yume = new ControlCenter();

	context.subscriptions.push(vscode.commands.registerCommand('yume.jpdict',()=>{yume.jpdict();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.searchMydict",()=>{yume.searchMydict();}));
	// context.subscriptions.push(vscode.commands.registerCommand("yume.addToMydict",()=>{yume.addToMydict();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.translate",()=>{yume.translate();}));
}

// this method is called when your extension is deactivated
export function deactivate() {}
