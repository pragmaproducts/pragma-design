import {cloneObject} from "./../node_modules/pragma-views2/baremetal/lib/class-helper.js";
import {DatasetFactory} from "./../node_modules/pragma-views2/lib/dataset-factory.js";
import {Resource} from "./resource.js";
import {BaseElement} from "./../node_modules/pragma-views2/baremetal/lib/base-element.js"
import {readQueryString} from "./url-helpers.js";

import {
    performTriggersFor,
    removeObserverFromCache
} from "./../node_modules/pragma-views2/baremetal/lib/binding/observers.js";
import {getCollectionData} from "./data-utils.js";


export class DynamicResourcesDialogBase extends BaseElement {

    constructor() {
        super();
        this._getDetailsHandler = this._getDetails.bind(this);
        this._refreshAssistantHandler = this._refreshAssistant.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        this.initTemplate();
        this.pragmaForm = this.querySelector("pragma-form");
        this.container = this.querySelector(".dialog-container");
        this.context = this;
        this.schemaLoadedHandler = this.schemaLoaded.bind(this);
        this.pragmaForm.addEventListener("loaded", this.schemaLoadedHandler);
    }

    disconnectedCallback() {
        window.pragmaMessages.clearContext(this.errorMessageContext);
        window.eventEmitter.remove(`refresh-assistant`, this._refreshAssistantHandler);

        if (this.oldContext != null) {
            window.eventEmitter.emit("refresh-assistant", {
                remote: this.oldContext.remote,
                type: this.oldContext.type
            });
        }

        if(this.closedCallback != null) {
            this.closedCallback(this.modified);
        }

        this.context = null;
        this._disposeResources();
        this.oldContext = null;
        this.resourceName = null;
        this.parameters = null;
        this.resourceId = null;
        this.pragmaForm = null;
        this.container = null;
        super.disconnectedCallback();
    }

    get context() {
        return this.pragmaForm.context;
    }

    set context(newValue) {
        this.pragmaForm.context = newValue;
    }

    get model() {
        return this.pragmaForm.model;
    }

    set model(newValue) {
        this.pragmaForm.model = newValue;
    }

    get schema() {
        return this.pragmaForm.schema;
    }

    set schema(newValue) {
        this.pragmaForm.schema = newValue;
    }

    _disposeResources() {
        if (this.resource != null) {
            this.resource.dispose();
            this.resource = null;
        }

        if (this.factory != null) {
            this.factory.dispose();
            this.factory = null;
        }

        if (this.model != null) {
            removeObserverFromCache(this.model);
            if (this.model.dispose != null) {
                this.model.dispose();
            }

            this.model = null;
        }

        if (this.schema != null) {
            this.schema = null;
        }
    }

    async _getDetails(definition, model, parentItem, parameters, queryOptions, fetchCountCallback) {
        return getCollectionData(this.resource, definition, parameters, null, queryOptions, fetchCountCallback);
    }

    _idToQueryString(id){
        return `?$filter=id in (${id.toString()}L)`;
    }

    _refreshAssistant(params) {
        if (params.type === this.contextType && params.remote === this.resource.name) {
            this.loadAssistant();
        }
    }

    _resetScrollPosition() {
       // this.container.scrollTo(0, 0);
    }
    

    async create(options) {
        if(this.resourceName === options.remote) {
            this.resourceId = options.resourceId;
            if (this.schema.variables != null) {
                this.setParametersOnSchema();
            }
            this.model.load();
            return;
        }
        this.modified = false;
        this._disposeResources();
        this.oldContext = null;
        this.resourceName = null;
        this.parameters = null;
        this.resourceId = null;
        // Adding on create to prevent fire when dismissed
        window.eventEmitter.on("refresh-assistant", this._refreshAssistantHandler);

        this.oldContext = options.context;
        this.dataSourceRef = options.dataSourceRef;
        this.queryRemoteCallback = options.queryRemoteCallback;

        if (options.resourceId != null) {
            this.resourceId = options.resourceId;
        }

        if (options.parameters != null) {
            this.parameters = options.parameters;
        }
        
        if (options.closedCallback != null) {
            this.closedCallback = options.closedCallback;
        }

        this.setParametersFromQueryString();

        this.resourceName = options.remote;
        await this.setResource();
        this._resetScrollPosition();
    }

    datasetRemote(options) {
        switch  (options.type) {
            case "create":
                return this.resource.create(options);
            case "update":
                return this.resource.update(options);
            case "load":
                return this.resource.fetch(options);
        }
    }
    
    /**
     * Override in derived class
     */
    initTemplate() {

    }

    async loadAssistant() {
        const assistSchema = await this.resource.fetchSchema(`assist/${this.contextType}`);

        window.eventEmitter.emit("assistant", {
            viewModel: this,
            schema: cloneObject(assistSchema)
        });
    }

    loadModel() {
        if (this.resourceId != null) {
            this.model.load();
        }
        else {
            this.model.setInitialValues({});
        }
    }

    async performAction(action) {
        return await this.resource.performAction(action);
    }
    
    async save(activityId) {
        window.eventEmitter.emit(`activity_${activityId}`, "busy");
        let activityState = "done";
        try {
            let response;
            if (this.resourceId != null) {
                response = await this.model.update();
            }
            else {
                response = await this.model.create();
            }

            if (response != null && response === true) {
                this.modified = true;
                if (this.resourceId != null) {
                    await this.model.load();
                }
               return response;
            }
            else {
                activityState = "error";
            }
        }
        finally {
            window.eventEmitter.emit(`activity_${activityId}`, activityState);
        }
    }
    
    schemaLoaded() {
        if (this.schema.variables != null) {
            this.setParametersOnSchema();
        }

        this.factory = new DatasetFactory({
            schema: this.schema,
            remoteDsCallback: this._getDetailsHandler,
            remoteCallback: this.datasetRemote.bind(this)
        });
        this.model = this.factory.createDataSet(0, null, this.model, this.resourceName, this.dataSourceRef);

        this.loadModel();
        this.schema.variables.dataModel = this.model;
        performTriggersFor(this.model);
        this.loadAssistant();
    }

    setParametersFromQueryString() {
        const queryStringParameters = readQueryString();
        if (this.parameters != null) {
           
            for (const key of Object.keys(queryStringParameters)) {
                this.parameters[key] = queryStringParameters[key];
            } 
        } 
        else {
            this.parameters = queryStringParameters;
        }
    }

    setParametersOnSchema() {
        if (this.schema.variables.parameters == null) {
            this.schema.variables.parameters = {};
        }

        this.schema.variables.parameters.resourceId = this.resourceId;
        if (this.parameters != null) {
            for (const key of Object.keys(this.parameters)) {
                this.schema.variables.parameters[key] = this.parameters[key];
            }
        }
    }


    /**
     * This function is called everytime the resource name in the url changes
     */
    async setResource() {
        //this._disposeResources();
        this.resource = new Resource(this.resourceName, this.contextType);
        this.errorMessageContext = `${this.resourceName}_${this.contextType}`;
        const resourceSchema = await this.resource.fetchSchema(this.contextType);
        this.schema = cloneObject(resourceSchema);
    }

    undo(){
        window.eventEmitter.emit("activity_1005", "busy");
        try {
            window.pragmaMessages.clearContext(this.resource.name);
            this.model.resetToDefault();
        }
        finally {
            window.eventEmitter.emit("activity_1005", "done");
        }
    }
}