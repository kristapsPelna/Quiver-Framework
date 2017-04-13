import {Type} from "../type/Type";
import {TypeMetadataInternal} from "./data/TypeMetadataInternal";
import {TypeMetadata} from "./data/TypeMetadata";
import {MetadataCollection} from "./model/MetadataCollection";

let metadataCollection:MetadataCollection = new MetadataCollection();

/**
 * Interal metadata provider that should be used only within metadata package
 * @type {{getTypeDescriptor: ((type:Type<any>)=>TypeMetadataInternal)}}
 */
export const metadataInternal = {
    /**
     * Retrieve some type metadata.
     * This should not be used from outside of metadata package!
     * @param type
     * @returns {TypeMetadataInternal}
     */
    getTypeDescriptor: (type: Type<any>):TypeMetadataInternal => {
        return metadataCollection.getOrCreateTypeMetadata(type);
    }
}

/**
 * Public data provider for registered type metadata
 * @type {{hasMetadata: ((type:Type<any>)=>boolean); getTypeDescriptor: ((type:Type<any>)=>TypeMetadata)}}
 */
export const metadata = {
    /**
     * Check if particular type has registered metadata
     * @param type
     * @returns {boolean}
     */
    hasMetadata:(type:Type<any>):boolean => {
        return metadataCollection.typeMetadataIsRegistered(type);
    },

    /**
     * Retrieve some type metadataInternal
     * @param type
     * @returns {TypeMetadataInternal}
     */
    getTypeDescriptor:(type:Type<any>):TypeMetadata => {
        return metadataCollection.getTypeMetadataExportFormat(type);
    },

    /**
     * Get inherited metadata for some instance (including its own prototype)
     * @param instance Any class instance that might be inheriting from any of metadata clients
     * @returns {TypeMetadata[]} A collection of all metadata entries that can be matched with instance
     */
    getInheritedMetadata(instance:any):TypeMetadata[] {
        return metadataCollection.getInheritedMetadata(instance);
    }
}