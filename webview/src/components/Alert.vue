<template>
    <p>{{ text }}</p>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name: "Alert",
    emits: ["confirm"],
    props: {
        text: String
    }
})
</script>

<style scoped>
p{
    margin: 20px;
    position: fixed;
    width: 30vw;
    left: 35vw;
    top: 20%;
    text-align: center;
    border: 2px ridge;
    background-color: darkgray;
}
</style>
