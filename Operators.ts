
export const Operators = Object.freeze({
    plus: "+",
    minus: "-",

    concat: "&",

    times: "*",
    div: "/",

    pow: "^",

    eq: "=",
    ne: "<>",
    lt: "<",
    lte: "<=",
    gt: ">",
    gte: ">="
});

export const AdditionOperators: Readonly<string[]> = [
    Operators.plus,
    Operators.minus
];

export const MultiplicationOperators: Readonly<string[]> = [
    Operators.times,
    Operators.div
];

export const ComparisonOperators: Readonly<string[]> = [
    Operators.eq,
    Operators.ne,
    Operators.lt,
    Operators.lte,
    Operators.gt,
    Operators.gte
];

export const Keywords = Object.freeze({
    true: "true",
    false: "false"
});

export const Brackets = Object.freeze({
    left: "(",
    right: ")"
});
