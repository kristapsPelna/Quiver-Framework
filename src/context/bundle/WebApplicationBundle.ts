import {EventDispatcherExtension} from "../extension/eventDispatcher/EventDispatcherExtension";
import {CommandMapExtension} from "../extension/commandMap/CommandMapExtension";
import {MediatorMapExtension} from "../extension/mediatorMap/MediatorMapExtension";

/**
 * Default listing of Context extensions for standard web application.
 * @type {[EventDispatcherExtension,CommandMapExtension,MediatorMapExtension]}
 * @author Kristaps Peļņa
 */
export const WebApplicationBundle:any[] = [
    EventDispatcherExtension,
    CommandMapExtension,
    MediatorMapExtension
];
