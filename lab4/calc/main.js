

function priority(operation) {
    if (operation == '+' || operation == '-') {
        return 1;
    } else {
        return 2;
    }
}

// Проверка, является ли строка str числом.
function isNumeric(str) {
    return /^\d+(.\d+){0,1}$/.test(str);
}

// Проверка, является ли строка str цифрой.
function isDigit(str) {
    return /^\d{1}$/.test(str);
}

// Проверка, является ли строка str оператором.
function isOperation(str) {
    return /^[\+\-\*\/]{1}$/.test(str);
}

function tokenize(str) {
    let tokens = [];
    let lastNumber = '';
    for (char of str) {
        if (isDigit(char) || char == '.') {
            lastNumber += char;
        } else {
            if (lastNumber.length > 0) {
                tokens.push(lastNumber);
                lastNumber = '';
            }
        }
        if (isOperation(char) || char == '(' || char == ')') {
            tokens.push(char);
        }
    }
    if (lastNumber.length > 0) {
        tokens.push(lastNumber);
    }
    return tokens;
}
function compile(str) {
    let out = [];
    let stack = [];
    for (token of tokenize(str)) {
        if (isNumeric(token)) {
            out.push(token);
        } else if (isOperation(token)) {
            while (stack.length > 0 && isOperation(stack[stack.length - 1]) && priority(stack[stack.length - 1]) >= priority(token)) {
                out.push(stack.pop());
            }
            stack.push(token);
        } else if (token == '(') {
            stack.push(token);
        } else if (token == ')') {
            while (stack.length > 0 && stack[stack.length - 1] != '(') {
                out.push(stack.pop());
            }
            stack.pop();
        }
    }
    while (stack.length > 0) {
        out.push(stack.pop());
    }
    return out.join(' ');
}

function evaluate(str) {

    let strings = compile(str).split(' ');
    let res = [];
    for (char of strings) {
        if (isDigit(char) || isNumeric(char)) {
            res.push(parseFloat(char));
        } else {
            let num1 = res.pop();
            let num2 = res.pop();
            if (char == '+') {
                res.push(num1 + num2).toFixed(2);
            } else if (char == '-') {
                res.push(num2 - num1).toFixed(2);
            } else if (char == '*') {
                res.push(num1 * num2).toFixed(2);
            } else if (char == '/') {
                res.push(num2 / num1).toFixed(2);
            }
        }
    }
    return res.pop().toFixed(2);
}



function clickHandler(event) {
    if ((event.target.className == "digits") ||
        (event.target.className == "other")) return;

    let mes = document.querySelector(".mes");

    if (event.target.className == "key clear") {
        mes.innerHTML = null;
    } else if (event.target.className == "key result") {
        mes.innerHTML = evaluate(mes.innerHTML);
    } else {
        mes.innerHTML += event.target.innerHTML;
    }
}

// Назначьте нужные обработчики событий.
window.onload = function () {
    let buttons = document.querySelector(".buttons");
    buttons.onclick = clickHandler;
};