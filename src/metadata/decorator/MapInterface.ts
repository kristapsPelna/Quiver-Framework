import {metadataInternal} from "../metadata";
import {Type} from "../../type/Type";
/**
 * Map custom class as interface to a class definition.
 * @param interfaces List of interfaces this class is declared to implement.
 * @author Jānis Radiņš
 */
export function MapInterface(... interfaces:Type[]):Function {
    return (target: Type): Type => {
        if (interfaces.length > 0) {
            metadataInternal.getTypeDescriptor(target).setMappedInterfaces(interfaces);
        }
        return target;
    };
}
