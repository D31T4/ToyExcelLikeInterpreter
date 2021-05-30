
import { Operators, AdditionOperators, MultiplicationOperators, ComparisonOperators, Keywords, Brackets } from "./Operators";
import { ValueType, Value } from "./Value";
import { Functions } from "./Functions";
import { Lexer } from "./Lexer";

export class Interpreter {
    private tokens: string[] = [];
    private current_position: number = 0;
    public debug: boolean = false;
    private scope: {[key: string]: Value<ValueType>} = {};

    private get current_token(): string {
        return this.tokens[this.current_position] ?? "";
    }

    public constructor(debug: boolean) {
        this.debug = debug;
    }

    /**
     * reset state of parser
     */
    public clear(): void {
        this.scope = {};
        this.current_position = 0;
        this.tokens = [];
    }

    /**
     * evaluate the input expression
     * @param expression input
     * @param scope variables
     * @returns result
     */
    public evaluate(expression: string, scope: {[key: string]: Value<ValueType>} = {}): string {
        this.tokens = Lexer.lex(expression);
        this.scope = scope;
        this.current_position = 0;

        if (this.tokens.length == 0) return "";

        try {
            if (this.debug)
                console.time("interpreter");
            
            let value: string = this.evaluate_comparison().asString();

            if (this.debug)
                console.timeEnd("interpreter");
            else
                this.clear();

            return this.current_token == "" ? value : Value.error("token").asString();
        }
        catch (ex) {
            if (this.debug) {
                console.timeEnd("interpreter");
                console.error(ex);
            }
            else
                this.clear();
            return Value.error("value").asString();
        }
    }

    /**
     * evaluate the input expression in async
     * @param expression input
     * @param scope variables
     * @returns result
     */
    public async evaluateAsync(expression: string, scope: {[key: string]: Value<ValueType>} = {}): Promise<string> {
        return new Promise<string>((resolve) => {
            this.tokens = Lexer.lex(expression);
            this.scope = scope;
            this.current_position = 0;

            if (this.tokens.length == 0) resolve("");

            try {
                if (this.debug)
                    console.time("interpreter");
                
                let value: string = this.evaluate_comparison().asString();

                if (this.debug)
                    console.timeEnd("interpreter");
                else
                    this.clear();

                resolve(this.current_token == "" ? value : Value.error("token").asString());
            }
            catch (ex) {
                if (this.debug) {
                    console.timeEnd("interpreter");
                    console.error(ex);
                }
                else
                    this.clear();
                resolve(Value.error("value").asString());
            }
        });
    }

    private evaluate_comparison(): Value<ValueType> {
        let lhs: Value<ValueType> = this.evaluate_concat();
        if (lhs.type == ValueType.error) return lhs;

        while (ComparisonOperators.includes(this.current_token)) {
            let token: string = this.current_token;
            this.consume(token);

            let rhs: Value<ValueType> = this.evaluate_concat();
            if (rhs.type == ValueType.error) return rhs;

            let value: any;
            switch (token) {
                case Operators.eq:
                    value = lhs.type == rhs.type && lhs.value == rhs.value;
                    break;
                case Operators.ne:
                    value = lhs.type != rhs.type || lhs.value != rhs.value;
                    break;
                case Operators.gt:
                    value = lhs.value > rhs.value;
                    break;
                case Operators.gte:
                    value = lhs.value >= rhs.value;
                    break;
                case Operators.lt:
                    value = lhs.value < rhs.value;
                    break;
                case Operators.lte:
                    value = lhs.value <= rhs.value;
                    break;
            }

            lhs.type = ValueType.boolean;
            lhs.value = value;
        }
        return lhs;
    }

    private evaluate_concat(): Value<ValueType> {
        let lhs: Value<ValueType> = this.evaluate_sum();
        if (lhs.type == ValueType.error) return lhs;

        while (this.current_token == "&") {
            let token: string = this.current_token;
            this.consume(token);

            let rhs: Value<ValueType> = this.evaluate_sum();
            if (rhs.type == ValueType.error) return rhs;

            lhs.type = ValueType.string;
            lhs.value = "".concat(lhs.asString(), rhs.asString());
        }
        return lhs;
    }

    private evaluate_sum(): Value<ValueType> {
        let lhs: Value<ValueType> = this.evaluate_product();
        if (lhs.type == ValueType.error) return lhs;

        while (AdditionOperators.includes(this.current_token)) {
            let token: string = this.current_token;
            this.consume(token);

            let rhs: Value<ValueType> = this.evaluate_product();
            if (rhs.type == ValueType.error) return rhs;

            let value: number;
            switch (token) {
                case Operators.plus:
                    value = lhs.asNumber() + rhs.asNumber();
                    break;
                case Operators.minus:
                    value = lhs.asNumber() - rhs.asNumber();
                    break;
            }

            lhs.type = ValueType.number;
            lhs.value = value;
        }
        return lhs;
    }

    private evaluate_product(): Value<ValueType> {
        let lhs: Value<ValueType> = this.evaluate_power();
        if (lhs.type == ValueType.error) return lhs;

        while (MultiplicationOperators.includes(this.current_token)) {
            let token: string = this.current_token;
            this.consume(token);

            let rhs: Value<ValueType> = this.evaluate_power();
            if (rhs.type == ValueType.error) return rhs;

            let value: number;
            switch (token) {
                case Operators.times:
                    value = lhs.asNumber() * rhs.asNumber();
                    break;
                case Operators.div:
                    if (rhs.asNumber() == 0) return Value.error("div/0");
                    value = lhs.asNumber() / rhs.asNumber();
                    break;
            }

            lhs.type = ValueType.number;
            lhs.value = value;
        }
        return lhs;
    }

