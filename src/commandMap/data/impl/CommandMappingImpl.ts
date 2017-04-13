import {EventGuard} from "../../../eventDispatcher/api/EventGuard";
import {Event} from "../../../eventDispatcher/event/Event";
import {Type} from "../../../type/Type";
import {Command} from "../../command/Command";
import {CommandMapping} from "../CommandMapping";
/**
 * Data object to store event command mapping data.
 * @author Jānis Radiņš / Kristaps Peļņa
 */
export class CommandMappingImpl implements CommandMapping {

    private guards:EventGuard[];
    private _eventClass:Type<Event> = Event;
    private _executeOnce:boolean = false;

    /**
     * Create new command mapping.
     * @param eventType Event type command is mapped to.
     * @param command   Command class which to execute as event is encountered.
     */
    constructor(
        public readonly eventType:string,
        public readonly command:Type<Command>) {
    }

    /**
     * Event class type to get explicit event source filter.
     * Default value for this property is Event, hence it will work for any Event and its subclasses.
     * @returns {Type<Event>}
     */
    get eventClass():Type<Event> {
        return this._eventClass;
    }

    /**
     * Defines if this command mapping should be executed only once.
     * @returns {boolean}
     */
    get executeOnce():boolean {
        return this._executeOnce;
    }

    /**
     * Mark command mapping to be executed only once.
     */
    once():this {
        this._executeOnce = true;
        return this;
    }

    /**
     * Set event guards which could prevent command to be executed upon some circumstances known only to
     * guard.
     * @param guards List of Guards that might prevent execution of command.
     * @returns {CommandMappingImpl} so we can call other methods of this class instantly from return value
     */
    withGuards(... guards:EventGuard[]):this {
        this.guards = guards;
        return this;
    }

    /**
     * Find if event execution is allowed by guards.
     * @param event Event object data.
     * @returns {boolean} True if guards aren't set or none of them has reason to stop execution.
     */
    executionAllowedByGuards(event:Event):boolean {
        if (!this.guards) {
            return true;
        }
        for (let guard of this.guards) {
            if (!guard(event)) {
                return false;
            }
        }
        return true;
    }
}