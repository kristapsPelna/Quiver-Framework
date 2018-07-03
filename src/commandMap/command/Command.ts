/**
 * Command class class/interface which has to be implemented, directly or not, by any
 * class which is used for event to command mapping.
 * @author Jānis Radiņš / Kristaps Peļņa
 */
export class Command {

    /**
     * Invoked as command is executed
     */
    execute(): void {
    }
}