import {Inject} from "../../../src/metadata/decorator/Inject";
import {Injectable} from "../../../src/metadata/decorator/Injectable";
import {CustomModel2} from "../../injector/data/CustomModel2";
/**
 * Class with injections for tests
 * @author Kristaps Peļņa
 */
@Injectable()
export class SuperClassWithInjections {

    @Inject()
    customModel2:CustomModel2;

}