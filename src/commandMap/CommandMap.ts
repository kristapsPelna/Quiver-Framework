import {Command} from "./command/Command";
import {Event} from "../eventDispatcher/event/Event";
import {CommandMappingImpl} from "./data/impl/CommandMappingImpl";
import {Type} from "../type/Type";
import {CommandMapping} from "./data/CommandMapping";
import {Inject} from "../metadata/decorator/Inject";
import {Injector} from "../injector/Injector";
import {AsyncCommand} from "./command/AsyncCommand";
import {typeReferenceToString} from "../util/StringUtil";

/**
 * Event command map describes event name to command class mappings and is useful as small pieces of control code
 * should be executed upon some event notification.
 * @author Jānis Radiņš / Kristaps Peļņa
 */
export class CommandMap {

    @Inject()
    protected injector:Injector;

    //Private storage to all command mappings
    private commandMappings:CommandMappingImpl[] = [];

    //--------------------
    //  Public methods
    //--------------------

    /**
     * Map event notification to a command class.
     * @param eventType String event name which will tiger execution of a command.
     * @param command   Command class which should implement <code>Command</code> interface or, at least,
     * should have execute method defined with same signature.
     * @returns {CommandMapping} data object which describes mapping and can be used to set command execution
     * only once; or null in case if mapping of requested event type is already mapped to class instance.
     */
    map(eventType:string, command:Type<Command>):CommandMapping {
        if (!eventType) {
            throw new Error("CommandMap: A command can not be mapped to an undefined event");
        }
        if (!command) {
            throw new Error("CommandMap: Only valid Commands can be mapped to events");
        }
        let mappings:CommandMappingImpl[] = this.getEventToCommandMappings(eventType);
        for (let mapping of mappings) {
            if (mapping.command === command) {
                let message:string = "CommandMap: Event to command mapping already exists. UnMap it before calling map again.";
                let info:string = "event:" + eventType + " command:" + typeReferenceToString(command);
                console.warn(message + " " + info);
                return null;
            }
        }

        let mapping:CommandMappingImpl = new CommandMappingImpl(eventType, command);
        this.commandMappings.push(mapping);

        return mapping;
    }

    /**
     * Remove all command mappings from all event type.
     * @returns {boolean} which indicates if the unMapping has been successful.
     */
    unMap():boolean;

    /**
     * Remove all command mappings for the specified event type.
     * @param eventType     Event type which is mapped to commands.
     * @returns {boolean} which indicates if the unMapping has been successful.
     */
    unMap(eventType:string):boolean;

    /**
     * Remove event type to command mapping.
     * @param eventType     Event type which is mapped to a command.
     * @param command   Command class which should be unmapped.
     * @returns {boolean} which indicates if the unMapping has been successful.
     */
    unMap(eventType:string, command:Type<Command>):boolean;

    /**
     * Remove event name to command mapping.
     * @param eventType     Event name which is mapped to a command.
     * @param command   Event command class which should be unmapped.
     * @returns {boolean} which indicates if the unMapping has been successful.
     * @private
     */
    unMap(eventType?:string, command?:Type<Command>):boolean {
        if (this.commandMappings.length < 1) {
            return false;
        }

        //If eventType is not specified, remove all mappings
        if (!eventType) {
            this.commandMappings = [];
            return true;
        }

        let mappings:CommandMappingImpl[] = this.getEventToCommandMappings(eventType, command);
        if (mappings.length === 0) {
            return false; //no mappings found
        }

        while (mappings.length > 0) {
            let mapping:CommandMappingImpl = mappings.shift();
            this.commandMappings.splice(this.commandMappings.indexOf(mapping), 1);
        }

        return true;
    }

    /**
     * Trigger all commands which are mapped to this event.
     * @param event Event object that defines event type and data
     */
    trigger(event:Event):void|Error;

    /**
     * Trigger all commands which are mapped to event name.
     * @param eventType String event name commands mapped to which must be invoked.
     * @param eventData Arbitrary data to be passed along with command invocation.
     */
    trigger(eventType:string, eventData?:any):void|Error;

    /**
     * Trigger all commands which are mapped to event name.
     * @param eventTypeOrEvent Event type or Event
     * @param eventData Arbitrary data to be passed along with command invocation.
     * @private
     */
    trigger(eventTypeOrEvent:Event|string, eventData?:any):void|Error {
        if (!eventTypeOrEvent) {
            throw new Error("CommandMap: Event type or value can not be null");
        }
        const event:Event = eventTypeOrEvent instanceof Event ? eventTypeOrEvent : new Event(eventTypeOrEvent, eventData);

        let commands:CommandMappingImpl[] = this.getEventToCommandMappings(event.type);
        while (commands.length > 0) {
            let command:CommandMappingImpl = commands.shift();
            //Execute command only if execution is allowed by guards
            if (!command.executionAllowedByGuards(event)) {
                continue;
            }

            this.executeCommand(command, event);
        }
    }

    //--------------------
    //  Private methods
    //--------------------

    /**
     * Get list of all commands assigned to particular event name.
     * @param eventType   String event name which is a target.
     * @param command Command to which event is mapped or nothing in case if that is not required look up param.
     * @returns {CommandMappingImpl[]} List of commands mappings attached to requested event type.
     */
    private getEventToCommandMappings(eventType:string, command?:Type<Command>):CommandMappingImpl[] {
        let mappings:CommandMappingImpl[] = [];
        for (let mapping of this.commandMappings) {
            if (mapping.eventType !== eventType) {
                continue;
            }
            if (command && mapping.command !== command) {
                continue;
            }
            mappings.push(mapping);
        }
        return mappings;
    }

    /**
     * Create command instance and execute it.
     */
    private executeCommand(commandMapping:CommandMappingImpl, event:Event):void {
        let commandInstance:Command = this.createCommandInstance(commandMapping, event);

        if (commandInstance instanceof AsyncCommand) {
            commandInstance.listenOnComplete(
                () => this.injector.destroyInstance(commandInstance)
            );
            commandInstance.execute();
        } else {
            commandInstance.execute();
            this.injector.destroyInstance(commandInstance);
        }

        if (commandMapping.executeOnce) {
            this.unMap(commandMapping.eventType, commandMapping.command);
        }
    }

    //--------------------
    //  Protected methods
    //--------------------
    
    /**
     * Implementation of a routine how individual command instance is created.
     * (This functionality may be overridden by sub classes)
     */
    protected createCommandInstance(commandMapping:CommandMappingImpl, event:Event):Command {
        //Create a subInjector and provide a mapping of the Event by its class
        let subInjector:Injector = this.injector.createSubInjector();
        subInjector.map(<Type<any>> event.constructor).toValue(event);
        return subInjector.instantiateInstance(commandMapping.command);
    }

    //--------------------
    //  Public properties
    //--------------------

    /**
     * Number of active mappings on this Command Map instance.
     * @returns {number}
     */
    get mappingCount():number {
        return this.commandMappings.length;
    }
}
