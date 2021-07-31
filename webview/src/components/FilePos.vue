<template>
  <div>
    <button @click="clickFpButton(index)" class="fp_button" v-for="(button, index) in fp_buttons" :key="index">
      {{ button }}
    </button>
  </div>
  <ul class="fp_inputs" v-for="fp in fp_inputs" :key="fp.id">
    <p>{{ fp.key }} :</p>
    <input :disabled="disable_fp_edit" class="fp_inputbox" type="value" v-model="fp.value"/>
  </ul>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { IPC } from "../Message";

export default defineComponent({
  name: "filepos",
  setup: () => {
    // 向插件发送获取设置项的消息
    IPC.getFilepos();
  },
  emits: ['message'],
  mounted() {
    window.addEventListener("message", (event) => {
      let msg = event.data;
      if(!msg) return;
      switch (msg.command) {
        case "showFilepos":
          this.update(msg.data);
          break;
        default:
          console.log("Filepos：未知消息！");
          console.log(event);
      }
    });
    this.update([
      { id: 0, value: "测试" },
      { id: 1, value: "" },
      { id: 2, value: "" },
      { id: 3, value: "" },
      { id: 4, value: "" },
      { id: 5, value: "u8" },
    ]);
  },
  data() {
    // 按键
    const fp_buttons: string[] = [
      "修改设置",
      "保存设置",
      "提取剧本",
      "回注剧本",
    ];
    const fp_inputs: { id: number; key: string; value: string }[] = [
      { id: 0, key: "源文件所在文件夹路径", value: "" },
      { id: 1, key: "源文件名后缀(如*.scn，中间用逗号隔开)", value: "" },
      { id: 2, key: "源文件编码", value: "" },
      { id: 3, key: "提取文件目标文件夹路径", value: "" },
      { id: 4, key: "目标文件后缀(默认*.txt)", value: "txt" },
      { id: 5, key: "提取文件编码(默认utf-8)", value: "utf-8" },
    ];
    return {
      fp_buttons: fp_buttons,
      fp_inputs: fp_inputs,
      disable_fp_edit: true
    };
  },
  methods: {
    clickFpButton(index: number) {
      switch (index) {
        case 0:
          this.editFp();
          break;
        case 1:
          this.saveFp();
          break;
        case 2:
          this.extractScn();
          break;
        case 3:
          this.injectScn();
          break;
        default:
          console.log("判断点击按键 出错！请检查代码");
      }
    },
    editFp() {
      this.disable_fp_edit = false;
    },
    saveFp() {
      this.disable_fp_edit = true;
      let data:{[id:number]:string|string[]} = {};
      for(let fp of this.fp_inputs){
        if(fp.id === 1){
          data[fp.id] = fp.value.split(/,|，/);
        }
        data[fp.id] = fp.value;
      }
      IPC.saveFilepos(data);
    },
    extractScn() {
      underDev();
    },
    injectScn() {
      underDev();
    },
    update(data: { id: number; value: string }[]) {
      try{
        for (let t of data) {
          this.fp_inputs[t.id].value = t.value;
        }
      }
      catch(e){
        console.error(e);
      }
    },
  },
});

function underDev(){
  alert("该功能尚未完成！");
  IPC.alert("该功能尚未完成！");
}
</script>

<style scoped>
p {
  margin: 0;
  display: inline-block;
  width: 30vw;
  text-align: right;
}

.fp_inputbox {
  width: 50vw;
}

.fp_button {
  cursor: pointer;
  background-color: rgb(75, 75, 75);
  color: azure;
  width: 15ch;
  padding: 10px;
  margin: 2ch;
}
</style>