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
    getMD5(content:string):string;
}

interface JPdata{
    word: string,
    katakana: string[],
    type: string,
    simple: string[],
    detail: string[]
}

declare interface Dictionary{
    cache:{
        [index:string]: string
    };
    search(text:string, convert?:boolean): Promise<string|JPdata>;
}

declare interface Mydict{
    cache:{
        [index:string]: string
    }
}

declare interface Header{
    [index:string]: {
        [index:string]:string
    };
}
