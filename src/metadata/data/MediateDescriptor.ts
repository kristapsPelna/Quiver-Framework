import {Type} from "../../type/Type";
import {Mediator} from "../../mediatorMap/Mediator";
/**
 * Module mediation instructions descriptor.
 * @author Jānis Radiņš
 */
export interface MediateDescriptor {

    /**
     * Reference to view type or interface it implemented upon which it should be matched, in order to create
     * mediator for view.
     * (any is added due to the fact that abstract classes do not resolve as Type)
     */
    readonly view: Type | any;

    /**
     * Mediator type that should be created as anything that can be matched as type defined in view
     * property is added to display list.
     */
    readonly mediator: Type<Mediator>;

}