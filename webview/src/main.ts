import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');
let p = document.getElementById("dev");
if(p){
    p.hidden = true;
}
