
/**
 * Basic event class which holds event type and data properties and which should be extended
 * by any custom event class.
 * @author Jānis Radiņš
 */
export class Event {

    protected _data:any;

    constructor(type:string, data?:any) {
        this.type = type;
        this._data = data;
    }

    /**
     * Event string type
     */
    readonly type:string;

    /**
     * Data shipped along with event notification, if any
     * @returns {any}
     */
    get data(): any {
        return this._data;
    }

    /**
     * Get a string representation of the event
     * @returns {string}
     */
    toString():string {
        return `[Event type=${this.type}, data=${this.data}]`;
    }

}
