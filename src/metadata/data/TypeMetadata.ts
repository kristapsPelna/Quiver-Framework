import {Type} from "../../type/Type";
import {ModuleDescriptor} from "./ModuleDescriptor";
import {ConstructorArg} from "./ConstructorArg";
import {PropertyInjection} from "./PropertyInjection";
import {TypeMetadataInternal} from "./TypeMetadataInternal";

/**
 * Describes some type metadata.
 * @author Jānis Radiņš
 */
export class TypeMetadata {

    /**
     * List of type constructor arguments data types
     */
    readonly constructorArguments:ConstructorArg[];
    /**
     * List of injected properties configuration this type expects.
     */
    readonly propertyInjections:PropertyInjection[];
    /**
     * List of method names that should be invoked as new instance of type is created and all injection points have
     * got values.
     */
    readonly postConstructMethods:string[] = [];
    /**
     * List of method names that should be invoked as Injected properties are applied to new created class.
     */
    readonly preDestroyMethods:string[] = [];
    /**
     * List of interfaces that are mapped to type.
     */
    readonly mappedInterfaces:Type<any>[] = [];
    /**
     * Module descriptor object that marks type as a module and defines properties of a module entry.
     */
    readonly moduleDescriptor:ModuleDescriptor;

    /**
     * Create new instance
     * @param type Type of class prototype this instance holds metadata for
     */
    constructor(typeMeta:TypeMetadataInternal) {
        //Parse raw constructor arguments data into more usable format
        let constructorArguments:ConstructorArg[] = [];
        if (typeMeta.constructorArguments) {
            for (let i:number = 0; i < typeMeta.constructorArguments.length; i++) {
                constructorArguments.push({
                    index: i,
                    type: typeMeta.constructorArguments[i],
                    isOptional: typeMeta.optionalConstructorArguments.indexOf(i) != -1
                })
            }
        }
        this.constructorArguments = constructorArguments;
        //Parse raw property injections data into more usable format
        let propertyInjections:PropertyInjection[] = [];
        if (typeMeta.propertyInjections.size > 0) {
            typeMeta.propertyInjections.forEach((type: Type<any>, name: string) => {
                propertyInjections.push({
                    name: name,
                    type: type,
                    isOptional: typeMeta.optionalPropertyInjections.indexOf(name) != -1
                })
            });
        }
        this.propertyInjections = propertyInjections;
        //Decouple what can be decoupled from raw data
        this.postConstructMethods = typeMeta.postConstructMethods.concat();
        this.preDestroyMethods = typeMeta.preDestroyMethods.concat();
        this.mappedInterfaces = typeMeta.mappedInterfaces.concat();
        this.moduleDescriptor = typeMeta.moduleDescriptor;
    }

}
