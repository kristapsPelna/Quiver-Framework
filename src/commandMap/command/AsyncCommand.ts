import {Command} from "./Command";
import {EventDispatcher} from "../../eventDispatcher/EventDispatcher";
import {EventListener} from "../../eventDispatcher/api/EventListener";
/**
 * Asynchronous command implementation
 * @author Kristaps Peļņa
 */
export class AsyncCommand extends Command {

    private static readonly COMPLETE_EVENT = "asyncCommandComplete";

    /**
     * Private event dispatcher instance for callback delivery.
     */
    private eventDispatcher = new EventDispatcher();

    //--------------------
    //  Public methods
    //--------------------

    /**
     * Invoked as command is executed
     */
    execute(): void {

    }

    /**
     * Provide a listener and optional scope to be called when this command is completed
     * @param listener Event listener function
     * @param scope Scope of the listener function
     */
    listenOnComplete(listener: EventListener, scope?: Object): void {
        this.eventDispatcher.listenOnce(AsyncCommand.COMPLETE_EVENT, listener, scope);
    }

    //--------------------
    //  Protected methods
    //--------------------

    /**
     * Should be executed when the command has finished
     */
    protected complete(): void {
        this.eventDispatcher.dispatchEvent(AsyncCommand.COMPLETE_EVENT, this);
        this.eventDispatcher.removeAllEventListeners();
        this.eventDispatcher = null;
    }

}