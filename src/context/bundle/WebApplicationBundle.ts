import {EventDispatcherExtension} from "../extension/eventDispatcher/EventDispatcherExtension";
import {CommandMapExtension} from "../extension/commandMap/CommandMapExtension";
import {MediatorMapExtension} from "../extension/mediatorMap/MediatorMapExtension";
import {ContextExtension} from "../data/ContextExtension";
/**
 * Default listing of Context extensions for standard web application.
 * @type {[EventDispatcherExtension,CommandMapExtension,MediatorMapExtension]}
 */
export const WebApplicationBundle:any[] = [
    EventDispatcherExtension,
    CommandMapExtension,
    MediatorMapExtension
];


