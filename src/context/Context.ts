import {EventDispatcher} from "../eventDispatcher/EventDispatcher";
import {Injector} from "../injector/Injector";
import {Type} from "../type/Type";
import {ContextExtension} from "./data/ContextExtension";
import {ContextLifecycleEvent} from "./event/ContextLifecycleEvent";
import {ModuleDescriptor} from "../metadata/data/ModuleDescriptor";
import {metadata} from "../metadata/metadata";
import {TypeMetadata} from "../metadata/data/TypeMetadata";
import {ContextModuleEvent} from "./event/ContextModuleEvent";
import {InjectionMapping} from "../injector/data/InjectionMapping";
import {typeReferenceToString} from "../util/StringUtil";
import {InjectionDescriptor} from "../metadata/data/InjectionDescriptor";

/**
 * Application context representation class - a hosting environment for application or its sub context
 * TODO: Add handling of child and parent contexts in this class
 * @author Jānis Radiņš / Kristaps Peļņa
 */
export class Context extends EventDispatcher {

    private _initialized: boolean = false;
    private _destroyed: boolean = false;

    private extensions: Type<ContextExtension>[] = [];
    private extensionInstances: ContextExtension[] = [];

    private modules: Type[] = [];
    private moduleMetadata: Map<Type, ModuleDescriptor> = new Map<Type, ModuleDescriptor>();

    /**
     * @private
     */
    constructor() {
        super();
    }

    //--------------------------
    //  Public properties
    //--------------------------

    /**
     * Injector instance used within current Context
     * @type {Injector}
     */
    readonly injector = new Injector();

    /**
     * Whether Context is initialized.
     * Extension mappings and modules should be added only whilst Context is not initialized.
     * @returns {boolean}
     */
    get initialized(): boolean {
        return this._initialized;
    }

    /**
     * Whether context is destroyed and thus unusable
     * @return {boolean}
     */
    get destroyed(): boolean {
        return this._destroyed;
    }

    //--------------------------
    //  Public methods
    //--------------------------

    /**
     * Install Context extensions
     * @param extension A single entry or list of Type<ContextExtension> entries
     * @returns {Context} Current context operation is performed on
     */
    install(...extension): this {
        if (this._initialized) {
            throw new Error("Installation of extensions is not permitted as context is already initialized");
        }

        this.throwErrorIfDestroyed();
        this.extensions.push(...extension);

        return this;
    }

    /**
     * Uninstall Context extensions
     * @param extension A single entry or list of Type<ContextExtension> entries
     * @returns {Context} Current context operation is performed on
     */
    uninstall(...extension): this {
        if (this._initialized) {
            throw new Error("Extensions can not be uninstall after a context initialization");
        }
        this.throwErrorIfDestroyed();

        for (const ext of extension) {
            const index = this.extensions.indexOf(ext);
            if (index !== -1) {
                this.extensions.splice(index, 1);
            }
        }
        return this;
    }

    /**
     * Check if an extension is installed
     * @param extension A context extension
     * @returns {boolean}
     */
    hasExtension(extension: Type<ContextExtension>): boolean {
        return this.extensions.indexOf(extension) !== -1;
    }

    /**
     * Configure application with application modules.
     * @param module A single entry or list of modules demarcated by @Module decorator.
     * @returns {Context} Current context operation is performed on
     */
    configure(...module): this {
        if (this._initialized) {
            throw new Error("Configuration of modules is not permitted as context is already initialized");
        }
        this.throwErrorIfDestroyed();

        this.modules.push(...module);
        return this;
    }

    /**
     * Initialize context - install extensions, map modules and move through init lifecycle phases
     * @throws Error on repeated call
     */
    initialize(): void {
        if (this._initialized) {
            throw new Error("Context is already installed");
        }
        this.throwErrorIfDestroyed();

        //Create extension instances before we proceed
        this.initializeExtensions();
        //Inform on pre-initialize, so extensions have a event pointer to do basic setup
        this.dispatchEvent(new ContextLifecycleEvent(ContextLifecycleEvent.PRE_INITIALIZE, this));
        //And then dispatch event that marks that all initialization should be finalized by now
        this.dispatchEvent(new ContextLifecycleEvent(ContextLifecycleEvent.INITIALIZE, this));

        //Collect list of all module metadata registered with Context
        this.prepareModules();
        //Spawn Injector mappings according to module metadata before modules are created
        this.prepareInjector();
        //Instantiate modules
        this.initializeModules();

        this._initialized = true;

        //And dispatch event that we have finished initialization
        this.dispatchEvent(new ContextLifecycleEvent(ContextLifecycleEvent.POST_INITIALIZE, this));
    }

    /**
     * Check if some module is mapped with Context via direct mapping via configure() call or as required module of any
     * directly mapped modules.
     * This method will return any valid data only after Context is initialized
     * @param module Module to check mapping of
     */
    hasModule(module: Type): boolean {
        return this.moduleMetadata.has(module);
    }

