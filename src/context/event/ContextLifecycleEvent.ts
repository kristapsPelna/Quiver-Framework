import {Context} from "../Context";
import {Event} from "../../eventDispatcher/event/Event";
/**
 * Context lifecycle event represents different stages in Context life
 * @author Jānis Radiņš
 */
export class ContextLifecycleEvent extends Event {
    /**
     * Dispatched as context is just about to be initialized
     * @type {string}
     */
    static readonly PRE_INITIALIZE:string = "preInitialize";
    /**
     * Dispatched as pre initialize is done and actual initialization of Context injector and modules will take place
     * @type {string}
     */
    static readonly INITIALIZE:string = "initialize";
    /**
     * Dispatched as Context initialization is complete
     * @type {string}
     */
    static readonly POST_INITIALIZE:string = "postInitialize";
    /**
     * Dispatched as Context destroy is just about to begin.
     * @type {string}
     */
    static readonly PRE_DESTROY:string = "preDestroy";
    /**
     * Dispatched as actual destroy of Context is performed.
     * @type {string}
     */
    static readonly DESTROY:string = "clearCommandMap";
    /**
     * Dispatched as destroyal of Context is complete
     * @type {string}
     */
    static readonly POST_DESTROY:string = "postDestroy";

    /**
     * Create new instance
     * @param type Event type
     * @param context Context instance that originated event
     */
    constructor(type:string, public context:Context) {
        super(type);
    }

}