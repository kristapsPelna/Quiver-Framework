import {metadataInternal} from "../metadata";
import {Type} from "../../type/Type";
/**
 * Mark method to be invoked as instance, client of injector, is to be destroyed and some mappings should be destroyed
 * manually just before its gone for good.
 * @author Jānis Radiņš
 */
export function PreDestroy():Function {
    return (target: Type, method: string): Type => {
        metadataInternal.getTypeDescriptor(<Type> target.constructor).addPreDestroyMethod(method);
        return target;
    };
}