import {Type} from "../../type/Type";
/**
 * Describes property of a type that expects to receive value from Injector.
 * @author Jānis Radiņš
 */
export interface PropertyInjection {
    /**
     * Name of class property that expects to value from Injector
     */
    readonly name: string;
    /**
     * Type to be extracted from Injector as this argument is applied
     */
    readonly type: Type;
    /**
     * Defines if argument is optional and no error should be produced if requested type is not found in Injector
     */
    readonly isOptional: boolean;
}
