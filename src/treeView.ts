/// <reference path = "yume.d.ts" />
"use strict";
import * as vscode from "vscode";

export class TreeViewManager{
    project: ProjectManager;
    dispose: vscode.Disposable | null | undefined;

    constructor(){
        this.project = new ProjectManager();
        this.dispose = this.register();
    }

    register():vscode.Disposable{
        return vscode.window.registerTreeDataProvider("yume.project",this.project);
    }

    unregister(){
        if(this.dispose){
            this.dispose.dispose();
            this.dispose = null;
        }
    }
}

class ProjectManager implements vscode.TreeDataProvider<vscode.TreeItem>{
    constructor(){}

    getTreeItem(element:vscode.TreeItem): vscode.TreeItem{
        return element;
    }

    getChildren(element?:vscode.TreeItem): Thenable<vscode.TreeItem[]>{
        return Promise.resolve([]);
    }
}

class ProjectInfo implements vscode.TreeItem{
    constructor(){}
}