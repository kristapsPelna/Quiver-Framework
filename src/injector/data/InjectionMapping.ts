import {Type} from "../../type/Type";
import {Injector} from "../Injector";
import {InjectionValueProvider} from "../provider/InjectionValueProvider";
import {ClassProvider} from "../provider/ClassProvider";
import {SingletonProvider} from "../provider/SingletonProvider";
import {ValueProvider} from "../provider/ValueProvider";
import {ExistingMappingProvider} from "../provider/ExistingMappingProvider";
import {typeReferenceToString} from "../../util/StringUtil";
/**
 * Injector data mapping instance.
 * @author Jānis Radiņš
 */
export class InjectionMapping {

    private _sealed: boolean = false;
    private _destroyed: boolean = false;

    private provider: InjectionValueProvider;
    private sealKey: Object;
    private defaultProviderSet: boolean;

    /**
     * Create new instance of injector mapping
     * @param type Mapping type of injected value by which it will be requested from injector
     * @param injector Hosting Injector instance of current mapping
     * @param masterSealKey Master seal key is necessary for unsealed by injector during destroy
     */
    constructor(public readonly type: Type,
                public readonly injector: Injector,
                private readonly masterSealKey: Object) {
        this.defaultProviderSet = true;
        //Set class provider as a default value provider
        this.setProvider(new ClassProvider(injector, type));
    }

    //------------------------------
    //  Public properties
    //------------------------------

    /**
     * Whether injection is sealed
     * @returns {boolean}
     */
    get sealed(): boolean {
        return this._sealed;
    }

    /**
     * Whether injection is destroyed
     * @returns {boolean}
     */
    get destroyed(): boolean {
        return this._destroyed;
    }

    //------------------------------
    //  Public methods
    //------------------------------

    /**
     * Makes the mapping return a lazily constructed singleton instance of the mapped type, for
     * each consecutive request.
     * @returns {InjectionMapping} The InjectionMapping the method is invoked on
     */
    asSingleton(): this {
        this.setProvider(new SingletonProvider(this.injector, this.type));
        return this;
    }

    /**
     * Makes the mapping return a newly created instance of the given <code>type</code> for
     * each consecutive request.
     * @param type Type that should be used as new injected value is spawned
     * @returns {InjectionMapping} The InjectionMapping the method is invoked on
     */
    toType(type: Type): this {
        this.setProvider(new ClassProvider(this.injector, type));
        return this;
    }

    /**
     * Makes the mapping return a lazily constructed singleton instance of the mapped type for
     * each consecutive request.
     * @param type Type that should be used as source of singleton instance
     * @returns {InjectionMapping} The InjectionMapping the method is invoked on
     */
    toSingleton(type: Type): this {
        this.setProvider(new SingletonProvider(this.injector, type));
        return this;
    }

    /**
     * Makes the mapping return the given value for each consecutive request.
     * @param value Hard coded value to be returned for each request
     * @returns {InjectionMapping} The InjectionMapping the method is invoked on
     */
    toValue(value: any): this {
        this.setProvider(new ValueProvider(value));
        return this;
    }

    /**
     * Makes the mapping return existing mapping from current injector or any of its parents upon each request
     * @param type Exsting mapping type to use as for a return value.
     * @returns {InjectionMapping} The InjectionMapping the method is invoked on
     */
    toExisting(type: Type): this {
        this.provider = new ExistingMappingProvider(this.injector, type);
        return this;
    }

    /**
     * Seal mapping and don't  allow any changes to it whist Injector that hosts this mapping is destroyed or mapping
     * is unsealed.
     * @returns {Object} Seal key to be used for unseal operation.
     */
    seal(): Object {
        this._sealed = true;
        this.sealKey = {};
        return this.sealKey;
    }

    /**
     * Unseal mapping.
     * @param key Seal key which was returned as a return value for seal() operation.
     * @returns {InjectionMapping} The InjectionMapping the method is invoked on
     */
    unseal(key: Object): this {
        if (!this._sealed) {
            throw new Error(`Can't unseal a non-sealed mapping.`);
        }
        if (key !== this.sealKey && key !== this.masterSealKey) {
            throw new Error(`Can't unseal mapping without the correct key.`);
        }

        this._sealed = false;
        this.sealKey = null;
        return this;
    }

    /**
     * Retrieve provided value of current injector mapping.
     * @returns {any}
     */
    getInjectedValue(): any {
        if (this._destroyed) {
            throw new Error(`InjectionMapping for type: ${this.type} is already destroyed!`);
        }
        return this.provider.getProviderValue();
    }

    /**
     * Destroy injection provider and invoke clearCommandMap of values provided if current value type supports that.
     */
    destroy(): void {
        if (this._destroyed) {
            throw new Error(`InjectionMapping for type: ${this.type} is already destroyed!`);
        }

        if ("destroy" in this.provider) {
            this.provider.destroy();
        }
        this.provider = null;
        this._destroyed = true;
    }

    //------------------------------
    //  Private methods
    //------------------------------

    private setProvider(provider: InjectionValueProvider): void | Error {
        if (this._destroyed) {
            throw new Error(`Can't change a destroyed mapping`);
        }

        if (this._sealed) {
            throw new Error(`Can't change a sealed mapping`);
        }

        if (!this.defaultProviderSet && this.provider) {
            console.log("provider", this.provider);
            console.warn(
                `Injector already has mapping for ${typeReferenceToString(this.type)} and its being overridden. ` +
                `This could be or could not be error, buy it's suggested to use injector.unMap() ` +
                `before new mapping is set.`
            );
        }

        //Check if current provider is default one
        this.defaultProviderSet = (provider instanceof ClassProvider && (provider as ClassProvider).type === this.type);

        if (this.provider && "destroy" in this.provider) {
            this.provider.destroy();
        }

        this.provider = provider;
    }
}
