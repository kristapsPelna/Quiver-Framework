import {AsyncCommand} from "../../../src/commandMap/command/AsyncCommand";
/**
 * Custom Asynchronous Command class for testing purposes
 * @author Kristaps Peļņa
 */
export class CustomAsyncCommand extends AsyncCommand {

    execute():void {
        setTimeout(
            () => this.complete(),
            10
        );
    }

}