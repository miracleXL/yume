<template>
    <p>语法检查目前可检查括号是否正确闭合，如果有其他想法，请自行设置匹配错误的正则表达式</p>
    <div id="brackets">
        <button @click="clickL(index)" v-for="(button, index) in buttonsL" :key="index">{{ button }}</button>
        <div class="inputbox"><input v-model="inputL" placeholder="左侧符号">…<input v-model="inputR" placeholder="右侧符号"></div>
        <div class="selectbox">
            <select v-model="selectedL" multiple>
            <option @dblclick="[inputL, inputR] = [value[0], value[1]]" v-for="(value, key) in diagnostics.brackets" :key="key" :value="key">
                {{ value[0] }}
            </option>
            </select>
            <span>…</span>
            <select v-model="selectedL" multiple>
            <option @dblclick="[inputL, inputR] = [value[0], value[1]]" v-for="(value, key) in diagnostics.brackets" :key="key" :value="key">
                {{ value[1] }}
            </option>
            </select>
        </div>
    </div>
    <div id="regex">
        <button @click="clickR(index)" v-for="(button, index) in buttonsR" :key="index">{{ button }}</button>
        <input class="regex_inputbox" v-model="regex_input" placeholder="待替换内容正则表达式">
        <select v-model="selectedR" multiple class="regex_selectbox">
            <option @dblclick="regex_input = value" v-for="(value, key) in diagnostics.regex" :key="key" :value="key">
                {{ value }}
            </option>
        </select>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { IPC } from '../Message'

export default defineComponent({
    name: "diagnostics",
    setup() {
    },
    emits: ["confirm"],
    mounted(){
        window.addEventListener("message", (e)=>{
            if(e.data){
                this.eventListener(e.data);
            }
        });
        IPC.getDiagnorstics();
    },
    data(){
        let buttonsL = ["保存", "删除", "清空"];
        let buttonsR = ["保存", "删除", "清空"];
        let diagnostics:{ brackets: {[id:number]:[string,string]}, regex: {[id:number]:string} } = { brackets: {}, regex: {} };
        return {
            buttonsL,
            buttonsR,
            diagnostics,
            inputL: "",
            inputR: "",
            selectedL: [-1],
            selectedR: [-1],
            regex_input: "",
            idL: 0,
            idR: 0
            };
    },
    methods: {
        eventListener(msg:{
            command : string;
            text?: string;
            data?: any;
        }){
            switch(msg.command){
                case "showDiagnorstics":
                    this.update(msg.data);
                    break;
            }
        },
        update(data:{
            brackets: [string,string][],
            regex: string[]
        }){
            [this.diagnostics, this.idL, this.idR] = IPC.transDiagnorstics(data);
        },
        clickL(index:number){
            switch(index){
                case 0:
                    this.saveBrackets();
                    break;
                case 1:
                    this.deleteBrackets();
                    break;
                case 2:
                    this.clearBrackets();
                    break;
            }
        },
        clickR(index:number){
            switch(index){
                case 0:
                    this.saveReg();
                    break;
                case 1:
                    this.deleteReg();
                    break;
                case 2:
                    this.clearReg();
                    break;
            }
        },
        saveBrackets(){
            if(!this.inputL || !this.inputR) return;
            for(let bracket in this.diagnostics.brackets){
                if(this.diagnostics.brackets[bracket][0] === this.inputL && this.diagnostics.brackets[bracket][1] === this.inputR) return;
            }
            this.diagnostics.brackets[this.idL++] = [this.inputL, this.inputR];
            IPC.updateDiagnorstics(this.diagnostics);
        },
        deleteBrackets(){
            if(this.selectedL[0] === -1){
                return;
            }
            this.$emit("confirm",()=>{
                for(let select of this.selectedL){
                    if(this.diagnostics.brackets[select]){
                        delete(this.diagnostics.brackets[select]);
                    }
                }
                IPC.updateDiagnorstics(this.diagnostics);
            });
        },
        clearBrackets(){
            this.$emit("confirm", ()=>{
                this.diagnostics.brackets = {};
                IPC.updateDiagnorstics(this.diagnostics);
            });
        },
        saveReg(){
            if(!this.regex_input) return;
            for(let reg in this.diagnostics.regex){
                if(this.diagnostics.regex[reg] === this.regex_input) return;
            }
            this.diagnostics.regex[this.idR++] = this.regex_input;
            IPC.updateDiagnorstics(this.diagnostics);
        },
        deleteReg(){
            if(this.selectedR[0] === -1){
                return;
            }
            this.$emit("confirm",()=>{
                for(let select of this.selectedR){
                    if(this.diagnostics.regex[select]){
                        delete(this.diagnostics.regex[select]);
                    }
                }
                IPC.updateDiagnorstics(this.diagnostics);
            });
        },
        clearReg(){
            this.$emit("confirm", ()=>{
                this.diagnostics.regex = {};
                IPC.updateDiagnorstics(this.diagnostics);
            });
        }
    }
})
</script>

<style scoped>
p{
    text-align: center;
    margin-top: 0;
    margin-bottom: 0.5em;
}

button{
    padding: 0.6em;
    margin: 0.6em;
}

#brackets{
    text-align: center;
    display: inline-block;
    width: 40vw;
    position: relative;
    left: 10vw;
}

#regex{
    text-align: center;
    display: inline-block;
    width: 40vw;
    position: relative;
    left: 10vw;
}

.inputbox input{
  width: 13vw;
  margin-bottom: 0.5em;
}

.selectbox{
  width: 30vw;
  height: 40vh;
  display: inline-block;
}

.selectbox select{
  width: 13vw;
  height: 40vh;
  background-color: darkgray;
}

.selectbox option{
  height: 1.5em;
}

.selectbox span{
  position: relative;
  top: -15vh;
  text-align: center;
}

.regex_inputbox{
    width: 30vw;
    margin-bottom: 0.5em;
}

.regex_selectbox{
  width: 30vw;
  height: 40vh;
  background-color: darkgray;
}

</style>