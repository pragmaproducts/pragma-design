import {TemplateInflator} from './../node_modules/onkey-bridge/lib/template-inflator.js';
import {showResponseMessages, createUrlMapFromParameters} from "./data-utils.js";
import { loadSchema } from './schema-loader.js';

export class Resource {
    constructor(name, contextType) {
        this.name = name; 
        this.contextType = contextType;
        this.errorMessageContext = `${this.name}_${contextType}`;
        this.inflator = new TemplateInflator(onkeyApi);
        this._typeNamesMap = new Map([
            ["assist/batch-update", "AssistBatchUpdate"],
            ["assist/create", "AssistCreate"],
            ["assist/dashboard", "AssistDashboard"],
            ["assist/update", "AssistUpdate"],
            ["assist/view", "AssistView"],
            ["batch-update", "BatchUpdate"],
            ["create", "Create"],
            ["dashboard", "Dashboard"],
            ["detailCollection", "DetailCollection"],
            ["update", "Update"],
            ["view", "View"],
            ["menu", "UIMenu"],
            ["theme", "UITheme"]
        ]);
    }

    dispose() {
        window.pragmaMessages.clearContext(this.errorMessageContext);
        this.inflator = null;
        this.name = null;
        this.contextType = null;
        this._typeNamesMap.clear();
        this._typeNamesMap = null;
    }

    _compareNodes(a, b) {
        if (a.name < b.name)
            return -1;
        if (a.name > b.name)
            return 1;
        return 0;
    }

    async batchDelete(event) {
        window.pragmaMessages.clearContext(this.errorMessageContext);
        // TODO GM: We need to pass in the action name
        const response = await onkeyApi.postMessage("executeActionAsync", this.name, event.action,this.parametersToMap(event.parameters),null, event.model);
        if (response.isValid() === false) {
            showResponseMessages(response, this.errorMessageContext);
        }
        return response;
    }

    async create(event) {
        window.pragmaMessages.clearContext(this.errorMessageContext);
        const response = await onkeyApi.postMessage("executeActionAsync", this.name, event.action,this.parametersToMap(event.parameters),null, event.model);
        if (response.isValid()) {
            event.successCallback(response);
        }
        else {
            showResponseMessages(response, this.errorMessageContext);
            event.errorCallback(response);
        }
    }

    /**
     * Posts message to on key api worker to create resource customization
     * @param actionName
     * @param parameters - parameter object holding resource customization detail (properties, criteria, orderBy, name, global vs temp, etc)
     * @returns {Promise<*>} - returns customisationId
     */
    async createResourceCustomization(actionName, parameters) {
        return await onkeyApi.postMessage("createResourceCustomisation", this.name, actionName, parameters);
    }
    
    async delete(event) {
        window.pragmaMessages.clearContext(this.errorMessageContext);
        const response = await onkeyApi.postMessage("executeActionAsync", this.name, event.action,this.parametersToMap(event.parameters),null, {version: event.version});
        if (response.isValid() === false) {
            showResponseMessages(response, this.errorMessageContext);
        }
        return response;
    }

    async expandTree(resourceAction, path) {
        const response = await onkeyApi.postMessage('expandTreeAsync', this.name, resourceAction, path);
        showResponseMessages(response, this.errorMessageContext);

        return response.data.nodes.sort(this._compareNodes);
    }

    async fetch(event) {
        const response = await onkeyApi.postMessage("executeActionAsync", this.name, event.action, this.parametersToMap(event.parameters));
        if (response.isValid()) {
            event.successCallback(response.data);
        }
        else {
            showResponseMessages(response, this.errorMessageContext);
        }
    }
        
    resolveTypeName(type) {        
        // TODO JB/GM: Remove this resolver/function when the UI works with template name instead of resource name
        if (!this._typeNamesMap.has(type)) {
            throw new Error(`There are no type mapping for type: '${type}'.`)
        }  
        
        return this._typeNamesMap.get(type);
    }
    
    async fetchSchema(type, customisationId) {
        let template = null;        
        const templateName = `${this.name}${this.resolveTypeName(type)}`;
        const response = await onkeyApi.postMessage("getTemplate", templateName, customisationId);
        if (response.isValid() === false) {
            const path = `${type}/${this.name}.json`;
            template = await loadSchema(path);
            template = await this.inflateValidations(template);
            template = await this.inflateParameters(template);
            return template;          
        }
        if (response.isValid()) {
            template = await this.inflateValidations(response.data.content);
            template = await this.inflateParameters(template);           
        }        
        else {
            showResponseMessages(response, this.errorMessageContext);
        }        

        return template;
    }

    async getResource() {
        const response = await onkeyApi.postMessage('getResourceAsync', this.name);
        showResponseMessages(response, this.errorMessageContext);

        return response.data;
    }

    async getResourceAction(actionName, customisationId) {
        const content = customisationId != null ? { customisationId: customisationId } : null;
        const response = await onkeyApi.postMessage('getResourceActionAsync', this.name, actionName, content);
        showResponseMessages(response, this.errorMessageContext);

        return response.data;
    }
    
    async inflateParameters(template) {
        const response = await this.inflator.inflateQueryParametersAsync(this.name, template);
        showResponseMessages(response, this.errorMessageContext);

        if (response.notification.isValid()) {
            template = response.template
        }

        return template;
    }

    async inflateValidations(template) {
        const response = await this.inflator.inflateValidationsAsync(template);
        showResponseMessages(response, this.errorMessageContext);

        if (response.notification.isValid()) {
            template = response.template
        }

        return template;
    }

    parametersToMap(parameters) {
        if (parameters == null) return new Map();
        return new Map(Object.entries(parameters));
    }

    async performAction(action) {
        const resourceName = action.remote;
        const actionName = action.action;
        const urlMap = createUrlMapFromParameters(action.parameters);
        let model = null;

        if (action.parameters.model != null) {
            model = action.parameters.model.raw != null ? action.parameters.model.raw() : action.parameters.model;
        }

        const result = await onkeyApi.postMessage("executeActionAsync", resourceName, actionName, urlMap, null, model);
        showResponseMessages(result, this.errorMessageContext);
        if (result.isValid() === true){
            return result.data || true;    
        } 
    }

    async update(event) {
        window.pragmaMessages.clearContext(this.errorMessageContext);
        const response = await onkeyApi.postMessage("executeActionAsync", this.name, event.action,this.parametersToMap(event.parameters),null, event.model);
        if (response.isValid()) {
            event.successCallback(response);
        }
        else {
            showResponseMessages(response, this.errorMessageContext);
            event.errorCallback(response);
        }
    }
}