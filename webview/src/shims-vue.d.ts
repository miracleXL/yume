declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare function acquireVsCodeApi():{postMessage(message:any):Thenable<boolean>}
declare module vscode{
  function postMessage(message:any):Thenable<boolean>
}