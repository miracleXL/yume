<template>
<div id="regex">
  <p>水平有限不提供撤销，请谨慎操作</p>
  <div>
    <button @click="clickRegButton(index)" class="reg_button" v-for="(button, index) in reg_buttons" :key="index"> {{ button }} </button>
    <button @click="selected = [-1]" class="reg_button">取消选择</button>
  </div>
  <div>
    <div class="reg_input"><input :disabled="disable_reg_edit" v-model="regex_input_key" placeholder="待替换内容正则表达式">→<input :disabled="disable_reg_edit" v-model="regex_input_value" placeholder="替换后结果"></div>
    <div class="selectbox">
        <select v-model="selected" multiple>
        <option @click="disable_reg_edit ? null : [regex_input_key, regex_input_value] = [value.key, value.value]" v-for="(value, key) in formatter" :key="key" :value="key">
            {{ value.key }}
        </option>
        </select>
        <span>→</span>
        <select v-model="selected" multiple>
        <option @dblclick="disable_reg_edit ? null : [regex_input_key, regex_input_value] = [value.key, value.value]" v-for="(value, key) in formatter" :key="key" :value="key">
            {{ value.value }}
        </option>
        </select>
    </div>
  </div>
</div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from 'vue'
import { IPC } from '../Message'

export default defineComponent({
  name: 'fmtreg',
  setup: () => {
    const formatterId: Ref<number> = ref(0);
    const formatter: Ref<{[id:number]:{key:string,value:string}}> = ref({});
    // 向插件发送获取设置项的消息
    IPC.getFormatter();
    return {formatterId, formatter};
  },
  mounted() {
    window.addEventListener("message",event=>{
      let msg = event.data;
      switch(msg.command){
        case "showFormatters":
          [this.formatter, this.formatterId] = IPC.transFormatter(msg.data, 0);
          break;
        default:
          console.error("FormatterRegex：未知消息！");
          console.log(event);
      }
    });
  },
  data: () => {
    // 按键
    const reg_buttons : string[] = ["修改", "保存", "删除", "清空输入框", "清空表达式", "恢复为默认"];
    // 其他数据
    return {
      reg_buttons : reg_buttons,
      currentTab : "filepos",
      selected : [-1],
      disable_reg_edit: true,
      regex_input_key: "",
      regex_input_value: ""
    };
  },
  emits: ["confirm"],
  methods: {
    clickRegButton(index:number){
      switch(index){
        case 0:
          this.editReg();
          break;
        case 1:
          this.saveReg();
          break;
        case 2:
          this.deleteReg();
          break;
        case 3:
          this.clearRegInput();
          break;
        case 4:
          this.clearFormatter();
          break;
        case 5:
          this.resetFormatter();
          break;
        default:
          console.log("判断点击按键 出错！请检查代码");
      }
    },
    editReg(){
      this.disable_reg_edit = !this.disable_reg_edit;
    },
    saveReg(){
      this.disable_reg_edit = true;
      if(!this.regex_input_key) return;
      for(let id in this.formatter){
        if(this.formatter[id].key === this.regex_input_key){
          if(this.formatter[id].value === this.regex_input_value){
            return;
          }
          this.formatter[id].value = this.regex_input_value;
          IPC.updateFormatter(this.formatter);
          return;
        }
      }
      this.formatter[this.formatterId++] = {
        key: this.regex_input_key,
        value: this.regex_input_value
      }
      this.regex_input_key = "";
      this.regex_input_value = "";
      IPC.updateFormatter(this.formatter);
    },
    deleteReg(){
      if(this.selected[0] === -1){
        return;
      }
      if(!confirm("该操作无法撤销，确认删除？")){
        return;
      }
      for(let selected of this.selected){
        if(this.formatter[selected]){
          delete(this.formatter[selected]);
        }
      }
    },
    clearRegInput(){
      this.regex_input_key = "";
      this.regex_input_value = "";
    },
    clearFormatter(){
      this.disable_reg_edit = true;
      this.$emit("confirm", ()=>{
        this.formatter = [];
        IPC.updateFormatter({});
      });
    },
    resetFormatter(){
      this.disable_reg_edit = true;
      this.$emit("confirm", ()=>{
        IPC.getDefaultFormatter();
      });
    },
  }
});

</script>

<style scoped>
#regex {
  text-align: center;
}

.reg_button{
  margin-top: 0;
}

.reg_input{
  width: 80vw;
  height: 2em;
  display: inline-block;
}

.reg_input input{
  width: 34vw;
}

.selectbox{
  width: 80vw;
  height: 50vh;
  display: inline-block;
}

.selectbox select{
  width: 35vw;
  height: 50vh;
}

.selectbox option{
  height: 1.5em;
}

.selectbox span{
  position: relative;
  top: -25vh;
  text-align: center;
}

button{
  cursor: pointer;
  background-color: rgb(75, 75, 75);
  color: azure;
  width: 15ch;
  padding: 10px;
  margin: 2ch;
}
</style>