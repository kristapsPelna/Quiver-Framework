import {Type} from "../../type/Type";
import {TypeMetadataInternal} from "../data/TypeMetadataInternal";
import {TypeMetadata} from "../data/TypeMetadata";
/**
 * Internal class that stores information on registered type metadata
 * @author Jānis Radiņš
 */
export class MetadataCollection {

    private rawTypeMetadata = new Map<Type, TypeMetadataInternal>();
    private exportedTypeMetadata = new Map<Type, TypeMetadata>();
    private inheritedMetadata = new Map<Type, TypeMetadata[]>();

    /**
     * Get or create internal type metadata object
     * @param type
     * @returns {TypeMetadataInternal}
     */
    getOrCreateTypeMetadata(type: Type): TypeMetadataInternal {
        if (!this.rawTypeMetadata.has(type)) {
            this.rawTypeMetadata.set(type, new TypeMetadataInternal(type));
        }
        return this.rawTypeMetadata.get(type);
    }

    /**
     * Get type metadata in clean export format
     * @param type
     * @throws Error if unre4gistered metadata is requested
     * @returns {TypeMetadata}
     */
    getTypeMetadataExportFormat(type: Type): TypeMetadata {
        if (!this.rawTypeMetadata.has(type)) {
            throw new Error(`Type metadata for ${type} is not registered`);
        }

        if (!this.exportedTypeMetadata.has(type)) {
            this.exportedTypeMetadata.set(type, new TypeMetadata(this.rawTypeMetadata.get(type)));
        }
        return this.exportedTypeMetadata.get(type);
    }

    /**
     * Check if particular type has registered entry
     * @param type
     * @returns {boolean}
     */
    typeMetadataIsRegistered(type: Type): boolean {
        return this.rawTypeMetadata.has(type);
    }

    /**
     * Get inherited metadata for some instance (including its own prototype)
     * @param instance Any class instance that might be inheriting from any of metadata clients
     * @returns {TypeMetadata[]} A collection of all metadata entries that can be matched with instance
     */
    getInheritedMetadata(instance: any): TypeMetadata[] {

        const instanceType: Type = instance.constructor;

        if (this.inheritedMetadata.has(instanceType)) {
            return this.inheritedMetadata.get(instanceType);
        }

        const parentTypeMetadata: TypeMetadata[] = [];
        this.rawTypeMetadata.forEach((typeDef: TypeMetadataInternal) => {
            if (instance instanceof typeDef.type) {
                parentTypeMetadata.push(this.getTypeMetadataExportFormat(typeDef.type));
            }
        });

        this.inheritedMetadata.set(instanceType, parentTypeMetadata);

        return parentTypeMetadata;
    }
}