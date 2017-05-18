import {Event} from "../../eventDispatcher/event/Event";
import {ModuleDescriptor} from "../../metadata/data/ModuleDescriptor";
import {Context} from "../Context";
import {Type} from "../../type/Type";

/**
 * Context module action event
 * @author Jānis Radiņš / Kristaps Peļņa
 */
export class ContextModuleEvent extends Event {

    /**
     * Dispatched as new module is registered with Context
     * @type {string}
     */
    static readonly REGISTER_MODULE:string = "registerModule";

    /**
     * Create new instance
     * @param type Event type
     * @param context Context instance that originated event
     * @param moduleDescriptor descripot of module is registered with Context
     */
    constructor(type:string,
                public readonly context:Context,
                public readonly moduleType:Type<any>,
                public readonly moduleDescriptor:ModuleDescriptor) {
        super(type);
    }
}
