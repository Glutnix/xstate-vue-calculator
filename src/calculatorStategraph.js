import { Machine, assign, actions } from "xstate";

const not = fn => (...args) => !fn.apply(null, args);
const isZero = (context, event) => event.key === 0;
const isNotZero = not(isZero);
const isMinus = (context, event) => event.operator === "-";
const isNotMinus = not(isMinus);
const divideByZero = (context, event) =>
  context.operand2 === "0." && context.operator === "/";
const notDivideByZero = not(divideByZero);

function doMath(operand1, operand2, operator) {
  switch (operator) {
    case "+":
      return +operand1 + +operand2;
    case "-":
      return +operand1 - +operand2;
    case "/":
      return +operand1 / +operand2;
    case "x":
      return +operand1 * +operand2;
    default:
      return Infinity;
  }
}

const calcMachine = Machine(
  {
    id: "calcMachine",
    context: {
      display: "0.",
      operand1: null,
      operand2: null,
      operator: null
    },
    // strict: true,
    on: {
      CLEAR_EVERYTHING: {
        target: ".start",
        actions: ["reset"]
      }
    },
    initial: "start",
    states: {
      start: {
        on: {
          NUMBER: [
            {
              cond: "isZero",
              target: "operand1.zero",
              actions: ["defaultReadout"]
            },
            {
              cond: "isNotZero",
              target: "operand1.before_decimal_point",
              actions: ["setReadoutNum"]
            }
          ],
          OPERATOR: {
            cond: "isMinus",
            target: "negative_number",
            actions: ["startNegativeNumber"]
          },
          DECIMAL_POINT: {
            target: "operand1.after_decimal_point",
            actions: ["defaultReadout"]
          }
        }
      },
      operand1: {
        on: {
          OPERATOR: {
            target: "operator_entered",
            actions: ["recordOperator"]
          },
          PERCENTAGE: {
            target: "result",
            actions: ["storeResultAsOperand2", "computePercentage"]
          },
          CLEAR_ENTRY: {
            target: "operand1",
            actions: ["defaultReadout"]
          }
        },
        initial: "zero",
        states: {
          zero: {
            on: {
              NUMBER: {
                target: "before_decimal_point",
                actions: ["setReadoutNum"]
              },
              DECIMAL_POINT: "after_decimal_point"
            }
          },
          before_decimal_point: {
            on: {
              NUMBER: {
                target: "before_decimal_point",
                actions: ["appendNumBeforeDecimal"]
              },
              DECIMAL_POINT: "after_decimal_point"
            }
          },
          after_decimal_point: {
            on: {
              NUMBER: {
                target: "after_decimal_point",
                actions: ["appendNumAfterDecimal"]
              }
            }
          }
        }
      },
      negative_number: {
        on: {
          NUMBER: [
            {
              cond: "isZero",
              target: "operand1.zero",
              actions: ["defaultNegativeReadout"]
            },
            {
              cond: "isNotZero",
              target: "operand1.before_decimal_point",
              actions: ["setNegativeReadoutNum"]
            }
          ],
          DECIMAL_POINT: {
            target: "operand1.after_decimal_point",
            actions: ["defaultNegativeReadout"]
          },
          CLEAR_ENTRY: {
            target: "start",
            actions: ["defaultReadout"]
          }
        }
      },
      operator_entered: {
        on: {
          OPERATOR: [
            {
              cond: "isNotMinus",
              target: "operator_entered",
              actions: ["setOperator"]
            },
            {
              cond: "isMinus",
              target: "negative_number_2",
              actions: ["startNegativeNumber"]
            }
          ],
          NUMBER: [
            {
              target: "operand2.zero",
              actions: ["defaultReadout"],
              cond: "isZero"
            },
            {
              cond: "isNotZero",
              target: "operand2.before_decimal_point",
              actions: ["setReadoutNum"]
            }
          ],
          DECIMAL_POINT: {
            target: "operand2.after_decimal_point",
            actions: ["defaultReadout"]
          }
        }
      },
      operand2: {
        on: {
          OPERATOR: {
            target: "operator_entered",
            actions: [
              "storeResultAsOperand2",
              "compute",
              "storeResultAsOperand1",
              "setOperator"
            ]
          },
          EQUALS: [
            {
              cond: "notDivideByZero",
              target: "result",
              actions: ["storeResultAsOperand2", "compute"]
            },
            { target: "alert", actions: ["divideByZeroAlert"] }
          ],
          CLEAR_ENTRY: {
            target: "operand2",
            actions: ["defaultReadout"]
          }
        },
        initial: "hist",
        states: {
          hist: {
            type: "history",
            target: "zero"
          },
          zero: {
            on: {
              NUMBER: {
                target: "before_decimal_point",
                actions: ["setReadoutNum"]
              },
              DECIMAL_POINT: "after_decimal_point"
            }
          },
          before_decimal_point: {
            on: {
              NUMBER: {
                target: "before_decimal_point",
                actions: ["appendNumBeforeDecimal"]
              },
              DECIMAL_POINT: "after_decimal_point"
            }
          },
          after_decimal_point: {
            on: {
              NUMBER: {
                target: "after_decimal_point",
                actions: ["appendNumAfterDecimal"]
              }
            }
          }
        }
      },
      negative_number_2: {
        on: {
          NUMBER: [
            {
              cond: "isZero",
              target: "operand2.zero",
              actions: ["defaultNegativeReadout"]
            },
            {
              cond: "isNotZero",
              target: "operand2.before_decimal_point",
              actions: ["setNegativeReadoutNum"]
            }
          ],
          DECIMAL_POINT: {
            target: "operand2.after_decimal_point",
            actions: ["defaultNegativeReadout"]
          },
          CLEAR_ENTRY: {
            target: "operator_entered",
            actions: ["defaultReadout"]
          }
        }
      },
      result: {
        on: {
          NUMBER: [
            {
              cond: "isZero",
              target: "operand1",
              actions: ["defaultReadout"]
            },
            {
              cond: "isNotZero",
              target: "operand1.before_decimal_point",
              actions: ["setReadoutNum"]
            }
          ],
          PERCENTAGE: {
            target: "result",
            actions: ["storeResultAsOperand2", "computePercentage"]
          },
          OPERATOR: {
            target: "operator_entered",
            actions: ["storeResultAsOperand1", "recordOperator"]
          },
          CLEAR_ENTRY: {
            target: "start",
            actions: ["defaultReadout"]
          }
        }
      },
      alert: {
        on: {
          OK: "operand2.hist"
        }
      }
    }
  },
  {
    guards: {
      isMinus,
      isNotMinus,
      isZero,
      isNotZero,
      notDivideByZero
    },
    actions: {
      defaultReadout: assign({
        display: () => "0."
      }),

      defaultNegativeReadout: assign({
        display: () => "-0."
      }),

      appendNumBeforeDecimal: assign({
        display: (context, event) =>
          context.display.slice(0, -1) + event.key + "."
      }),

      appendNumAfterDecimal: assign({
        display: (context, event) => context.display + event.key
      }),

      setReadoutNum: assign({
        display: (context, event) => event.key + "."
      }),

      setNegativeReadoutNum: assign({
        display: (context, event) => "-" + event.key + "."
      }),

      startNegativeNumber: assign({
        display: () => "-"
      }),

      recordOperator: assign({
        operand1: context => context.display,
        operator: (_, event) => event.operator
      }),

      setOperator: assign({
        operator: ({ operator }) => operator
      }),

      computePercentage: assign({
        display: context => context.display / 100
      }),

      compute: assign({
        display: ({ operand1, operand2, operator }) => {
          const result = doMath(operand1, operand2, operator);
          console.log(
            `doing calculation ${operand1} ${operator} ${operand2} = ${result}`
          );
          return result;
        }
      }),

      storeResultAsOperand1: assign({
        operand1: context => context.display
      }),

      storeResultAsOperand2: assign({
        operand2: context => context.display
      }),

      divideByZeroAlert() {
        // have to put the alert in setTimeout because action is executed on event, before the transition to next state happens
        // this alert is supposed to happend on transition
        // setTimeout allows time for other state transition (to 'alert' state) to happen before showing the alert
        // probably a better way to do it. like entry or exit actions
        setTimeout(() => {
          alert("Cannot divide by zero!");
          this.transition("OK");
        }, 0);
      },

      reset: assign({
        display: () => "0.",
        operand1: () => null,
        operand2: () => null,
        operator: () => null
      })
    }
  }
);

export default calcMachine;
