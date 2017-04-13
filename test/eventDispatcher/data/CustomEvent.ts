import {Event} from "../../../src/eventDispatcher/event/Event";
/**
 * Custom Event class for testing purposes
 * @author Kristaps Peļņa
 */
export class CustomEvent extends Event {

    constructor(type:string, data?:any) {
        super(type, data);
    }

}