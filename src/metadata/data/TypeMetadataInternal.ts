import {Type} from "../../type/Type";
import {ModuleDescriptor} from "./ModuleDescriptor";
import {typeReferenceToString} from "../../util/StringUtil";
/**
 * Data object which holds raw information collected for particular Type from class metadataInternal decorators.
 * This is internal class of metadataInternal package and should never be used outside of it.
 * @author Jānis Radiņš / Kristaps Peļņa
 */
export class TypeMetadataInternal {

    private _constructorArguments: Type[];
    private _optionalConstructorArguments: number[] = [];

    private _propertyInjections = new Map<string, Type>();
    private _optionalPropertyInjections: string[] = [];

    private _postConstructMethods: string[] = [];
    private _preDestroyMethods: string[] = [];
    private _mappedInterfaces: Type[] = [];
    private _moduleDescriptor: ModuleDescriptor;

    /**
     * Create new instance
     * @param type Type of class prototype this instance holds metadataInternal for
     */
    constructor(public readonly type: Type) {

    }

    //-----------------------
    //  Public properties
    //-----------------------

    /**
     * List of type constructor arguments data types
     * @returns {Type[]}
     */
    get constructorArguments(): Type[] {
        return this._constructorArguments;
    }

    /**
     * Indices of injectable constructor arguments that are optional and should be omitted, in case if there is no
     * mapping found in Injector, with no error.
     * @returns {number[]}
     */
    get optionalConstructorArguments(): number[] {
        return this._optionalConstructorArguments;
    }

    /**
     * List of type property name and data type pairs that should be filled with values from Injector as instance
     * of this type is created.
     * @returns {Map<string, Type>}
     */
    get propertyInjections(): Map<string, Type> {
        return this._propertyInjections;
    }

    /**
     * List of optional property injections.
     * @returns {string[]}
     */
    get optionalPropertyInjections(): string[] {
        return this._optionalPropertyInjections;
    }

    /**
     * List of method names that should be invoked as new instance of type is created and all injection points have
     * got values
     * @returns {string[]}
     */
    get postConstructMethods(): string[] {
        return this._postConstructMethods;
    }

    /**
     * List of method names that should be invoked as Injected properties are applied to new created class.
     * @returns {string[]}
     */
    get preDestroyMethods(): string[] {
        return this._preDestroyMethods;
    }

    /**
     * List of interfaces that are mapped to type.
     * @returns {Type[]}
     */
    get mappedInterfaces(): Type[] {
        return this._mappedInterfaces;
    }

    /**
     * Module descriptor object that marks type as a module and defines properties of a module entry.
     * @returns {ModuleDescriptor}
     */
    get moduleDescriptor(): ModuleDescriptor {
        return this._moduleDescriptor;
    }

    //-----------------------
    //  Public methods
    //-----------------------

    setConstructorArguments(value: Type[]): void {
        if (this._constructorArguments) {
            throw new Error("Double set of type constructor arguments is attempted and that is clear error!");
        }
        this._constructorArguments = value;
    }

    setOptionalConstructorArgument(index: number): void {
        if (this._optionalConstructorArguments.indexOf(index) !== -1) {
            throw new Error("Double set of optional constructor argument!");
        }
        this._optionalConstructorArguments.push(index);
    }

    addPropertyInjection(name: string, type: Type): void {
        if (this._propertyInjections.get(name)) {
            throw new Error(`Double set of property ${name} injection to ${typeReferenceToString(type)}`);
        }

        this._propertyInjections.set(name, type);
    }

    setOptionalPropertyInjection(name: string): void {
        if (this._optionalPropertyInjections.indexOf(name) !== -1) {
            throw new Error("Double set of optional proprety injection!");
        }
        this._optionalPropertyInjections.push(name);
    }

    addPostConstructMethod(name: string): void {
        if (this._postConstructMethods.indexOf(name) !== -1) {
            throw new Error(`Double register of post construct method ${name} to ${typeReferenceToString(this.type)}`);
        }
        this._postConstructMethods.push(name);
    }

    addPreDestroyMethod(name: string): void {
        if (this._preDestroyMethods.indexOf(name) !== -1) {
            throw new Error(`Double register of pre destroy method ${name} to ${typeReferenceToString(this.type)}`);
        }
        this._preDestroyMethods.push(name);
    }

    setMappedInterfaces(value: Type[]): void {
        if (this._mappedInterfaces.length > 0) {
            throw new Error("Double set of mapped interfaces is attempted and that is clear error!");
        }
        this._mappedInterfaces = value;
    }

    setModuleDescriptor(descriptor: ModuleDescriptor): void {
        if (this._moduleDescriptor) {
            throw new Error("Double set of module descriptor and that is clear error!");
        }
        this._moduleDescriptor = descriptor;
    }
}
