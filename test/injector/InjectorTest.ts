import {suite, test, timeout} from "mocha-typescript";
import {expect} from 'chai';
import {Injector} from "../../src/injector/Injector";
import {CustomModel} from "./data/CustomModel";
import {CustomModel2} from "./data/CustomModel2";
import {CustomModelWithInject} from "./data/CustomModelWithInject";
import {CustomExtendedModel} from "./data/CustomExtendedModel";
import {ClassWithInjections} from "../metadata/data/ClassWithInjections";
import {InjectionMapping} from "../../src/injector/data/InjectionMapping";
import {CustomModelWithPostConstruct} from "./data/CustomModelWithPostConstruct";
import {AbstractClass} from "./data/AbstractClass";
import {AbstractClassImpl} from "./data/AbstractClassImpl";

/**
 * Injector test suite
 * @author Kristaps Peļņa
 */
@suite export class InjectorTest {

    private injector:Injector;

    before() {
        this.injector = new Injector();
    }

    after() {
        CustomModelWithInject.onDestroy = null;
        if (!this.injector) {
            return;
        }

        expect(
            () => this.injector.destroy(),
            "Injector destroy should not cause any errors"
        ).to.not.throw(Error);

        this.injector = null;
    }

    @test("Get self")
    get() {
        expect(
            this.injector.get(Injector),
            "injector.get(Injector) should return itself"
        ).to.be.eq(this.injector);
    }

    @test("Get unavailable type")
    getUnavailableType() {
        expect(
            () => this.injector.get(CustomModel),
            "Accessing an unavailable type should cause an error"
        ).to.throw(Error);
    }

    @test("Map")
    map() {
        this.injector.map(CustomModel);
        let model:CustomModel = this.injector.get(CustomModel);

        expect(
            model,
            "Mapped model should be available from injector"
        ).to.not.be.null;

        expect(
            this.injector.get(CustomModel),
            "Each returned model instance should be unique"
        ).to.not.be.eq(model);
    }

    @test("Map as singleton")
    mapAsSingleton() {
        this.injector.map(CustomModel).asSingleton();
        let model:CustomModel = this.injector.get(CustomModel);

        expect(
            model,
            "Mapped model should be available from injector"
        ).to.not.be.null;

        expect(
            this.injector.get(CustomModel),
            "Model mapped as singleton should return the same instance"
        ).to.be.eq(model);
    }

    @test("Map to singleton")
    mapToSingleton() {
        this.injector.map(CustomModel2).toSingleton(CustomModel);

        expect(
            this.injector.get(CustomModel2),
            "CustomModel2 mapped to CustomModel should return instance of CustomModel"
        ).to.be.instanceof(CustomModel);
    }

    @test("Map to type")
    mapToType() {
        this.injector.map(CustomModel2).toType(CustomModel);

        expect(
            this.injector.get(CustomModel2),
            "CustomModel2 mapped to CustomModel should return instance of CustomModel"
        ).to.be.instanceof(CustomModel);
    }

    @test("Map to value")
    mapToValue() {
        let model:CustomModel = new CustomModel();
        model.value = 999;

        this.injector.map(CustomModel).toValue(model);

        expect(
            this.injector.get(CustomModel),
            "Mapped model should be available from injector"
        ).to.not.be.null;

        expect(
            this.injector.get(CustomModel),
            "Model mapped as value should return the same mapped instance"
        ).to.be.eq(model);
    }

    @test("Map to existing")
    mapToExisting() {
        this.injector.map(CustomModel).asSingleton();
        this.injector.map(CustomModel2).toExisting(CustomModel);

        expect(
            this.injector.get(CustomModel2),
            "Mapped model should be available from injector"
        ).to.not.be.null;

        expect(
            this.injector.get(CustomModel2),
            "Model mapped as existing should return the same mapping as for the existing mapping"
        ).to.be.eq(this.injector.get(CustomModel));
    }

    @test("Map by abstract class")
    mapByAbstractClass() {
        this.injector.map(AbstractClass).toType(AbstractClassImpl);
        expect(
            this.injector.get(AbstractClass),
            "Abstract class should be usable as mapping key"
        ).to.be.instanceof(AbstractClassImpl);
    }

    @test("Create subInjector")
    createSubInjector() {
        let subInjector:Injector = this.injector.createSubInjector();
        subInjector.map(CustomModel).asSingleton();

        expect(
            subInjector.parent,
            "SubInjector parent should be the original injector"
        ).to.be.eq(this.injector);

        expect(
            this.injector.hasMapping(CustomModel),
            "SubInjector mappings should not be available from the parent injector"
        ).to.be.false;
    }

    @test("Has mapping")
    hasMapping() {
        this.injector.map(CustomModel).asSingleton();

        expect(
            this.injector.hasMapping(CustomModel),
            "Mapped model should have a mapping"
        ).to.be.true;

        expect(
            this.injector.hasDirectMapping(CustomModel),
            "Mapped model should have a direct mapping"
        ).to.be.true;
    }

    @test("Has direct mapping")
    hasDirectMapping() {
        let subInjector:Injector = this.injector.createSubInjector();
        this.injector.map(CustomModel).asSingleton();

        expect(
            subInjector.hasMapping(CustomModel),
            "Mapped model should be available from the subInject"
        ).to.be.true;

        expect(
            subInjector.hasDirectMapping(CustomModel),
            "Mapped model should not be a direct mapping as it is mapped to the parent injector"
        ).to.be.false;
    }

