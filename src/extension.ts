// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
/// <reference path = "yume.d.ts" />
import * as vscode from 'vscode';
import {Config} from "./config";
import {Baidu} from "./baiduAPI";
import {JPdict, Mydict} from "./dictionary";
import { log } from './log';

class ControlCenter{

	config: Config;
	initialled: boolean;
	baidu:BaiduFanyi;
	_jpdict:JPdict;
	_mydict:Mydict;

	constructor(){
		this.config = new Config();
		this.baidu = new Baidu(this.config.getBaiduAPI());
		this._jpdict = new JPdict();
		this.initialled = this.config.rootPath ? true : this.init();
		if(this.initialled){
			this._mydict = new Mydict(this.config.rootPath);
		}
		else{
			this._mydict = new Mydict();
		}
		let yume = this;
        vscode.languages.registerHoverProvider({scheme:"file"},{
            provideHover(document, position, token){
				let jp = yume.selectedText() || document.getText(document.getWordRangeAtPosition(position));
				if(jp === ""){
					return;
				}
				let res:string = yume._mydict.search(jp);
				if(res === ""){
					return;
				}
                return new vscode.Hover(res);
            }
        });
	}

	init():boolean{
		try{
			this.config.save();
		}
		catch(e){
			log.error(e);
			return false;
		}
		return true;
	}

	save(){
		this.config.save().catch((e)=>{
			log.error(e);
		});
		if(this._mydict){
			this._mydict.save().catch((e)=>{
				log.error(e);
			});
		}
	}

	translate(){
		this.baidu.search(this.selectedText()).then((res: string) => {
			log.print(res);
		}).catch((e) => {
			vscode.window.showErrorMessage("查询失败！请检查错误日志！");
			log.error(e);
		});
	}

	jpdict():boolean{
		if(this.searchMydict()){
			return true;
		}
		this._jpdict.search(this.selectedText()).then((res : string|JPdata)=>{
			log.print(res as string);
			return true;
		}).catch((e)=>{
			vscode.window.showErrorMessage("查询失败！请检查错误日志");
			log.error(e);
			return false;
		});
		return false;
	}

	searchMydict():boolean{
		try{
			let res:string = this._mydict.search(this.selectedText());
			if(res === ""){
				return false;
			}
			log.print(res);
			return true;
		}
		catch(e){
			vscode.window.showErrorMessage("未知错误！");
			log.error(e);
		}
		return false;
	}

	addToMydict():void{
		if(this.initialled){
			let jp:string = this.selectedText();
			vscode.window.showInputBox().then((zh)=>{
				if(zh === undefined){
					return;
				}
				if(this._mydict.add(jp,zh)){
					vscode.window.showInformationMessage("添加成功！");
					this._mydict.save().catch((e)=>{
						log.error(e);
					});
				}
			});
		}
		else{
			log.print("请先初始化项目！");
		}
	}

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

let yume:ControlCenter;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated

	yume = new ControlCenter();
	console.log('Yume运行成功！');
	// vscode.window.showInformationMessage("插件加载成功！");

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	context.subscriptions.push(vscode.commands.registerCommand('yume.jpdict',()=>{yume.jpdict();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.searchMydict",()=>{yume.searchMydict();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.addToMydict",()=>{yume.addToMydict();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.translate",()=>{yume.translate();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.load",()=>{yume.config.load();}));
}

// this method is called when your extension is deactivated
export function deactivate() {
	yume.save();
}
