/// <reference path = "yume.d.ts" />
"use strict";
import * as vscode from "vscode";
import { log } from "./log";

class FormattingEditProvider implements vscode.DocumentFormattingEditProvider{
    origin: RegExp;
    translate: RegExp;
    constructor(oriReg:RegExp, transReg:RegExp){
        this.origin = oriReg;
        this.translate = transReg;
        log.log(`oriReg: ${oriReg}`);
        log.log(`transReg: ${transReg}`);
    }

    updateReg(origin:RegExp, translate: RegExp){
        this.origin = origin;
        this.translate = translate;
    }

    format(text:string):string{
        return text.replace(/(……?)|(\.{2,})|(。{2,})/g, "……")
        .replace(/[~〜∼∽⁓]/g, "～")
        .replace(/(ー{2,})|(－{2,})|(-{2,})/g, "——")
        .replace(/[,]/g, "，")
        .replace(/[\.]/g, "。")
        .replace(/[:]/, "：")
        .replace(/[;]/g, "；")
        .replace(/[!]/g, "！")
        .replace(/[?]/g, "？")
        .replace(/[(]/g, "（")
        .replace(/[)]/g, "）")
        .replace(/[『]/g, "“")
        .replace(/[』]/g, "”");
    }

    provideDocumentFormattingEdits(document:vscode.TextDocument, options:vscode.FormattingOptions, token: vscode.CancellationToken) : vscode.ProviderResult<vscode.TextEdit[]>{
        let operations = new Array<vscode.TextEdit>();
        log.log("开始格式化");
        for(let lineNumber = 0; lineNumber < document.lineCount; lineNumber++){
            if(token.isCancellationRequested){
                return null;
            }
            let line = document.lineAt(lineNumber);
            let text = line.text;
            let pre = text.match(this.translate);
            if(pre){
                operations.push(vscode.TextEdit.replace(line.range, pre[0] + this.format(text.replace(this.translate,""))));
            }
        }
        return operations;
    }
}

export class Formatter{
    selector: vscode.DocumentSelector;
    provider: FormattingEditProvider;
    _register: vscode.Disposable | null;

    constructor(oriReg:RegExp, transReg:RegExp){
        this.selector = {
            scheme: "file",
            language: "plaintext"
        };
        this.provider = new FormattingEditProvider(oriReg, transReg);
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

    updateReg(origin:RegExp, translate: RegExp){
        this.provider.updateReg(origin,translate);
    }
}