    @test("unMap")
    unMap() {
        this.injector.map(CustomModel).asSingleton();

        expect(
            this.injector.hasMapping(CustomModel),
            "Mapped model should be available from the injector"
        ).to.be.true;

        this.injector.unMap(CustomModel);

        expect(
            this.injector.hasMapping(CustomModel),
            "Model should no longer have a mapping after unMap"
        ).to.be.false;

        expect(
            () => this.injector.get(CustomModel),
            "Accessing an unMapped model should cause an error"
        ).to.throw(Error);
    }

    @test("Seal")
    seal() {
        const mapping:InjectionMapping = this.injector.map(CustomModel);
        mapping.seal();

        expect(
            () => mapping.asSingleton(),
            "Changing sealed mappings should throw an error"
        ).to.throw(Error);
    }

    @test("Unseal")
    unseal() {
        const mapping:InjectionMapping = this.injector.map(CustomModel);

        expect(
            () => mapping.unseal(null),
            "Trying to unseal a not sealed mapping should throw an error"
        ).to.throw(Error);

        mapping.seal();

        expect(
            () => mapping.unseal(null),
            "Trying to unseal a mapping with an incorrect key should throw an error"
        ).to.throw(Error);
    }

    @test("Remapping")
    remapping() {
        const mapping:InjectionMapping = this.injector.map(CustomModel2).asSingleton();

        expect(
            () => mapping.toValue(new CustomModel()),
            "Remapping should not throw an error"
        ).to.not.throw(Error);
    }

    @test("Instantiate instance")
    instantiateInstance() {
        let model:any = this.injector.instantiateInstance(CustomModel);

        expect(
            model,
            "Instantiated instance should not be null"
        ).to.not.be.null;

        expect(
            model instanceof CustomModel,
            "Instantiated instance should match the class"
        ).to.not.be.null;
    }

    @test("Inject Into")
    @timeout(500) //Limit waiting time in case the callback is not called
    injectInto(done:() => void) {
        expect(
            () => this.injector.injectInto(new ClassWithInjections()),
            "An error should be thrown because the injections can not be provided"
        ).to.throw(Error);

        ClassWithInjections.onPostConstruct = done;
        this.injector.map(CustomModel);

        expect(
            () => this.injector.injectInto(new ClassWithInjections()),
            "An error should not be thrown because the injections can be provided"
        ).to.not.throw(Error);
    }

    @test("Property injections")
    propertyInjections() {
        let model:CustomModelWithInject = this.injector.instantiateInstance(CustomModelWithInject);

        expect(
            model.injector,
            "Instantiated instance should have their Inject() properties filled"
        ).to.not.be.undefined;

        let extendedModel:CustomExtendedModel = this.injector.instantiateInstance(CustomExtendedModel);

        expect(
            extendedModel.injector,
            "Extended instances should have inherited Inject() properties filled"
        ).to.not.be.undefined;
    }

    @test("Destroy mapping")
    destroyMapping() {
        const mapping:InjectionMapping = this.injector.map(CustomModel);

        expect(
            () => mapping.destroy(),
            "Destroying a mapping should work"
        ).to.not.throw(Error);

        expect(
            () => mapping.destroy(),
            "Double destroying a mapping should throw an error"
        ).to.throw(Error);

        expect(
            () => mapping.asSingleton(),
            "Changing mapping providers after destroy should throw an error"
        ).to.throw(Error);

        expect(
            () => mapping.getInjectedValue(),
            "Accessing getInjectedValue destroy should throw an error"
        ).to.throw(Error);
    }

    @test("Destroy instance")
    @timeout(500) //Limit waiting time in case the callback is not called
    destroyInstance(done:() => void) {
        let model:CustomModelWithInject = this.injector.instantiateInstance(CustomModelWithInject);
        CustomModelWithInject.onDestroy = done;
        this.injector.destroyInstance(model);
    }

    @test("Destroy instance without metadata")
    destroyInstanceWithoutMetadata() {
        this.injector.destroyInstance({});
    }

    @test("Destroy injector")
    destroyInjector(done:() => void) {
        this.injector.map(CustomModelWithInject).asSingleton();
        this.injector.get(CustomModelWithInject);

        CustomModelWithInject.onDestroy = done;

        this.injector.destroy();

        const methods:Function[] = [
            () => this.injector.createSubInjector(),
            () => this.injector.map(null),
            () => this.injector.unMap(null),
            () => this.injector.hasDirectMapping(null),
            () => this.injector.hasMapping(null),
            () => this.injector.getMapping(null),
            () => this.injector.get(null),
            () => this.injector.instantiateInstance(null),
            () => this.injector.injectInto(null),
            () => this.injector.destroyInstance(null)
        ];
        for (let method of methods) {
            expect(
                method,
                "Accessing a destroyed injector functionality should throw an error"
            ).to.throw(Error);
        }

        this.injector = null;
    }

    @test("Double destroy injector")
    doubleDestroyInjector() {
        this.injector.destroy();

        expect(
            () => this.injector.destroy(),
            "Trying to destroy a destroyed injector should throw an error"
        ).to.throw(Error);

        this.injector = null;
    }

    @test("Instance must be available in Injector before @PostConstruct is invoked")
    @timeout(10)
    isInstanceInInjectorOnPostConstruct(done:() => void) {
        this.injector.map(CustomModelWithPostConstruct).asSingleton();
        let instance:CustomModelWithPostConstruct;
        CustomModelWithPostConstruct.onPostConstruct = () => {
            expect(
                this.injector.get(CustomModelWithPostConstruct),
                "Injection must be available in Injector before postConstruct is invoked"
            ).to.be.eq(instance);

            done();
        };

        instance = this.injector.get(CustomModelWithPostConstruct);
    }

}