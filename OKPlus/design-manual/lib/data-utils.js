import { SchemaHelper } from "../node_modules/pragma-views2/lib/schema-helper.js";
import { SeverityType } from "./../node_modules/pragma-core/lib/models/severity-type.js";
import { PragmaMessagesSections } from "./../node_modules/pragma-views2/lib/pragma-messages-sections.js";
import { SystemConstants } from "./system-constants.js";

/**
 * This library is resource agnostic and provides functions that work with any resource.
 * All functions defined here has to at minimum define the server resource name and schema definition
 */

/**
 * This function allows you to fetch a collection or data pending the parameters provided
 * @param resource
 * @param definition
 * @param parameters
 * @param queryString
 * @param queryOptions
 * @param fetchCountCallback
 * @returns {Promise<*>}
 */
export async function getCollectionData(resource, definition, parameters, queryString, queryOptions, fetchCountCallback) {
    let resourceName = definition.remote;
    let resourceAction = definition.action;
    if (definition.isLookup === true) {
        resourceName = resource.name;
        resourceAction = definition.remote;
    }

    queryString = queryString || definition.queryString;
    if (queryOptions != null) {
        queryString = buildFilterQueryString(queryOptions, queryString);
    }

    let skip = 0;
    let finishedLoading = false;
    const content = definition.customisationId != null ? { customisationId: definition.customisationId } : null;
    const result = [];
    const prefix = queryString == null ? "?" : `${queryString}&`;

    while ((fetchCountCallback == null || fetchCountCallback(skip)) === true && finishedLoading === false) {
        const pagedQueryString = `${prefix}$top=${SystemConstants.pagingCount}&$skip=${skip}`;
        let response = await onkeyApi.postMessage("executeActionAsync", resourceName, resourceAction, resource.parametersToMap(parameters), pagedQueryString, null, content);
        if (response.isValid()) {
            definition.responseType = response.resourceActionDocumentation.request == null ?
                response.resourceActionDocumentation.response.entity.name :
                response.resourceActionDocumentation.request.entity.name;
            skip += response.data.length;
            result.push(...response.data);
            finishedLoading = SystemConstants.pagingCount > response.data.length || skip >= SystemConstants.fetchSoftLimit;
        } else {
            showResponseMessages(response, resource.errorMessageContext, PragmaMessagesSections.systemErrors);
            break;
        }
    }
    return result;
}

/**
 * @param {*} context 
 * @param {Function} apiFn 
 * @param {Array} parameters 
 * @param {*} notification 
 * @param {*} cancelCallback 
 */
export async function getCollection(context, apiFn, parameters, cancelCallback) {
    let skip = 0;
    let moreData = true;
    let data = [];
    while (moreData) {
        const pagedQueryString = `?$top=${SystemConstants.pagingCount}&$skip=${skip}`;
        parameters[4] = parameters[4] + pagedQueryString;
        const response = await apiFn.call(context, ...parameters);
        if (response.isValid() !== true) return response;
        data = [...data, ...response.data];
        skip += response.data.length;
        moreData = (response.data.length === SystemConstants.pagingCount) &&
            (skip <= SystemConstants.fetchSoftLimit) && !cancelCallback(skip);
    }
    return data;
}


export const severityToMessageSection = {
    [SeverityType.error]: PragmaMessagesSections.systemErrors,
    [SeverityType.information]: PragmaMessagesSections.systemInformation,
    [SeverityType.warning]: PragmaMessagesSections.systemWarnings
};

/**
 * Show response information on pragma messages
 * @param response
 * @param name
 * @param allowDismiss
 * @param detailContext
 */
export function showResponseMessages(response, name, allowDismiss = true, detailContext) {
    if ((response.notification != null) && (response.notification.messages.length > 0)) {
        for (const message of response.notification.messages) {
            const sectionName = severityToMessageSection[message.severity];
            message.detailContext = detailContext;
            window.pragmaMessages.addMessages(name, response.notification.messages, sectionName, allowDismiss);
        }
    }
}

