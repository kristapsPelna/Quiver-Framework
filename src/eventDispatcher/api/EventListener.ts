import {Event} from "../event/Event";
/**
 * Describes a method that is used as an event listener call, optionally receiving the event data
 * as the parameter.
 * @author Kristaps Peļņa
 */
export interface EventListener {

    /**
     * @param event Optional parameter for receiving Event data passed by the event dispatch.
     */
    (event?: Event): void;
}