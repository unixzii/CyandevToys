/**
 * expr> 9*(2+3)/3
 * 15
 */

class Scanner {
    constructor(expr) {
        this._expr = expr;
        this._ptr = -1;
    }

    current() {
        return this._expr[this._ptr];
    }

    next() {
        if (this._ptr + 1 < this._expr.length) {
            this._ptr += 1;
            return true;
        } else {
            return false;
        }
    }

    prev() {
        if (this._ptr - 1 >= 0) {
            this._ptr -= 1;
            return true;
        } else {
            return false;
        }
    }
}

const TOKEN_NUMBER = 0;
const TOKEN_OPERATOR = 1;
const TOKEN_BRACKET_BEGIN = 2;
const TOKEN_BRACKET_END = 3;
const TOKEN_DOT = 4;
const TOKEN_UNKNOWN = 5;

const TOKENIZE_STATE_ANY = 0;
const TOKENIZE_STATE_NUMBER = 1;
const TOKENIZE_STATE_FLOAT = 2;
const TOKENIZE_STATE_OPERATOR = 3;

const getElementType = function (c) {
    if (c == null || c == undefined) {
        return TOKEN_UNKNOWN;
    }
    
    if (c.length > 1) {
        const n = Number.parseFloat(c);
        if (n !== NaN) {
            return TOKEN_NUMBER;
        } else {
            return TOKEN_OPERATOR;
        }
    }

    if (c == '(') {
        return TOKEN_BRACKET_BEGIN;
    }

    if (c == ')') {
        return TOKEN_BRACKET_END;
    }

    if (c == '.') {
        return TOKEN_DOT;
    }

    if (['+', '-', '*', '/'].includes(c)) {
        return TOKEN_OPERATOR;
    }

    const ascii = String.prototype.charCodeAt.call(c, 0);
    if (ascii >= 48 && ascii <= 57) {
        return TOKEN_NUMBER;
    }

    return TOKEN_UNKNOWN;
};

const tokenize = function (expr) {
    var currentState = TOKENIZE_STATE_ANY;
    var scanner = new Scanner(expr);

    var tokens = [];
    var cur = "";

    const errResult = function(reason) {
        return {
            err: true,
            reason
        };
    };

    while (scanner.next()) {
        const c = scanner.current();

        if (c == ' ') {
            continue;
        }

        const type = getElementType(c);
        switch (type) {
            case TOKEN_BRACKET_BEGIN:
                if (cur != "") {
                    tokens.push(cur);
                }
                tokens.push('(');
                cur = "";
                currentState = TOKENIZE_STATE_ANY;
                break;
            case TOKEN_BRACKET_END:
                if (cur != "") {
                    tokens.push(cur);
                }
                tokens.push(')');
                cur = "";
                currentState = TOKENIZE_STATE_ANY;
                break;
            case TOKEN_NUMBER:
                if ((currentState == TOKENIZE_STATE_NUMBER) || (currentState == TOKENIZE_STATE_FLOAT)) {
                    cur += c;
                } else {
                    if (cur != "") {
                        tokens.push(cur);
                    }
                    cur = c;
                    currentState = TOKENIZE_STATE_NUMBER;
                }
                break;
            case TOKEN_DOT:
                if (currentState == TOKENIZE_STATE_NUMBER) {
                    cur += c;
                } else if (currentState == TOKENIZE_STATE_FLOAT) {
                    return errResult('Unexcepted token ".".');
                } else {
                    if (cur != "") {
                        tokens.push(cur);
                    }
                    cur = "0."; 
                }

                currentState = TOKENIZE_STATE_FLOAT;
                break;
            case TOKEN_OPERATOR:
                if (currentState != TOKENIZE_STATE_OPERATOR) {
                    if (cur != "") {
                        tokens.push(cur);
                    }

                    currentState = TOKENIZE_STATE_OPERATOR;
                    cur = c;
                } else {
                    cur += c;
                }
                break;
            case TOKEN_UNKNOWN:
                return errResult('Unknown token "' + c + '".');
        }
    }

    if (cur != "") {
        tokens.push(cur);
    }

    return {
        err: false,
        tokens
    };
};


class Parser {
    constructor(tokens) {
        this._tokens = tokens;
        this._ptr = 0;
        this._result = 0;
    }

    parse() {
        var left = null;
        while (this._ptr < this._tokens.length) {
            left = this._parseExpression(left);
        }
        return left;
    }

    _peek() {
        if (this._ptr >= this._tokens.length) {
            return null;
        }
        return this._tokens[this._ptr];
    }

    _peekType() {
        return getElementType(this._peek());
    }

    _next() {
        this._ptr += 1;
    }

    _prev() {
        this._ptr -= 1;
    }

    _errResult(reason) {
        return {
            err: true,
            reason
        };
    }

    _parseFactor() {
        if (this._peekType() == TOKEN_NUMBER) {
            const n = Number.parseFloat(this._peek());
            return n;
        }

        if (this._peekType() != TOKEN_BRACKET_BEGIN) {
            return null;
        }
        this._next();
        
        const exp = this._parseExpression();
        if (exp == null) {
            return null;
        }
        this._next();

        if (this._peekType() != TOKEN_BRACKET_END) {
            return null;
        }
        this._next();

        return exp;
    }

    _parseTerm(i) {
        var factor = this._parseFactor();
        if (factor == null) {
            return null;
        }
        
        while (true) {
            this._next();
            const op = this._peek();
            if (['*', '/'].includes(op)) {
                this._next();
                const operand = this._parseFactor();
                if (operand == null) {
                    return factor;
                }
                
                factor = {
                    op,
                    nodes: [factor, operand]
                };
            } else {
                this._prev();
                return factor;
            }
        }
    }

    _parseExpression(left) {
        const term = left || this._parseTerm(0);
        if (term == null) {
            return null;
        }

        this._next();
        const op = this._peek();
        if (['+', '-'].includes(op)) {
            this._next();
            const operand = this._parseTerm(0);
            if (operand == null) {
                return term;
            }
            
            return {
                op,
                nodes: [term, operand]
            }
        } else {
            return term;
        }
    }
}


const expand = function (root) {
    if (Object.prototype.toString.call(root) == '[object Number]') {
        return root;
    }

    const op = root.op;
    switch (op) {
        case '+':
            return expand(root.nodes[0]) + expand(root.nodes[1]);
        case '-':
            return expand(root.nodes[0]) - expand(root.nodes[1]);
        case '*':
            return expand(root.nodes[0]) * expand(root.nodes[1]);
        case '/':
            return expand(root.nodes[0]) / expand(root.nodes[1]);
    }
}


module.exports = function (expr) {
    const tokenizingResult = tokenize(expr);
    return expand(new Parser(tokenizingResult.tokens).parse());
}