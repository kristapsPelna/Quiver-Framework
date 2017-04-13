import {metadataInternal} from "../metadata";
import {Type} from "../../type/Type";
/**
 * Mark injected variable in class constructor or class property as Optional hence avoid lacking injected property
 * error.
 * @author Jānis Radiņš
 */
export function Optional():Function {
    return (target:Type<any>, key:string, index:number|Object):Type<any> => {
        if (key && !index) {
            // We have a class property mapping in here
            metadataInternal.getTypeDescriptor(<Type<any>> target.constructor).setOptionalPropertyInjection(key);
        } else if (!key && typeof index === "number") {
            //This one is a constructor param entry
            metadataInternal.getTypeDescriptor(target).setOptionalConstructorArgument(index);
        } else {
            console.warn(`@Optional meta tag is applied to non constructor argument or class property named "${key}" and will make no effect`);
        }

        return target;
    }
}