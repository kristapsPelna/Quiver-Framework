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
    static readonly REGISTER_MODULE = "registerModule";

    /**
     * Create new instance
     * @param {string} type
     * @param {Context} context
     * @param {Type} moduleType
     * @param {ModuleDescriptor} moduleDescriptor
     */
    constructor(type: string,
                public readonly context: Context,
                public readonly moduleType: Type,
                public readonly moduleDescriptor: ModuleDescriptor) {
        super(type);
    }
}
