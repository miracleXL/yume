/// <reference path = "yume.d.ts" />
/* eslint-disable @typescript-eslint/naming-convention */
"use strict";
import crypto = require("crypto");
import request = require("request");

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
            if(this.cache[text]){
                resolve(this.cache[text]);
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
                headers: {
                    Referer: this.api.api,
                    "User-Agent" : this.userAgent
                },
                qs: data
            },(err:any, res:any, body:any)=>{
                if(err){
                    reject(err);
                }
                let sentences = JSON.parse(body);
                if (sentences.trans_result) {
                    sentences = sentences.trans_result;
                    let result = "";
                    for (let i in sentences) {
                        result += sentences[i].dst;
                    }
                    resolve(result);
                } else {
                    reject(
                        `Error. Raw result: ${body}`
                    );
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
