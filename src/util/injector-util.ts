import {InjectionDescriptor} from "../metadata/data/InjectionDescriptor";
import {Type} from "../type/Type";
import {Injector} from "../injector/Injector";

/**
 * Update injector with instructions from InjectionDescriptor
 * @param {Type | InjectionDescriptor} mapping
 * @param {Injector} injector
 * @returns {Type[]} Injector mappings that should be instantiated before Injector is ready
 */
export function applyInjectorMapping(mapping: Type | InjectionDescriptor, injector: Injector): Type[] {
    const toInstantiate: Type[] = [];

    // We have got a singular entry and such are to be mapped as singletons
    if ("map" in mapping === false) {
        const mappedType = mapping as Type;
        if (injector.hasDirectMapping(mappedType)) {
            injector.unMap(mappedType);
        }
        injector.map(<Type> mapping).asSingleton();
        return toInstantiate;
    }

    const injection = mapping as InjectionDescriptor;
    if (typeof injection.map !== "function") {
        throw new Error("Injection mapping doesn't seem to be a valid object type");
    }

    const injectionMapping = injector.map(injection.map);
    if (injection.useExisting) {
        // if use existing is set create forward reference and ignore the rest
        injectionMapping.toExisting(injection.useExisting);
    } else if (injection.useValue) {
        // Look for use value as next one
        injectionMapping.toValue(injection.useValue);
    } else if (injection.useType) {
        // If use type is set map injection to type or to singleton in case if asSingleton is present
        if ("asSingleton" in injection && !injection.asSingleton) {
            injectionMapping.toType(injection.useType);
        } else {
            injectionMapping.toSingleton(injection.useType);
        }
    } else if (injectionMapping.asSingleton) {
        // If everything else fails make mapping as singleton
        injectionMapping.asSingleton();
    }
    if (injection.instantiate && toInstantiate.indexOf(injection.map) === -1) {
        toInstantiate.push(injection.map);
    }
    return toInstantiate;
}