import {EventMapping} from "./api/EventMapping";
import {EventMappingImpl} from "./api/impl/EventMappingImpl";
import {EventListener} from "./api/EventListener";
import {Event} from "./event/Event";

/**
 * Event dispatcher class which implements event exchange functionality.
 * @author Jānis Radiņš / Kristaps Peļņa
 */
export class EventDispatcher {

    /**
     * List of all event mappings known to event dispatcher
     */
    private eventMap: EventMappingImpl[] = [];

    //--------------------
    //  Public methods
    //--------------------

    /**
     * Add event listener.
     * @param event     Event name for which to listen to
     * @param listener  Listener function that will be invoked as event with specified name is dispatched.
     * @param scope     Listener scope which will be applied as listener is invoked. (You can leave it undefined,
     * if you don't care about scope that much).
     * @returns {EventMapping} Null in case if event name is already mapped to same function. Or EventMapping object
     * which is to be used in order to set some of mapping properties like <code>once()</code> which will make listener
     * to be executed upon first event dispatch and then be gone.
     */
    addEventListener(event: string, listener: EventListener, scope?: Object): EventMapping {
        if (!event) {
            throw new Error("EventDispatcher: Listener can not be added to an invalid event");
        }
        if (!listener) {
            throw new Error("EventDispatcher: Invalid listener can not be added");
        }

        if (this.getEventMappings(event, listener, scope).length === 0) {
            return this.createMapping(event, listener, scope);
        }

        const message = `EventDispatcher: addListener already has a mapping. Remove it before calling addListener again.`;
        const info = `event:${event} listener:${listener} scope:${scope}`;
        console.warn(message + " " + info);

        return null;
    }

    /**
     * Add event listener that will be executed only once.
     * @param event     Event name for which to listen to
     * @param listener  Listener function that will be invoked as event with specified name is dispatched.
     * @param scope     Listener scope which will be applied as listener is invoked. (You can leave it undefined,
     * if you don't care about scope that much).
     * @returns {EventMapping} Null in case if event name is already mapped to same function. Or EventMapping object
     * which is to be used in order to set some of mapping properties like <code>once()</code> which will make listener
     * to be executed upon first event dispatch and then be gone.
     */
    listenOnce(event: string, listener: EventListener, scope?: Object): EventMapping {
        return this.addEventListener(event, listener, scope).once();
    }

    /**
     * Check if event dispatcher has mapping of certain event to listener.
     * @param event     Target event name.
     * @param listener  Listener function.
     * @param scope     Listener scope which will be applied as listener is invoked.
     * @returns {boolean} true if event mapping is found and false otherwise
     */
    hasEventListener(event: string, listener?: EventListener, scope?: Object): boolean {
        return this.getEventMappings(event, listener, scope).length > 0;
    }

    /**
     * Remove event listener.
     * @param event     Target event name.
     * @param listener  Listener function.
     * @param scope     Listener scope which will be applied as listener is invoked.
     * @returns {boolean} True if event name binding to listener function was found or false if it was found not.
     */
    removeEventListener(event: string, listener: EventListener, scope?: Object): boolean {
        if (!event) {
            throw new Error("EventDispatcher: Listener can not be removed from an invalid event");
        }
        if (!listener) {
            throw new Error("EventDispatcher: Invalid listener can not be removed");
        }

        const mappings = this.getEventMappings(event, listener, scope);
        if (mappings.length === 0) {
            //No event name to listener mapping has been found
            return false;
        }
        if (mappings.length > 1) { //This should really never happen
            throw new Error("For some reason there are multiple event to listener mappings - that's a clear error!");
        }

        const index = this.eventMap.indexOf(mappings[0]);
        //The index should always be valid because getEventMappings is getting the mapping from the same array
        this.eventMap.splice(index, 1);

        return true;
    }

    /**
     * Remove all listeners of a particular event from all scopes or the specified scope.
     * @param eventType Event name to be unmapped from all listeners.
     * @param scope     Listener scope from which all listeners mapped to eventType will be removed.
     * @returns {boolean} True if any of mappings have been found; false otherwise.
     */
    removeEventListeners(eventType: string, scope?: Object): boolean {
        const mappings = this.getEventMappings(eventType, null, scope);
        return this.removeMappings(mappings);
    }

