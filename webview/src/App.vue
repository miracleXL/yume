<template>
  <Scenario/>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Scenario from './components/Scenario.vue'

export default defineComponent({
  name: 'App',
  components: {
    Scenario
  }
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 1vh;
}
</style>
