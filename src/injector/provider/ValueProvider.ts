import {InjectionValueProvider} from "./InjectionValueProvider";
/**
 * Hardcoded value provider.
 * @author Jānis Radiņš
 */
export class ValueProvider implements InjectionValueProvider {

    constructor(private value:any) {

    }

    getProviderValue(): any {
        return this.value;
    }

    destroy(): void {
        this.value = null;
    }
}
