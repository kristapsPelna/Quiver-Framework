import {suite, test, timeout} from "mocha-typescript";
import {expect} from 'chai';
import {CommandMap} from "../../src/commandMap/CommandMap";
import {CustomCommand} from "./data/CustomCommand";
import {CustomCommand2} from "./data/CustomCommand2";
import {EventGuard} from "../../src/eventDispatcher/api/EventGuard";
import {CustomMacroCommand} from "./data/CustomMacroCommand";
import {Injector} from "../../src/injector/Injector";
import {Event} from "../../src/eventDispatcher/event/Event";
import {CommandMappingImpl} from "../../src/commandMap/data/impl/CommandMappingImpl";
import {MacroCommand} from "../../src/commandMap/command/MacroCommand";
import {EventDispatcher} from "../../src/eventDispatcher/EventDispatcher";
import {Context} from "../../src/context/Context";
import {ModuleWithMetatag} from "./data/ModuleWithMetatag";
import {CommandMapExtension} from "../../src/context/extension/commandMap/CommandMapExtension";
import {EventDispatcherExtension} from "../../src/context/extension/eventDispatcher/EventDispatcherExtension";


/**
 * CommandMap test suite
 * @author Kristaps Peļņa
 */
@suite
export class CommandMapTest {

    private injector = new Injector();
    private commandMap: CommandMap;

    before() {
        this.commandMap = this.injector.instantiateInstance(CommandMap);
    }