    private evaluate_power(): Value<ValueType> {
        let lhs: Value<ValueType> = this.evaluate_factor();
        if (lhs.type == ValueType.error)
            return lhs;

        while (this.current_token == "^") {
            this.consume(this.current_token);

            let rhs: Value<ValueType> = this.evaluate_power();
            if (rhs.type == ValueType.error)
                return rhs;
            
            lhs.type = ValueType.number;
            lhs.value = Math.pow(lhs.asNumber(), rhs.asNumber());
        }
        return lhs;
    }

    private evaluate_factor(): Value<ValueType> {
        switch (this.current_token) {
            case Operators.plus:
            case Operators.minus:
                return this.evaluate_unary();
            case Brackets.left:
                return this.evaluate_bracket();
            case "\"":
                return this.evaluate_string();
            default:
                if ((this.current_token[0] >= "0" && this.current_token[0] <= "9") || this.current_token == ".")
                    return this.evaluate_number();
                if (Keywords.hasOwnProperty(this.current_token.toLowerCase()))
                    return this.evaluate_boolean();
                if (/[a-zA-Z_][a-zA-Z0-9_]*/g.test(this.current_token))
                    return this.evaluate_identifier();
                return Value.error("token");
        }
    }

    private evaluate_bracket(): Value<ValueType> {
        this.consume(Brackets.left);
        let value: Value<ValueType> = this.evaluate_comparison();
        this.consume(Brackets.right);
        return value;
    }

    private evaluate_unary(): Value<ValueType> {
        let token: string = this.current_token;
        if (!AdditionOperators.includes(token))
            return Value.error("token");

        this.consume(token);

        let value: Value<ValueType>;
        if (AdditionOperators.includes(this.current_token))
            value = this.evaluate_unary();
        else
            value = this.evaluate_factor();
        
        if (value.type == ValueType.error) return value;
        if (value.type != ValueType.number) return Value.error("value");

        value.type = ValueType.number;
        if (token == Operators.plus)
            return value;
        else {
            // @ts-ignore
            value.value *= -1;
            return value;
        }
    }

    private evaluate_identifier(): Value<ValueType> {
        let indentifier: string = this.current_token;
        this.consume(indentifier);

        if (this.current_token == Brackets.left) {
            indentifier = indentifier.toUpperCase();
            if (!Functions[indentifier]) {
                return Value.error("name");
            }

            /**function to be called */
            let func = Functions[indentifier];

            this.consume(Brackets.left);

            /**call stack of func */
            let callstack: Value<ValueType>[] = new Array(func.arguments.length);
            /**point to n-th argument of the function */
            let pointer: number = 0;
            /**no. of arguments processed */
            let count: number = 0;

            if (this.current_token != Brackets.right) {
                do {
                    if (count > 0) this.consume(",");
    
                    let arg: Value<ValueType> = this.evaluate_comparison();
                    if (arg.type == ValueType.error && func.arguments[pointer].type != ValueType.all)
                        return arg;

                    if (count < callstack.length)
                        callstack[count] = arg;
                    else
                        callstack.push(arg);
    
                    if (!func.arguments[pointer]?.any)
                        pointer += 1;
                    count += 1;
                } while (this.current_token == ",");
            }

            this.consume(Brackets.right);

            return (count < func.arguments.length) ?
                    Value.error("value") :
                    func.body.apply(null, callstack);
        }
        else {
            return this.scope[indentifier] ?
                    Value.clone(this.scope[indentifier]) :
                    Value.error("name");
        }
    }

    /**
     * evaluate string literal
     * @returns 
     */
    private evaluate_string(): Value<ValueType.string> {
        this.consume("\"", false);
        let str: string = "";
        while (this.current_token != "\"" && this.current_token != "") {
            let token: string = this.current_token;
            str += token;
            this.consume(token, false);
        }
        this.consume("\"");
        return Value.string(str);
    }

    /**
     * evaluate number literal
     * @returns 
     */
    private evaluate_number(): Value<ValueType.number> | Value<ValueType.error> {
        let token: string = this.current_token;
        this.consume(token);

        if (!/(?:^\d*\.?\d+$)|(?:^\d+\.?\d*$)/.test(token))
            return Value.error("num?");
        
        let value: number = Number.parseFloat(token);
        return Value.number(value);
    }

    /**
     * evaluate boolean literal
     * @returns 
     */
    private evaluate_boolean(): Value<ValueType.boolean> | Value<ValueType.error> {
        let token: string = this.current_token;
        this.consume(token);

        token = token.toLowerCase();
        return Keywords.hasOwnProperty(token) ? 
               Value.boolean(token == Keywords.true) :
               Value.error("value");
    }

    /**
     * consume a token and go to next token
     * @param token expected token to be consumed
     * @param skip_space skip whitespace tokens
     * @returns 
     */
    private consume(token: string, skip_space: boolean = true): void {
        if (this.current_token != token) throw Error("unexpected token");
        
        ++this.current_position;
        if (!skip_space) return;

        while (this.current_token == " " && this.current_position < this.tokens.length)
            ++this.current_position;
    }
}
