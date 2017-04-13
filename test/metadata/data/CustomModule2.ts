import {Module} from "../../../src/metadata/decorator/Module";
import {RequiredClass} from "./RequiredClass";
/**
 * Custom Module class for testing purposes
 * @author Kristaps Peļņa
 */
@Module({
    requires:[
        RequiredClass
    ]
})
export class CustomModule2 {

}