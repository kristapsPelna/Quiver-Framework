
/**
 * Basic event class which holds event type and data properties and which should be extended
 * by any custom event class.
 * @author Jānis Radiņš
 */
export class Event {

    /**
     * Event string type
     */
    readonly type:string;

    /**
     * Data shipped along with event notification, if any
     */
    readonly data:any;

    constructor(type:string, data?:any) {
        this.type = type;
        this.data = data;
    }

    /**
     * Get a string representation of the event
     * @returns {string}
     */
    toString():string {
        return `[Event type=${this.type}, data=${this.data}]`;
    }

}
