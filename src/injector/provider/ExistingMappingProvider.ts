import {InjectionValueProvider} from "./InjectionValueProvider";
import {Injector} from "../Injector";
import {ClassType} from "../../type/ClassType";
/**
 * Provide value of existing mapping of required type
 * @author Jānis Radiņš
 */
export class ExistingMappingProvider implements InjectionValueProvider {

    constructor(private injector: Injector,
                private type: ClassType) {

    }

    getProviderValue(): any {
        return this.injector.get(this.type);
    }

}
