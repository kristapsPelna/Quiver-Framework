import {EventDispatcher} from "../../../../eventDispatcher/EventDispatcher";
import {Event} from "../../../../eventDispatcher/event/Event";
import {CommandMap} from "../../../../commandMap/CommandMap";
import {Injectable} from "../../../../metadata/decorator/Injectable";
/**
 * Custom implementation of EventDispatcher that will trigger command map each time EventDispatcher receives
 * event dispatch
 * @author Jānis Radiņš
 */
@Injectable()
export class EventDispatcherForCommandMap extends EventDispatcher {

    constructor(private commandMap:CommandMap) {
        super();
    }

    dispatchEventImpl(event:Event):boolean {
        this.commandMap.trigger(event);
        return super.dispatchEventImpl(event);
    }

}