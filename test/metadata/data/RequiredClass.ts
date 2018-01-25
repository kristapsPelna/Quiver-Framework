/**
 * Custom class for tests
 * @author Kristaps Peļņa
 */
export class RequiredClass {

    static constructionCallback:() => void;

    constructor() {
        if (RequiredClass.constructionCallback) {
            RequiredClass.constructionCallback();
        }
    }

}