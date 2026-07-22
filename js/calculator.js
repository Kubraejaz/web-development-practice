/* ================================================ */
/*   Nimbus Calculator – calculator.js              */
/*   Linked from: calculator.html                  */
/* ================================================ */

/* -------------------------------------------------------
   STATE VARIABLES
   These store what the user has typed so far.
------------------------------------------------------- */
let expression = "";        // The full expression string shown on display
let justCalculated = false; // Track if we just pressed '='


/* -------------------------------------------------------
   FUNCTION 1: add(a, b)
   Takes two numbers and returns their SUM.
   Example: add(5, 3) → 8
------------------------------------------------------- */
function add(a, b) {
    return a + b;
}


/* -------------------------------------------------------
   FUNCTION 2: subtract(a, b)
   Takes two numbers and returns the DIFFERENCE.
   Example: subtract(10, 4) → 6
------------------------------------------------------- */
function subtract(a, b) {
    return a - b;
}


/* -------------------------------------------------------
   FUNCTION 3: multiply(a, b)
   Takes two numbers and returns their PRODUCT.
   Example: multiply(6, 7) → 42
------------------------------------------------------- */
function multiply(a, b) {
    return a * b;
}


/* -------------------------------------------------------
   FUNCTION 4: divide(a, b)
   Takes two numbers and returns the QUOTIENT.
   Special case: Returns an error if b is 0 (can't divide by zero!)
   Example: divide(20, 4) → 5
------------------------------------------------------- */
function divide(a, b) {
    if (b === 0) {
        return "Error: Cannot divide by zero!";
    }
    return a / b;
}


/* -------------------------------------------------------
   FUNCTION 5: modulus(a, b)
   Returns the REMAINDER after dividing a by b.
   Example: modulus(10, 3) → 1  (because 10 ÷ 3 = 3 remainder 1)
------------------------------------------------------- */
function modulus(a, b) {
    if (b === 0) {
        return "Error: Cannot mod by zero!";
    }
    return a % b;
}



/* -------------------------------------------------------
   FUNCTION 8: formatNumber(num)
   Formats a number to avoid too many decimal places.
   Example: 3.3333333333333 → 3.33333333
------------------------------------------------------- */
function formatNumber(num) {
    // If the number has more than 10 decimal digits, round it
    if (typeof num === 'number' && !isNaN(num)) {
        return parseFloat(num.toPrecision(10));
    }
    return num;
}


/* -------------------------------------------------------
   FUNCTION 9: updateDisplay(displayValue)
   Updates what is shown on the calculator screen.
   Takes no input — reads from global 'expression' variable.
------------------------------------------------------- */
function updateDisplay(displayValue) {
    var resultEl = document.getElementById('result');
    var exprEl   = document.getElementById('expression');

    exprEl.textContent   = expression;
    resultEl.textContent = displayValue !== undefined ? displayValue : (expression || '0');
    resultEl.classList.remove('error');
}


