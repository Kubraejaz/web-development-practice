let expression = "";
let justCalculated = false;

function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}

function multiply(a, b) {
    return a * b;
}

function divide(a, b) {
    if (b === 0) return "Error: Cannot divide by zero!";
    return a / b;
}

function modulus(a, b) {
    if (b === 0) return "Error: Cannot mod by zero!";
    return a % b;
}

function power(a, b) {
    return Math.pow(a, b);
}

function formatNumber(num) {
    if (typeof num === "number" && !isNaN(num)) {
        return parseFloat(num.toPrecision(10));
    }
    return num;
}

function updateDisplay(displayValue) {
    var resultEl = document.getElementById("result");
    var exprEl = document.getElementById("expression");

    exprEl.textContent = expression;
    resultEl.textContent = displayValue !== undefined ? displayValue : (expression || "0");
    resultEl.classList.remove("error");
}

function appendToExpr(value) {
    if (justCalculated) {
        var currentResult = document.getElementById("result").textContent;
        if (!isNaN(value) || value === ".") {
            expression = value;
        } else {
            expression = currentResult + value;
        }
        justCalculated = false;
    } else {
        expression += value;
    }
    updateDisplay(expression);
}

function appendDecimal() {
    var parts = expression.split(/[\+\-\×\÷\%\^]/);
    var lastPart = parts[parts.length - 1];

    if (!lastPart.includes(".")) {
        if (lastPart === "" || justCalculated) {
            expression = (justCalculated ? "" : expression) + "0.";
            justCalculated = false;
        } else {
            expression += ".";
        }
        updateDisplay(expression);
    }
}

function clearAll() {
    expression = "";
    justCalculated = false;
    updateDisplay("0");
    document.getElementById("expression").textContent = "";
}

function backspace() {
    if (justCalculated) {
        clearAll();
        return;
    }
    expression = expression.slice(0, -1);
    updateDisplay(expression || "0");
}

function calculate() {
    if (expression === "") return;

    var resultEl = document.getElementById("result");
    var exprEl = document.getElementById("expression");

    try {
        var result = evaluateExpression(expression);

        if (typeof result === "string") {
            showError(result);
        } else {
            var formatted = formatNumber(result);
            exprEl.textContent = expression + " =";
            resultEl.textContent = formatted;
            resultEl.classList.remove("error");

            expression = String(formatted);
            justCalculated = true;
        }
    } catch (e) {
        showError("Invalid Expression!");
    }
}

function evaluateExpression(expr) {
    var jsExpr = expr
        .replace(/÷/g, "/")
        .replace(/×/g, "*")
        .replace(/\^/g, "**");

    var simpleResult = trySimpleOperation(expr);
    if (simpleResult !== null) return simpleResult;

    return Function('"use strict"; return (' + jsExpr + ")")();
}

function trySimpleOperation(expr) {
    var patterns = [
        { regex: /^(-?[\d.]+)\+(-?[\d.]+)$/, fn: (a, b) => add(a, b) },
        { regex: /^(-?[\d.]+)\-(-?[\d.]+)$/, fn: (a, b) => subtract(a, b) },
        { regex: /^(-?[\d.]+)×(-?[\d.]+)$/, fn: (a, b) => multiply(a, b) },
        { regex: /^(-?[\d.]+)÷(-?[\d.]+)$/, fn: (a, b) => divide(a, b) },
        { regex: /^(-?[\d.]+)%(-?[\d.]+)$/, fn: (a, b) => modulus(a, b) },
        { regex: /^(-?[\d.]+)\^(-?[\d.]+)$/, fn: (a, b) => power(a, b) },
    ];

    for (var i = 0; i < patterns.length; i++) {
        var match = expr.match(patterns[i].regex);
        if (match) {
            var a = parseFloat(match[1]);
            var b = parseFloat(match[2]);
            return patterns[i].fn(a, b);
        }
    }

    return null;
}

function showError(message) {
    var resultEl = document.getElementById("result");
    resultEl.textContent = message;
    resultEl.classList.add("error");
    expression = "";
    justCalculated = false;
}

document.addEventListener("keydown", function (event) {
    var key = event.key;

    if (key >= "0" && key <= "9") {
        appendToExpr(key);
    } else if (key === "+") {
        appendToExpr("+");
    } else if (key === "-") {
        appendToExpr("-");
    } else if (key === "*") {
        appendToExpr("×");
    } else if (key === "/") {
        event.preventDefault();
        appendToExpr("÷");
    } else if (key === "%") {
        appendToExpr("%");
    } else if (key === "^") {
        appendToExpr("^");
    } else if (key === ".") {
        appendDecimal();
    } else if (key === "Enter" || key === "=") {
        calculate();
    } else if (key === "Backspace") {
        backspace();
    } else if (key === "Escape") {
        clearAll();
    }
});
