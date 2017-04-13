import {suite, test, timeout} from "mocha-typescript";
import {expect} from 'chai';
import {CommandMap} from "../../src/commandMap/CommandMap";
import {CustomCommand} from "./data/CustomCommand";
import {CustomCommand2} from "./data/CustomCommand2";
import {EventGuard} from "../../src/eventDispatcher/api/EventGuard";
import {CustomMacroCommand} from "./data/CustomMacroCommand";
import {Injector} from "../../src/injector/Injector";

/**
 * CommandMap test suite
 * @author Kristaps Peļņa
 */
@suite export class CommandMapTest {

    private injector:Injector = new Injector();
    private commandMap:CommandMap;

    before() {
        this.commandMap = this.injector.instantiateInstance(CommandMap);
    }

    after() {
        this.commandMap.unMap();
        this.commandMap = null;

        //Clear custom command static callbacks
        CustomCommand.done = null;
        CustomCommand2.done = null;
        CustomMacroCommand.done = null;
    }

    @test("Instantiation")
    instantiation() {
        expect(
            this.commandMap,
            "Command map instance is not available"
        ).to.be.not.null;

        expect(
            this.commandMap.mappingCount,
            "Command map instance should not have any mappings on creation"
        ).to.be.eq(0);
    }

    @test("Map command")
    @timeout(500) //Limit waiting time in case the callback is not called
    mapCommand(done:Function) {
        const eventName:string = "test";
        CustomCommand.done = done;

        this.commandMap.map(eventName, CustomCommand);

        expect(
            this.commandMap.mappingCount,
            "Command map instance should have only one mapping"
        ).to.be.eq(1);

        this.commandMap.trigger(eventName);
    }

    @test("Map command once")
    mapCommandOnce() {
        const eventName:string = "test";
        let executeCount:number = 0;

        CustomCommand.done = () => {
            executeCount++;
            expect(
                executeCount,
                "Command should not be executed more than once"
            ).to.be.lessThan(2);
        };

        this.commandMap.map(eventName, CustomCommand).once();

        this.commandMap.trigger(eventName);

        expect(
            this.commandMap.mappingCount,
            "Command map instance should not have any mappings after the command has been triggered once"
        ).to.be.eq(0);

        this.commandMap.trigger(eventName);
    }

    @test("Map command with successful guard")
    @timeout(500) //Limit waiting time in case the callback is not called
    mapCommandWithSuccessfulGuard(done:Function) {
        const eventName:string = "test";
        const guard:EventGuard = () => {
            return true;
        };
        CustomCommand.done = done;

        this.commandMap.map(eventName, CustomCommand).withGuards(guard);
        this.commandMap.trigger(eventName);
    }

    @test("Map command with unsuccessful guard")
    mapCommandWithUnsuccessfulGuard() {
        const eventName:string = "test";
        const guard:EventGuard = () => {
            return false;
        };
        CustomCommand.done = () => {
            throw new Error("Command should not be executed because the guard should block it");
        };

        this.commandMap.map(eventName, CustomCommand).withGuards(guard);
        this.commandMap.trigger(eventName);
    }

    @test("unMap command")
    unMapCommand() {
        const eventName:string = "test";
        CustomCommand.done = () => {
            throw new Error("Command should not be executed because it has been unMapped");
        };

        this.commandMap.map(eventName, CustomCommand);
        this.commandMap.unMap(eventName, CustomCommand);

        expect(
            this.commandMap.mappingCount,
            "Command map instance should have only one mapping"
        ).to.be.eq(0);

        this.commandMap.trigger(eventName);
    }

    @test("unMap all commands from event")
    unMapAllCommandsFromEvent() {
        const eventName:string = "test";
        CustomCommand.done = CustomCommand2.done = () => {
            throw new Error("Command should not be executed because it should be unMapped");
        };

        this.commandMap.map(eventName, CustomCommand);
        this.commandMap.map(eventName, CustomCommand2);

        this.commandMap.unMap(eventName);

        expect(
            this.commandMap.mappingCount,
            "Command map instance should have only one mapping"
        ).to.be.eq(0);

        this.commandMap.trigger(eventName);
    }

    @test("unMap everything")
    unMapEverything() {
        const eventName:string = "firstEvent";
        const eventName2:string = "secondEvent";
        CustomCommand.done = CustomCommand2.done = () => {
            throw new Error("Command should not be executed because it should be unMapped");
        };

        this.commandMap.map(eventName, CustomCommand);
        this.commandMap.map(eventName2, CustomCommand);
        this.commandMap.map(eventName, CustomCommand2);
        this.commandMap.map(eventName2, CustomCommand2);

        this.commandMap.unMap();

        expect(
            this.commandMap.mappingCount,
            "Command map instance should have only one mapping"
        ).to.be.eq(0);

        this.commandMap.trigger(eventName);
    }

    @test("Check invalid value mapping")
    checkInvalidValueMapping() {
        const eventName:string = "test";
        const invalidValues:any[] = [undefined, null, ""];

        for (let value of invalidValues) {
            expect(
                () => this.commandMap.map(value, CustomCommand),
                "Mapping a command to an invalid value should throw an error. value: " + value
            ).to.throw(Error);

            expect(
                () => this.commandMap.map(eventName, value),
                "Mapping an event to an invalid command should throw an error. value: " + value
            ).to.throw(Error);
        }
    }

    @test("Check invalid trigger")
    checkInvalidTrigger() {
        const invalidValues:any[] = [undefined, null, ""];

        for (let value of invalidValues) {
            expect(
                () => this.commandMap.trigger(value),
                "Triggering CommandMap with an invalid value should throw an error. value: " + value
            ).to.throw(Error);
        }
    }

    @test("Macro command execute")
    @timeout(500) //Limit waiting time in case the callback is not called
    macroCommandExecute(done:Function) {
        const eventName:string = "test";
        CustomMacroCommand.done = done;

        this.commandMap.map(eventName, CustomMacroCommand);
        this.commandMap.trigger(eventName);
    }

}