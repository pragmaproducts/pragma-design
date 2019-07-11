import {Resource} from "./resource.js";
import {DatasetFactory} from "../node_modules/pragma-views2/lib/dataset-factory.js";
import {ViewBase} from "../node_modules/pragma-views2/baremetal/lib/view-base.js"
import {cloneObject} from "../node_modules/pragma-views2/baremetal/lib/class-helper.js";
import {performTriggersFor, removeObserverFromCache} from "./../node_modules/pragma-views2/baremetal/lib/binding/observers.js";
import {readQueryString} from "./url-helpers.js";
import {getCollectionData} from "./data-utils.js";
import {Utils} from "./utils.js";

export class DynamicResourcesViewBase extends ViewBase {

    get model() {
        return this._model;
    }

    set model(newValue) {
        this._model = newValue;
    }

    _disposeResources() {
        // Need to clear assist to prevent holding on to model
        window.eventEmitter.emit("clear-assistant");

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

        if (this.assistSchema != null) {
            this.assistSchema = null;

        }

        if (this.schema != null) {
            this.schema = null;
        }

        if (this.resource != null) {
            this.resource.dispose();
            this.resource = null;
        }

        document.title = window.translations.applicationTitle;

    }

    async _getDetails(definition, model, parentItem, parameters, queryOptions, fetchCountCallback) {
        return getCollectionData(this.resource, definition, parameters, null, queryOptions, fetchCountCallback);
    }

    _refreshAssistant(params) {
        if (params.type == this.contextType && params.remote == this.resource.name) {
            this.loadAssistant();
        }
    }

    connectedCallback() {
        this.context = this;
        this._getDetailsHandler = this._getDetails.bind(this);
        this._refreshAssistantHandler = this._refreshAssistant.bind(this);
        window.eventEmitter.on("refresh-assistant", this._refreshAssistantHandler);
        this.initBreadcrumb();
        this.selectedId = [];
    }
    
    initBreadcrumb() {
        this.breadcrumb = document.querySelector("pragma-breadcrumb");
        this.breadcrumb.mediator = window.breadcrumbNavigator;
    }

    disconnectedCallback() {
        this._getDetailsHandler = null;
        window.eventEmitter.remove("refresh-assistant", this._refreshAssistantHandler);
        this._refreshAssistantHandler = null;
        this._disposeResources();
        this.resourceName = null;
        this.resourceId = null;
    }

    async loadAssistant() {
        const assistSchema = await this.resource.fetchSchema(`assist/${this.contextType}`);
        window.eventEmitter.emit("assistant", {
            viewModel: this,
            schema: assistSchema
        });
    }

    loadModel() {
        this.model.setInitialValues({});
    }

    async performAction(action) {
        return await this.resource.performAction(action);
    }

    async routeParametersChanged(newValue) {
        const isNewResource = newValue.resourceName != null && this.resourceName !== newValue.resourceName;

        const oldResourceValue = this.resourceId;
        this.resourceId = newValue.resourceId === ""? null: newValue.resourceId;
        if (newValue.resourceId != null && newValue.resourceId !== "" && oldResourceValue != newValue.resourceId) {

            if (isNewResource === false && this.resourceId) {
                this.setParametersOnSchema(this.schema);
                this.loadModel();
            }

          
        }

        if (isNewResource) {
            await this.setResource(newValue.resourceName);
        }

        if (this.resourceId != this.selectedId) {
            this.selectedId = [Number(this.resourceId)];
        }
    }

    setParametersOnSchema(schema) {
        if (schema.variables.parameters == null) {
            schema.variables.parameters = {};
        }

        schema.variables.parameters.resourceId = this.resourceId;
        if (this.parameters != null) {
            for (const key of Object.keys(this.parameters)) {
                schema.variables.parameters[key] = this.parameters[key];
            }
        }
    }

    async setResource(newValue) {
        if (newValue == undefined) return;

        this.resourceName = newValue;

        this._disposeResources();

        this.resource = new Resource(this.resourceName, this.contextType);
        this.errorMessageContext = `${this.resourceName}_${this.contextType}`;
        const resourceSchema = await this.resource.fetchSchema(this.contextType);
        this.schema = cloneObject(resourceSchema);
        await this.loadAssistant();
        document.title = `${window.translations.applicationTitle} - ${Utils.resourceTextToPrintText(this.resourceName)}` ;
        this. _setBreadcrumbRootValue();
    }

    _setBreadcrumbRootValue() {
        if (this.breadcrumb.mediator.data() == null) {
            this.breadcrumb.mediator.add(window.location.hash, {
                context: this.resourceId || this.contextType,
                remote:Utils.resourceTextToPrintText(this.resourceName),
                view: this.view
            });
        }
    }
    
    schemaLoaded(event) {
        this.setParametersOnSchema(this.schema);
        this._updateDataSourceDefinition(this.schema);

        this.factory = new DatasetFactory({
            schema: this.schema,
            remoteDsCallback: this._getDetailsHandler,
            remoteCallback: this.datasetRemote.bind(this),
            draft: event.detail.draft
        });

        this.model = this.factory.createDataSet(0, null, this.model, this.resourceName);

        this.loadModel();

        performTriggersFor(this.model);

        this.schema.variables.dataModel = this.model;

        this.factory.finalize();
    }
    
    _updateDataSourceDefinition(schema) {
        if ((schema.datasources || []).length === 0 || (this.parameters || {}).filter == null || this.parameters.resourceAction == null) return;
        
        const dsDefinition = schema.datasources.find(ds => ds.action === this.parameters.resourceAction);
        
        if (dsDefinition == null) return;
        
        dsDefinition.queryString = `?$filter=${this.parameters.filter}`;
    }

    datasetRemote(options) {
        switch (options.type) {
            case "create":
                return this.resource.create(options);
            case "update":
                return this.resource.update(options);
            case "load":
                return this.resource.fetch(options);
        }
    }
}
