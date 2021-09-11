/// <reference path = "yume.d.ts" />
"use strict";
import * as vscode from "vscode";

export class TreeViewManager{
    project: ProjectManager;
    // baidu: TreeViewBaidu;
    provider: vscode.Disposable[];

    constructor(){
        this.project = new ProjectManager();
        // this.baidu = new TreeViewBaidu();
        this.provider = this.register();
    }

    register():vscode.Disposable[]{
        // return [vscode.window.registerTreeDataProvider("yume.treeViewTranslate",this.baidu),vscode.window.registerTreeDataProvider("yume.project",this.project)];
        return [vscode.window.registerTreeDataProvider("yume.project",this.project)];
    }

    unregister(){
        for(let p of this.provider){
            p.dispose();
        }
        this.provider = [];
    }
}

class ProjectManager implements vscode.TreeDataProvider<vscode.TreeItem>{
	private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | null | void> = new vscode.EventEmitter<vscode.TreeItem | null | void>();
	readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | null | void> = this._onDidChangeTreeData.event;

    constructor(){}

    getTreeItem(element:vscode.TreeItem): vscode.TreeItem{
        return element;
    }

    getChildren(element?:vscode.TreeItem): Thenable<vscode.TreeItem[]>{
        if(element){
            return Promise.resolve([]);
        }
        return Promise.resolve([new ScnManager()]);
    }
}

class ScnManager implements vscode.TreeItem{
    label = "简单设置";
    collapsibleState = vscode.TreeItemCollapsibleState.None;
    command = {
        title:"简单设置",
        command: "yume.scenario"
    };
}

class Game implements vscode.TreeItem{
    name: string;
    characters: Character[];
    info: string;
    id: string;
    tooltip: string | undefined;
    
    constructor(){
        this.name = "";
        this.characters = [];
        this.info = "";
        this.id = "game";
        this.tooltip = "游戏信息";
    }
}

class Character{
    info: string;
    charRoute: boolean;
    phrase: string[];

    constructor(){
        this.info = "";
        this.charRoute = false;
        this.phrase = [];
    }
}

class Group implements vscode.TreeItem{
    name: string;
    members: Translator[];
    tooltip: string | undefined;
    
    constructor(){
        this.name = "";
        this.members = [];
        this.tooltip = "汉化组信息";
    }
}

class Translator{
    name: string;
    task: string;

    constructor(){
        this.name = "";
        this.task = "";
    }
}