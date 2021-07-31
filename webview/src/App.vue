<template>
  <div id="tab">
    <button @click="currentTab = 'filepos'">文件位置</button>
    <button @confirm="waitingConfirm = true" @click="currentTab = 'fmtreg'">文本格式化</button>
  </div>
  <filepos v-if="currentTab === 'filepos'"></filepos>
  <fmtreg @confirm="startWaitingConfirm" v-if="currentTab === 'fmtreg'"></fmtreg>
  <div v-if="waitingConfirm" id="confirmBox"><Confirm @confirm="confirmEvent" :text="confirmText"></Confirm></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import filepos from './components/FilePos.vue'
import fmtreg from './components/FormatterRegex.vue'
import Confirm from './components/Confirm.vue'
import Alert from './components/Alert.vue'

export default defineComponent({
  name: 'App',
  components: {
    filepos,
    fmtreg,
    Confirm,
    Alert
  },
  data(){
    let confirmCallback:Function|undefined;
    return {
      currentTab: "filepos",
      confirmText: "该操作无法撤销，确定继续？",
      waitingConfirm: false,
      confirmCallback: confirmCallback
    };
  },
  // mounted(){
  //   this.startWaitingConfirm(()=>{console.log("确认成功！")});
  // },
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

button{
  padding: 1em;
  margin: 1em;
  margin-bottom: 0;
}
</style>
