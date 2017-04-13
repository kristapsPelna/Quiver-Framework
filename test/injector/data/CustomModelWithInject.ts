import {Inject} from "../../../src/metadata/decorator/Inject";
import {Injector} from "../../../src/injector/Injector";
/**
 * Custom model class for testing purposes
 * @author Kristaps Peļņa
 */
export class CustomModelWithInject {

    @Inject()
    injector:Injector;

}