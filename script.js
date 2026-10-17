
const expressionDisplay = document.getElementById("expression");
const resultDisplay = document.getElementById("result");
const buttons = document.querySelector(".buttons");

let expression = "";
let justCalculated = false;

function formatNumber(number) {
  if (!Number.isFinite(number)) {
    throw new Error("Invalid calculation");
  }

  return String(Number(number.toPrecision(12)));
}

function evaluateExpression(value) {
  const cleaned = value.replace(/\s/g, "");

  // Only allow calculator characters, not arbitrary JavaScript.
  if (!cleaned || !/^[0-9+\-*/.()]+$/.test(cleaned)) {
    throw new Error("Invalid expression");
  }

  // Do not evaluate an unfinished expression.
  if (/[+\-*/.]$/.test(cleaned)) {
    throw new Error("Incomplete expression");
  }

  // Evaluate only after validating the allowed characters.
  const answer = Function('"use strict"; return (' + cleaned + ')')();

  if (typeof answer !== "number" || !Number.isFinite(answer)) {
    throw new Error("Invalid result");
  }

  return answer;
}

function updateDisplay() {
  expressionDisplay.textContent = expression || "Ready to calculate";

  if (!expression) {
    resultDisplay.textContent = "0";
    return;
  }

  try {
    const answer = evaluateExpression(expression);
    resultDisplay.textContent = formatNumber(answer);
  } catch {
    resultDisplay.textContent = "…";
  }
}

function addValue(value) {
  const isOperator = ["+", "-", "*", "/"].includes(value);

  if (justCalculated && !isOperator) {
    expression = "";
  }

  justCalculated = false;

  if (isOperator) {
    if (!expression) {
      if (value !== "-") return;
    } else if (/[+\-*/]$/.test(expression)) {
      // Allow a minus sign after another operator, e.g. 5 * -2.
      if (value === "-" && !expression.endsWith("-")) {
        expression += value;
        updateDisplay();
        return;
      }

      expression = expression.slice(0, -1);
    }
  }

  if (value === ".") {
    const currentNumber = expression.split(/[+\-*/]/).pop();

    if (currentNumber.includes(".")) return;

    if (!currentNumber) {
      expression += "0";
    }
  }

  expression += value;
  updateDisplay();
}

function calculate() {
  try {
    const answer = evaluateExpression(expression);
    expression = formatNumber(answer);
    expressionDisplay.textContent = "Result";
    resultDisplay.textContent = expression;
    justCalculated = true;
  } catch {
    resultDisplay.textContent = "Invalid input";
    justCalculated = false;
  }
}

function clearCalculator() {
  expression = "";
  justCalculated = false;
  updateDisplay();
}

function deleteLast() {
  if (justCalculated) {
    clearCalculator();
    return;
  }

  expression = expression.slice(0, -1);
  updateDisplay();
}

function applyPercent() {
  if (!expression || justCalculated) {
    if (justCalculated) {
      expression = String(Number(expression) / 100);
      justCalculated = false;
      updateDisplay();
    }
    return;
  }

  const match = expression.match(/(\d*\.?\d+)$/);

  if (match) {
    const number = Number(match[0]) / 100;
    expression =
      expression.slice(0, -match[0].length) + formatNumber(number);
    updateDisplay();
  }
}

function toggleSign() {
  if (!expression) {
    expression = "-";
    updateDisplay();
    return;
  }

  const match = expression.match(/(\d*\.?\d+)$/);

  if (match) {
    const start = expression.slice(0, -match[0].length);
    const previousChar = start.slice(-1);

    if (previousChar === "-" &&
        (start.length === 1 || /[+*/]/.test(start.slice(-2, -1)))) {
      expression = start.slice(0, -1) + match[0];
    } else {
      expression = start + "(-" + match[0] + ")";
    }

    justCalculated = false;
    updateDisplay();
  }
}

buttons.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.value !== undefined) {
    addValue(button.dataset.value);
    return;
  }

  switch (button.dataset.action) {
    case "clear":
      clearCalculator();
      break;
    case "delete":
      deleteLast();
      break;
    case "calculate":
      calculate();
      break;
    case "percent":
      applyPercent();
      break;
    case "sign":
      toggleSign();
      break;
  }
});

// Keyboard support
document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/^[0-9.]$/.test(key)) {
    addValue(key);
  } else if (["+", "-", "*", "/"].includes(key)) {
    addValue(key);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculate();
  } else if (key === "Backspace") {
    deleteLast();
  } else if (key === "Escape" || key === "Delete") {
    clearCalculator();
  } else if (key === "%") {
    applyPercent();
  }
});
