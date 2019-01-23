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
        // Making injector mappings as singletons by default
        injector.map(<Type> mapping).asSingleton();
        return toInstantiate;
    }

    const descriptor = mapping as InjectionDescriptor;
    if (typeof descriptor.map !== "function") {
        throw new Error("Injection mapping doesn't seem to be a valid object type");
    }

    const injectionMapping = injector.map(descriptor.map);
    if (descriptor.useExisting) {
        // if use existing is set create forward reference and ignore the rest
        injectionMapping.toExisting(descriptor.useExisting);
    } else if (descriptor.useValue) {
        // Look for use value as next one
        injectionMapping.toValue(descriptor.useValue);
    } else if (descriptor.useType) {
        // If use type is set map injection to type or to singleton in case if asSingleton is present
        if ("asSingleton" in descriptor && !descriptor.asSingleton) {
            injectionMapping.toType(descriptor.useType);
        } else {
            injectionMapping.toSingleton(descriptor.useType);
        }
    } else if (descriptor.useFactory) {
        injectionMapping.toFactory(descriptor.useFactory);
        // Mark it as singleton in case asSingleton is not mentioned or is explicitly set to true
        // which makes this one a singleton by default
        if ("asSingleton" in descriptor === false || descriptor.asSingleton) {
            injectionMapping.asSingleton();
        }

    } else if (injectionMapping.asSingleton) {
        // If everything else fails make mapping as singleton
        injectionMapping.asSingleton();
    }
    if (descriptor.instantiate && toInstantiate.indexOf(descriptor.map) === -1) {
        toInstantiate.push(descriptor.map);
    }
    return toInstantiate;
}