import {InjectionValueProvider} from "./InjectionValueProvider";
import {Type} from "../../type/Type";
import {Injector} from "../Injector";
/**
 * Provide singleton value.
 * @author Jānis Radiņš
 */
export class SingletonProvider implements InjectionValueProvider {

    private instance:any;

    constructor(private injector:Injector,
                private type:Type<any>
    ) {}

    getProviderValue():any {
        if (!this.instance) {
            this.instance = this.injector.instantiateInstance(this.type, true);
        }
        return this.instance;
    }

    destroy():void {
        if (this.instance) {
            this.injector.destroyInstance(this.instance);
            this.instance = null;
        }
    }

}
