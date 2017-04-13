import {EventGuard} from "./EventGuard";

/**
 * Interface which describes public API of a event mapping and which is not intended to be used outside EventDispatcher
 * addEventListener return.
 * @author Jānis Radiņš
 */
export abstract class EventMapping {

    /**
     * Unique id of a mapping.
     * @returns {number}
     */
    readonly id:number;

    /**
     * Mark event mapping to be executed only once.
     * @returns {EventMappingImpl} so we can call other methods of this class instantly from return value
     */
    abstract once():EventMapping;

    /**
     * Set event guards which could prevent event listener to be executed upon some circumstances known only to
     * guards themselves.
     * @param guards List of EventGuard callback methods that might prevent execution of listener.
     * @returns {EventMappingImpl} so we can call other methods of this class instantly from return value
     */
    abstract withGuards(... guards:EventGuard[]):EventMapping;
}