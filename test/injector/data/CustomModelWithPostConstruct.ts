import {PostConstruct} from "../../../src/metadata/decorator/PostConstruct";
/**
 * Custom model class for testing purposes
 * @author Jānis Radiņš
 */
export class CustomModelWithPostConstruct {

    /**
     * Async test callback function
     */
    static onPostConstruct:() => void;

    @PostConstruct()
    private initialize():void {
        if (CustomModelWithPostConstruct.onPostConstruct) {
            CustomModelWithPostConstruct.onPostConstruct();
        }
    }

}