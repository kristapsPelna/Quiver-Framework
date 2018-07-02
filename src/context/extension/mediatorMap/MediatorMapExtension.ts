import {Context} from "../../Context";
import {ContextExtension} from "../../data/ContextExtension";
import {MediatorMap} from "../../../mediatorMap/MediatorMap";
import {ContextModuleEvent} from "../../event/ContextModuleEvent";
import {ContextLifecycleEvent} from "../../event/ContextLifecycleEvent";
/**
 * Maps mediator map to context scope
 * @author Jānis Radiņš
 */
export class MediatorMapExtension implements ContextExtension {

    private context: Context;
    private mediatorMap: MediatorMap;

    extend(context: Context): void {
        this.context = context;

        context.injector.map(MediatorMap).asSingleton().seal();

        this.mediatorMap = context.injector.get(MediatorMap);

        //TODO: Add mediator map clear functionality as context is destroyed
        context.listenOnce(ContextLifecycleEvent.POST_INITIALIZE, this.removeInitListeners, this);

        context.addEventListener(ContextModuleEvent.REGISTER_MODULE, this.createModuleMappings, this)
            .withGuards((event: ContextModuleEvent): boolean => {
                return !!(event.moduleDescriptor && event.moduleDescriptor.mediate);
            });
    }

    private removeInitListeners(): void {
        this.context.removeAllEventListeners(this);
    }

    private createModuleMappings(event: ContextModuleEvent): void {
        for (let mapping of event.moduleDescriptor.mediate) {
            this.mediatorMap.map(mapping.view, mapping.mediator);
        }
    }

}
