// export const Type = Function;
export interface Type<T = any> extends Function {
    new (...args: any[]): T;
}

/*
export interface ClassType<T = any> extends Function {
    new (...args: any[]): T;
}*/
