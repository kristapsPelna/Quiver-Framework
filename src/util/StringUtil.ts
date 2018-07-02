import {Type} from "../type/Type";

/**
 * Convert Type reference to simple string representation representing constructor shape
 * @param type
 * @returns {string}
 */
export function typeReferenceToString(type: Type): string {
    const str = String(type);
    if (str.match(/^function/)) {
        return str.match(/^function (\w+\([^\)]*\))/)[1];
    }

    if (str.match(/^class/)) {
        return str.match(/^class (\w+)/)[1];
    }
    return str;
}