    after() {
        this.commandMap.unMap();
        this.commandMap = null;

        // Clear custom command static callbacks
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

    @test("Trigger event with eventName")
    triggerEventWithEventName() {
        const eventName = "test";
        expect(
            this.commandMap.trigger(eventName),
            "Command trigger with eventName should not throw an error"
        ).to.be.undefined;
    }

    @test("Trigger event with event instance")
    triggerEventWithEventInstance() {
        const event = new Event("test");
        expect(
            this.commandMap.trigger(event),
            "Command trigger with event instance should not throw an error"
        ).to.be.undefined;
    }

    @test("Map command")
    @timeout(500) //Limit waiting time in case the callback is not called
    mapCommand(done: () => void) {
        const eventName = "test";
        CustomCommand.done = done;

        const mapping = this.commandMap.map(eventName, CustomCommand) as CommandMappingImpl;

        expect(
            mapping.eventClass,
            "Mapping event class should be Event by default"
        ).to.be.eq(Event);

        expect(
            this.commandMap.mappingCount,
            "Command map instance should have only one mapping"
        ).to.be.eq(1);

        this.commandMap.trigger(eventName);
    }

    @test("Map command once")
    mapCommandOnce() {
        const eventName = "test";
        let executeCount = 0;

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

    @test("Map command twice")
    mapCommandTwice() {
        const eventName = "test";

        expect(
            this.commandMap.map(eventName, CustomCommand),
            "First command map should return the mapping"
        ).to.be.not.null;

        expect(
            this.commandMap.map(eventName, CustomCommand),
            "Second command map should return null, because the mapping already exists"
        ).to.be.null;
    }

    @test("Map command to two events")
    mapCommandToTwoEvents() {
        const eventName = "test";
        const eventName2 = "test2";

        let executeCount = 0;

        CustomCommand.done = () => executeCount++;

        this.commandMap.map(eventName, CustomCommand);
        this.commandMap.map(eventName2, CustomCommand);

        this.commandMap.trigger(eventName2);
        this.commandMap.trigger(eventName);

        expect(
            executeCount,
            "Command should be executed twice"
        ).to.be.eq(2);
    }

    @test("Map command with successful guard")
    @timeout(500) //Limit waiting time in case the callback is not called
    mapCommandWithSuccessfulGuard(done: () => void) {
        const eventName = "test";
        const guard: EventGuard = () => true;
        CustomCommand.done = done;

        this.commandMap.map(eventName, CustomCommand).withGuards(guard);
        this.commandMap.trigger(eventName);
    }

    @test("Map command with unsuccessful guard")
    mapCommandWithUnsuccessfulGuard() {
        const eventName = "test";
        const guard: EventGuard = () =>  false;

        CustomCommand.done = () => {
            throw new Error("Command should not be executed because the guard should block it");
        };

        this.commandMap.map(eventName, CustomCommand).withGuards(guard);
        this.commandMap.trigger(eventName);
    }

    @test("unMap command")
    unMapCommand() {
        const eventName = "test";
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

    @test("unMap command twice")
    unMapCommandTwice() {
        const eventName = "test";
        const eventName2 = "test2";

        this.commandMap.map(eventName, CustomCommand);
        this.commandMap.map(eventName2, CustomCommand);

        expect(
            this.commandMap.unMap(eventName, CustomCommand),
            "First unMap should be successful"
        ).to.be.true;

        expect(
            this.commandMap.unMap(eventName, CustomCommand),
            "Second unMap should not have anything to unMap"
        ).to.be.false;
    }

    @test("unMap command from two different events")
    unMapCommandFromTwoEvents() {
        const eventName = "test";
        const eventName2 = "test2";

        this.commandMap.map(eventName, CustomCommand);
        this.commandMap.map(eventName2, CustomCommand);

        expect(
            this.commandMap.unMap(eventName, CustomCommand),
            "First unMap should be successful"
        ).to.be.true;

        expect(
            this.commandMap.unMap(eventName2, CustomCommand),
            "Second unMap should be successful"
        ).to.be.true;
    }

    @test("unMap command from wrong event")
    unMapCommandFromWrongEvent() {
        const eventName = "test";
        const eventName2 = "test2";

        this.commandMap.map(eventName2, CustomCommand2);
        this.commandMap.map(eventName, CustomCommand);

        expect(
            this.commandMap.unMap(eventName2, CustomCommand),
            "unMap should return false because there is no mapping"
        ).to.be.false;
    }

    @test("unMap all commands from event")
    unMapAllCommandsFromEvent() {
        const eventName = "test";
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
        const eventName = "firstEvent";
        const eventName2 = "secondEvent";
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
        const eventName = "test";
        const invalidValues: any[] = [undefined, null, ""];

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
        const invalidValues = [undefined, null, ""];

        for (const value of invalidValues) {
            expect(
                () => this.commandMap.trigger(value),
                "Triggering CommandMap with an invalid value should throw an error. value: " + value
            ).to.throw(Error);
        }
    }

    @test("Macro command add")
    macroCommandAdd() {
        const macroCommand = new MacroCommand();
        macroCommand.add(CustomCommand);

        expect(macroCommand.has(CustomCommand), "Macro command should have CustomCommand").to.be.true;
        expect(macroCommand.has(CustomCommand2), "Macro command should not have CustomCommand2").to.be.false;
        expect(() => macroCommand.add(null), "Trying to add a null command should throw an error").to.throw(Error);
    }

    @test("Macro command remove")
    macroCommandRemove() {
        const macroCommand = new MacroCommand();
        macroCommand.add(CustomCommand);

        expect(
            () => macroCommand.remove(CustomCommand),
            "Removing the command should be successful"
        ).to.not.throw(Error);

        expect(
            macroCommand.has(CustomCommand),
            "Macro command should not have CustomCommand after remove"
        ).to.be.false;

        expect(
            () => macroCommand.remove(CustomCommand),
            "Trying to remove a command which is not added should throw an error"
        ).to.throw(Error);

        expect(
            () => macroCommand.remove(null),
            "Trying to remove a null command should throw an error"
        ).to.throw(Error);
    }

    @test("Macro command execute")
    @timeout(500) //Limit waiting time in case the callback is not called
    macroCommandExecute(done: () => void) {
        const eventName = "test";
        CustomMacroCommand.done = done;

        this.commandMap.map(eventName, CustomMacroCommand);
        this.commandMap.trigger(eventName);
    }

    @test("Can map multiple event in module decorator")
    multipleCommandsCanBeMappedInModuleDecorator() {

        let executeCount = 0;

        CustomCommand.done = () => executeCount++;
        CustomCommand2.done = () => executeCount++;

        const context = new Context().install(CommandMapExtension, EventDispatcherExtension).configure(ModuleWithMetatag);
        context.initialize();

        const dispatcher = context.injector.get(EventDispatcher);
        dispatcher.dispatchEvent("multiCommandEvent");

        expect(
            executeCount,
            "Both commands must be executed"
        ).to.be.eq(2);

    }

}