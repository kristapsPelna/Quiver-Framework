import {Context} from "./Context";
import {WebApplicationBundle} from "./bundle/WebApplicationBundle";

/**
 * Web application context is Context pre-configured with default extension bundles necessary
 * for web application development.
 * @author Kristaps Peļņa
 */
export class WebApplicationContext extends Context {

    constructor() {
        super();
        this.install(WebApplicationBundle);
    }
}

