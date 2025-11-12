const ops = {
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "*": (a, b) => a * b,
    "/": (a, b) => {
        if (b === 0) throw new Error("Division by zero");
        return a / b;
    }
};

const precedence = {
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2,
    "^": 4,
    "%": 3,
    "√": 5
};

function isOperator(ch) {
    return ["+", "-", "*", "/", "^", "%", "√"].includes(ch);
}

function expandPercents(expr) {
    if (!expr) return expr;
    expr = expr.replace(/\s+/g, "");
    expr = expr.replace(/(\d+(\.\d+)?)([+\-*/^])(\d+(\.\d+)?)%/g, (m, a, _, op, b) => {
        return `${a}${op}(${a}*${b}/100)`;
    });
    expr = expr.replace(/(\d+(\.\d+)?)%/g, (m, num) => `(${num}/100)`);
    return expr;
}

function convert(tokens) {
    const output = [];
    const stack = [];
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (!isNaN(token)) output.push(token);
        else if (token === "√") stack.push(token);
        else if (token === "-" && (i === 0 || tokens[i - 1] === "(" || isOperator(tokens[i - 1]))) {
            const next = tokens[i + 1];
            if (!isNaN(next)) {
                output.push((-parseFloat(next)).toString());
                i++;
            } else if (next === "(") {
                output.push("0");
                stack.push("-");
            }
        }
        else if (isOperator(token)) {
            while (stack.length && isOperator(stack.at(-1)) && precedence[stack.at(-1)] >= precedence[token])
                output.push(stack.pop());
            stack.push(token);
        }
        else if (token === "(") stack.push(token);
        else if (token === ")") {
            while (stack.length && stack.at(-1) !== "(") output.push(stack.pop());
            stack.pop();
            if (stack.length && stack.at(-1) === "√") output.push(stack.pop());
        }
    }
    while (stack.length) output.push(stack.pop());
    return output;
}

function evaluateRPN(rpn) {
    const stack = [];
    for (let i = 0; i < rpn.length; i++) {
        const token = rpn[i];
        if (!isNaN(token)) { stack.push(parseFloat(token)); continue; }
        if (token === "√") { 
            const a = stack.pop(); 
            if (a < 0) throw new Error("Square root of negative");
            stack.push(Math.sqrt(a)); 
            continue; 
        }
        const b = stack.pop();
        const a = stack.pop();

        try {
            switch (token) {
                case "+": stack.push(a + b); break;
                case "-": stack.push(a - b); break;
                case "*": stack.push(a * b); break;
                case "/": 
                    if (b === 0) throw new Error("Division by zero");
                    stack.push(a / b); 
                    break;
                case "^": stack.push(Math.pow(a, b)); break;
                case "%": 
                    if (a !== undefined && b !== undefined) stack.push(a * (b / 100)); 
                    else if (b !== undefined) stack.push(b / 100); 
                    else throw new Error("Invalid %");
                    break;
                default: throw new Error("Unknown operator");
            }
        } catch (e) {
            if (e.message === "Division by zero") {
                throw new Error("Can't divide by zero");  // Friendly message
            }
            throw e;
        }
    }
    return stack[0];
}

// =============================================
// Number formatting with commas
// =============================================
function formatNumber(num) {
    if (Number.isInteger(num)) {
        return num.toLocaleString('en-US');
    }
    const [int, dec] = num.toString().split('.');
    const intFormatted = parseInt(int, 10).toLocaleString('en-US');
    return dec ? `${intFormatted}.${dec}` : intFormatted;
}

// Replace commas when parsing (for calculation)
function removeCommas(str) {
    return str.replace(/,/g, '');
}

// Format expression: keep commas in numbers, leave operators alone
function formatExpression(expr) {
    return expr.replace(/-?\d{4,}(?:\.\d+)?/g, match => {
        const num = parseFloat(removeCommas(match));
        return formatNumber(num);
    });
}

// =============================================
// State
// =============================================
const display = document.getElementById("display");
let expression = "";        // raw input (no commas)
let displayExpr = "0";      // what user sees (with commas)
let isHistoryVisible = false;

// =============================================
// Update Display
// =============================================
function updateDisplay() {
    display.textContent = displayExpr;
}

