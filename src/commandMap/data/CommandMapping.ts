import {EventGuard} from "../../eventDispatcher/api/EventGuard";
/**
 * Interface describing public API of a Command Mapping returned by CommandMap map().
 * @author Jānis Radiņš / Kristaps Peļņa
 */
export interface CommandMapping {
    /**
     * Mark event mapping to be executed only once.
     * @returns {EventMappingImpl} so we can call other methods of this class instantly from return value
     */
    once():this;

    /**
     * Set event guards which could prevent event listener to be executed upon some circumstances known only to
     * guards themselves.
     * @param guards List of EventGuard callback methods that might prevent execution of listener.
     * @returns {EventMappingImpl} so we can call other methods of this class instantly from return value
     */
    withGuards(... guards:EventGuard[]):this;
}