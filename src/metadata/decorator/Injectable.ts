import {metadataInternal} from "../metadata";
import {Type} from "../../type/Type";
/**
 * Mark class as injectable which will make all of its constructor arguments filled with values from Injector
 * @author Jānis Radiņš
 */
export function Injectable():Function {
    return (target:Type<any>):Type<any> => {

        let constructorArgs:Type<any>[] = Reflect.getMetadata("design:paramtypes", target);

        if (constructorArgs && constructorArgs.length > 0) {
            metadataInternal.getTypeDescriptor(target).setConstructorArguments(constructorArgs);
        }
        return target;
    };
}
