import {Type} from "../type/Type";
import {InjectionMapping} from "./data/InjectionMapping";
import {EventDispatcher} from "../eventDispatcher/EventDispatcher";
import {MappingEvent} from "./event/MappingEvent";
import {metadata} from "../metadata/metadata";
import {typeReferenceToString} from "../util/StringUtil";
import {PropertyInjection} from "../metadata/data/PropertyInjection";
import {ClassType} from "../type/ClassType";

/**
 * Dependencies provider implementation class
 * @author Jānis Radiņš / Kristaps Peļņa
 */
export class Injector extends EventDispatcher {

    private readonly MASTER_SEAL_KEY = (Math.random() * 0xFFFFFFFF).toString(16);

    private _destroyed: boolean = false;

    private mappings = new Map<ClassType, InjectionMapping>();

    constructor(parent: Injector = null) {
        super();
        this.parent = parent;
        this.map(Injector).toValue(this).seal();
    }

    //---------------------------
    //  Public properties
    //---------------------------

    /**
     * Parent injector of which to extract mappings that are not present in current injector.
     * @returns {Injector}
     */
    readonly parent: Injector;

    /**
     * Whether Injector is destroyed
     * @returns {boolean}
     */
    get destroyed(): boolean {
        return this._destroyed;
    }

    //---------------------------
    //  Public methods
    //---------------------------

    /**
     * Create a new sub-injector.
     * This injector instance will be the parent instance of the newly created injector.
     * @returns {Injector}
     */
    createSubInjector(): Injector {
        this.throwErrorIfDestroyed();
        return new Injector(this);
    }

    /**
     * Create injector mapping.
     * @param {ClassType} type The class type describing the mapping
     * @returns {InjectionMapping}
     * @throws Error in case if method is invoked on destroyed instance
     * @throws Error in case if attempt to override sealed mapping is encountered
     */
    map(type: ClassType): InjectionMapping {
        this.throwErrorIfDestroyed();

        if (this.hasDirectMapping(type)) {
            const existingMapping = this.getMapping(type);
            if (existingMapping.sealed) {
                throw new Error(`Injector error: sealed mapping of type ${typeReferenceToString(type)} override is attempted!`);
            }

            if (this.hasEventListener(MappingEvent.MAPPING_OVERRIDE)) {
                this.dispatchEvent(new MappingEvent(MappingEvent.MAPPING_OVERRIDE, type, existingMapping));
            }

            this.unMap(type);
        }

        const mapping = new InjectionMapping(type, this, this.MASTER_SEAL_KEY);
        this.mappings.set(type, mapping);
        this.dispatchEvent(new MappingEvent(MappingEvent.MAPPING_CREATED, type, mapping));
        return mapping;
    }

    /**
     * Removes the mapping described by the given type from current injector.
     * @param type The class type describing the mapping
     * @throws Error in case if method i invoked on destroyed instance
     * @throws Error if unknown mapping is attempted to be unmapped
     * @throws Error if sealed mapping is attempted to be unmapped
     */
    unMap(type: ClassType): void {
        this.throwErrorIfDestroyed();

        if (!this.hasDirectMapping(type)) {
            throw new Error(`Injector error: no mapping could be located for ${typeReferenceToString(type)} as unMap is attempted!`);
        }

        const mapping = this.getMapping(type);
        if (mapping.sealed) {
            throw new Error(`Injector error: cannot unMap sealed mapping of type: ${typeReferenceToString(type)}!`);
        }

        // Destroy mapping
        if (!mapping.destroyed) {
            mapping.destroy();
        }

        this.mappings.delete(type);
        this.dispatchEvent(new MappingEvent(MappingEvent.MAPPING_DESTROYED, type, mapping));
    }

    /**
     * Does this injector have a direct mapping for the given type?
     * @param type The type
     * @return True if the mapping exists
     * @throws Error in case if method i invoked on destroyed instance
     */
    hasDirectMapping(type: ClassType): boolean {
        this.throwErrorIfDestroyed();

        return this.mappings.has(type);
    }

