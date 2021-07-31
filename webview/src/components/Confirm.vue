<template>
    <p>{{ text }}</p>
    <div id="confirmButton">
        <button @click="$emit('confirm', true)">确定</button>
        <button @click="$emit('confirm', false)">取消</button>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name: "Confirm",
    emits: ["confirm"],
    props: {
        text: String
    }
})
</script>

<style scoped>
p{
    text-align: center;
    display: block;
    width: auto;
    margin: 20px;
    color: crimson;
}
button{
    margin: 20px;
    margin-top: 0;
}
</style>
