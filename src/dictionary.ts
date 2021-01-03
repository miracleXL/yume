/* eslint-disable @typescript-eslint/naming-convention */
/// <reference path = "yume.d.ts" />
"use strict";
import fs = require("fs");
import request = require("request");

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
        // console.log(msg);
        return msg;
    }
}

export class Mydict implements Mydict{

    mydict:{[index:string]:string};
    mydictPath:string;

    constructor(path?:string){
        this.mydictPath = path ? path : __dirname + "\\dict\\mydict.json";
        this.mydict = require("./dict/mydict.json");
    }
    
    search(text:string){
        if(text === ""){
            return "";
        }
        if(this.mydict[text]){
            return this.mydict[text];
        }
        return "查找失败！请确认是否已添加进名词表";
    }

    async add(jp:string, zh:string){
        this.mydict[jp] = zh;
        return new Promise((resolve, reject) =>{
            try{
                fs.writeFileSync(this.mydictPath, this.mydict);
            }
            catch(e){
                reject(e);
            }
            resolve(`成功添加"${jp}"："${zh}"到自定义词典`);
        });
    }
}
