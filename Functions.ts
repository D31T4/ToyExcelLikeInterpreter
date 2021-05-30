
import { Value, ValueType } from "./Value";

interface FunctionNode {
    arguments: {name: string, type: ValueType, any?: boolean}[],
    body: (...args: Value<ValueType>[]) => Value<ValueType>,
    return: ValueType
}

export const Functions: Readonly<{[key: string]: FunctionNode}> = {
    MAX: {
        arguments: [
            {
                name: "value",
                type: ValueType.number,
                any: true
            }
        ],
        body: (...args: Value<ValueType>[]) => {
            let _args: number[] = args.map(arg => arg.asNumber());
            return Value.number(Math.max.apply(null, _args));
        },
        return: ValueType.number
    },
    MIN: {
        arguments: [
            {
                name: "value",
                type: ValueType.number,
                any: true
            }
        ],
        body: (...args: Value<ValueType>[]) => {
            let _args: number[] = args.map(arg => arg.asNumber());
            return Value.number(Math.min.apply(null, _args));
        },
        return: ValueType.number
    },
    CONCAT: {
        arguments: [
            {
                name: "value",
                type: ValueType.string,
                any: true
            }
        ],
        body: (...args) => {
            let _args: string[] = args.map(arg => arg.toString().value);
            return Value.string(_args.join(""));
        },
        return: ValueType.string
    },
    SUM: {
        arguments: [
            {
                name: "value",
                type: ValueType.number,
                any: true
            }
        ],
        body: (...args) => {
            let _args: number[] = args.map(arg => arg.asNumber());
            return Value.number(_args.reduce((sum, val) => sum + val, 0));
        },
        return: ValueType.number
    },
    PROD: {
        arguments: [
            {
                name: "value",
                type: ValueType.number,
                any: true
            }
        ],
        body: (...args) => {
            let _args: number[] = args.map(arg => arg.asNumber());
            return Value.number(_args.reduce((sum, val) => sum * val, 1));
        },
        return: ValueType.number
    },
    AND: {
        arguments: [
            {
                name: "value",
                type: ValueType.boolean,
                any: true
            }
        ],
        body: (...args) => {
            let and = true;
            for (let i = 0; i < args.length; ++i) {
                if (!and) return Value.boolean(false);

                and = and && args[i].asBoolean();
            }
            return Value.boolean(and);
        },
        return: ValueType.boolean
    },
    OR: {
        arguments: [
            {
                name: "value",
                type: ValueType.boolean,
                any: true
            }
        ],
        body: (...args) => {
            let or = false;
            for (let i = 0; i < args.length; ++i) {
                if (or) return Value.boolean(true);

                or = or || args[i].asBoolean();
            }
            return Value.boolean(or);
        },
        return: ValueType.boolean
    },
    NOT: {
        arguments: [
            {
                name: "value",
                type: ValueType.boolean
            }
        ],
        body: (arg) => {
            return new Value(ValueType.boolean, !arg.asBoolean());
        },
        return: ValueType.boolean
    },
    PI: {
        arguments: [],
        body: () => Value.number(Math.PI),
        return: ValueType.number
    },
    VALUE: {
        arguments: [
            {
                name: "value",
                type: ValueType.string
            }
        ],
        body: (arg) => {
            if (arg.type == ValueType.number) return arg;
            if (arg.type != ValueType.string) return Value.error("value");
            return Value.number(Number.parseFloat(arg.value as string));
        },
        return: ValueType.number
    },
    ISNAN: {
        arguments: [
            {
                name: "value",
                type: ValueType.number
            }
        ],
        body: (arg) => {
            if (arg.type != ValueType.number) return Value.error("value");
            return Value.boolean(Number.isNaN(arg.value));
        },
        return: ValueType.boolean
    },
    IF: {
        arguments: [
            {
                name: "condition",
                type: ValueType.any
            },
            {
                name: "if_true",
                type: ValueType.any
            },
            {
                name: "if_false",
                type: ValueType.any
            }
        ],
        body: (condition, if_true, if_false) => {
            if (condition.asBoolean()) {
                return if_true;
            }
            else return if_false;
        },
        return: ValueType.any
    },
    ISERROR: {
        arguments: [
            {
                name: "value",
                type: ValueType.all
            }
        ],
        body: (arg: Value<ValueType>) => {
            if (arg.type == ValueType.error) return Value.boolean(true);
            else return Value.boolean(false);
        },
        return: ValueType.boolean
    },
    IFERROR: {
        arguments: [
            {
                name: "value",
                type: ValueType.all
            },
            {
                name: "value_if_error",
                type: ValueType.any
            }
        ],
        body: (value: Value<ValueType>, value_if_error: Value<ValueType>) => {
            if (value.type != ValueType.error) return value;
            else return value_if_error;
        },
        return: ValueType.any
    }
};
