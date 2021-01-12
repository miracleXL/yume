/* eslint-disable @typescript-eslint/naming-convention */
/// <reference path = "yume.d.ts" />
"use strict";
import fs = require("fs");
import vscode = require("vscode");
import request = require("request");
import {log} from "./log";

export class JPdict{

    url:string;
    header:Header;
	// cache:{[index:string]:JPdata};

    constructor(header?:Header){
        this.url = 'https://dict.hjenglish.com/jp/jc/';
        this.header = header ? header : {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.81 Safari/537.36',
                "Cookie": 'HJ_UID=0f406091-be97-6b64-f1fc-f7b2470883e9; HJ_CST=1; HJ_CSST_3=1;TRACKSITEMAP=3%2C; HJ_SID=393c85c7-abac-f408-6a32-a1f125d7e8c6; _REF=; HJ_SSID_3=4a460f19-c0ae-12a7-8e86-6e360f69ec9b; _SREF_3=; HJ_CMATCH=1'
            }
        };
		// this.cache = {};
    }

    // convert的值表示是否转换为字符串，为false时返回JPdata
    search(text : string):Promise<JPdata>{
        let dict = this;
        return new Promise((resolve, reject)=>{
            if(text === ""){
                reject("");
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
                resolve(data);
            });
        });
    }

    convertResult(jsonData:JPdata, detail:boolean = true){
        // 转换查询结果至字符串，detail为false时不保留详细释义
        let msg = "";
        msg += jsonData["word"] + "  \n";
        msg += jsonData["katakana"][0] + jsonData["katakana"][1] + "  " + jsonData["type"] + "  \n";
        msg += "释义：" + "  \n";
        for(let data of jsonData["simple"]){
            msg += "  " + data + "  \n";
        }
        if(detail){
            msg += "详细释义：" + "  \n";
            for(let data of jsonData["detail"]){
                msg += "  " + data + "  \n";
            }
        }
        // log.log(JSON.stringify(jsonData));
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
        return "";
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

export class ZHdict{
    enable:EnabledDict;
    word:{[word:string]:string};        // 词语
    idiom:{[object:string]:{
        derivation:string,
        example:string,
        explanation:string,
        pinyin:string,
        word:string,
        abbreviation: string
    }};                                 // 成语
    char:{[text:string]:{
        word:string,
        oldword:string,
        strokes:string,
        pinyin:string,
        radicals:string,
        explanation:string,
        more:string
    }};                                 // 字
    xiehouyu:{[text:string]:string};    //歇后语
    constructor(config:EnabledDict){
        this.enable = {
            char: config.char,
            word: config.word,
            idiom: config.idiom,
            xie: config.xie
        };
        this.char = config.char ? require("./dict/word.json") : {}; // 字
        this.word = config.word ? require("./dict/ci.json") : {}; // 词
        this.idiom = config.idiom ? require("./dict/idiom.json") : {}; // 成语
        this.xiehouyu = config.xie ? require("./dict/xiehouyu.json") : {}; // 歇后语
    }

    reload(config:EnabledDict){
        // log.log(config);
        if(config.word){
            this.word = this.enable.word ? this.word : require("./dict/ci.json");
        }else{
            this.word = {};
        }
        if(config.idiom){
            this.idiom = this.enable.idiom ? this.idiom : require("./dict/idiom.json");
        }else{
            this.idiom = {};
        }
        if(config.char){
            this.char = this.enable.char ? this.char : require("./dict/word.json");
        }else{
            this.char = {};
        }
        if(config.xie){
            this.xiehouyu = this.enable.xie ? this.xiehouyu : require("./dict/xiehouyu.json");
        }else{
            this.xiehouyu = {};
        }
        // log.log(this.enable);
        this.enable = {
            char: config.char,
            word: config.word,
            idiom: config.idiom,
            xie: config.xie
        };
        // log.log(Object.keys(this.idiom).length);
    }

    autoSearch(text:string):string{
        if(text.length === 1){
            return this.searchChar(text);
        }
        if(text.length > 4){
            let res = this.searchXiehouyu(text);
            if(res !== ""){
                return res;
            }
            res = this.searchIdiom(text);
            if(res !== ""){
                return res;
            }
            return this.searchWord(text);
        }
        if(text.length === 4){
            let res = this.searchIdiom(text);
            if(res !== ""){
                return res;
            }
            res = this.searchWord(text);
            if(res !== ""){
                return res;
            }
            return this.searchXiehouyu(text);
        }
        else{
            let res = this.searchWord(text);
            if(res !== ""){
                return res;
            }
            res = this.searchIdiom(text);
            return res === "" ? this.searchXiehouyu(text) : res;
        }
    }

    searchChar(text:string, more:boolean = false):string{
        let tmp = this.char[text];
        if(tmp){
            let res:string = `* ${text}(${tmp.oldword})\n  释义：${tmp.explanation}`;
            if(more){
                res += `\n  更多：${tmp.more}`;
            }
            return res;
        }
        return "";
    }

    searchWord(text:string):string{
        let tmp = this.word[text];
        if(tmp){
            return `* ${text}：${tmp}`;
        }
        return "";
    }

    searchIdiom(text:string, example:boolean = false):string{
        let tmp = this.idiom[text];
        if(tmp){
            let res = `* ${text}：\n  释义：${tmp.explanation}\n  出处：${tmp.derivation}`;
            if(example){
                res += `\n  例：${tmp.example}`;
            }
            // log.log("查询成语成功！");
            return res;
        }
        return "";
    }

    searchXiehouyu(text:string):string{
        let tmp = this.xiehouyu[text];
        if(tmp){
            return `* ${text}：${tmp}`;
        }
        return "";
    }
}