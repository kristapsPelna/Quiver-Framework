import {Command} from "../../../src/commandMap/command/Command";
/**
 * Custom Command class for testing purposes
 * @author Kristaps Peļņa
 */
export class CustomCommand extends Command {

    /**
     * Async test callback function
     */
    static done:() => void;

    constructor() {
        super();
    }

    execute():void {
        //Trigger the Async test complete callback.
        if (CustomCommand.done) {
            CustomCommand.done();
        }
    }

}