/// <reference path = "yume.d.ts" />
import vscode = require("vscode");

class Log{
    channel: vscode.OutputChannel;
    constructor(){
		this.channel = vscode.window.createOutputChannel("Yume");
    }

    print(info:any){
        this.channel.appendLine(info);
        this.channel.show();
    }

    log(info:any){
        console.log(info);
    }

    error(e:any){
        console.error(e);
    }
}

export const log = new Log();