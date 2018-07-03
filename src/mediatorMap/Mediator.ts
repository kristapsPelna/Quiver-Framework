import {PostConstruct} from "../metadata/decorator/PostConstruct";
import {PreDestroy} from "../metadata/decorator/PreDestroy";
/**
 * Mediator class represents class which will be created as a mapped mediator.
 * @author Jānis Radiņš
 */
export abstract class Mediator {

    /**
     * Initialize mediator.
     */
    @PostConstruct()
    initialize(): void {

    }

    /**
     * Destroy mediator.
     */
    @PreDestroy()
    destroy(): void {

    }

}