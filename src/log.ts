/// <reference path = "yume.d.ts" />
import vscode = require("vscode");
import fs = require("fs");

class Log{
    channel: vscode.OutputChannel;

    constructor(){
		this.channel = vscode.window.createOutputChannel("Yume");
    }

    print(info:string){
        this.channel.appendLine(info);
        this.channel.show(true);
    }

    log(info:any){
        console.log(info);
    }

    error(e:any){
        if(typeof(e) === "string"){
            vscode.window.showErrorMessage(e);
        }
        else{
            this.channel.appendLine(e);
        }
        console.error(e);
    }

    show(info:string){
        vscode.window.showInformationMessage(info);
    }
}

export const log = new Log();

export class LogFile{

    filePath: vscode.Uri;

    constructor(path:vscode.Uri){
        this.filePath = path;
    }

    write(info:string){
        fs.writeFile(this.filePath.fsPath, info, {
            encoding:"utf-8",
            flag: "a"
        },(err)=>{
            log.log(err);
        });
    }
}