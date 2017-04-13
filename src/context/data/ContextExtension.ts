import {Context} from "../Context";
/**
 * Interface describing an extension of application context which should be implementing custom functionality
 * that should be available for a Context class, once this extension is installed.
 * @author Jānis Radiņš
 */
export interface ContextExtension {

    /**
     * Implement this method in order to retrieve reference to current context and add extra configuration to
     * context or subscribe to any of events listed in ContextLifecycleEvent class
     * @param context Current application context which is extended.
     */
    extend(context:Context):void;
}