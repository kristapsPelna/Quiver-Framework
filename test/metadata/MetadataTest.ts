import {suite, test} from "mocha-typescript";
import {expect} from 'chai';
import {RequiredModule} from "./data/RequiredModule";
import {CustomModule} from "./data/CustomModule";
import {CustomModuleWithMetatags} from "./data/CustomModuleWithMetatags";
import {metadata} from "../../src/metadata/metadata";
import {TypeMetadata} from "../../src/metadata/data/TypeMetadata";
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
@suite export class MetadataTest {

    after() {
        //Clear custom class static callbacks
        RequiredModule.constructionCallback = null;
        RequiredClass.constructionCallback = null;
    }

    @test("Get constructor arguments")
    getConstructorArguments() {
        let typeMetadata: TypeMetadata = metadata.getTypeDescriptor(CustomModuleWithMetatags);

        //Constructor arguments
        expect(
            typeMetadata.constructorArguments.length,
            "Constructor must have 2 arguments"
        ).to.be.eq(2);

        expect(
            typeMetadata.constructorArguments[0].type,
            "Second constructor argument type must be Injector"
        ).to.be.eq(Injector);

        expect(
            typeMetadata.constructorArguments[1].type,
            "First constructor argument type must be CustomInjectedClass"
        ).to.be.eq(CustomInjectedClass);

        expect(
            typeMetadata.constructorArguments[0].isOptional,
            "First constructor argument is not optional"
        ).to.be.false;

        expect(
            typeMetadata.constructorArguments[0].isOptional,
            "Second constructor argument is not optional"
        ).to.be.false;
    }

    @test("Get mapped interfaces")
    getMappedInterfaces() {
        let typeMetadata: TypeMetadata = metadata.getTypeDescriptor(CustomModuleWithMetatags);

        expect(
            typeMetadata.mappedInterfaces.length,
            "Only a single interface is mapped to this class"
        ).to.be.eq(1);

        expect(
            typeMetadata.mappedInterfaces[0],
            "First mapped interface must be CustomInterface"
        ).to.be.eq(CustomInterface);
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
        let typeMetadata: TypeMetadata = metadata.getTypeDescriptor(CustomModuleWithMetatags);

        //Mappings
        expect(
            typeMetadata.moduleDescriptor.mappings.length,
            "Module descriptor has 3 mappings"
        ).to.be.eq(3);

        expect(
            typeMetadata.moduleDescriptor.mappings[0],
            "1st module descriptor mapping must be CustomInjectedClass"
        ).to.be.eq(CustomInjectedClass);

        expect(
            (<InjectionDescriptor> typeMetadata.moduleDescriptor.mappings[1]).map,
            "2nd module descriptor mapping.map must be CustomModel"
        ).to.be.eq(CustomModel);

        expect(
            (<InjectionDescriptor> typeMetadata.moduleDescriptor.mappings[2]).map,
            "3rd module descriptor mapping.map must be CustomModel2"
        ).to.be.eq(CustomModel2);

        expect(
            (<InjectionDescriptor> typeMetadata.moduleDescriptor.mappings[2]).useExisting,
            "3rd module descriptor mapping.useExisting must be CustomModel2"
        ).to.be.eq(CustomModel);

        //Requires
        expect(
            typeMetadata.moduleDescriptor.requires.length,
            "Module descriptor has 1 requires dependency"
        ).to.be.eq(1);

        expect(
            typeMetadata.moduleDescriptor.requires[0],
            "1st module descriptor requires dependency must be RequiredModule"
        ).to.be.eq(RequiredModule);
    }

    @test("Get postConstruct methods")
    getPostConstructMethods() {
        let typeMetadata: TypeMetadata = metadata.getTypeDescriptor(CustomModuleWithMetatags);

        expect(
            typeMetadata.postConstructMethods.length,
            "Class has 2 postConstruct methods"
        ).to.be.eq(2);

        let methodNames:string[] = ["postConstruct", "anotherPostConstruct"];

        for (let i:number = 0; i < methodNames.length; i++) {
            expect(
                typeMetadata.postConstructMethods[i],
                "postConstruct method name must be correct"
            ).to.be.equals(methodNames[i]);
        }
    }

    @test("Get preDestroy methods")
    getPreDestroyMethods() {
        let typeMetadata: TypeMetadata = metadata.getTypeDescriptor(CustomModuleWithMetatags);

        expect(
            typeMetadata.preDestroyMethods.length,
            "Class has 2 preDestroy methods"
        ).to.be.eq(2);

        let methodNames:string[] = ["preDestroy", "anotherPreDestroy"];

        for (let i:number = 0; i < methodNames.length; i++) {
            expect(
                typeMetadata.preDestroyMethods[i],
                "preDestroy method name must be correct"
            ).to.be.equals(methodNames[i]);
        }
    }

    @test("Get property injections")
    getPropertyInjections() {
        let typeMetadata: TypeMetadata = metadata.getTypeDescriptor(CustomModuleWithMetatags);

        expect(
            typeMetadata.propertyInjections.length,
            "Class has 2 property injections"
        ).to.be.eq(2);

        let injectionTypes:any[] = [CustomInjectedClass, Injector];

        for (let i:number = 0; i < injectionTypes.length; i++) {
            expect(
                typeMetadata.propertyInjections[i].type,
                "Property injection type must be correct"
            ).to.be.equals(injectionTypes[i]);
        }
    }

    @test("@Module metadata Requires")
    moduleRequires(done:() => void) {
        RequiredModule.constructionCallback = done;

        let context:Context = new Context();
        context.configure(CustomModule);
        context.initialize();
    }

    @test("@Module metadata Requires a non module")
    moduleRequiresNonModule() {
        RequiredClass.constructionCallback = () => {
            throw new Error("RequiredClass should not be initialized because @Module 'requires' tag should only create new modules not classes");
        };

        let context:Context = new Context();
        context.configure(CustomModule2);
        context.initialize();
    }

}