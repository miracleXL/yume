/// <reference path = "yume.d.ts" />
/* eslint-disable @typescript-eslint/naming-convention */
"use strict";
import crypto = require("crypto");
import request = require("request");
import {log} from "./log";

export class Baidu implements BaiduFanyi{

    cache:{[index:string]:string};
    api: {
        api:string,
        appId:string,
        appKey:string
    };
    userAgent: string;

    constructor(api:{
        api:string,
        appId:string,
        appKey:string
    }){
        this.userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.81 Safari/537.36';;
        this.cache = {};
        this.api = api;
    }

    search(text:string, to = "zh"):Promise<string>{
        return new Promise((resolve, reject)=>{
            if(text === ""){
                reject();
                return;
            }
            if(this.cache[text]){
                resolve(this.cache[text]);
                return;
            }
            if(this.api.appId === "" || this.api.appKey === ""){
                reject("请检查设置是否正确填写百度机翻API！");
            }
            let salt = (new Date()).getTime();
            let data = {
                q: text,
                from: 'auto',
                to: to,
                appid: this.api.appId,
                salt: salt,
                sign: this.getMD5(this.api.appId+text+salt+this.api.appKey)
            };
            request.get(this.api.api,{
                gzip: true,
                headers:{
                    'Content-Type':'application/json',
                    'User-Agent':this.userAgent
                },
                qs: data
            },(err:Error, res:any, body:any)=>{
                if(err){
                    reject(err);
                    return;
                }
                if(res.headers['content-type'] !== "application/json"){
                    log.error(res);
                }
                try{
                    let sentences = JSON.parse(body);
                    if (sentences.trans_result) {
                        let result = "";
                        for (let i of sentences.trans_result) {
                            result += i.dst;
                        }
                        this.cache[text] = result;
                        resolve(result);
                    } else {
                        reject(
                            `Error. Raw result: ${body}`
                        );
                    }
                }
                catch(e){
                    log.error(`JSON解析失败！\n${body}`);
                    reject(e);
                }
            });
        });
    }

    getMD5(content:string):string{
        if(!content){
            return content;
        }
        var md5 = crypto.createHash('md5');
        md5.update(content);
        var d = md5.digest('hex'); 
        return d.toLowerCase();
    }
}
