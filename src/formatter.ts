/// <reference path = "yume.d.ts" />
"use strict";
import * as vscode from "vscode";
import { log } from "./log";

class FormattingEditProvider implements vscode.DocumentFormattingEditProvider{
    originText: string;
    origin: RegExp;
    translateText: string;
    translate: RegExp;
    private formatter: {
        [index:string]:string
    };
    constructor(formatter:[string,string, {[index:string]:string}]){
        this.originText = formatter[0];
        this.origin = new RegExp(this.originText);
        this.translateText = formatter[1];
        this.translate = new RegExp(this.translateText);
        this.formatter = formatter[2];
    }

    updateReg(origin:string, translate: string){
        this.origin = new RegExp(origin);
        this.translate = new RegExp(translate);
    }

    format(text:string):string{
        for(let reg in this.formatter){
            text = text.replace(new RegExp(reg,"g"),this.formatter[reg]);
        }
        return text;
    }

    provideDocumentFormattingEdits(document:vscode.TextDocument, options:vscode.FormattingOptions, token: vscode.CancellationToken) : vscode.ProviderResult<vscode.TextEdit[]>{
        if(!this.originText || !this.translateText){
            log.show("请在设置中添加原文行、译文行起始标志！");
        }
        let operations = new Array<vscode.TextEdit>();
        log.log("开始格式化");
        try{
            for(let lineNumber = 0; lineNumber < document.lineCount; lineNumber++){
                if(token.isCancellationRequested){
                    log.log("操作已取消");
                    return null;
                }
                let line = document.lineAt(lineNumber);
                let text = line.text;
                let pre = text.match(this.translate);
                if(pre){
                    operations.push(vscode.TextEdit.replace(line.range, pre[0] + this.format(text.replace(this.translate,""))));
                }
            }
        }
        catch(e){
            log.error(e);
        }
        log.log("格式化完成！");
        return operations;
    }
}

export class Formatter{
    selector: vscode.DocumentSelector;
    provider: FormattingEditProvider;
    _register: vscode.Disposable | null;

    constructor(formatter:[string,string, {[index:string]:string}]){
        this.selector = {
            scheme: "file",
            language: "plaintext"
        };
        this.provider = new FormattingEditProvider(formatter);
        this._register = vscode.languages.registerDocumentFormattingEditProvider(this.selector, this.provider);
    }

    register(){
        if(this._register){
            return;
        }else{
            this._register = vscode.languages.registerDocumentFormattingEditProvider(this.selector, this.provider);
        }
    }

    unregister(){
        if(this._register){
            this._register.dispose();
        }
        this._register = null;
    }

    updateReg(origin:string, translate: string){
        this.provider.updateReg(origin,translate);
    }
}