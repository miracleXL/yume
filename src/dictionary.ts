/* eslint-disable @typescript-eslint/naming-convention */
/// <reference path = "yume.d.ts" />
"use strict";
import fs = require("fs");
import vscode = require("vscode");
import request = require("request");
import {log} from "./log";

export class JPdict implements Dictionary{

    cache : {
        [index:string]:string
    };
    url:string;
    header:Header;

    constructor(header?:Header){
        this.url = 'https://dict.hjenglish.com/jp/jc/';
        this.header = header ? header : {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.81 Safari/537.36',
                "Cookie": 'HJ_UID=0f406091-be97-6b64-f1fc-f7b2470883e9; HJ_CST=1; HJ_CSST_3=1;TRACKSITEMAP=3%2C; HJ_SID=393c85c7-abac-f408-6a32-a1f125d7e8c6; _REF=; HJ_SSID_3=4a460f19-c0ae-12a7-8e86-6e360f69ec9b; _SREF_3=; HJ_CMATCH=1'
            }
        };
        this.cache = {};
    }

    // convert的值表示是否转换为字符串，为false时返回JPdata
    search(text : string, convert = true):Promise<string|JPdata>{
        let dict = this;
        return new Promise((resolve, reject)=>{
            if(text === ""){
                reject("");
            }
            // 缓存查询结果
            if(this.cache[text]){
                resolve(this.cache[text]);
                return;
            }
            let data:JPdata = {
                word: "",
                katakana: [],
                type: "",
                simple: [],
                detail: []
            };
            request(encodeURI(this.url + text), this.header, (err: Error, res :any, body:any) => {
                if(err){
                    reject("查询失败！");
                    return;
                }
                const cheerio = require('cheerio'), $ = cheerio.load(body);
                if($(`.word-details-pane`).length === 0){
                        reject("查询失败！");
                        return;
                }
                $('.word-info .pronounces span').each((index:number, element:any)=>{
                    data["katakana"].push($(element).text());
                });
                data["type"] = $('.simple h2').text();
                $('.simple li').each((index:number, element:any) =>{
                    data["simple"].push($(element).text());
                });
                $('.detail-groups p').each((index:number, element:any) =>{
                    let tmp = $(element).text().trim();
                    if(tmp !== ""){
                        data["detail"].push(tmp);
                    }
                });
                if(convert){
                    resolve(dict.convertResult(data));
                }
                else{
                    resolve(data);
                }
            });
        });
    }

    // 转换查询结果至字符串
    convertResult(jsonData:JPdata){
        let msg = "";
        msg += jsonData["word"] + "  \n";
        msg += jsonData["katakana"][0] + jsonData["katakana"][1] + "  " + jsonData["type"] + "  \n";
        msg += "释义：" + "  \n";
        for(let data of jsonData["simple"]){
            msg += "  " + data + "  \n";
        }
        msg += "详细释义：" + "  \n";
        for(let data of jsonData["detail"]){
            msg += "  " + data + "  \n";
        }
        // log.log(msg);
        return msg;
    }
}

export class Mydict{

    dict:{[index:string]:string};
    mydictPath: vscode.Uri | null;

    constructor(rootPath?:vscode.Uri | null){
        if(rootPath === undefined || rootPath === null){
            this.dict = {};
            this.mydictPath = null;
            return;
        }
        this.mydictPath = vscode.Uri.joinPath(rootPath, ".vscode/mydict.json");
        this.dict = {};
        this.load();
    }
    
    search(text:string):string{
        if(text === ""){
            return "";
        }
        if(this.dict[text]){
            return this.dict[text];
        }
        return "查找失败！请确认是否已添加进名词表";
    }

    save():Promise<unknown>{
        return new Promise((resolve, reject)=>{
            if(this.mydictPath === null || JSON.stringify(this.dict) === "{}"){
                return;
            }
            fs.writeFile(this.mydictPath.fsPath, JSON.stringify(this.dict),(e)=>{
                if(e){
                    log.error("自定义词典保存失败！");
                    reject(e);
                }
                else{
                    log.log("自定义词典保存成功！");
                    resolve(null);
                }
            });
        });
    }

    load(){
        return new Promise((resolve, reject)=>{
            if(this.mydictPath === null){
                return;
            }
            if(fs.existsSync(this.mydictPath.fsPath)){
                try{
                    vscode.workspace.fs.readFile(this.mydictPath).then((value)=>{
                        this.dict = JSON.parse(value.toString());
                        log.log("自定义词典加载成功！");
                    });
                }
                catch(e){
                    reject(e);
                }
            }
            else{
                reject("找不到字典文件！");
            }
        });
    }

    add(jp:string, zh:string):boolean{
        if(this.dict[jp]){
            return false;
        }
        else{
            this.dict[jp] = zh;
            return true;
        }
    }
}
