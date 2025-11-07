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