    /**
     * Does this injector (or any parents) have a mapping for the given type?
     * @param type The type
     * @return True if the mapping exists
     * @throws Error in case if method i invoked on destroyed instance
     */
    hasMapping(type: ClassType): boolean {
        this.throwErrorIfDestroyed();

        let injector: Injector = this;
        do {
            // Check if there's direct mapping of requested type
            if (injector.hasDirectMapping(type)) {
                return true;
            }
            // If not move to parent injector
            injector = injector.parent;
        } while (injector);
        return false;
    }

    /**
     * Returns the mapping for the specified dependency class
     * Note that getMapping will only return mappings in exactly this injector, not ones
     * mapped in an ancestor injector. To get mappings from ancestor injectors, query them
     * using parent.
     * This restriction is in place to prevent accidental changing of mappings in ancestor
     * injectors where only the child's response is meant to be altered.
     * @param type The type of the dependency to return the mapping for
     * @return The mapping for the specified dependency class
     * @throws Error in case if method i invoked on destroyed instance
     * @throws Error when no mapping was found for the specified dependency
     */
    getMapping(type: ClassType): InjectionMapping {
        this.throwErrorIfDestroyed();

        if (!this.hasDirectMapping(type)) {
            throw new Error(`Injector error: no mapping could be located for ${typeReferenceToString(type)}`);
        }
        return this.mappings.get(type);
    }

    /**
     * Get or created injected instance mapped for required type.
     * Invoking this method will return existing mapping or create new one in case if there have been no
     * requests for this mapping or it's not mapped with instantiate call.
     * @param {ClassType<T>} type
     * @returns {T}
     * @throws Error in case if method is invoked on destroyed instance
     * @throws Error when no mapping was found for the specified dependency
     */
    get<T>(type: ClassType<T>): T {
        this.throwErrorIfDestroyed();

        if (!this.hasMapping(type)) {
            throw new Error(`There are no known mapping for ${typeReferenceToString(type)} type in Injector!`);
        }

        let injector: Injector = this;
        do {
            // Check if there's direct mapping of requested type
            if (injector.hasDirectMapping(type)) {
                return injector.getMapping(type).getInjectedValue();
            }

            // If not move to parent injector
            injector = injector.parent;
        } while (injector);

        throw new Error(`Injection mapping for ${typeReferenceToString(type)} could not be found in this or any of parent injectors and this should not happen!`);
    }

    /**
     * Create instance of given type with constructor argument values injected, if any are described by metadata,
     * and injected properties filled with values from Injector, if there are any.
     * Invoking this method will also invoke any methods marked with @PostConstruct just as injected properties will
     * be filled in.
     * @param type Instance type to be created.
     * @param postponePostConstruct Flag which is set true will postpone post construct method invocation for smallest amount of time
     * possible in order to make mapped value available within injector as PostConstruct is called
     * @returns {T} Newly created class instance of type described by input argument.
     * @throws Error in case if method i invoked on destroyed instance
     * @throws Error in case if some Injector mapping could not be found.
     */
    instantiateInstance<T>(type: Type<T>, postponePostConstruct?: boolean): T {
        this.throwErrorIfDestroyed();

        // There is no metadata for type - simply create instance with no constructor arguments
        if (!metadata.hasMetadata(type)) {
            // Event tho lacking metadata indicates that there is no direct meta mapping for given type, it still
            // might inherit from some class that has
            return this.injectInto(new type());
        }

        const typeMeta = metadata.getTypeDescriptor(type);

        // Collect array of constructor arguments, if there are any
        const constructorArgs: (Type | undefined)[] = [];
        for (const argData of typeMeta.constructorArguments) {
            let mappingIsPresent: boolean = this.hasMapping(argData.type);
            if (!mappingIsPresent && !argData.isOptional) {
                throw new Error(`Constructor argument of type: ${typeReferenceToString(argData.type)} for ${typeReferenceToString(type)} could not be found in Injector!`);
            }
            constructorArgs.push(mappingIsPresent ? this.get(argData.type) : undefined);
        }

        // Create new instance with or without injected constructor arguments!
        const instance = new type(...constructorArgs);

        // Inject class properties if there are some and return it
        return this.injectInto(instance, postponePostConstruct);
    }

