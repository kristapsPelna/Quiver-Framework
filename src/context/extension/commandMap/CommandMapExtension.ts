import {ContextExtension} from "../../data/ContextExtension";
import {Context} from "../../Context";
import {EventDispatcher} from "../../../eventDispatcher/EventDispatcher";
import {ContextLifecycleEvent} from "../../event/ContextLifecycleEvent";
import {CommandMap} from "../../../commandMap/CommandMap";
import {EventDispatcherForCommandMap} from "./impl/EventDispatcherForCommandMap";
import {InjectionMapping} from "../../../injector/data/InjectionMapping";
import {ContextModuleEvent} from "../../event/ContextModuleEvent";

/**
 * Add this extension in order to add support for CommandMap which is receiving its trigger calls from EventDispatcher.
 * Upon some custom config this extension can be omitted and substituted to other or no implementation.
 * @author Jānis Radiņš
 */
export class CommandMapExtension implements ContextExtension {

    private context: Context;
    private commandMapMapping: InjectionMapping;
    private commandMap: CommandMap;

    extend(context: Context): void {
        this.context = context;

        // Map default CommandMap implementation to injector but don't seal it yet before Context is not initialized
        this.commandMapMapping = context.injector.map(CommandMap).asSingleton();

        context.listenOnce(ContextLifecycleEvent.PRE_INITIALIZE, this.mapCustomEventDispatcher, this);
        context.listenOnce(ContextLifecycleEvent.INITIALIZE, this.sealCommandMap, this);
        context.listenOnce(ContextLifecycleEvent.POST_INITIALIZE, this.removeInitListeners, this);
        context.listenOnce(ContextLifecycleEvent.DESTROY, this.clearCommandMap, this);

        context.addEventListener(ContextModuleEvent.REGISTER_MODULE, this.createModuleMappings, this)
            .withGuards(({moduleDescriptor}: ContextModuleEvent) => !!(moduleDescriptor && moduleDescriptor.commandMap));
    }

    private mapCustomEventDispatcher(): void {
        // If default event dispatcher is already mapped - remove it
        if (this.context.injector.hasDirectMapping(EventDispatcher)) {
            this.context.injector.unMap(EventDispatcher);
        }
        // And replace it with custom implementation that will forward event dispatches to CommandMap
        this.context.injector.map(EventDispatcher).toSingleton(EventDispatcherForCommandMap);
    }

    private sealCommandMap(): void {
        this.commandMapMapping.seal();
        this.commandMap = this.context.injector.get(CommandMap);
    }

    private clearCommandMap(): void {
        // Clear all command mappings as context is destroyed
        this.commandMap.unMap();
    }

    private removeInitListeners(): void {
        this.context.removeAllEventListeners(this);
    }

    private createModuleMappings({moduleDescriptor: {commandMap}}: ContextModuleEvent): void {
        for (const {event, command, once} of commandMap) {
            (Array.isArray(command) ? command : [command]).forEach(command => {
                const mapping = this.commandMap.map(event, command);
                if (once === true) {
                    mapping.once();
                }
            });
        }
    }

}