    /**
     * Destroy context, its Injector, modules and extensions
     * @throws Error if context is not initialized or already destroyed
     */
    destroy(): void {
        if (!this._initialized) {
            throw new Error("Context is not initialized yet");
        }
        this.throwErrorIfDestroyed();

        //Inform on pre-initialize, so extensions have a event pointer to do basic destroy
        this.dispatchEvent(new ContextLifecycleEvent(ContextLifecycleEvent.PRE_DESTROY, this));
        //Implement actual tear down as this is encountered

        this.dispatchEvent(new ContextLifecycleEvent(ContextLifecycleEvent.DESTROY, this));

        //this will invoke preDestroy on all singleton instances spawned via Injector
        this.injector.destroy();

        this.extensionInstances = [];
        this.moduleMetadata = null;

        this._destroyed = true;

        //finalize stuff
        this.dispatchEvent(new ContextLifecycleEvent(ContextLifecycleEvent.POST_DESTROY, this));
        this.removeAllEventListeners();
    }

    //--------------------------
    //  Private methods
    //--------------------------

    private throwErrorIfDestroyed(): void {
        if (this._destroyed) {
            throw new Error("Context is already destroyed");
        }
    }

    private initializeExtensions(): void {
        for (const extensionType of this.extensions) {
            const extension = new extensionType();
            extension.extend(this);
            this.extensionInstances.push(extension);
        }
    }

    private prepareModules(): void {
        for (const moduleType of this.modules) {
            this.registerModule(moduleType);
        }
    }

    private registerModule(module: Type, parent?: Type): void {
        if (this.moduleMetadata.has(module)) {
            if (!parent) {
                console.warn(`
                    Context warn: ${typeReferenceToString(module)} is mapped sever times to Context.
                    Not a big problem as second mapping will be ignored but this indicates that there could be some error.
                `);
            }
            return;
        }
        if (!metadata.hasMetadata(module)) {
            console.warn(`Context warn: ${typeReferenceToString(module)} has no @Module metadata thus it cannot be a module in Context understanding.`);
            return;
        }
        let meta: TypeMetadata = metadata.getTypeDescriptor(module);
        if (!meta.moduleDescriptor) {
            console.warn(`Context warn: ${typeReferenceToString(module)} metadata has no moduleDescriptor thus it cannot be a module in Context understanding.`);
            return;
        }

        //Loop through module dependencies and register those modules just before module which requires them
        //just as module might want to override some mappings from required module and that require its mappings to be
        //executed after imported module
        if (meta.moduleDescriptor.requires && meta.moduleDescriptor.requires.length > 0) {
            for (let requiredModule of meta.moduleDescriptor.requires) {
                this.registerModule(requiredModule, module);
            }
        }
        this.moduleMetadata.set(module, meta.moduleDescriptor);
        //Dispatch event so Context extensions can react to new module added to Context scope
        this.dispatchEvent(new ContextModuleEvent(
            ContextModuleEvent.REGISTER_MODULE,
            this,
            module,
            meta.moduleDescriptor
        ));
    }

    private prepareInjector(): void {
        let injectionsToInstantiate: Type[] = [];
        this.moduleMetadata.forEach((moduleDescriptor: ModuleDescriptor) => {
            if (!moduleDescriptor.mappings) {
                return;
            }

            for (let mapping of moduleDescriptor.mappings) {
                injectionsToInstantiate.push(...this.prepareMapping(mapping));
            }
        });
        //Instantiate mappings that have been marked so
        for (let instanceToInstantiate of injectionsToInstantiate) {
            this.injector.get(instanceToInstantiate);
        }
    }

    private prepareMapping(mapping: Type | InjectionDescriptor): Type[] {
        const injectionsToInstantiate: Type[] = [];

        //We have got a singular entry and such are to be mapped as singletons
        if ("map" in mapping === false) {
            const mappedType = mapping as Type;
            if (this.injector.hasDirectMapping(mappedType)) {
                this.injector.unMap(mappedType);
            }
            this.injector.map(<Type> mapping).asSingleton();
        } else {
            const injection = mapping as InjectionDescriptor;
            if (typeof injection.map !== "function") {
                throw new Error("Injection mapping doesn't seem to be a valid object type");
            }

            const injectionMapping = this.injector.map(injection.map);
            if (injection.useExisting) {
                //if use existing is set create forward reference and ignore the rest
                injectionMapping.toExisting(injection.useExisting);
            } else if (injection.useValue) {
                //Look for use value as next one
                injectionMapping.toValue(injection.useValue);
            } else if (injection.useType) {
                //If use type is set map injection to type or to singleton in case if asSingleton is present
                if ('asSingleton' in injection && !injection.asSingleton) {
                    injectionMapping.toType(injection.useType);
                } else {
                    injectionMapping.toSingleton(injection.useType);
                }
            } else if (injectionMapping.asSingleton) {
                //If everything else fails make mapping as singleton
                injectionMapping.asSingleton();
            }
            if (injection.instantiate && injectionsToInstantiate.indexOf(injection.map) === -1) {
                injectionsToInstantiate.push(injection.map);
            }
        }
        return injectionsToInstantiate;
    }

    private initializeModules(): void {
        this.moduleMetadata.forEach((metadata: ModuleDescriptor, module: Type) => {
            //Let us be using sealed modules for a start just as there is no reasonable scenario in which modules
            //should be added and removed dynamically
            this.injector.map(module).asSingleton().seal();
            //Instantiate!
            this.injector.get(module);
        });
    }

}
