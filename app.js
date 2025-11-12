const ops = {
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "*": (a, b) => a * b,
    "/": (a, b) => b === 0 ? NaN : a / b
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
        if (token === "√") { const a = stack.pop(); stack.push(Math.sqrt(a)); continue; }
        const b = stack.pop();
        const a = stack.pop();
        switch (token) {
            case "+": stack.push(a + b); break;
            case "-": stack.push(a - b); break;
            case "*": stack.push(a * b); break;
            case "/": stack.push(b === 0 ? NaN : a / b); break;
            case "^": stack.push(Math.pow(a, b)); break;
            case "%": if (a !== undefined && b !== undefined) stack.push(a * (b / 100)); else if (b !== undefined) stack.push(b / 100); else stack.push(NaN); break;
            default: stack.push(NaN);
        }
    }
    return stack[0];
}

const display = document.getElementById("display");
let expression = "";
let isHistoryVisible = false;

function updateDisplay() { display.textContent = expression || "0"; }

function toggleHistory() {
    const historyDiv = document.getElementById("history");
    const histBtn = document.querySelector(".hist");
    isHistoryVisible = !isHistoryVisible;
    historyDiv.style.display = isHistoryVisible ? 'block' : 'none';
    histBtn.textContent = isHistoryVisible ? 'Hide' : 'History';
    if (isHistoryVisible && historyDiv.firstChild) {
        historyDiv.scrollTop = historyDiv.scrollHeight;
    }
}

document.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
        if (btn.classList.contains('hist')) {
            toggleHistory();
            return;
        }
        let val = btn.textContent;
        if (val === "×") val = "*";
        if (val === "−") val = "-";
        if (val === "AC") { expression = ""; updateDisplay(); return; }
        if (val === "←") { expression = expression.slice(0, -1); updateDisplay(); return; }
        if (val === "=") { evaluateAndShow(); return; }
        if (val === "±") {
            const match = expression.match(/(\(*-?\d+(\.\d+)?\)*)$/);
            if (match) {
                const num = match[0];
                if (num.startsWith("-")) expression = expression.slice(0, -num.length) + num.replace(/^-/, "");
                else expression = expression.slice(0, -num.length) + "-" + num;
                updateDisplay();
            }
            return;
        }
        expression += val;
        updateDisplay();
    });
});

function evaluateAndShow() {
    try {
        expression = expression.replace(/(\d|\))\(/g, "$1*(");
        const pre = expandPercents(expression);
        const tokens = pre.match(/\d+(\.\d+)?|√|[+\-*/^%()]/g);
        const rpn = convert(tokens);
        const result = evaluateRPN(rpn);
        display.textContent = result;
        const historyDiv = document.getElementById("history");
        const entry = document.createElement("p");
        entry.textContent = `${expression} = ${result}`;
        historyDiv.appendChild(entry);
        while (historyDiv.children.length > 10) {
            historyDiv.removeChild(historyDiv.firstChild);
        }
        expression = result.toString();
    } catch { display.textContent = "Error"; expression = ""; }
}

document.addEventListener("keydown", (e) => {
    const key = e.key;
    if (/^[0-9]$/.test(key)) { expression += key; updateDisplay(); return; }
    if (["+", "-", "*", "/", "(", ")", "^", ".", "%"].includes(key)) { expression += key; updateDisplay(); return; }
    if (key === "Enter" || key === "=") { evaluateAndShow(); return; }
    if (key === "Backspace") { expression = expression.slice(0, -1); updateDisplay(); return; }
    if (key.toLowerCase() === "c") { expression = ""; updateDisplay(); return; }
    if (key === "r") { expression += "√"; updateDisplay(); return; }
    if (key === "m") {
        const match = expression.match(/(\(*-?\d+(\.\d+)?\)*)$/);
        if (match) {
            const num = match[0];
            if (num.startsWith("-")) expression = expression.slice(0, -num.length) + num.replace(/^-/, "");
            else expression = expression.slice(0, -num.length) + "-" + num;
            updateDisplay();
        }
        return;
    }
    if (key === "h") { toggleHistory(); }
});