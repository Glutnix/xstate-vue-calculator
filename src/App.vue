<template>
  <div id="app">
    <Calculator msg="Hello Vue in CodeSandbox!"/>
  </div>
</template>

<script>
import Calculator from "./components/Calculator";

export default {
  name: "App",
  components: {
    Calculator
  }
};
</script>

<style>
body {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
