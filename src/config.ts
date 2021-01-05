/// <reference path = "yume.d.ts" />
/* eslint-disable @typescript-eslint/naming-convention */
"use strict";
import fs = require("fs");
import path = require("path");
import vscode = require("vscode");

export class Config{

    extensionConf: vscode.WorkspaceConfiguration;
    userAgent: string;
    baiduAPI: {
        api:string,
        appId:string,
        appKey:string
    };
    rootPath: string | null;
    mydictPath : string | null;
    config:{
        [index:string]: object | string,
        hjUrl: string,

        hjHeader: Header,
    };

    constructor(){
        this.extensionConf = vscode.workspace.getConfiguration("yume");
        this.rootPath = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : null;
        this.baiduAPI = {
            "api": this.extensionConf.get("百度API.api") as string,
            "appId": this.extensionConf.get("百度API.appId") as string,
            "appKey": this.extensionConf.get("百度API.appKey") as string,
        };
        this.userAgent = this.extensionConf.get("userAgent") as string;

        this.mydictPath = this.rootPath ? path.join(this.rootPath, ".vscode/yume-config.json") : null;         //自定义名词表
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
    }

    load(path:string):boolean{
        try{
            this.config = require(path);
        }
        catch(e){
            console.error(e);
            return false;
        }
        if(this.config.hjHeader.headers["User-Agent"] !== this.extensionConf.get("userAgent")){
            this.config.hjHeader.headers["User-Agent"] = this.extensionConf.get("userAgent") as string;
            this.save(path);
        }
        return true;
    }

    save(path:string):boolean{
        try{
            fs.writeFileSync(path, JSON.stringify(this.config), {
                encoding: "utf-8",
                flag: "w"
            });
        }
        catch(e){
            console.error(e);
            return false;
        }
        return true;
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
