import vscode = require("vscode");
import { yume } from "./extension";
import { log } from "./log"

export class LanguageManager{
    collection: vscode.DiagnosticCollection;
    target: string;
    regex?: RegExp[];

    constructor(target:string, context?:vscode.ExtensionContext){
        this.target = target;
        this.collection = vscode.languages.createDiagnosticCollection("scenario_text");
        this.activate(context);
    }

    activate(context?: vscode.ExtensionContext){
        if(!context){
            log.log("未激活语法检查功能！")
            return;
        }
        context.subscriptions.push(
            vscode.window.onDidChangeActiveTextEditor((e: vscode.TextEditor|undefined)=>{
                if(e){
                    let fn = e.document.fileName.split(".");
                    if(fn[fn.length-1] === this.target){
                        this.updateDiagnostics(e.document);
                    }
                }
            })
        )
        context.subscriptions.push(
            vscode.workspace.onDidChangeTextDocument((e:vscode.TextDocumentChangeEvent)=>{
                if(e){
                    let fn = e.document.fileName.split(".");
                    if(fn[fn.length-1] ===  this.target){
                        for(let content of e.contentChanges){
                            this.updateDiagnostics(e.document, content.range);
                        }
                    }
                }
            })
        )
    }

    updateRegex(){
        this.regex = [];
        for(let reg of yume.getDiagnostics().regex){
            this.regex.push(new RegExp(reg));
        }
        console.log(this.regex)
    }

    updateDiagnostics(document: vscode.TextDocument, range?: vscode.Range){
        let diags:vscode.Diagnostic[] = [];
        let startline:number = range ? range.start.line : 0;
        let endLine:number = range ? range.end.line+1 : document.lineCount;
        for(let i = startline; i < endLine; i++){
            let line = document.lineAt(i);
            if(line.text.match(new RegExp(yume.config.translateReg))){
                if(!this._testBrackets(line.text)){
                    diags.push(new vscode.Diagnostic(line.range, "括号未正确闭合，请检查是否需要修复", vscode.DiagnosticSeverity.Warning));
                }
                if(this._testRegex(line.text)){
                    diags.push(new vscode.Diagnostic(line.range, "用户自定义错误", vscode.DiagnosticSeverity.Warning));
                }
            }
        }
        for(let diag of vscode.languages.getDiagnostics(document.uri)){
            if(!this._testBrackets(document.getText(diag.range))){
                diags.push(diag);
            }
        }
        this.collection.set(document.uri, diags);
    }

    // 检测到错误返回true
    _testBrackets(text:string):boolean{
        let stack = [];
        let brackets: [string, string][] =  yume.getDiagnostics().brackets;
        for(let c of text){
            for(let bracket of brackets){
                if(c === bracket[0]){
                    stack.push(c);
                }
                else if(c === bracket[1]){
                    if(stack[stack.length-1] === bracket[0]){
                        stack.pop();
                    }
                    else{
                        return false;
                    }
                }
            }
        }
        if(stack.length === 0) return true;
        return false;
    }

    // 检测到错误返回true
    _testRegex(text:string):boolean{
        if(!this.regex){
            this.regex = [];
            for(let reg of yume.getDiagnostics().regex){
                this.regex.push(new RegExp(reg));
            }
        }
        for(let reg of this.regex){
            if(reg.exec(text)){
                return true;
            }
        }
        return false;
    }
}