/**
 *
 * @param template: Template literal
 * @param variables: Template literal variables
 * @returns {*}
 */
export function getHydratedTemplate(template, variables) {
    return new Function("return `" + template + "`;")
        .call(variables);
}

/**
 * Createa the URL map for parameterised actions where URL maps are defined.
 * @param parameters
 * @returns {Map<any, any>}
 */
export function createUrlMapFromParameters(parameters) {
    const keys = Object.keys(parameters).filter(item => item.indexOf("->") > 0);
    const result = new Map();
    for (let key of keys) {
        result.set(key, parameters[key]);
    }
    return result;
}

/**
 * Parameterised schema actions need to populate the parameters for the calls.
 * This function fills the parameters with the values as defined in the schema
 */
export function inflateSchemaParameters(schema, model, parameters) {
    const schemaHelper = new SchemaHelper(schema, model);
    const resultParameters = cloneObject(parameters);
    const keys = Object.keys(resultParameters);

    for (let key of keys) {
        let result = schemaHelper.getAssociatedValue(resultParameters[key]);

        if (key == "model") {
            result = this.inflateParameters(result);
        }

        resultParameters[key] = result;
    }

    return resultParameters;
}

export function cloneObject(obj) {
    const result = Object.create({});
    Object.assign(result, obj);
    return result;
}

export function isMapEqual(mapA, mapB) {
    if (mapA.size !== mapB.size) return false;
    for (const property of mapA.keys()) {
        if (!mapB.has(property)) return false;
        if (mapA.get(property) != mapB.get(property)) return false;
    }
    return true;
}

/**
 *  Construct filter query string
 * @param queryOptions
 * @param existingQueryString
 * @returns {string}
 */
export function buildFilterQueryString(queryOptions, existingQueryString) {

    // TODO JB: Chat to me about this. I have created a queryString datatype parser.
    //      - It uses the meta data and cater for all the types the OKQL supports.
    //      - Might even want to not need to use a query string at all. Lets discuss.

    const filterParameterName = "$filter";

    const queryStringParts = queryStringToObject(existingQueryString);
    // TODO JN & GM: We need to expand this to cater for other logical operators. Defaulting to AND now
    let filterString = "";

    for (const option of queryOptions) {
        const prefix = filterString !== "" ? "  AND " : "";
        filterString += `${prefix}${arrayToParameterString(option.field, option.value, option.operator)}`;
    }

    queryStringParts[filterParameterName] = filterString;

    return `?${objectToQueryString(queryStringParts)}`;
}

export function arrayToParameterString(field, value, operator) {
    if (Array.isArray(value)) {
        let filterParts = [];
        for (const part of value) {
            // TODO GM/JN Hardcoded id to number. We have to introduce Antler to parse query
            if (typeof part === "number" || field == "id") {
                filterParts.push(`${part.toString()}L`);
            } else {
                filterParts.push(`'${part}'`);
            }
        }
        return value.length > 1 ? `${field} ${operator || "IN"} (${filterParts.join()})` : `${field} ${operator || "EQ"} ${filterParts.join()}`;
    }

    return `${field} ${operator || "EQ"} ${typeof value == "string" ? `'${value}'` : `${value}L`}`;
}

export function queryStringToObject(queryString) {
    if (queryString == null) return {};
    queryString = queryString.indexOf("?") !== -1 ? queryString.replace("?", "") : queryString;

    return decodeURIComponent(queryString).split("&").reduce((result, item) => {
        const parts = item.split('=');
        result[parts[0]] = parts[1];
        return result;
    }, {});
}

export function objectToQueryString(object) {
    let newQueryString = "";
    for (const key of Object.keys(object)) {
        if (newQueryString !== "") {
            newQueryString += "&";
        }
        newQueryString += `${key}=${encodeURIComponent(object[key])}`;
    }
    return newQueryString;
}

