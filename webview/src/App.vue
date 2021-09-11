<template>
  <div id="tab">
    <button @click="currentTab = 'filepos'">文件位置</button>
    <button @confirm="waitingConfirm = true" @click="currentTab = 'fmtreg'">文本格式化</button>
    <button @confirm="waitingConfirm = true" @click="currentTab = 'diagnostics'">语法检查</button>
  </div>
  <keep-alive>
    <component :is="currentTab" @confirm="startWaitingConfirm"></component>
  </keep-alive>
  <div v-if="waitingConfirm" id="confirmBox"><Confirm @confirm="confirmEvent" :text="confirmText"></Confirm></div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { IPC } from './Message'
import filepos from './components/FilePos.vue'
import fmtreg from './components/FormatterRegex.vue'
import diagnostics from './components/Diagnostics.vue'
import Confirm from './components/Confirm.vue'
import Alert from './components/Alert.vue'

export default defineComponent({
  name: 'App',
  components: {
    filepos,
    fmtreg,
    diagnostics,
    Confirm,
    Alert
  },
  data(){
    let confirmCallback:Function|undefined;
    return {
      currentTab: "filepos",
      confirmText: "该操作无法撤销，确定继续？",
      waitingConfirm: false,
      confirmCallback: confirmCallback,
    };
  },
  methods: {
    startWaitingConfirm(callback:Function|undefined){
      this.waitingConfirm = true;
      if(typeof(callback) === "function"){
        this.confirmCallback = callback;
      }
    },

    confirmEvent(cfm:boolean){
      this.waitingConfirm = false;
      if(cfm && this.confirmCallback){
        this.confirmCallback();
      }
    }
  }
})
</script>

<style>
body{
  background: gray;
  /* text-align: center; */
}
.fmtreg{
  text-align: center;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin-top: 1vh;
}

#confirmBox{
  position: fixed;
  width: 30vw;
  left: 35vw;
  top: 20%;
  text-align: center;
  border: 2px ridge;
  background-color: darkgray;
}

footer{
  text-align: center;
  margin-top: 1.5em;
}
footer p{
  margin: 0;
}

#tab button{
  background-color: rgb(235, 235, 235);
  color: black;
}

button{
  padding: 1em;
  margin: 1em;
  cursor: pointer;
  background-color: rgb(75, 75, 75);
  color: azure;
}
</style>
