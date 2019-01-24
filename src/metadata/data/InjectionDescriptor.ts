import {Type} from "../../type/Type";
/**
 * Injection descriptor object shape.
 * @author Jānis Radiņš
 */
export interface InjectionDescriptor {

    /**
     * Injection mapping key which will be used to extract mapping.
     */
    readonly map: Type | any;

    /**
     * Type, instance of which, must be created as injection with signature defined in map
     * property will be requested.
     */
    readonly useType?: Type;

    /**
     * Value to return as it is provided in here as injection with signature defined in map
     * property will be requested.
     */
    readonly useValue?: any;

    /**
     * use existing mapping defined by this property as injection with signature defined in map
     * property will be requested.
     */
    readonly useExisting?: Type;

    /**
     * Provide same instance of mapped instance (true) or create new instance upon any request (false)
     * Default value for this property will be assumed to be true and if this property is omitted singleton instance
     * will be in use.
     * @default true
     */
    readonly asSingleton?: boolean;

    /**
     * Auto instantiate mapping as context is created, if this property is set to true.
     * @default false
     */
    readonly instantiate?: boolean;

}