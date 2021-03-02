/// <reference path = "yume.d.ts" />
"use strict";
import * as vscode from "vscode";

export class TreeViewManager{
    project: ProjectManager;
    provider: vscode.Disposable | null | undefined;

    constructor(){
        this.project = new ProjectManager();
        this.provider = this.register();
    }

    register():vscode.Disposable{
        return vscode.window.registerTreeDataProvider("yume.project",this.project);
    }

    unregister(){
        if(this.provider){
            this.provider.dispose();
            this.provider = null;
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