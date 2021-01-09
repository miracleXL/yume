// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
/// <reference path = "yume.d.ts" />
import * as vscode from 'vscode';
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

	constructor(){
		this.config = new Config();
		this.baidu = new Baidu(this.config.getBaiduAPI());
		this._jpdict = new JPdict();
		this.initialled = this.config.rootPath ? true : false; //this.init();
		if(this.initialled){
			this._mydict = new Mydict(this.config.rootPath);
		}
		else{
			this._mydict = new Mydict();
		}
		this._zhdict = new ZHdict(this.config.enableDict);
		this.cache = {};
		let yume = this;
        vscode.languages.registerHoverProvider({scheme:"file"},{
            provideHover(document, position, token){
				let jp = yume.selectedText() || document.getText(document.getWordRangeAtPosition(position));
				if(jp === ""){
					return;
				}
				let res:string = yume.baidu.cache[jp] || "";
				for(let i in yume._mydict.dict){
					if(jp.search(i) > -1){
						res += `\n* **${i}**: ${yume._mydict.dict[i]}`;
					}
				}
				for(let i in yume.cache){
					if(jp.search(i) > -1){
						res += `\n* **${i}**: ${yume._jpdict.convertResult(yume.cache[i],false)}`;
					}
				}
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
		// this.config.save().catch((e)=>{
		// 	log.error(e);
		// });
		if(this._mydict){
			this._mydict.save().catch((e)=>{
				log.error(e);
			});
		}
	}

	reload():void{
		this._mydict.load().catch((e)=>{
			log.error(e);
		});
		// this.config.load().catch((e)=>{
		// 	log.error(e);
		// });
	}

	translate(){
		this.baidu.search(this.selectedText()).then((res: string) => {
			log.print(res);
		}).catch((e) => {
			vscode.window.showErrorMessage("查询失败！请检查错误日志！");
			log.print(e);
		});
	}

	jpdict(text?:string):boolean{
		let jp:string = text? text : this.selectedText();
		if(this.cache[jp]){
			log.print(this._jpdict.convertResult(this.cache[jp]));
			return true;
		}
		if(this.searchMydict(jp)){
			return true;
		}
		this._jpdict.search(jp).then((res : JPdata)=>{
			log.print(this._jpdict.convertResult(res));
			this.cache[jp] = res;
			return true;
		}).catch((e)=>{
			vscode.window.showErrorMessage("查询失败！");
			log.error(e);
			return false;
		});
		return false;
	}

	searchMydict(text?:string):boolean{
		try{
			let jp:string = text ? text : this.selectedText();
			let res = this._mydict.search(jp);
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

	// 查询单个汉字
	searchChar():boolean{
		let char = this.selectedText();
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
		let res = word === "" ? "" : this._zhdict.searchWord(word);
		if(res === ""){
			log.error("查询失败！");
			return false;
		}
		log.print(res);
		return true;
	}

	searchIdiom():boolean{
		let text = this.selectedText();
		let res = text === "" ? "" : this._zhdict.searchIdiom(text);
		if(res === ""){
			log.error("查询失败！");
			return false;
		}
		log.print(res);
		return true;
	}

	searchXiehouyu():boolean{
		let text = this.selectedText();
		let res = text === "" ? "" : this._zhdict.searchXiehouyu(text);
		if(res === ""){
			log.error("查询失败！");
			return false;
		}
		log.print(res);
		return true;
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
	context.subscriptions.push(vscode.commands.registerCommand("yume.translate",()=>{yume.translate();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.chineseChar",()=>{yume.searchChar();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.chineseWord",()=>{yume.searchWord();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.chineseIdiom",()=>{yume.searchIdiom();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.xiehouyu",()=>{yume.searchXiehouyu();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.chinese",()=>{yume.dictChinese();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.reload",()=>{yume.reload();}));
	context.subscriptions.push(vscode.commands.registerCommand("yume.init",()=>{yume.init();}));
	// 注册事件
	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((e)=>{
		if(yume.config.changeConfig(e)){
			yume._zhdict.reload(yume.config.enableDict);
		}
	}));
	
}

// this method is called when your extension is deactivated
export function deactivate() {
	yume.save();
}