    /**
     * Inspect given type and fill in type properties, clients for Injected values and invoke methods described with
     * @PostConstruct if there are any.
     * @param target The instance to inject into
     * @param postponePostConstruct Flag which is set true will postpone post construct method invocation for smallest amount of time
     * possible in order to make mapped value available within injector as PostConstruct is called
     * @returns Instance passed in via param with properties filled by injections and post construct methods invoked,
     * or as it where in case if there is no metadata tpo apply.
     * @throws Error in case if method i invoked on destroyed instance
     * @throws Error in case if some Injector mapping could not be found.
     */
    injectInto(target: any, postponePostConstruct?: boolean): any {
        this.throwErrorIfDestroyed();

        const inheritedMetadata = metadata.getInheritedMetadata(target);
        // There are no metadata for given type - do nothing
        if (!inheritedMetadata) {
            return target;
        }

        const propertyInjections = new Map<string, PropertyInjection>();
        const postConstructMethods: string[] = [];

        // Join definitions of property injections and post construct methods from all inherited meta
        for (const meta of inheritedMetadata) {
            for (const injection of meta.propertyInjections) {
                if (!propertyInjections.has(injection.name)) {
                    propertyInjections.set(injection.name, injection);
                    // If there are several definitions where one is optional and other not - use it as optional
                } else if (propertyInjections.get(injection.name).isOptional !== injection.isOptional && injection.isOptional) {
                    propertyInjections.set(injection.name, injection);
                }
            }

            for (let method of meta.postConstructMethods) {
                if (postConstructMethods.indexOf(method) === -1) {
                    postConstructMethods.push(method);
                }
            }
        }

        // Fill Injected class properties
        propertyInjections.forEach((injection: PropertyInjection) => {
            const mappingIsPresent = this.hasMapping(injection.type);
            if (!mappingIsPresent && !injection.isOptional) {
                const typeString = typeReferenceToString(injection.type);
                const classString = typeReferenceToString(target.constructor);
                throw new Error(`Injected property of type: ${typeString} for ${classString} could not be found in Injector!`);
            }
            if (mappingIsPresent) {
                target[injection.name] = this.get(injection.type);
            }
        });

        /**
         * Execute PostConstruct methods
         */
        if (!postponePostConstruct) {
            postConstructMethods.forEach(method => target[method]());
        } else {
            // With slight delay if instructed so. This is required for singleton instances just we're running into problem of not having
            // instance mapped in Injector as PotConstruct is called. Which will result in errors in case class will produce any actions that
            // in response must acquire mapped class instance
            setTimeout(() => postConstructMethods.forEach(method => target[method]()));
        }

        return target;
    }

    /**
     * Check if some instance has pre destroy methods defined and if so - invoke them
     * @param target instance of injected values client
     * @throws Error in case if method is invoked on destroyed instance
     */
    destroyInstance(target: any): void {
        this.throwErrorIfDestroyed();

        const inheritedMetadata = metadata.getInheritedMetadata(target);
        // There are no metadata for given type - do nothing
        if (!inheritedMetadata) {
            return;
        }

        let preDestroyMethods: string[] = [];

        // Join definitions of pre destroy methods from all inherited meta
        for (const meta of inheritedMetadata) {
            for (const method of meta.preDestroyMethods) {
                if (preDestroyMethods.indexOf(method) === -1) {
                    preDestroyMethods.push(method);
                }
            }
        }

        // Check if there are any pre preDestroyMethods defined for give type and if so invoke them
        for (let method of preDestroyMethods) {
            target[method]();
        }
    }

    /**
     * Destroy injector and all of its direct mappings.
     * @throws Error in case if Injector is already destroyed
     */
    destroy(): void {
        this.throwErrorIfDestroyed();

        // Remove all mappings
        this.mappings.forEach((mapping: InjectionMapping, type: Type) => {
            if (mapping.sealed) {
                mapping.unseal(this.MASTER_SEAL_KEY);
            }
            this.unMap(type);
        });

        this._destroyed = true;
    }

    /**
     * Throw error if Injector is already destroyed.
     */
    private throwErrorIfDestroyed(): void {
        if (this._destroyed) {
            throw new Error("Injector instance is already destroyed!");
        }
    }
}