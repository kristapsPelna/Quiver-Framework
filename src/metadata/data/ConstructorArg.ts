import {Type} from "../../type/Type";
/**
 * Injectable instance constructor argument entry
 * @author Jānis Radiņš
 */
export interface ConstructorArg {
    /**
     * Index of constructor argument
     */
    readonly index: number;
    /**
     * Type to be extracted from Injector as this argument is applied
     */
    readonly type: Type<any>;
    /**
     * Defines if argument is optional and no error should be produced if requested type is not found in Injector
     */
    readonly isOptional: boolean;
}
