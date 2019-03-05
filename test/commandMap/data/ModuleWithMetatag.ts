import {Module} from "../../../src/metadata/decorator/Module";
import {CustomCommand} from "../../commandMap/data/CustomCommand";
import {CustomCommand2} from "../../commandMap/data/CustomCommand2";

@Module({
    commandMap:[
        {
            event: "multiCommandEvent",
            command: [
                CustomCommand,
                CustomCommand2
            ]
        }
    ]
})
export class ModuleWithMetatag {

}