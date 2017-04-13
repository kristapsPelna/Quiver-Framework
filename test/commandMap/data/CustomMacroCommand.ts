import {MacroCommand} from "../../../src/commandMap/command/MacroCommand";
import {CustomCommand} from "./CustomCommand";
import {CustomCommand2} from "./CustomCommand2";
import {CustomAsyncCommand} from "./CustomAsyncCommand";
import {AsyncCommand} from "../../../src/commandMap/command/AsyncCommand";
import {Type} from "../../../src/type/Type";
import {Command} from "../../../src/commandMap/command/Command";
/**
 * Custom Macro command used for tests
 * @author Kristaps Peļņa
 */
export class CustomMacroCommand extends MacroCommand {

    /**
     * Async test callback function
     */
    static done:Function;

    private commandOrder:Type<Command|AsyncCommand>[] = [
        CustomAsyncCommand,
        CustomCommand,
        CustomCommand2
    ];

    constructor() {
        super();

        for (let command of this.commandOrder) {
            this.add(command);
        }
    }

    protected commandComplete(commandInstanceOrPromise:any, commandType:Type<Command>):void {
        let expectedCommandType:Type<Command> = this.commandOrder.shift();

        if (commandType !== expectedCommandType) {
            throw new Error("MacroCommand command execution order is not correct");
        }
        super.commandComplete(commandInstanceOrPromise, commandType);
    }

    complete():void {
        super.complete();

        if (CustomMacroCommand.done) {
            CustomMacroCommand.done();
        }
    }
}