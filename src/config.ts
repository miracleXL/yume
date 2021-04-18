/// <reference path = "yume.d.ts" />
/* eslint-disable @typescript-eslint/naming-convention */
"use strict";
import fs = require("fs");
import vscode = require("vscode");
import {log} from "./log";

export class Config{

    // 项目设置
    config: {
        formatter: [string,string, {[index:string]:string}]
    };

    // 默认设置
    hjUrl: string;
    hjHeader: Header;
    mydictPath : vscode.Uri | null;

    // 插件全局设置
    extensionConf: vscode.WorkspaceConfiguration;
    userAgent: string;
    baiduAPI: {
        api:string,
        appId:string,
        appKey:string
    };
    rootPath: vscode.Uri | null;
    path: vscode.Uri | null;
    logPath: vscode.Uri | null;
    hover: boolean;
    hoverRequireSelect: boolean;
    jpDetail: boolean;
    originReg: string;
    translateReg: string;

    constructor(){
        // 读取全局配置
        this.extensionConf = vscode.workspace.getConfiguration("yume");
        this.baiduAPI = {
            "api": this.extensionConf.get("百度API.api") as string,
            "appId": this.extensionConf.get("百度API.appId") as string,
            "appKey": this.extensionConf.get("百度API.appKey") as string,
        };
        this.userAgent = this.extensionConf.get("userAgent") as string;
        this.hover = this.extensionConf.get("浮窗.开启行内查询") as boolean;
        this.hoverRequireSelect = this.extensionConf.get("浮窗.需要选中") as boolean;
        this.jpDetail = this.extensionConf.get("沪江词典.显示详细释义") as boolean;
        this.originReg = this.extensionConf.get("原文行起始标志") as string;
        this.translateReg = this.extensionConf.get("译文行起始标志") as string;


        // 默认配置
        this.rootPath = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri : null;
        this.path = this.rootPath ? vscode.Uri.joinPath(this.rootPath, ".vscode/yume-config.json") : null;
        this.mydictPath = this.rootPath ? vscode.Uri.joinPath(this.rootPath, ".vscode/mydict.json") : null;
        this.logPath = this.rootPath ? vscode.Uri.joinPath(this.rootPath, ".vscode/yume.log") : null;

        this.hjHeader = {
            headers: {
                'User-Agent': this.extensionConf.get("userAgent") as string,
                "Cookie": 'HJ_UID=0f406091-be97-6b64-f1fc-f7b2470883e9; HJ_CST=1; HJ_CSST_3=1;TRACKSITEMAP=3%2C; HJ_SID=393c85c7-abac-f408-6a32-a1f125d7e8c6; _REF=; HJ_SSID_3=4a460f19-c0ae-12a7-8e86-6e360f69ec9b; _SREF_3=; HJ_CMATCH=1'
            }
        };
        this.hjUrl = 'https://dict.hjenglish.com/jp/jc/';

        // 读取项目设置
        this.config = {
            formatter: [this.originReg, this.translateReg, {
                "(……?)|(\\.{2,})|(。{2,})" : "……",
                "[~〜∼∽⁓]" : "～",
                "(ー+)|(－{2,})|(-{2,})" : "——",
                "," : "，",
                "(?<=D).(?=D)?" : "。",
                "(?<=D) *= *(?=D)" :" ＝ ",
                ":" : "：",
                ";" : "；",
                "!" : "！",
                "[\\?]" : "？",
                "\\(" : "（",
                "\\)" : "）",
                "『" : "“",
                "』" : "”",
                "(！+？+)" : "？！",
                "，$":"……"
            }]
        };
        if(this.path){
            if(fs.existsSync(this.path.fsPath)){
                this.load();
            }
            else{
                this.save();
            }
        }
    }

    loadGlobal(){
        this.extensionConf = vscode.workspace.getConfiguration("yume");
        this.setBaiduAPI();
        this.userAgent = this.extensionConf.get("userAgent") as string;
        this.hover = this.extensionConf.get("浮窗.开启行内查询") as boolean;
        this.hoverRequireSelect = this.extensionConf.get("浮窗.需要选中") as boolean;
        this.jpDetail = this.extensionConf.get("沪江词典.显示详细释义") as boolean;
        this.originReg = this.extensionConf.get("原文行起始标志") as string;
        this.translateReg = this.extensionConf.get("译文行起始标志") as string;
    }

    load():Promise<unknown>{
        return new Promise((resolve, reject)=>{
            if(this.path){
                vscode.workspace.fs.readFile(this.path).then((value: Uint8Array)=>{
                    this.config = JSON.parse(value.toString());
                    log.log(`配置加载成功！`);
                },(e)=>{
                    reject(e);
                });
            }
            else{
                log.error("未打开文件夹！");
            }
        });
    }

    save(){
        return new Promise((resolve, reject)=>{
            if(this.path){
                fs.writeFile(this.path.fsPath, JSON.stringify(this.config), {
                    encoding: "utf-8",
                    flag: "w"
                },(e)=>{
                    if(e){
                        reject(e);
                    }
                    else{
                        log.log("设置保存成功！");
                    }
                });
            }
            else{
                log.error("设置保存路径空！");
            }
        });
    }

    setBaiduAPI():boolean{
        this.baiduAPI = {
            "api": this.extensionConf.get("百度API.api") as string,
            "appId": this.extensionConf.get("百度API.appId") as string,
            "appKey": this.extensionConf.get("百度API.appKey") as string,
        };
        return true;
    }

    getBaiduAPI(){
        this.setBaiduAPI();
        return this.baiduAPI;
    }

    changeConfig(e:vscode.ConfigurationChangeEvent):boolean{
        // log.log(e);
        if(e.affectsConfiguration("yume")){
            this.loadGlobal();
            return true;
        }
        return false;
    }
}
