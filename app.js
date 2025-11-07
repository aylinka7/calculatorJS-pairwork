const ops = {
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "*": (a, b) => a * b,
    "/": (a, b) => b === 0 ? NaN : a / b
};

function createCalculator() {
    return {
        current: "0",
        operand: null,
        operator: null,
        history: [],
        inputDigit(d) { /* ... */ },
        chooseOperator(op) { /* ... */ },
        evaluate() { /* ... */ },
        clear() { this.current = "0"; },
        allClear() { Object.assign(this, createCalculator()); }
    };
}