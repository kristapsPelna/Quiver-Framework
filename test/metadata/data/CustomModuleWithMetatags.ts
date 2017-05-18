import {CustomModel} from "../../injector/data/CustomModel";
import {CustomInterface} from "./CustomInterface";
import {MapInterface} from "../../../src/metadata/decorator/MapInterface";
import {Module} from "../../../src/metadata/decorator/Module";
import {CustomModel2} from "../../injector/data/CustomModel2";
import {RequiredModule} from "./RequiredModule";
import {Inject} from "../../../src/metadata/decorator/Inject";
import {Optional} from "../../../src/metadata/decorator/Optional";
import {Injector} from "../../../src/injector/Injector";
import {PostConstruct} from "../../../src/metadata/decorator/PostConstruct";
import {PreDestroy} from "../../../src/metadata/decorator/PreDestroy";
import {CustomInjectedClass} from "./CustomInjectedClass";
import {CustomCommand} from "../../commandMap/data/CustomCommand";
/**
 * Custom module class for tests
 * @author Kristaps Peļņa
 */
@Module({
    requires:[
        RequiredModule
    ],
    mappings:[
        CustomInjectedClass,
        {
            map: CustomModel,
            useValue: new CustomModel()

        },
        {
            map: CustomModel2,
            useExisting: CustomModel
        }
    ],
    commandMap:[
        {
            event: "Test",
            command: CustomCommand,
            once: true
        }
    ]
})
//Test an empty MapInterface
@MapInterface()
//Test a full MapInterface
@MapInterface(CustomInterface)
export class CustomModuleWithMetatags implements CustomInterface {

    @Inject()
    @Optional()
    customClass:CustomInjectedClass;

    @Inject()
    private injector:Injector;

    @Optional()
    get intentionallyIncorrectOptionalMetatagUse():null {
        return null;
    }

    constructor(injector:Injector, @Optional() customClass:CustomInjectedClass) {

    }

    @PostConstruct()
    postConstruct():void {

    }

    @PostConstruct()
    anotherPostConstruct():void {

    }

    @PreDestroy()
    preDestroy():void {

    }

    @PreDestroy()
    anotherPreDestroy():void {

    }
}