// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
/// <reference path = "yume.d.ts" />
import * as vscode from 'vscode';
import fs = require("fs");
import path = require("path");

import {Config} from "./config";
import {Baidu} from "./baiduAPI";
import {JPdict, Mydict, ZHdict} from "./dictionary";
import { log } from './log';

class ControlCenter{

	config: Config;
	initialled: boolean;
	baidu:BaiduFanyi;
	_jpdict:JPdict;
	_mydict:Mydict;
	_zhdict:ZHdict;
	cache:{[index:string]:JPdata};
	hover: vscode.Disposable | null;

	constructor(){
		this.config = new Config();
		this.baidu = new Baidu(this.config.getBaiduAPI());
		this._jpdict = new JPdict();
		this.initialled = this.config.mydictPath ? fs.existsSync(this.config.mydictPath.fsPath) : false; //this.init();
		this._mydict = new Mydict(this.config.mydictPath);
		this._zhdict = new ZHdict(this.config.enableDict);
		this.cache = {};
		this.hover = null;
		this.register();
	}

	init():boolean{
		if(!this.config.rootPath){
			log.error("初始化前请先打开项目文件夹！");
			return false;
		}
		if(!fs.existsSync(path.join(this.config.rootPath.fsPath, ".vscode"))){
			fs.mkdirSync(path.join(this.config.rootPath.fsPath,".vscode"));
		}
		this.save().then(()=>{
			vscode.window.showInformationMessage("初始化完成！");
		}).catch((e)=>{
			log.error("初始化失败！");
			log.error(e);
		});
		this.initialled = true;
		return true;
	}

	save(){
		return new Promise<unknown>((resolve, reject)=>{
			this.config.save().catch((e)=>{
				reject(e);
			});
			this._mydict.save().catch((e)=>{
				reject(e);
			});
			resolve(true);
		});
	}

	reload():void{
		this.config = new Config();
		this._mydict = new Mydict(this.config.mydictPath);
	}

	register(){
		if(this.hover){
			this.hover.dispose();
		}
		this.hover = vscode.languages.registerHoverProvider({scheme:"file"},{
            provideHover(document, position, token){
				let jp = yume.selectedText();
				if(jp === "" && !yume.config.hoverRequireSelect){
					jp = document.getText(document.getWordRangeAtPosition(position));
				}
				if(jp === ""){
					return;
				}
				let res:string = yume.baidu.cache[jp] ? `* 整句机翻：  \n  ${yume.baidu.cache[jp]}` : "";
				for(let i in yume._mydict.dict){
					if(jp.search(i) > -1){
						res += `  \n* **${i}**: ${yume._mydict.dict[i]}`;
					}
				}
				for(let i in yume.cache){
					if(jp.search(i) > -1){
						let tmp = yume._jpdict.convertResult(yume.cache[i],false);
						res += `\n* **${i}**: ${tmp}`;
					}
				}
				if(res === ""){
					return;
				}
                return new vscode.Hover(res);
            }
        });
	}

	unregister(){
		if(this.hover){
			this.hover.dispose();
		}
		this.hover = null;
	}

	async translate(){
		let text = this.selectedText() || await this.getInput();
		if(text === ""){
			return;
		}
		this.baidu.search(text).then((res: string) => {
			log.print(res);
		}).catch((e) => {
			vscode.window.showErrorMessage("查询失败！请检查错误日志！");
			log.print(e);
		});
	}

	async jpdict():Promise<boolean>{
		let text = this.selectedText();
		let jp:string = text? text : await this.getInput();
		if(this.cache[jp]){
			log.print(this._jpdict.convertResult(this.cache[jp], this.config.jpDetail));
			return true;
		}
		if(this.searchMydict(jp, true)){
			return true;
		}
		this._jpdict.search(jp).then((res : JPdata)=>{
			log.print(this._jpdict.convertResult(res, this.config.jpDetail));
			this.cache[jp] = res;
			return true;
		}).catch((e)=>{
			vscode.window.showErrorMessage("查询失败！");
			log.error(e);
			return false;
		});
		return false;
	}

