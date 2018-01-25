import "reflect-metadata";
import {ContextTest} from "./context/ContextTest";
import {InjectorTest} from "./injector/InjectorTest";
import {MetadataTest} from "./metadata/MetadataTest";
import {EventDispatcherTest} from "./eventDispatcher/EventDispatcherTest";
import {CommandMapTest} from "./commandMap/CommandMapTest";

/**
 * Core test package is the entry point of test initialization.
 * All test suits must referenced in this class for them to be called on "npm test" command.
 * @author Kristaps Peļņa
 */
class CoreTests {

    /**
     * All test suites which need to be run.
     * The order of their execution is defined by their import order.
     */
    testSuites = [
        ContextTest,
        InjectorTest,
        MetadataTest,
        EventDispatcherTest,
        CommandMapTest
    ];

}