
export namespace Lexer {
    export function lex(expression: string): string[] {
        expression = expression.trim()
                               .replaceAll(/[\t\r\n]/g, " ")
                               .replaceAll(/\s+/g, " ");

        return expression.split(/(<=|<>|<|>=|>|=)|([\(\),\"\'\+\-\*\/\&\^\s])/g)
                         .filter(token => token != "" && token != undefined);
    }
}
