import {suite, test} from "mocha-typescript";
import {expect} from 'chai';
import {RequiredModule} from "./data/RequiredModule";
import {CustomModule} from "./data/CustomModule";
import {CustomModuleWithMetatags} from "./data/CustomModuleWithMetatags";
import {metadata} from "../../src/metadata/metadata";
import {CustomInjectedClass} from "./data/CustomInjectedClass";
import {Injector} from "../../src/injector/Injector";
import {CustomInterface} from "./data/CustomInterface";
import {CustomModel} from "../injector/data/CustomModel";
import {CustomModel2} from "../injector/data/CustomModel2";
import {Context} from "../../src/context/Context";
import {CustomModule2} from "./data/CustomModule2";
import {RequiredClass} from "./data/RequiredClass";
import {InjectionDescriptor} from "../../src/metadata/data/InjectionDescriptor";

/**
 * Metadata test suite
 * @author Kristaps Peļņa
 */
@suite
export class MetadataTest {

    after() {
        // Clear custom class static callbacks
        RequiredModule.constructionCallback = null;
        RequiredClass.constructionCallback = null;
    }

    @test("Get constructor arguments")
    getConstructorArguments() {
        const {constructorArguments} = metadata.getTypeDescriptor(CustomModuleWithMetatags);
        expect(constructorArguments.length, "Constructor must have 2 arguments").to.be.eq(2);
        expect(constructorArguments[0].type, "Second constructor argument type must be Injector").to.be.eq(Injector);
        expect(constructorArguments[1].type, "First constructor argument type must be CustomInjectedClass").to.be.eq(CustomInjectedClass);
        expect(constructorArguments[0].isOptional, "First constructor argument is not optional").to.be.false;
        expect(constructorArguments[0].isOptional, "Second constructor argument is not optional").to.be.false;
    }

    @test("Get mapped interfaces")
    getMappedInterfaces() {
        const {mappedInterfaces} = metadata.getTypeDescriptor(CustomModuleWithMetatags);
        expect(mappedInterfaces.length, "Only a single interface is mapped to this class").to.be.eq(1);
        expect(mappedInterfaces[0], "First mapped interface must be CustomInterface").to.be.eq(CustomInterface);
    }

    @test("Get non existent type descriptor")
    getNonExistentTypeDescriptor() {
        expect(
            () => metadata.getTypeDescriptor(CustomInterface),
            "Getting Type Descriptor of a class without descriptors should cause an error"
        ).to.throw(Error);
    }

    @test("Get module descriptor")
    getModuleDescriptor() {
        const {moduleDescriptor} = metadata.getTypeDescriptor(CustomModuleWithMetatags);

        // Mappings
        expect(moduleDescriptor.mappings.length, "Module descriptor has 3 mappings").to.be.eq(3);
        expect(moduleDescriptor.mappings[0], "1st module descriptor mapping must be CustomInjectedClass").to.be.eq(CustomInjectedClass);
        expect(
            (moduleDescriptor.mappings[1] as InjectionDescriptor).map,
            "2nd module descriptor mapping.map must be CustomModel"
        ).to.be.eq(CustomModel);
        expect(
            (moduleDescriptor.mappings[2] as InjectionDescriptor).map,
            "3rd module descriptor mapping.map must be CustomModel2"
        ).to.be.eq(CustomModel2);
        expect(
            (moduleDescriptor.mappings[2] as InjectionDescriptor).useExisting,
            "3rd module descriptor mapping.useExisting must be CustomModel2"
        ).to.be.eq(CustomModel);
        //Requires
        expect(
            moduleDescriptor.requires.length,
            "Module descriptor has 1 requires dependency"
        ).to.be.eq(1);
        expect(
            moduleDescriptor.requires[0],
            "1st module descriptor requires dependency must be RequiredModule"
        ).to.be.eq(RequiredModule);
    }

    @test("Get postConstruct methods")
    getPostConstructMethods() {
        const {postConstructMethods} = metadata.getTypeDescriptor(CustomModuleWithMetatags);
        expect(postConstructMethods.length, "Class has 2 postConstruct methods").to.be.eq(2);
        ["postConstruct", "anotherPostConstruct"].forEach((methodName, index) => {
            expect(postConstructMethods[index], "postConstruct method name must be correct").to.be.equals(methodName);
        });
    }

    @test("Get preDestroy methods")
    getPreDestroyMethods() {
        const {preDestroyMethods} = metadata.getTypeDescriptor(CustomModuleWithMetatags);
        expect(preDestroyMethods.length, "Class has 2 preDestroy methods").to.be.eq(2);
        ["preDestroy", "anotherPreDestroy"].forEach(
            (methodName, index) => {
                expect(preDestroyMethods[index], "preDestroy method name must be correct").to.be.equals(methodName);
            });
    }

    @test("Get property injections")
    getPropertyInjections() {
        const {propertyInjections} = metadata.getTypeDescriptor(CustomModuleWithMetatags);
        expect(propertyInjections.length, "Class has 2 property injections").to.be.eq(2);
        [CustomInjectedClass, Injector].forEach((method, index) => {
            expect(propertyInjections[index].type, "Property injection type must be correct").to.be.equals(method);
        });
    }

    @test("@Module metadata Requires")
    moduleRequires(done: () => void) {
        RequiredModule.constructionCallback = done;

        const context = new Context();
        context.configure(CustomModule);
        context.initialize();
    }

    @test("@Module metadata Requires a non module")
    moduleRequiresNonModule() {
        RequiredClass.constructionCallback = () => {
            throw new Error("RequiredClass should not be initialized because @Module 'requires' tag should only create new modules not classes");
        };

        const context = new Context();
        context.configure(CustomModule2);
        context.initialize();
    }

}