// =============================================
// Toggle History
// =============================================
function toggleHistory() {
    const historyDiv = document.getElementById("history");
    const histBtn = document.querySelector(".hist");
    isHistoryVisible = !isHistoryVisible;
    historyDiv.style.display = isHistoryVisible ? 'block' : 'none';
    histBtn.textContent = isHistoryVisible ? 'Hide' : 'History';
    if (isHistoryVisible) {
        historyDiv.scrollTop = historyDiv.scrollHeight;
    }
}

// =============================================
// Button Handlers
// =============================================
document.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
        if (btn.classList.contains('hist')) {
            toggleHistory();
            return;
        }
        let val = btn.textContent;
        if (val === "×") val = "*";
        if (val === "−") val = "-";
        if (val === "AC") { 
            expression = ""; 
            displayExpr = "0"; 
            updateDisplay(); 
            return; 
        }
        if (val === "Backspace") { 
            expression = expression.slice(0, -1); 
            displayExpr = expression ? formatExpression(expression) : "0";
            updateDisplay(); 
            return; 
        }
        if (val === "=") { 
            evaluateAndShow(); 
            return; 
        }
        if (val === "±") {
            const match = expression.match(/(\(*-?\d+(\.\d+)?\)*)$/);
            if (match) {
                const num = match[0];
                if (num.startsWith("-")) {
                    expression = expression.slice(0, -num.length) + num.replace(/^-/, "");
                } else {
                    expression = expression.slice(0, -num.length) + "-" + num;
                }
                displayExpr = formatExpression(expression);
                updateDisplay();
            }
            return;
        }

        // Append raw value
        expression += val;
        displayExpr = formatExpression(expression);
        updateDisplay();
    });
});

// =============================================
// Evaluate & Show Result
// =============================================
function evaluateAndShow() {
    try {
        // Insert implicit multiplication
        let preExpr = expression
            .replace(/(\d|\))√/g, "$1*√")
            .replace(/(\d|\))\(/g, "$1*(");

        const pre = expandPercents(preExpr);
        const tokens = pre.match(/\d+(\.\d+)?|√|[+\-*/^%()]/g);
        if (!tokens) throw new Error("Invalid expression");

        const rpn = convert(tokens);
        const result = evaluateRPN(rpn);

        if (!isFinite(result)) throw new Error("Invalid result");

        const formattedResult = formatNumber(result);
        display.textContent = formattedResult;

        // History: show original (with commas) = result
        const historyDiv = document.getElementById("history");
        const entry = document.createElement("p");
        entry.textContent = `${displayExpr} = ${formattedResult}`;
        historyDiv.appendChild(entry);

        while (historyDiv.children.length > 10) {
            historyDiv.removeChild(historyDiv.firstChild);
        }

        // Reset for next calc
        expression = result.toString();
        displayExpr = formattedResult;
    } catch (err) {
        if (err.message === "Can't divide by zero") {
            display.textContent = "Can’t divide by zero";
        } else {
            display.textContent = "Error";
        }
        expression = "";
        displayExpr = "0";
        console.error(err.message);
    }
}

// =============================================
// Keyboard Support
// =============================================
document.addEventListener("keydown", (e) => {
    const key = e.key;
    if (/^[0-9]$/.test(key)) { 
        expression += key; 
        displayExpr = formatExpression(expression);
        updateDisplay(); 
        return; 
    }
    if (["+", "-", "*", "/", "(", ")", "^", ".", "%"].includes(key)) { 
        expression += key; 
        displayExpr = formatExpression(expression);
        updateDisplay(); 
        return; 
    }
    if (key === "Enter" || key === "=") { evaluateAndShow(); return; }
    if (key === "Backspace") { 
        expression = expression.slice(0, -1); 
        displayExpr = expression ? formatExpression(expression) : "0";
        updateDisplay(); 
        return; 
    }
    if (key.toLowerCase() === "c") { expression = ""; displayExpr = "0"; updateDisplay(); return; }
    if (key === "r") { expression += "√"; displayExpr = formatExpression(expression); updateDisplay(); return; }
    if (key === "m") {
        const match = expression.match(/(\(*-?\d+(\.\d+)?\)*)$/);
        if (match) {
            const num = match[0];
            if (num.startsWith("-")) {
                expression = expression.slice(0, -num.length) + num.replace(/^-/, "");
            } else {
                expression = expression.slice(0, -num.length) + "-" + num;
            }
            displayExpr = formatExpression(expression);
            updateDisplay();
        }
        return;
    }
    if (key === "h") { toggleHistory(); }
});