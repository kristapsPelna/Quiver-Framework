import {Module} from "../../../src/metadata/decorator/Module";
import {RequiredModule} from "./RequiredModule";
/**
 * Custom Module class for testing purposes
 * @author Kristaps Peļņa
 */
@Module({
    requires:[
        RequiredModule
    ]
})
export class CustomModule {

}