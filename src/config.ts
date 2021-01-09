/// <reference path = "yume.d.ts" />
/* eslint-disable @typescript-eslint/naming-convention */
"use strict";
import fs = require("fs");
import vscode = require("vscode");
import {log} from "./log";

export class Config{

    extensionConf: vscode.WorkspaceConfiguration;
    userAgent: string;
    baiduAPI: {
        api:string,
        appId:string,
        appKey:string
    };
    rootPath: vscode.Uri | null;
    path: vscode.Uri | null;
    mydictPath : vscode.Uri | null;
    config:{
        [index:string]: object | string,
        hjUrl: string,

        hjHeader: Header,
    };

    constructor(){
        this.extensionConf = vscode.workspace.getConfiguration("yume");
        this.rootPath = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri : null;
        this.path = this.rootPath ? vscode.Uri.joinPath(this.rootPath, ".vscode/yume-config.json") : null;
        this.baiduAPI = {
            "api": this.extensionConf.get("百度API.api") as string,
            "appId": this.extensionConf.get("百度API.appId") as string,
            "appKey": this.extensionConf.get("百度API.appKey") as string,
        };
        this.userAgent = this.extensionConf.get("userAgent") as string;

        this.mydictPath = this.rootPath ? vscode.Uri.joinPath(this.rootPath, ".vscode/mydict.json") : null;         //自定义名词表
        // 词典来源：https://github.com/pwxcoo/chinese-xinhua
        // idiomUrl : __dirname+"\\dict\\idiom.json",           //成语词典
        // xiehouyuUrl : __dirname+"\\dict\\xiehouyu.json",     //歇后语
        // ciUrl : __dirname+"\\dict\\ci.json",                 //词典
        // wordUrl : __dirname+"\\dict\\word.json",             //字典

        this.config = {
            hjHeader : {
                headers: {
                    'User-Agent': this.extensionConf.get("userAgent") as string,
                    "Cookie": 'HJ_UID=0f406091-be97-6b64-f1fc-f7b2470883e9; HJ_CST=1; HJ_CSST_3=1;TRACKSITEMAP=3%2C; HJ_SID=393c85c7-abac-f408-6a32-a1f125d7e8c6; _REF=; HJ_SSID_3=4a460f19-c0ae-12a7-8e86-6e360f69ec9b; _SREF_3=; HJ_CMATCH=1'
                }
            },

            hjUrl : 'https://dict.hjenglish.com/jp/jc/',
        };
        // this.load();
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
                if(this.config.hjHeader.headers["User-Agent"] !== this.extensionConf.get("userAgent")){
                    this.config.hjHeader.headers["User-Agent"] = this.extensionConf.get("userAgent") as string;
                    this.save();
                }
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

    setBaiduAPI(api:string, appId:string, appKey:string):boolean{
        this.baiduAPI.api = api;
        this.baiduAPI.appId = appId;
        this.baiduAPI.appKey = appKey;
        return true;
    }

    getBaiduAPI(){
        return this.baiduAPI;
    }
}
