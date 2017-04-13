/**
 * Custom class for tests
 * @author Kristaps Peļņa
 */
export class RequiredClass {

    static constructionCallback:Function;

    constructor() {
        if (RequiredClass.constructionCallback) {
            RequiredClass.constructionCallback();
        }
    }

}