import {metadataInternal} from "../metadata";
import {Type} from "../../type/Type";
/**
 * Mark class property as client for value from Injector.
 * @author Jānis Radiņš / Kristaps Peļņa
 */
export function Inject():Function {
    return (target:Type<any>, variable:string):Type<any> => {
        let variableType:Type<any> = Reflect.getMetadata("design:type", target, variable);

        //The variable must be assigned to any default value.
        //If this is not done, the property can not be modified by the Injector and becomes readonly.
        target[variable] = undefined;

        metadataInternal.getTypeDescriptor(<Type<any>> target.constructor).addPropertyInjection(variable, variableType);
        return target;
    }
}