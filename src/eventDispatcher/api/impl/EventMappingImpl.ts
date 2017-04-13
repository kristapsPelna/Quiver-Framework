import {EventGuard} from "../EventGuard";
import {EventMapping} from "../EventMapping";
import {EventListener} from "../EventListener";
import {Event} from "../../event/Event";

/**
 * Event mappings class used to describe single event name to listener mapping.
 * @author Jānis Radiņš
 */
export class EventMappingImpl implements EventMapping {

    private static EVENT_MAPPING_ID:number = 0;

    /**
     * Unique id of a mapping.
     * @returns {number}
     */
    readonly id:number = EventMappingImpl.EVENT_MAPPING_ID++;

    private guards:EventGuard[] = [];
    private _executeOnce:boolean = false;

    /**
     * Create new mapping
     * @param event     String event name.
     * @param listener  Listener function.
     * @param context   Listener scope to apply as it is executed
     */
    constructor(public readonly event:string,
                public readonly listener:EventListener,
                public readonly context:Object){
    }

    /**
     * Defines if this event mapping should be executed only once.
     * @returns {boolean}
     */
    get executeOnce():boolean {
        return this._executeOnce;
    }

    /**
     * Mark event mapping to be executed only once.
     * @returns {EventMappingImpl} so we can call other methods of this class instantly from return value
     */
    once():this {
        this._executeOnce = true;
        return this;
    }

    /**
     * Set event guards which could prevent event listener to be executed upon some circumstances known only to
     * guards themselves.
     * @param guards List of EventGuard callback methods that might prevent execution of listener.
     * @returns {EventMappingImpl} so we can call other methods of this class instantly from return value
     */
    withGuards(... guards:EventGuard[]):this {
        this.guards = this.guards.concat(guards);
        return this;
    }

    /**
     * Find if event execution is allowed by event mapping guards.
     * @param event Event object to be dispatched.
     * @returns {boolean} True if guards aren't set or none of them has reason to stop event execution.
     */
    executionAllowedByGuards(event:Event):boolean {
        for (let guard of this.guards) {
            if (!guard(event)) {
                return false;
            }
        }
        return true;
    }
}