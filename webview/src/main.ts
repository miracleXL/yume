/// <reference path = "shims-vue.d.ts" />

import { createApp } from 'vue';
import App from './App.vue';

export const app = createApp(App);
app.mount('#app');
let p = document.getElementById("dev");
if(p){
    p.remove();
}
