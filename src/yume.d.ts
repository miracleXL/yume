// interface
declare interface BaiduFanyi{
    cache:{[index:string]:string};
    api: {
        api:string,
        appId:string,
        appKey:string
    };
    userAgent: string;
    search(text:string,to?:string):Promise<string>;
}

interface JPdata{
    word: string,
    katakana: string[],
    type: string[],
    simple: string[],
    detail: string[]
}

declare interface Header{
    [index:string]: {
        [index:string]:string
    };
}

declare interface EnabledDict{
    [index:string]:boolean,    
    char:boolean,
    word:boolean,
    idiom:boolean,
    xie:boolean
}