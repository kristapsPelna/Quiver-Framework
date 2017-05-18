import {Command} from "./Command";
import {AsyncCommand} from "./AsyncCommand";
import {Type} from "../../type/Type";
import {Injector} from "../../injector/Injector";
import {Inject} from "../../metadata/decorator/Inject";
import {EventGuard} from "../../eventDispatcher/api/EventGuard";
import {Event} from "../../eventDispatcher/event/Event";

/**
 * Macro command provides the functionality of sequential execution of a sub-command batch.
 * @author Kristaps Peļņa
 */
export class MacroCommand extends AsyncCommand {

    @Inject()
    protected injector:Injector;

    @Inject()
    protected event:Event;

    protected subCommands:{
        commandType:Type<Command>,
        guards?:EventGuard[]
    }[] = [];

    //--------------------
    //  Public methods
    //--------------------

    /**
     * Add a command to the end of the command list.
     * @param commandType Type of the Command
     * @param guards Optional list of event guards for this commands execution
     * @returns {MacroCommand}
     */
    add(commandType:Type<Command>, guards?:EventGuard[]):this {
        if (!commandType) {
            throw new Error("MacroCommand: Can not add a null command!");
        }

        this.subCommands.push({
            commandType:commandType,
            guards:guards
        });
        return this;
    }

    /**
     * Remove a command from the sub-command list.
     * @param commandType Type of the Command by which it was added
     * @returns {MacroCommand}
     */
    remove(commandType:Type<Command>):this {
        if (!commandType) {
            throw new Error("MacroCommand: Can not remove a null command!");
        }

        let index:number = this.subCommands.indexOf(
            this.getSubCommand(commandType)
        );
        if (index === -1) {
            throw new Error("MacroCommand: A command must be added before it can be removed. Command: " + commandType);
        }

        this.subCommands.splice(index, 1);
        return this;
    }

    /**
     * Check if this MacroCommand has a specific commandType
     * @param commandType
     * @returns {boolean}
     */
    has(commandType:Type<Command>):boolean {
        return !!this.getSubCommand(commandType);
    }

    /**
     * Main macro command execution entry.
     */
    execute():void {
        this.executeNextCommand();
    }

    //--------------------
    //  Private methods
    //--------------------

    /**
     * Get Command type and guard data
     * @param commandType Command type
     * @returns {any}
     */
    private getSubCommand(commandType:Type<Command>):{commandType:Type<Command>, guards?:EventGuard[]} {
        for (let subCommand of this.subCommands) {
            if (subCommand.commandType === commandType) {
                return subCommand;
            }
        }
        return null;
    }

    /**
     * Find if command execution is allowed by guards.
     * @returns {boolean} True if guards aren't set or none of them has reason to stop execution.
     */
    private executionAllowedByGuards(guards?:EventGuard[]):boolean {
        if (!guards) {
            return true;
        }
        for (let guard of guards) {
            if (!guard(this.event)) {
                return false;
            }
        }
        return true;
    }

    //--------------------
    //  Protected methods
    //--------------------

    /**
     * Execute next command from the subCommands list as FiFo (first in, first out).
     * If there are no commands left, executeComplete will be called.
     */
    protected executeNextCommand():void {
        if (this.subCommands.length === 0) {
            this.complete();
            return;
        }

        let commandDescriptor:{
            commandType:Type<Command>,
            guards?:EventGuard[]
        } = this.subCommands.shift();

        //If execution is blocked by a guard, then move to the next command at once
        if (!this.executionAllowedByGuards(commandDescriptor.guards)) {
            this.executeNextCommand();
            return;
        }

        let command:Command = this.injector.instantiateInstance(commandDescriptor.commandType);

        if (command instanceof AsyncCommand) {
            (command as AsyncCommand).listenOnComplete(
                () => this.commandComplete(command, commandDescriptor.commandType)
            );
            command.execute();
        } else {
            command.execute();
            this.commandComplete(command, commandDescriptor.commandType);
        }
    }

    /**
     * Executed on each command complete.
     * @param commandInstance Instance of the command which has just completed
     * @param commandType Type/class of the executed command
     */
    protected commandComplete(commandInstance:Command, commandType:Type<Command>):void {
        this.executeNextCommand();
    }

}