	searchMydict(text?:string, nolog = false):boolean{
		try{
			let jp:string = text ? text : this.selectedText();
			let res = this._mydict.search(jp);
			if(res === ""){
				!nolog && log.error("查询失败！");
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
			log.error("请先初始化项目！");
		}
	}

	deleteFromMydict():void{
		if(this._mydict.empty()){
			log.error("词典空！");
			return;
		}
		vscode.window.showQuickPick(this._mydict.getKeys(),{
			canPickMany: false,
			ignoreFocusOut: false,
			placeHolder: "请输入待修改项原文"
		}).then((jp)=>{
			if(jp){
				if(this._mydict.delete(jp)){
					this._mydict.save().then(()=>{
						log.show("删除成功！");
					}).catch((e)=>{
						log.error(e);
					});
				}
				else{
					log.error("删除失败！删除项不存在！");
				}
			}
		});
	}

	async editMydict(){
		if(this._mydict.empty()){
			log.error("词典空！");
			return;
		}
		vscode.window.showQuickPick(this._mydict.getKeys(),{
			canPickMany: false,
			ignoreFocusOut: false,
			placeHolder: "请输入待修改项原文"
		}).then((jp)=>{
			if(jp){
				vscode.window.showInputBox({
					ignoreFocusOut: true,
					placeHolder: "请输出修改后内容",
					value: this._mydict.search(jp)
				}).then((zh)=>{
					if(zh){
						if(this._mydict.edit(jp,zh)){
							vscode.window.showInformationMessage("修改成功！");
							this._mydict.save().catch((e)=>{
								log.error("自定义词典保存失败！");
								log.error(e);
							});
						}
						else{
							log.error("修改失败！修改项不存在！");
						}
					}
				});
			}
		});
	}

	// 获取待查询文本
	selectedText():string {
		let editor = vscode.window.activeTextEditor;
		if (!editor) {
			return "";
		}
		let selection = editor.selection;
		return editor.document.getText(selection);
	}

	// 获取用户手动输入
	getInput():Promise<string>{
		return new Promise((resolve, reject)=>{
			vscode.window.showInputBox().then((text)=>{
				if(text && text !== ""){
					resolve(text);
				}else{
					reject("");
				}
			});
		});
	}

	dictChinese():boolean{
		let text = this.selectedText();
		let res = text === "" ? "" : this._zhdict.autoSearch(text);
		if(res === ""){
			log.error("查询失败！");
			return false;
		}
		log.print(res);
		return true;
	}

	// 查询单个汉字
	searchChar():boolean{
		let char = this.selectedText();
		if(char === ""){
			vscode.window.showInputBox().then((text)=>{
				if(text && text.length === 1){
					let res = this._zhdict.searchChar(text);
					if(res === ""){
						log.error("查询失败！");
						return false;
					}
					log.print(res);
				}
			});
			return false;
		}
		if(char.length !== 1){
			return false;
		}
		let res = this._zhdict.searchChar(char);
		if(res === ""){
			log.error("查询失败！");
			return false;
		}
		log.print(res);
		return true;
	}

	searchWord():boolean{
		let word = this.selectedText();
		if(word === ""){
			vscode.window.showInputBox().then((text)=>{
				if(text && text !== ""){
					let res = this._zhdict.searchWord(text);
					if(res === ""){
						log.error("查询失败！");
						return false;
					}
					log.print(res);
				}
			});
			return false;
		}else{
			let res = this._zhdict.searchWord(word);
			if(res === ""){
				log.error("查询失败！");
				return false;
			}
			log.print(res);
			return true;
		}
	}

	searchIdiom():boolean{
		let text = this.selectedText();
		if(text === ""){
			vscode.window.showInputBox().then((text)=>{
				if(text && text !== ""){
					let res = this._zhdict.searchIdiom(text);
					if(res === ""){
						log.error("查询失败！");
						return false;
					}
					log.print(res);
				}
			});
			return false;
		}else{
			let res = this._zhdict.searchIdiom(text);
			if(res === ""){
				log.error("查询失败！");
				return false;
			}
			log.print(res);
			return true;
		}
	}

	searchXiehouyu():boolean{
		let text = this.selectedText();
		if(text === ""){
			vscode.window.showInputBox().then((value)=>{
				if(value && value !== ""){
					let res = this._zhdict.searchXiehouyu(value);
					if(res === ""){
						log.error("查询失败！");
						return false;
					}
					log.print(res);
					return true;
				}
				return false;
			});
			return false;
		}else{
			let res = this._zhdict.searchXiehouyu(text);
			if(res === ""){
				log.error("查询失败！");
				return false;
			}
			log.print(res);
			return true;
		}
	}

	changeConfig(e:any){
		if(yume.config.changeConfig(e)){
			yume._zhdict.reload(yume.config.enableDict);
			if(yume.config.hover){
				if(!yume.hover){
					yume.register();
				}
			}
			else{
				yume.unregister();
			}
		}
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

	// 注册命令
	context.subscriptions.push(vscode.commands.registerCommand('yume.jpdict',()=>{yume.jpdict();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.searchMydict",()=>{yume.searchMydict();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.addToMydict",()=>{yume.addToMydict();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.editMydict",()=>{yume.editMydict();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.deleteFromMydict",()=>{yume.deleteFromMydict();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.translate",()=>{yume.translate();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.chineseChar",()=>{yume.searchChar();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.chineseWord",()=>{yume.searchWord();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.chineseIdiom",()=>{yume.searchIdiom();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.xiehouyu",()=>{yume.searchXiehouyu();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.chinese",()=>{yume.dictChinese();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.reload",()=>{yume.reload();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.init",()=>{yume.init();}));
	// 注册事件
	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((e)=>{yume.changeConfig(e);}));
	
}

// this method is called when your extension is deactivated
export function deactivate() {
	if(yume.initialled){
		yume.save();
	}
}
