import {suite, test, timeout} from "mocha-typescript";
import {expect} from 'chai';
import {Context} from "../../src/context/Context";
import {WebApplicationBundle} from "../../src/context/bundle/WebApplicationBundle";
import {typeReferenceToString} from "../../src/util/StringUtil";
import {CustomModuleWithMetatags} from "../metadata/data/CustomModuleWithMetatags";
import {ContextModuleEvent} from "../../src/context/event/ContextModuleEvent";
import {CustomCommand} from "../commandMap/data/CustomCommand";
import {EventDispatcher} from "../../src/eventDispatcher/EventDispatcher";
import {ContextLifecycleEvent} from "../../src/context/event/ContextLifecycleEvent";

/**
 * Context test suite
 * @author Kristaps Peļņa
 */
@suite export class ContextTest {

    private context:Context;

    before() {
        this.context = new Context();
    }

    after() {
        if (!this.context) {
            return;
        }

        if (this.context.initialized && !this.context.destroyed) {
            expect(
                () => this.context.destroy(),
                "Destroying a context should not cause any errors"
            ).to.not.throw(Error);
        }

        this.context = null;
    }

    @test("Initialize")
    initialize() {
        this.context.initialize();

        expect(
            this.context.initialized,
            "Context should be initialized"
        ).to.be.true;

        const methods:Function[] = [
            this.context.install,
            this.context.uninstall,
            this.context.configure,
            this.context.initialize
        ];

        for (let method of methods) {
            expect(
                () => method(),
                "Context method should not be available after initialize " + method
            ).to.throw(Error);
        }
    }

    @test("Install")
    install() {
        this.context.install(...WebApplicationBundle);

        for (let extension of WebApplicationBundle) {
            expect(
                this.context.hasExtension(extension),
                "Context should have the installed extension " + typeReferenceToString(extension)
            ).to.be.true;
        }
    }

    @test("Uninstall")
    uninstall() {
        this.context.install(...WebApplicationBundle);
        this.context.uninstall(...WebApplicationBundle);

        for (let extension of WebApplicationBundle) {
            expect(
                this.context.hasExtension(extension),
                "Context should not have the installed extension " + typeReferenceToString(extension)
            ).to.be.false;
        }
    }

    @test("Configure")
    @timeout(500) //Limit waiting time in case the callback is not called
    configure(done:() => void) {
        this.context.install(...WebApplicationBundle);
        this.context.configure(CustomModuleWithMetatags);

        const checkRegisteredModule = (event:ContextModuleEvent) => {
            if (event.moduleType === CustomModuleWithMetatags) {
                done();
            }
        };
        this.context.addEventListener(ContextModuleEvent.REGISTER_MODULE, checkRegisteredModule, this);
        this.context.initialize();
    }

    @test("CommandMapExtension")
    @timeout(500) //Limit waiting time in case the callback is not called
    commandMapExtension(done:() => void) {
        this.context.install(...WebApplicationBundle);
        this.context.configure(CustomModuleWithMetatags);
        this.context.initialize();

        CustomCommand.done = done;
        const dispatcher:EventDispatcher = this.context.injector.get(EventDispatcher);
        dispatcher.dispatchEvent("Test");
    }

    @test("Destroy")
    destroy() {
        expect(
            () => this.context.destroy(),
            "Trying to destroy a context which is not initialized should throw an error"
        ).to.throw(Error);

        this.context.initialize();

        expect(
            () => this.context.destroy(),
            "Trying to destroy a destroyed context should throw an error"
        ).to.not.throw(Error);

        expect(
            this.context.destroyed,
            "The context should be destroyed"
        ).to.be.true;

        const methods:Function[] = [
            this.context.install,
            this.context.uninstall,
            this.context.configure
        ];

        for (let method of methods) {
            expect(
                () => method(),
                "Context method should not be available after destroy " + method
            ).to.throw(Error);
        }

        this.context = null;
    }

}