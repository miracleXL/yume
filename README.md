# Galgame翻译助手（暂停更新）

学业繁忙，暂时弃坑，有缘再见  
推荐使用仍在积极维护同类型的插件 [DLTXT：双行文本翻译解决方案](https://github.com/jsc6924/translation-assistant)，并且其功能完善程度已经超过了本插件

原名Galgame Translator Assistant ~~(GTA)~~，后来和朋友讨论后改为 Yume (Your Unsophisticated Multifunctional Enlightenment)
~~(发布的时候中二病犯了，临时编的)~~

是否会持续更新待定，有需求的话看情况开发一个独立完整的翻译软件

目录

* [目前主要功能](#目前主要功能)
* [安装及使用方法](#安装及使用方法)
* [已知问题](#已知问题)
* Release Notes

## 目前主要功能

* 字典工具
    允许设置专有名词，搜索时优先查找自定义名词表
    使用时先*选中需要翻译的内容*，**快捷键**(Ctrl + Alt + W)，或者使用**右键**字典工具
* 自定义词典
    添加、修改、删除专有名词，无快捷键，仅能通过右键使用（添加需要选中原文），或Ctrl + Shift + P然后搜索相关命令
* 百度机翻
    使用时先*选中需要翻译的内容*，**快捷键**(Ctrl + Alt + S)，或者使用**右键**百度翻译
* 浮动提示
    划词翻译、整句翻译，提示选中内容中最近查询过的词汇、自定义名词
* ~~汉语词典~~(已废弃)
* 格式化文档
    使用方法为右键点击格式化。使用正则表达式处理，支持修改格式化规则
* 语法检查
    检查译文行符号匹配，可自行修改规则，支持正则检查

![演示1](https://raw.githubusercontent.com/miracleXL/yume/master/pic/实用演示.png)
![演示2](https://raw.githubusercontent.com/miracleXL/yume/master/pic/修改自定义词典.png)
计划变更和详细更新记录请查阅[**更改日志**](https://github.com/miracleXL/yume/CHANGELOG.md)

## 安装及使用方法

安装VSCode后，在插件库中搜索，或在发布链接中下载后手动导入
使用前需先初始化项目工作区，初始化操作可在打开有文件夹的情况下，在左侧资源管理器的文件夹中右键——初始化翻译助手，点击后即可完成初始化操作，或者使用侧边栏中Yume项目管理：初始化，点击初始化按钮即可。
![初始化操作演示](https://raw.githubusercontent.com/miracleXL/yume/master/pic/初始化.png)
初始化会在当前文件夹中的.vscode目录下生成mydict.json和yume-config.json（暂时无任何作用）文件。不进行初始化仍可使用除自定义词典以外的翻译工具。
初始化完成后可使用完整功能。可右键或快捷键使用功能，其中百度机翻目前只实现了翻译至汉语，机翻和查词均需选中文字后才会出现在菜单，若未选中任何文字时使用快捷键，可以手动输入待查内容。
![功能使用演示](https://raw.githubusercontent.com/miracleXL/yume/master/pic/右键.png)
扩展设置页面可以修改UA、选择开启功能等
![设置页面](https://raw.githubusercontent.com/miracleXL/yume/master/pic/设置.png)

## 已知问题

待反馈
从来没人反馈过问题~~甚至让我怀疑到底有没有人在用~~

* ~~代码内对各功能称呼可能不同一，看到不对劲了再改~~
* ~~日语词典查询结果词性较多且含义不同时，显示方式不友好，难以判断词性对应翻译~~

## Release Notes

### 1.0.8

到此暂停更新。
新增语法检查，允许自行修改规则。

### 1.0.7

完成侧边栏修改设置的UI，现在可以方便地自行设置修改格式化文档时的正则表达式了

### 1.0.5

修复一处错误正则，请手动删除yume-config.json并重新加载，或自行手动修改

### 1.0.4

添加设置文件，允许自行修改格式化条件（正则表达式）

### 1.0.2

因为操作失误，干脆彻底删去汉语词典功能
添加格式化文档，将各类标点统一为汉语标点。

### 1.0.0

正式发布第一版
