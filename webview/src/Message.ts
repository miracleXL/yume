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
  },

  getDiagnorstics(){
    vscode.postMessage({
      command: 'showDiagnorstics'
    });
  },

  transDiagnorstics(diags:{
    brackets: [string,string][],
    regex: string[]
  }):[{ brackets: {[id:number]:[string,string]}, regex: {[id:number]:string} }, number, number]{
    let new_diags:{ brackets: {[id:number]:[string,string]}, regex: {[id:number]:string} } = {
      brackets: {},
      regex: {}
    };
    let idL = 0, idR = 0;
    for(let bracket in diags.brackets){
      idL++;
      new_diags.brackets[bracket] = diags.brackets[bracket];
    }
    for(let reg in diags.regex){
      idR++;
      new_diags.regex[reg] = diags.regex[reg];
    }
    return [new_diags, idL, idR];
  },

  updateDiagnorstics(diags: { brackets: {[id:number]:[string,string]}, regex: {[id:number]:string} } ){
    let data = this.retransDiagnorstics(diags);
    vscode.postMessage({
      command: "updateDiagnorstics",
      data: data
    })
  },

  retransDiagnorstics(diags:{ brackets: {[id:number]:[string,string]}, regex: {[id:number]:string}})
  {
    let new_diags:{brackets: [string,string][], regex: string[]} = {brackets:[], regex:[]};
    for(let bracket in diags.brackets){
      new_diags.brackets.push([diags.brackets[bracket][0], diags.brackets[bracket][1]]);
    }
    for(let reg in diags.regex){
      new_diags.regex[reg] = diags.regex[reg];
    }
    // console.log(new_diags)
    return new_diags;
  },

}