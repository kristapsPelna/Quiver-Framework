import {InjectionValueProvider} from "./InjectionValueProvider";
import {Injector} from "../Injector";
import {ClassType} from "../../type/ClassType";
/**
 * Provide value from factory function
 * @author Jānis Radiņš
 */
export class FactoryProvider<T extends ClassType> implements InjectionValueProvider {

    private value: T;
    private singleton: boolean = false;

    constructor(private injector: Injector,
                private factory: FactoryMethod<T>) {

    }

    asSingleton(): void {
        this.singleton = true;
    }

    getProviderValue(): T {
        if (!this.singleton) { // Providing a new value for each request
            return this.factory(this.injector);
        }

        if (!this.value) {
            this.value = this.factory(this.injector);
        }
        return this.value;
    }
}

export type FactoryMethod<T> = (injector?: Injector) => FactoryResult<T>;
export type FactoryResult<T> = Exclude<T, "prototype">;
