import {Type} from "../../type/Type";
/**
 * Injection descriprot object shape.
 * @author Jānis Radiņš
 */
export interface InjectionDescriptor {

    /**
     * Injection mapping key which will be used to extract mapping.
     * (any is added due to the fact that abstract classes do not resolve as Type<any>)
     */
    readonly map: Type<any>|any;

    /**
     * Type, instance of which, must be created as injection with signature defined in map
     * property will be requested.
     */
    readonly useType?: Type<any>;

    /**
     * Value to return as it is provided in here as injection with signature defined in map
     * property will be requested.
     */
    readonly useValue?: any;

    /**
     * use existing mapping defined by this property as injection with signature defined in map
     * property will be requested.
     */
    readonly useExisting?: Type<any>;

    /**
     * Provide same instance of mapped instance (true) or create new instance upon any request (false)
     * Default value for this property will be assumed to be true and if this property is omitted singleton instance
     * will be in use.
     * @default true
     */
    readonly asSingleton?: boolean;

    /**
     * Auto instantiate mapping as application context is created, if this property is set to true.
     * @default false
     */
    readonly instantiate?: boolean;

}