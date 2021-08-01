import * as vscode from "vscode";
import { log } from "./log"
import { yume } from "./extension"
import { getWebviewContent } from "./extension"

export class ScenarioManager{
    private uri: vscode.Uri;
    public panel: vscode.WebviewPanel|undefined;

    constructor(rootUri:vscode.Uri){
        this.uri = vscode.Uri.joinPath(rootUri, "./webview/dist/index.html");
    }

    initPanel(){
        if(!this.panel){
            this.panel = vscode.window.createWebviewPanel("yume.scnWebview","剧本管理", vscode.ViewColumn.One, {
                enableScripts: true,
                retainContextWhenHidden: true,
                // localResourceRoots: [vscode.Uri.joinPath(yume.config.rootPath as vscode.Uri, "webview/dist")]
            });
        }
        this.panel.onDidDispose(()=>{
            this.panel = undefined;

        })
        getWebviewContent(this.uri, this.panel.webview).then((html)=>{
            if(!this.panel) return;
            let webview = this.panel.webview;
            webview.html = html;
			webview.onDidReceiveMessage(message=>{
				log.log(message.command);
				switch(message.command){
					case "alert":
						log.show(message.text);
						break;
					case "showFormatters":
						webview.postMessage({
							command: "showFormatters",
							data: yume.getProjectConfig().formatter[2]
						});
						break;
					case "showFilepos":
						webview.postMessage({
                            command: "showFilepos",
                            data: yume.getProjectConfig().filepos
                        });
						break;
					case "updateFormatter":
                        yume.updateFormatter(message.data);
						break;
					case "clearFormatter":
						log.log("开始清空")
                        yume.clearFormatter();
						break;
					case "getDefaultFormatter":
                        yume.resetFormatter();
						webview.postMessage({
							command: "showFormatters",
							data: yume.getProjectConfig().formatter[2]
						});
						break;
					case "saveFilepos":
                        yume.updateFilepos(message.data);
						break;
					default :
						log.error(message);
				}
			})
        })
    }

	show(){
		const columnToShowIn = vscode.window.activeTextEditor? vscode.window.activeTextEditor.viewColumn : vscode.ViewColumn.One;
		if(this.panel){
			this.panel.reveal(columnToShowIn);
		}
		else{
            this.initPanel();
		}
	}
}