import {Type} from "../type/Type";
import {Inject} from "../metadata/decorator/Inject";
import {Injector} from "../injector/Injector";
import {metadata} from "../metadata/metadata";
import {typeReferenceToString} from "../util/StringUtil";
import {Mediator} from "./Mediator";
import {ClassType} from "../type/ClassType";

/**
 * Mediator map utility represents a list of view component/interface mappings to their Mediator classes.
 * @author Jānis Radiņš / Kristaps Peļņa
 */
export class MediatorMap {

    @Inject()
    private injector: Injector;

    private mappings: MediatorMapping[] = [];
    private mediators: MediatorData[] = [];

    /**
     * Map display object to mediator class.
     * @param {ClassType} type Display object type or abstract class type which to map to mediator.
     * @param {Type} mediator A mediator class which should be created for every instance of <code>type</code>.
     * @returns {boolean} true if mediator is created successfully or false if type been already mapped to requested mediator class.
     */
    map(type: ClassType, mediator: Type<Mediator>): boolean {
        // Look for mapping of same type and mediator
        const existingMapping = this.mappings.find(mapping => mapping.type === type && mapping.mediator === mediator);
        if (existingMapping) {
            // Return false if that mapping is found.
            console.warn(`MediatorMap: Duplicate mapping of ${typeReferenceToString(existingMapping.type)} to ${typeReferenceToString(existingMapping.mediator)}`);
            return false;
        }

        this.mappings.push({type: type, mediator: mediator});
        return true;
    }

    /**
     * Remove mediator mapping.
     * @param {ClassType} type Display object type or abstract class mapping to which should be removed from mediator map.
     * @param {Type<Mediator>} mediator A mediator class binding from which should be removed.
     * @returns {boolean} true if mediator mapping was found and sucessfully removed or false otherwise.
     */
    unMap(type: ClassType, mediator: Type<Mediator>): boolean {
        // Look for mediator mapping for type and mediator
        const existingMapping = this.mappings.find(mapping => mapping.type === type && mapping.mediator === mediator);
        if (existingMapping) {
            // Remove mapping
            this.mappings.splice(this.mappings.indexOf(existingMapping), 1);
            return true;
        }

        // No mapping with requested signature has been found
        return false;
    }

    /**
     * Check if some instance has mediators mapped to it
     * @param instance Display object instance that should be checked for mediators.
     * @returns {boolean} True if mediators mapped for this instance are found or false
     */
    hasMediators(instance: any): boolean {
        return this.getInstanceMediators(instance).length > 0;
    }

    /**
     * Check if <code>instance</code> is part of any mediator map binding known to this class. And
     * if so, mediator or several of them will be created for instance or nothing at all will happen.
     * @param instance Display object instance whose mediators should be created.
     * @returns {boolean} true if any of mediators have been created.
     */
    mediate(instance: any): boolean {
        for (const entry of this.mediators) {
            if (entry.instance === instance) {
                console.warn("MediatorMap: an instance can not be mediated multiple times. unMediate must be called to mediate this instance another time.", instance);
                return;
            }
        }

        const mappings = this.getInstanceMediators(instance);
        if (!mappings.length) {
            // no mediators to create
            return false;
        }

        // Loop through matched mappings
        mappings.forEach(mapping => this.createMediator(instance, mapping.type, mapping.mediator));

        return true;
    }

    /**
     * Remove any mediators created for instance.
     * @param instance Display object instance whose mediators should be removed.
     * @returns {boolean} true if any mediators have been removed.
     */
    unMediate(instance: any): boolean {
        const instanceMediators = this.mediators.filter(entry => entry.instance === instance);

        // No active mediators are found
        if (!instanceMediators.length) {
            return false;
        }

        // Call destroy on all mediators and remove from cache
        for (const entry of instanceMediators) {
            this.injector.destroyInstance(entry.mediator);
            this.mediators.splice(this.mediators.indexOf(entry), 1);
        }

        return true;
    }

    //--------------------------------
    //  Private methods
    //--------------------------------

    private createMediator(instance: any, instanceType: ClassType, mediatorClass: Type<Mediator>): void {
        // Create sub injector
        const subInjector = this.injector.createSubInjector();
        subInjector.map(instanceType).toValue(instance);

        // Create mediator class right away
        const mediator = subInjector.instantiateInstance(mediatorClass);

        this.mediators.push({instance: instance, mediator: mediator});
    }

    private getInstanceMediators(instance: any): MediatorMapping[] {

        const mappings: MediatorMapping[] = [];
        const instanceType = <Type> instance.constructor;

        let mappedInterfaces: Type[] = [];

        if (metadata.hasMetadata(instanceType)) {
            mappedInterfaces = metadata.getTypeDescriptor(instanceType).mappedInterfaces;
        }

        // Find all mappings which are mapped to instance type
        for (const mapping of this.mappings) {
            // We have a direct implementation of required type
            if (instance instanceof mapping.type) {
                mappings.push(mapping);
                continue;
            }

            if (mappedInterfaces && mappedInterfaces.indexOf(mapping.type as Type) !== -1) {
                mappings.push(mapping);
                continue;
            }

            // TODO JR: This one is old-school and should be removed at some point as static isInstanceOf() is not encouraged
            if ('isInstanceOf' in mapping.type) {
                const callback = mapping.type['isInstanceOf'] as (instance: any) => boolean;
                if (callback(instance)) {
                    mappings.push(mapping);
                }
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
    readonly type: ClassType;
    /**
     * Mediator type to be created as mediator is initalized
     */
    readonly mediator: Type<Mediator>;
};

/**
 * Describes instance to created mediator mapping
 */
type MediatorData = {
    /**
     * Mediatable instance for which mediator has been created
     */
    readonly instance: any;
    /**
     * Mediator instance
     */
    readonly mediator: Mediator
};