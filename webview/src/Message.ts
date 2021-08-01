// export const vscode = acquireVsCodeApi();
export const vscode = (typeof(acquireVsCodeApi) === "function") ? acquireVsCodeApi() : {
    postMessage: (msg:{
        command : string;
        text?: string;
        data?: any;
    })=>{
      console.log(`vscode message: ${msg.command}`);
    }
};

export const IPC = {
  alert(text: string){
    vscode.postMessage({
      command: "alert",
      text: text
    })
  },

  getFilepos(){
    vscode.postMessage({
      command: "showFilepos"
    })
  },

  getFormatter(){
      vscode.postMessage({
        command: 'showFormatters'
      });
  },

  transFormatter(data:any, id: number):[{[id:number]:{key:string,value:string}}, number] {
      let formatter:{[id:number]:{key:string,value:string}} = {};
      for(let key in data){
        formatter[id++] = {
          key:key,
          value: data[key]
        }
      }
      return [formatter, id];
  },

  reTransFormatter(Formatter:{[id:number]:{key:string,value:string}}):{[index: string]: string}{
    let data:{[index: string]: string} = {};
    for(let id in Formatter){
      data[Formatter[id].key] = Formatter[id].value
    }
    return data;
  },

  updateFormatter(formatter:{[id:number]:{key:string,value:string}}){
    vscode.postMessage({
      command: "updateFormatter",
      data: this.reTransFormatter(formatter)
    })
  },

  clearFormatter(){
    vscode.postMessage({
      command: "clearFormatter"
    })
  },

  getDefaultFormatter(){
    vscode.postMessage({
      command: "getDefaultFormatter"
    })
  },

  saveFilepos(fp:{[id:number]:string|string[]}){
    vscode.postMessage({
      command: "saveFilepos",
      data: fp
    })
  }
}