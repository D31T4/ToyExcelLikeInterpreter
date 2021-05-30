
/**
 * type enum
 */
export const enum ValueType {
    number,
    string,
    boolean,
    error,
    any,
    all
};

/**
 * inferred type of Value.value
 * @template T enum of value type
 */
type TypeInfer<T> = T extends ValueType.number ? number : 
                    T extends ValueType.string ? string :
                    T extends ValueType.boolean ? boolean :
                    T extends ValueType.error ? string :
                    never;

/**
 * value
 * @template T type of value
 */
export class Value<T extends ValueType> {
    public type: T;
    public value: TypeInfer<T>;

    public constructor(type: T, value: TypeInfer<T>) {
        this.type = type;
        this.value = value;
    }

    /**clone the value */
    public static clone<TClone extends ValueType>(value: Value<TClone>): Value<TClone> {
        return new Value(value.type, value.value);
    }

    /**create a numeric value */
    public static number(value: number): Value<ValueType.number> {
        return new Value(ValueType.number, value);
    }

    public static string(value: string): Value<ValueType.string> {
        return new Value(ValueType.string, value);
    }

    public static boolean(value: boolean): Value<ValueType.boolean> {
        return new Value(ValueType.boolean, value);
    }

    public static error(msg: string): Value<ValueType.error> {
        return new Value(ValueType.error, "#" + msg.toUpperCase());
    }

    public asString(): string {
        switch (this.type) {
            case ValueType.boolean:
                return (this.value as boolean).toString().toUpperCase();
            default:
                return this.value.toString();
        }
    }

    public toString(): Value<ValueType.string> {
        return new Value(ValueType.string, this.asString());
    }

    public asNumber(): number {
        switch (this.type) {
            case ValueType.number:
                return this.value as number;
            case ValueType.boolean:
                return (this.value as boolean) ? 1 : 0;
            default:
                return NaN;
        }
    }

    public toNumber(): Value<ValueType.number> | Value<ValueType.error> {
        let value = this.asNumber();
        return Number.isNaN(value) ? Value.error("n/a") : Value.number(value);
    }

    public asBoolean(): boolean {
        switch (this.type) {
            case ValueType.number:
                return (this.value as number) != 0;
            case ValueType.string:
                return (this.value as string) != "";
            case ValueType.boolean:
                return this.value as boolean;
            default:
                throw Error("value");
        }
    }

    public toBoolean(): Value<ValueType.boolean> {
        return Value.boolean(this.asBoolean());
    }
}
