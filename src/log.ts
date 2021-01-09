/// <reference path = "yume.d.ts" />
import vscode = require("vscode");

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
}

export const log = new Log();