    /**
     * Remove all listeners registered with specified scope or with the whole dispatcher instance.
     * @param scope     Scope from which all listeners mapped listeners will be removed. If not specified,
     * all listeners will be removed from whole dispatcher instance.
     * @returns {boolean} True if any listeners to remove where found; false otherwise.
     */
    removeAllEventListeners(scope?: Object): boolean {
        if (this.eventMap.length === 0) {
            return false;
        }

        if (!scope) {
            this.eventMap = [];
            return true;
        }

        const mappings = this.getEventMappings(null, null, scope);
        return this.removeMappings(mappings);
    }

    /**
     * Dispatch event object to all subscribed listeners.
     * @param event Event object that defines event type and data
     * @returns {boolean} True if default action of event has not been prevented in any of its listeners.
     */
    dispatchEvent(event: Event): boolean;

    /**
     * Dispatch event notification by separate type and data arguments.
     * @param eventType Event type to be dispatched.
     * @param eventData  Arbitrary data to ship along with event dispatch.
     * @returns {boolean} True if default action of event has not been prevented in any of its listeners
     */
    dispatchEvent(eventType: string, eventData?: any): boolean;

    /**
     * Implement event dispatch from any of method signatures
     * @param eventTypeOrEvent Event type or Event
     * @param eventData Arbitrary data to ship along with event dispatch.
     * @returns {boolean} True if default action of event has not been prevented in any of its listeners
     * @private
     */
    dispatchEvent(eventTypeOrEvent: Event | string, eventData?: any): boolean {
        if (!eventTypeOrEvent) {
            throw new Error("EventDispatcher: Event type or name can not be null");
        }

        const event = eventTypeOrEvent instanceof Event ? eventTypeOrEvent : new Event(eventTypeOrEvent, eventData);

        return this.dispatchEventImpl(event);
    }

    //--------------------
    //  Private methods
    //--------------------

    /**
     * Lookup event mappings by event name or name and listener combination.
     * @param eventType     Event name to look bindings for.
     * @param listener  Listener which, if provided, will also be used as mappings filter criteria.
     * @param scope     Scope upon which listener should be executed.
     * @returns {EventMappingImpl[]} List of event mappings or empty list if no mappings are found.
     */
    private getEventMappings(eventType: string, listener?: EventListener, scope?: Object): EventMappingImpl[] {
        const mappings: EventMappingImpl[] = [];
        for (const mapping of this.eventMap) {
            if (eventType && mapping.event !== eventType) {
                continue;
            }
            if (listener && mapping.listener !== listener) {
                continue;
            }
            if (scope && mapping.context !== scope) {
                continue;
            }
            mappings.push(mapping);
        }
        return mappings;
    }

    /**
     * Create a new event mapping.
     * @param event     Event name for which mapping will be created
     * @param listener  Listener function which will be mapped.
     * @param scope     Listener scope which will be mapped.
     * @returns {EventMappingImpl} Instance of the created event mapping.
     */
    private createMapping(event: string, listener: EventListener, scope?: Object): EventMappingImpl {
        const mapping = new EventMappingImpl(event, listener, scope);
        this.eventMap.push(mapping);
        return mapping;
    }

    /**
     * Remove provided event mappings.
     * @param mappings  All mappings to be removed.
     * @returns {boolean} True if mappings have been removed; false if provided mappings are empty.
     */
    private removeMappings(mappings: EventMappingImpl[]): boolean {
        if (!mappings || mappings.length === 0) {
            return false;
        }
        while (mappings.length > 0) {
            const mapping = mappings.shift();
            this.removeEventListener(mapping.event, mapping.listener, mapping.context);
        }
        return true;
    }

    //--------------------
    //  Private methods
    //--------------------

    /**
     * Implement actual event dispatching
     * @param event Event to dispatch
     * @returns {boolean} True if default action of event has not been prevented in any of its listeners
     */
    protected dispatchEventImpl(event: Event): boolean {
        const mappings = this.getEventMappings(event.type);
        if (mappings.length === 0) {
            return true;
        }

        while (mappings.length > 0) {
            const mapping = mappings.shift();
            if (!mapping.executionAllowedByGuards(event)) {
                continue;
            }
            mapping.listener.apply(mapping.context, [event]);
            if (mapping.executeOnce) {
                this.removeEventListener(mapping.event, mapping.listener, mapping.context);
            }
        }

        return !event.defaultPrevented;
    }

    //--------------------
    //  Public properties
    //--------------------

    /**
     * Number of active listeners on this dispatcher instance.
     * @returns {number}
     */
    get listenerCount(): number {
        return this.eventMap.length;
    }

}