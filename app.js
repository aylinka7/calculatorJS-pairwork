const ops = {
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "*": (a, b) => a * b,
    "/": (a, b) => b === 0 ? "Cannot divide by zero": a / b
};

const precedence = {
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2
};
function isOperator(ch) {
    return ["+", "-", "*", "/"].includes(ch);
}

function convert(tokens) {
    const output = [];
    const stack = [];

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (!isNaN(token)) {
            output.push(token);
        } else if (isOperator(token)) {
            const prev = tokens[i - 1];
            if (
                token === "-" &&
                (i === 0 || (isOperator(prev) || prev === "("))
            ) {
                const next = tokens[i + 1];
                if (!isNaN(next)) {
                    output.push("-" + next);
                    i++;
                    continue;
                }
            }
            while (
                stack.length &&
                isOperator(stack.at(-1)) &&
                precedence[stack.at(-1)] >= precedence[token]
                ) {
                output.push(stack.pop());
            }
            stack.push(token);
        } else if (token === "(") {
            stack.push(token);
        } else if (token === ")") {
            while (stack.length && stack.at(-1) !== "(") {
                output.push(stack.pop());
            }
            stack.pop();
        }
    }
    while (stack.length) output.push(stack.pop());
    return output;
}

function evaluateRPN(rpn) {
    const stack = [];
    for (const token of rpn) {
        if (!isNaN(token)) {
            stack.push(parseFloat(token));
        } else {
            const b = stack.pop();
            const a = stack.pop();
            switch (token) {
                case "+": stack.push(a + b); break;
                case "-": stack.push(a - b); break;
                case "*": stack.push(a * b); break;
                case "/": stack.push(b === 0 ? NaN : a / b); break;
            }
        }
    }
    return stack[0];
}

const display = document.getElementById("display");
let expression = "";

document.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
        const val = btn.textContent;

        if (val === "AC") {
            expression = "";
            display.textContent = "0";
        } else if (val === "=") {
            try {
                const tokens = expression.match(/\d+(\.\d+)?|[+\-*/()]/g);
                const rpn = convert(tokens);
                const result = evaluateRPN(rpn);
                display.textContent = result;
                expression = result.toString();
            } catch {
                display.textContent = "Error";
                expression = "";
            }
        } else {
            expression += val;
            display.textContent = expression;
        }
    });
});

document.addEventListener("keydown", (e) => {
    const key = e.key;

    if (/[\d+\-*/().]/.test(key)) {
        expression += key;
        display.textContent = expression;
    } else if (key === "Enter" || key === "=") {
        try {
            const tokens = expression.match(/\d+(\.\d+)?|[+\-*/()]/g);
            const rpn = convert(tokens);
            const result = evaluateRPN(rpn);
            display.textContent = result;
            expression = result.toString();
        } catch {
            display.textContent = "Error";
            expression = "";
        }
    } else if (key === "Backspace") {
        expression = expression.slice(0, -1);
        display.textContent = expression || "0";
    } else if (key.toLowerCase() === "c") {
        expression = "";
        display.textContent = "0";
    }
});

