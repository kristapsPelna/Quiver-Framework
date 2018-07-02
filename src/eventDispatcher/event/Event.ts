/**
 * Basic event class which holds event type and data properties and which can be used as it is or
 * could be extended by any custom event class.
 * @author Jānis Radiņš
 */
export class Event {

    private _defaultPrevented: boolean = false;

    /**
     * Create new instance
     * @param {string} type Event string type
     * @param data Data shipped along with event notification, if any
     */
    constructor(public readonly type: string,
                public readonly data?: any
    ) {
    }

    /**
     * Flag which indicates that somewhere within event listeners default event action has been prevented
     * @returns {boolean}
     */
    get defaultPrevented(): boolean {
        return this._defaultPrevented;
    }

    /**
     * Prevent event default action
     */
    preventDefault(): void {
        this._defaultPrevented = true;
    }

    /**
     * Get a string representation of the event
     * @returns {string}
     */
    toString(): string {
        return `[Event type=${this.type}, data=${this.data}]`;
    }

}
