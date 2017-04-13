/**
 * Generic shape of injected value provider
 * @author Jānis Radiņš
 */
export interface InjectionValueProvider {

    /**
     * Implement providing of mapped value
     */
    getProviderValue():any;

    /**
     * Implement clearCommandMap of provided instance that will be invoked as provider instance if to be destroyed.
     */
    destroy?():void;

}
