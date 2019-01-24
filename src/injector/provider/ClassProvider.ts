import {InjectionValueProvider} from "./InjectionValueProvider";
import {Type} from "../../type/Type";
import {Injector} from "../Injector";
/**
 * Class provider that will return new instance of required type upon any request.
 * @author Jānis Radiņš
 */
export class ClassProvider implements InjectionValueProvider {

    constructor(private injector: Injector,
                public readonly type: Type) {

    }

    getProviderValue(): any {
        //Return new instance of type without caring how this instance will be destroyed afterwards
        return this.injector.instantiateInstance(this.type);
    }

}
