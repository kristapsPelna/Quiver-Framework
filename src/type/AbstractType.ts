/**
 * Abstract class type definition
 */
export type AbstractType<T = any> = Function & {
    prototype: T;
};