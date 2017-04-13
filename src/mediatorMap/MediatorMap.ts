import {Mediator} from './Mediator';
import {Type} from "../type/Type";
import {Inject} from "../metadata/decorator/Inject";
import {Injector} from "../injector/Injector";
import {metadata} from "../metadata/metadata";
import {typeReferenceToString} from "../util/StringUtil";
/**
 * Mediator map utility represents a list of view component/interface mappings to their Mediator classes.
 * @author Jānis Radiņš / Kristaps Peļņa
 */
export class MediatorMap {

    @Inject()
    private injector:Injector;
    
    private mappings:MediatorMapping[] = [];
    private mediators:MediatorData[] = [];

    /**
     * Map display object to mediator class.
     * @param type Display object type or abstract class type which to map to mediator.
     * @param mediator A mediator class which should be created as instance of <code>type</code> is created.
     * @returns true if mediator is created successfully or false if type been already mapped to requested mediator
     * class. 
     */
    map(type:Type<any>|any, mediator:Type<any>):boolean {
        //Look for mapping of same type and mediator
        for (let mapping of this.mappings) {
            if (mapping.type === type && mapping.mediator === mediator) {
                //Return false if that mapping is found.
                console.warn("MediatorMap: Duplicate mapping of ", typeReferenceToString(type), "to", typeReferenceToString(mediator))
                return false;
            }
        }        
        this.mappings.push({type:type, mediator:mediator});
        return true;
    }
    
    /**
     * Remove mediator mapping for type.
     * @param type Display object type or abstract class mapping to which should be removed from mediator map.
     * @param mediator A mediator class binding from which should be removed.
     * @returns true if mediator mapping was found and sucessfully removed or false otherwise. 
     */
    unMap(type:Type<any>|any, mediator:Type<any>):boolean {
        //Look for mediator mapping for type and mediator
        for (let mapping of this.mappings) {
            if (mapping.type == type && mapping.mediator == mediator) {
                //Remove mapping                
                this.mappings.splice(this.mappings.indexOf(mapping), 1);
                return true;
            }
        }
        //no mapping with requested signature has been found
        return false;
    }

    /**
     * Check if some instance has mediators mapped to it
     * @param instance Display object instance that should be checked fro mediators.
     * @returns {boolean} True if mediators mapped for this instance are found or false
     */
    hasMediators(instance:any):boolean {
        return this.getInstanceMediators(instance).length > 0;
    }
    
    /**
     * Check if <code>instance</code> is part of any mediator map binding known to this class. And 
     * if so, mediator or several of them will be created for instance or nothing at all will happen.
     * @param instance Display object instance whose mediators should be created.
     * @returns true if any of mediators have been created.
     */
    mediate(instance:any):boolean {

        for (let entry of this.mediators) {
            if (entry.instance === instance) {
                console.warn("MediatorMap: an instance can not be mediated multiple times. unMediate must be called to mediate this instance another time.", instance);
                return;
            }
        }

        let mappings:MediatorMapping[] = this.getInstanceMediators(instance);
        if (!mappings.length) {
            //no mediators to create
            return false; 
        }
        
        //Loop through matched mappings
        for (let mapping of mappings) {
            this.createMediator(instance, mapping.type, mapping.mediator);
        }
        
        return true;
    }
    
    /**
     * Remove any mediators created for instance.
     * @param instance Display object instance whose mediators should be removed.
     * @returns true if any mediators have been removed.
     */
    unMediate(instance:any):boolean {
        let instanceMediators:MediatorData[] = this.mediators.filter((entry:MediatorData) => {
            return entry.instance === instance;
        });

        //No active mediators are found
        if (!instanceMediators.length) {
            return false;
        }

        //Call destroy on all mediators and remove from cache
        for (let entry of instanceMediators) {
            this.injector.destroyInstance(entry.mediator);
            this.mediators.splice(this.mediators.indexOf(entry), 1);
        }
        
        return true;
    }
    
    //--------------------------------
    //  Private methods
    //--------------------------------
    
    private createMediator(instance:any, instanceType:Type<any>, mediatorClass:Type<any>):void {
        //Create sub injector
        let subInjector:Injector = this.injector.createSubInjector();
        subInjector.map(instanceType).toValue(instance);

        //Create mediator class right away
        let mediator:any = subInjector.instantiateInstance(mediatorClass);

        this.mediators.push({instance: instance, mediator: mediator});
    }

    private getInstanceMediators(instance:any):MediatorMapping[] {

        let mappings:MediatorMapping[] = [];
        let mappedInterfaces:Type<any>[] = [];
        let instanceType:Type<any> = <Type<any>> instance.constructor;

        if (metadata.hasMetadata(instanceType)) {
            mappedInterfaces = metadata.getTypeDescriptor(instanceType).mappedInterfaces;
        }

        //Find all mappings which are mapped to instance type
        for (let mapping of this.mappings) {
            //We have a direct implementation of required type
            if (instance instanceof mapping.type) {
                mappings.push(mapping);
                continue;
            }

            if (mappedInterfaces && mappedInterfaces.indexOf(mapping.type) !== -1) {
                mappings.push(mapping);
                continue;
            }

            //TODO JR: This one is old-school and should be removed at some point as static isInstanceOf() is not encouraged
            if ('isInstanceOf' in mapping.type && mapping.type['isInstanceOf'](instance) == true){
                mappings.push(mapping);
                continue;
            }
        }

        return mappings;
    }
}

/**
 * Describes mediator mapping to instance type data
 */
type MediatorMapping = {
    /**
     * Mediatable instance type
     */
    readonly type:Type<any>;
    /**
     * Mediator type to be created as mediator should be created
     */
    readonly mediator:Type<any>;
}

/**
 * Describes instance to created mediator mapping
 */
type MediatorData = {
    /**
     * Mediatable instance for which mediator has been created
     */
    readonly instance:Type<any>;
    /**
     * Mediator instance
     */
    readonly mediator:any
}