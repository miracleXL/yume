<template>
  <div id="tab">
    <button @click="currentTab = 'filepos'">文件位置</button>
    <button @click="currentTab = 'regex'">文本格式化</button>
  </div>

  <div id="filepos" v-if="currentTab === 'filepos'">
    <div><button @click="clickFpButton(index)" class="fp_button" v-for="(button, index) in fp_buttons" :key="index"> {{ button }} </button></div>
    <ul class="fp_inputs" v-for="fp in fp_inputs" :key="fp.id"><p> {{ fp.key }} : </p><input class="fp_inputbox" type="value" v-model="fp.value"></ul>
  </div>

  <div id="regex" v-if="currentTab === 'regex'">
    <p>水平有限不提供撤销，请谨慎操作</p>
    <div><button @click="clickRegButton(index)" class="reg_button" v-for="(button, index) in reg_buttons" :key="index"> {{ button }} </button></div>
    <div>
      <div class="reg_input"><input :disabled="disable_reg_edit" v-model="regex_input_key" placeholder="待替换内容正则表达式">→<input :disabled="disable_reg_edit" v-model="regex_input_value" placeholder="替换后结果"></div>
      <div class="selectbox">
        <select v-model="selected" multiple>
          <option @dblclick="disable_reg_edit ? null : [regex_input_key, regex_input_value] = [key, value]" v-for="(value, key, index) in formatter" :key="index" :value="index">
            {{ key }}
          </option>
        </select>
        <span>→</span>
        <select v-model="selected" multiple>
          <option @dblclick="disable_reg_edit ? null : [regex_input_key, regex_input_value] = [key, value]" v-for="(value, key, index) in formatter" :key="index" :value="index">
            {{ value }}
          </option>
        </select>
      </div>
    </div>
    <p>推荐参考<br>
      <a href="http://c.gb688.cn/bzgk/gb/showGb?type=online&hcno=22EA6D162E4110E752259661E1A0D0A8">国家标准GB/T 15834-2011标点符号用法</a><br>
      <a href="https://www.runoob.com/regexp/regexp-tutorial.html">正则表达式 – 教程 | 菜鸟教程</a>
    </p>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, ToRefs, Ref } from 'vue'
export default defineComponent({
  name: 'Scenario',
  setup: () => {
    const formatter: Ref<{[index:string]:string}> = ref(getFormatter());
    return { formatter }
  },
  data(){
    const fp_buttons : string[] = ["修改设置", "保存设置", "提取剧本", "回注剧本"];
    const fp_inputs: {id:number,key:string,value:string}[] = [
      { id: 1, key: "源文件所在文件夹路径", value: "" },
      { id: 2, key: "源文件名后缀(如*.scn，多种后缀用逗号隔开", value: "" },
      { id: 3, key: "源文件编码", value: "" },
      { id: 4, key: "提取文件目标文件夹路径", value: "" },
      { id: 5, key: "目标文件后缀(默认*.txt)", value: "txt" },
      { id: 6, key: "提取文件编码(默认utf-8)", value: "utf-8" },
    ];
    const reg_buttons : string[] = ["修改", "保存", "删除", "清空输入框", "清空表达式", "恢复为默认"];
    return {
      fp_buttons : fp_buttons,
      fp_inputs : fp_inputs,
      reg_buttons : reg_buttons,
      currentTab : "filepos",
      selected : 0,
      disable_reg_edit: true,
      regex_input_key: "",
      regex_input_value: "",
    };
  },
  methods: {
    clickFpButton(index:number){},
    clickRegButton(index:number){
      switch(index){
        case 0:
          this.editReg();
          break;
        case 1:
          this.saveReg();
          break;
      }
    },
    editReg(){
      this.disable_reg_edit = !this.disable_reg_edit;
    },
    saveReg(){
      this.disable_reg_edit = true;
      this.formatter[this.regex_input_key] = this.regex_input_value;
      this.regex_input_key = "";
      this.regex_input_value = "";
      postFormatter(this.formatter);
    }
  }
})
function getFormatter():{[index:string]:string} {
  return {
    "(……?)|(\\.{2,})|(。{2,})": "……",
    "[~〜∼∽⁓]": "～",
    "(ーー?)|(－－?)|(--+)": "——",
    ",": "，",
    "(?<=\\D)\\.(?=\\D)?": "。",
    "(?<=\\D) *= *(?=\\D)": " ＝ ",
    ":": "：",
    ";": "；",
    "!": "！",
    "[\\?]": "？",
    "\\(": "（",
    "\\)": "）",
    "『": "“",
    "』": "”",
    "(！+？+)": "？！",
    "，$": "——"
  };
};
function postFormatter(formatter:{[index:string]:string}){
  return;
};
</script>

<style scoped>
button{
  padding: 1em;
  margin: 1em;
  margin-bottom: 0;
}

.fp_inputs p{
  display: inline;
  width: 30vw;
  text-align: right;
}

.fp_inputbox{
  width: 59vw;
  right: 1vw;
  position: absolute;
}

.fp_button, .reg_button{
  cursor: pointer;
  background-color: rgb(75, 75, 75);
  color: azure;
  width: 15ch;
  padding: 10px;
  margin: 2ch;
}

.reg_button{
  margin-top: 0;
}

#regex{
  text-align: center;
}

#regex p:first{
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

code {
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 4px;
  color: #304455;
}
</style>
