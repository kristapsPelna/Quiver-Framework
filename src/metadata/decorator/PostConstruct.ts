import {metadataInternal} from "../metadata";
import {Type} from "../../type/Type";
/**
 * Mark method to be invoked as instance, client of injector, is created and all custom injections have
 * their values set.
 * For instances mapped to Injector as Singletons methods marked with @PostConstruct will be invoked with slight delay in
 * order to put instance in Injector before it is fully initialized.
 * @author Jānis Radiņš
 */
export function PostConstruct():Function {
    return (target: Type, method: string): Type => {
        metadataInternal.getTypeDescriptor(<Type> target.constructor).addPostConstructMethod(method);
        return target;
    };
}