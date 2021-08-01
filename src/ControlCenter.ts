import vscode = require("vscode");
import fs = require("fs");
import path = require("path");

import { Config } from "./config";
import { Baidu } from "./baiduAPI";
import { JPdict, Mydict } from "./dictionary";
import { TreeViewManager } from "./treeView";
import { Formatter } from "./formatter";
import { ScenarioManager } from "./ScenarioManager";
import { yume } from "./extension"
import { log } from "./log"

export class ControlCenter{

	public config: Config;
	private _jpdict:JPdict;
	private _mydict:Mydict;
	private baidu:BaiduFanyi;
	private cache:{[index:string]:JPdata};
	private hover: vscode.Disposable | null;
	private treeview: TreeViewManager;
	private formatter: Formatter;
	private extension: vscode.Extension<any>;
	public scnManager: ScenarioManager;
	initialled: boolean;

	constructor(){
		this.config = new Config();
		this.baidu = new Baidu(this.config.getBaiduAPI());
		this._jpdict = new JPdict();
		this.initialled = (this.config.path && this.config.mydictPath) ? (fs.existsSync(this.config.path.fsPath) || fs.existsSync(this.config.mydictPath.fsPath)) : false; //this.init();
		this._mydict = new Mydict(this.config.mydictPath);
		this.cache = {};
		this.hover = null;
		this.treeview = new TreeViewManager();
		this.registerHover();
		vscode.commands.executeCommand("setContext", "yume:init", this.initialled);
		this.extension = vscode.extensions.getExtension("miraclexl.yume") as vscode.Extension<any>;
		
		this.formatter = new Formatter(this.config.config.formatter);
		this.config.load().finally(()=>{
			this.formatter.updateFormatter(this.config.config.formatter);
		});
		this.scnManager = new ScenarioManager(this.extension.extensionUri);
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
		vscode.commands.executeCommand("setContext", "yume:init", this.initialled);
		return true;
	}

	save(){
		return new Promise<unknown>(async (resolve, reject)=>{
			await this.config.save().catch((e)=>{
				reject(e);
			});
			await this._mydict.save().catch((e)=>{
				reject(e);
			});
			resolve(true);
		});
	}




	registerHover(){
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

	unregisterHover(){
		if(this.hover){
			this.hover.dispose();
		}
		this.hover = null;
	}

	registerAll(){
		this.registerHover();
	}

	unregisterAll(){
		this.unregisterHover();
		this.formatter.unregister();
	}




    async translate(text?: string){
		text = text || this.selectedText() || await this.getInput();
		if(text === ""){
			return;
		}
		this.baidu.search(text).then((res: string) => {
			log.print(res);
		}).catch((e) => {
			vscode.window.showErrorMessage("查询失败！请检查错误日志！");
			log.print(e);
			this.baidu.api = this.config.getBaiduAPI();
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
			log.error(e);
			return false;
		});
		return false;
	}

	searchMydict(text?:string, nolog = false):boolean{
		try{
			let jp:string = text ? text : this.selectedText();
            if(jp){
                let res = this._mydict.search(jp);
                if(res === ""){
                    !nolog && log.error("查询失败！");
                    return false;
                }
                log.print(res);
                return true;
            }
            vscode.window.showQuickPick(this._mydict.getKeys(),{
                canPickMany: false,
                ignoreFocusOut: false,
                placeHolder: "请输入待查询原文"
            }).then((jp)=>{
                this.searchMydict(jp);
            });
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
        if(this._mydict.delete(this.selectedText())){
            this._mydict.save().then(()=>{
                log.show("删除成功！");
            }).catch((e)=>{
                log.error(e);
            });
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




    // 获取选中文本
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



    // 获取项目设置
    getProjectConfig(){
        return this.config.config;
    }

    updateFormatter(formatter:{[index:string]:string}){
        this.config.updateFormatter(formatter)
    }

    resetFormatter(){
        this.config.resetFormatter();
    }

    clearFormatter(){
        this.config.clearFormatter();
    }

    updateFilepos(fp:{[index:number]:string}){
        this.config.updateFilepos(fp);
    }

    changeConfig(e:any){
		if(yume.config.changeConfig(e)){
			if(yume.config.hover){
				if(!yume.hover){
					yume.registerHover();
				}
			}
			else{
				yume.unregisterHover();
			}
			yume.formatter.updateReg(yume.config.originReg, yume.config.translateReg);
		}
	}



    scenarioManage(){
		this.scnManager.show();
	}
}