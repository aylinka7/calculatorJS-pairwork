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

    for (const token of tokens) {
        if (!isNaN(token)) {
            output.push(token);
        } else if (isOperator(token)) {
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
