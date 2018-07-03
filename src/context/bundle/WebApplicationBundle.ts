import {EventDispatcherExtension} from "../extension/eventDispatcher/EventDispatcherExtension";
import {CommandMapExtension} from "../extension/commandMap/CommandMapExtension";
import {MediatorMapExtension} from "../extension/mediatorMap/MediatorMapExtension";
import {Type} from "../../type/Type";
import {ContextExtension} from "../data/ContextExtension";

/**
 * Default listing of Context extensions for standard web application.
 * @type {Type<ContextExtension>[]}
 * @author Kristaps Peļņa
 */
export const WebApplicationBundle: Type<ContextExtension>[] = [
    EventDispatcherExtension,
    CommandMapExtension,
    MediatorMapExtension
];
