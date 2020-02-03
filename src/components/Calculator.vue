<template>
  <div class="hello">
    <div class="container">
      <input class="readout" :value="state.context.display" disabled>
      <div class="button-grid">
        <button
          v-for="button in buttons"
          :key="button"
          @click="handleButtonClick(button)"
          class="calc-button"
          :class="{'two-span': button === 'C'}"
        >{{ button }}</button>
      </div>
    </div>
    <pre><code>{{ state.value }}</code></pre>
    <p>Context:</p>
    <pre><code>{{ state.context }}</code></pre>
  </div>
</template>

<script>
import calcMachine from "./../calculatorStategraph";
import { useMachine } from "@xstate/vue";

const buttons = [
  "C",
  "CE",
  "/",
  "7",
  "8",
  "9",
  "x",
  "4",
  "5",
  "6",
  "-",
  "1",
  "2",
  "3",
  "+",
  "0",
  ".",
  "=",
  "%"
];

function isOperator(text) {
  return "+-x/".indexOf(text) > -1;
}

export default {
  name: "Calculator",
  setup() {
    const { state, send: machineSend } = useMachine(calcMachine, {});

    function send(event, payload) {
      console.log(event, payload);
      console.log(machineSend(event, payload));
    }

    function handleButtonClick(item) {
      console.log("handleButtonClick", item);
      if (Number.isInteger(+item)) {
        send("NUMBER", { key: +item });
      } else if (isOperator(item)) {
        send("OPERATOR", { operator: item });
      } else if (item === "C") {
        send("CLEAR");
      } else if (item === ".") {
        send("DECIMAL_POINT");
      } else if (item === "%") {
        send("PERCENTAGE");
      } else if (item === "CE") {
        send("CLEAR_EVERYTHING");
      } else {
        send("EQUALS");
      }
    }

    return {
      state,
      send,
      buttons,
      handleButtonClick
    };
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.container {
  max-width: 300px;
  margin: 0 auto;
  border: 2px solid gray;
  border-radius: 4px;
  box-sizing: border-box;
}

.readout {
  font-size: 32px;
  color: #333;
  text-align: right;
  padding: 5px 13px;
  width: 100%;
  border: none;
  border-bottom: 1px solid gray;
  box-sizing: border-box;
}

.button-grid {
  display: grid;
  padding: 20px;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 15px;
}

.calc-button {
  padding: 10px;
  font-size: 22px;
  color: #eee;
  background: rgba(0, 0, 0, 0.5);
  cursor: pointer;
  border-radius: 2px;
  border: 0;
  outline: none;
  opacity: 0.8;
  transition: opacity 0.2s ease-in-out;
}

.calc-button:hover {
  opacity: 1;
}

.calc-button:active {
  background: #999;
  box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.6);
}

.two-span {
  grid-column: span 2;
  background-color: #3572db;
}

p,
pre,
code {
  text-align: left;
}
</style>
