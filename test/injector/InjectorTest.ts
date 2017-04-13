import {suite, test} from "mocha-typescript";
import {expect} from 'chai';
import {Injector} from "../../src/injector/Injector";
import {CustomModel} from "./data/CustomModel";
import {CustomModel2} from "./data/CustomModel2";
import {CustomModelWithInject} from "./data/CustomModelWithInject";
import {CustomExtendedModel} from "./data/CustomExtendedModel";

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

}