/* -------------------------------------------------------
   FUNCTION 10: appendToExpr(value)
   Adds a character (digit or operator) to the expression.
   Input: value — the character to add (e.g. '5', '+', '×')
------------------------------------------------------- */
function appendToExpr(value) {
    // If we just finished a calculation and user presses a number,
    // start fresh. If they press an operator, continue with result.
    if (justCalculated) {
        var currentResult = document.getElementById('result').textContent;
        if (!isNaN(value) || value === '.') {
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


/* -------------------------------------------------------
   FUNCTION 11: appendDecimal()
   Adds a decimal point, but only if the current number
   doesn't already have one.
------------------------------------------------------- */
function appendDecimal() {
    // Find the last number segment in the expression
    var parts    = expression.split(/[\+\-\×\÷\%\^]/);
    var lastPart = parts[parts.length - 1];

    // Only add '.' if the current number doesn't already have one
    if (!lastPart.includes('.')) {
        if (lastPart === '' || justCalculated) {
            expression     = (justCalculated ? '' : expression) + '0.';
            justCalculated = false;
        } else {
            expression += '.';
        }
        updateDisplay(expression);
    }
}


/* -------------------------------------------------------
   FUNCTION 12: clearAll()
   Resets the calculator — clears everything.
------------------------------------------------------- */
function clearAll() {
    expression     = "";
    justCalculated = false;
    updateDisplay('0');
    document.getElementById('expression').textContent = '';
}


/* -------------------------------------------------------
   FUNCTION 13: backspace()
   Removes the LAST character the user typed.
------------------------------------------------------- */
function backspace() {
    if (justCalculated) {
        clearAll();
        return;
    }
    expression = expression.slice(0, -1);
    updateDisplay(expression || '0');
}


/* -------------------------------------------------------
   FUNCTION 14: toggleSign()
   Flips the sign of the current number (positive ↔ negative).
   Example: 5 → -5 → 5
------------------------------------------------------- */
function toggleSign() {
    if (expression === "" || expression === "0") return;

    // If expression starts with '-', remove it; otherwise add '-'
    if (expression.startsWith('-')) {
        expression = expression.slice(1);
    } else {
        expression = '-' + expression;
    }
    updateDisplay(expression);
}


/* -------------------------------------------------------
   FUNCTION 15: calculateSqrt()
   Calculates the square root of the current displayed number.
------------------------------------------------------- */
function calculateSqrt() {
    if (expression === "") return;

    var num    = parseFloat(expression);
    var result = squareRoot(num);   // Uses our squareRoot() function!

    addToHistory("√(" + expression + ")", result);

    if (typeof result === 'string') {
        // It's an error message
        showError(result);
    } else {
        var formatted = formatNumber(result);
        document.getElementById('expression').textContent = "√(" + expression + ")";
        document.getElementById('result').textContent    = formatted;
        expression     = String(formatted);
        justCalculated = true;
    }
}


/* -------------------------------------------------------
   FUNCTION 16: calculate()
   The MAIN calculation function — called when '=' is pressed.
   It reads the expression, figures out which operation to use,
   calls the correct function (add, subtract, etc.), and shows result.
------------------------------------------------------- */
function calculate() {
    if (expression === "") return;

    var resultEl = document.getElementById('result');
    var exprEl   = document.getElementById('expression');

    try {
        // Replace display symbols with JavaScript operators
        // Then use our named functions to compute the result
        var result = evaluateExpression(expression);

        if (typeof result === 'string') {
            // It's an error message from divide() or modulus()
            addToHistory(expression, "Error");
            showError(result);
        } else {
            var formatted = formatNumber(result);
            addToHistory(expression, formatted);

            exprEl.textContent   = expression + " =";
            resultEl.textContent = formatted;
            resultEl.classList.remove('error');

            expression     = String(formatted);
            justCalculated = true;
        }

    } catch (e) {
        showError("Invalid Expression!");
    }
}


/* -------------------------------------------------------
   FUNCTION 17: evaluateExpression(expr)
   Parses the expression string and calls the right function.
   This is the "brain" that reads what the user typed.
   Input:  expression string like "12 + 5 × 3"
   Output: the numeric result
------------------------------------------------------- */
function evaluateExpression(expr) {
    // Replace our display symbols with standard JS math symbols
    // ÷ → /    × → *    ^ → **
    var jsExpr = expr
        .replace(/÷/g, '/')
        .replace(/×/g, '*')
        .replace(/\^/g, '**');

    // Check for simple two-operand cases to use our named functions
    // This demonstrates functions clearly for the teacher!
    var simpleResult = trySimpleOperation(expr);
    if (simpleResult !== null) {
        return simpleResult;
    }

    // For complex multi-step expressions, evaluate safely
    var result = Function('"use strict"; return (' + jsExpr + ')')();
    return result;
}


/* -------------------------------------------------------
   FUNCTION 18: trySimpleOperation(expr)
   For simple "number operator number" expressions,
   this calls our named functions directly.
   Example: "5 + 3"  → calls add(5, 3) → 8
------------------------------------------------------- */
function trySimpleOperation(expr) {
    // Patterns: find a number, an operator, then another number
    var patterns = [
        { regex: /^(-?[\d.]+)\+(-?[\d.]+)$/, fn: (a, b) => add(a, b)      },
        { regex: /^(-?[\d.]+)\-(-?[\d.]+)$/, fn: (a, b) => subtract(a, b) },
        { regex: /^(-?[\d.]+)×(-?[\d.]+)$/,  fn: (a, b) => multiply(a, b) },
        { regex: /^(-?[\d.]+)÷(-?[\d.]+)$/,  fn: (a, b) => divide(a, b)   },
        { regex: /^(-?[\d.]+)%(-?[\d.]+)$/,  fn: (a, b) => modulus(a, b)  },
        { regex: /^(-?[\d.]+)\^(-?[\d.]+)$/, fn: (a, b) => power(a, b)    },
    ];

    for (var i = 0; i < patterns.length; i++) {
        var match = expr.match(patterns[i].regex);
        if (match) {
            var a = parseFloat(match[1]);
            var b = parseFloat(match[2]);
            return patterns[i].fn(a, b);
        }
    }

    return null; // Not a simple operation
}


/* -------------------------------------------------------
   FUNCTION 19: showError(message)
   Displays an error message on the calculator screen.
   Input: message — the error text to show
------------------------------------------------------- */
function showError(message) {
    var resultEl = document.getElementById('result');
    resultEl.textContent = message;
    resultEl.classList.add('error');
    expression     = "";
    justCalculated = false;
}





/* -------------------------------------------------------
   KEYBOARD SUPPORT
   Listens for keyboard input so user can type numbers too.
------------------------------------------------------- */
document.addEventListener('keydown', function (event) {
    var key = event.key;

    if (key >= '0' && key <= '9') {
        appendToExpr(key);
    } else if (key === '+') {
        appendToExpr('+');
    } else if (key === '-') {
        appendToExpr('-');
    } else if (key === '*') {
        appendToExpr('×');
    } else if (key === '/') {
        event.preventDefault();
        appendToExpr('÷');
    } else if (key === '%') {
        appendToExpr('%');
    } else if (key === '^') {
        appendToExpr('^');
    } else if (key === '.') {
        appendDecimal();
    } else if (key === 'Enter' || key === '=') {
        calculate();
    } else if (key === 'Backspace') {
        backspace();
    } else if (key === 'Escape') {
        clearAll();
    }
});
