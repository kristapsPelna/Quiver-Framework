import {InjectionValueProvider} from "./InjectionValueProvider";
import {Type} from "../../type/Type";
import {Injector} from "../Injector";
/**
 * Provide value of existing mapping of required type
 * @author Jānis Radiņš
 */
export class ExistingMappingProvider implements InjectionValueProvider {

    constructor(private injector: Injector,
                private type: Type) {

    }

    getProviderValue(): any {
        return this.injector.get(this.type);
    }

}
