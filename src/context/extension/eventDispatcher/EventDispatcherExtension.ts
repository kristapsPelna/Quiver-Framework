import {ContextExtension} from "../../data/ContextExtension";
import {Context} from "../../Context";
import {EventDispatcher} from "../../../eventDispatcher/EventDispatcher";
import {ContextLifecycleEvent} from "../../event/ContextLifecycleEvent";
/**
 * Event dispatcher extension which adds EventDispatcher singleton to Context scope.
 * @author Jānis Radiņš
 */
export class EventDispatcherExtension implements ContextExtension {

    private context:Context;

    extend(context: Context): void {
        this.context = context;

        /**
         * Map default implementation of EventDispatcher to injector but don't seal it right now as
         * we assume that before context initialization some custom EventDispatcher might take place of
         * a default one
         */
        context.injector.map(EventDispatcher).asSingleton();

        context.listenOnce(ContextLifecycleEvent.INITIALIZE, this.sealEventDispatcher, this);
        context.listenOnce(ContextLifecycleEvent.DESTROY, this.clearEventDispatcher, this);
    }

    /**
     * Context is about to initialize - seal EventDispatcher so all parties of application receive same instance
     */
    private sealEventDispatcher():void {
        this.context.injector.getMapping(EventDispatcher).seal();
    }

    /**
     * Remove all listeners from EventDispatcher as Context is destroyed
     */
    private clearEventDispatcher():void {
        this.context.injector.get(EventDispatcher).removeAllEventListeners();
    }
}
