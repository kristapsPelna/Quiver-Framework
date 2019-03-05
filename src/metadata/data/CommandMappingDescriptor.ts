import {Type} from "../../type/Type";

/**
 * Command mapping descriptor to be used within system module meta data.
 * @author Jānis Radiņš
 */
export interface CommandMappingDescriptor {

    /**
     * Event name upon which command mapped in command property should be invoked.
     */
    readonly event: string,

    /**
     * Command type or list of commands that should be invoked as event name listed in event property is fired in system context.
     */
    readonly command: Type | Type[];

    /**
     * Describes if command should be executed only once.
     * @default false
     */
    readonly once?: boolean;

}