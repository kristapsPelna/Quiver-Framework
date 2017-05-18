import {metadataInternal} from "../metadata";
import {Type} from "../../type/Type";
/**
 * Mark method to be invoked as instance, client of injector, is created and all custom injections have
 * their values set.
 * @author Jānis Radiņš
 */
export function PostConstruct():Function {
    return (target:Type<any>, method:string):Type<any> => {
        metadataInternal.getTypeDescriptor(<Type<any>> target.constructor).addPostConstructMethod(method);
        return target;
    };
}