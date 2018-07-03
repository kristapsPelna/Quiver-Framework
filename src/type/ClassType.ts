import {Type} from "./Type";
import {AbstractType} from "./AbstractType";
/**
 * Any class that can be constructed or abstracted, definition.
 */
export type ClassType<T = any> = Type<T> | AbstractType<T>;