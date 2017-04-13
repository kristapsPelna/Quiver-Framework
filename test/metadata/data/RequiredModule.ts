import {Module} from "../../../src/metadata/decorator/Module";
/**
 * Custom Module class for testing purposes
 * @author Kristaps Peļņa
 */
@Module({})
export class RequiredModule {

    /**
     * Command called on successful construction.
     */
    static constructionCallback:Function;

    constructor() {
        RequiredModule.constructionCallback();
    }

}