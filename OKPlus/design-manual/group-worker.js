class GroupWorker {
    /**
     * constructor
     */
    constructor() {
        this.createCacheHandler = this.createCache.bind(this);
        this.createGroupPerspectiveHandler = this.createGroupPerspective.bind(this);
        this.disposeGroupPerspectiveHandler = this.disposeGroupPerspective.bind(this);
        this.disposeCacheHandler = this.disposeCache.bind(this);
        this.getGroupPerspectiveHandler = this.getGroupPerspective.bind(this);
        this.getRecordsForHandler = this.getRecordsFor.bind(this);
        this.addRecordsHandler = this.addRecords.bind(this);
        this.updateRecordsHandler = this.updateRecords.bind(this);
        this.removeDataFromGroupPerspectivesHandler = this.removeDataFromGroupPerspectives.bind(this);
        this.appendCacheHandler = this.appendCache.bind(this);
        this.filterRecordsHandler = this.filterRecords.bind(this);

        this.functionMap = new Map();
        this.functionMap.set("createCache", this.createCacheHandler);
        this.functionMap.set("appendCache", this.appendCacheHandler);
        this.functionMap.set("createGroupPerspective", this.createGroupPerspectiveHandler);
        this.functionMap.set("disposeGroupPerspective", this.disposeGroupPerspectiveHandler);
        this.functionMap.set("disposeCache", this.disposeCacheHandler);
        this.functionMap.set("getGroupPerspective", this.getGroupPerspectiveHandler);
        this.functionMap.set("getRecordsFor", this.getRecordsForHandler);
        this.functionMap.set("addRecords", this.addRecordsHandler);
        this.functionMap.set("updateRecords", this.updateRecordsHandler);
        this.functionMap.set("removeRecords", this.removeDataFromGroupPerspectivesHandler);
        this.functionMap.set("filterRecords", this.filterRecordsHandler);
        this.dataCache = new Map();
    }

    /**
     * dispose
     */
    dispose() {
        this.createCacheHandler = null;
        this.createGroupPerspectiveHandler = null;
        this.disposeGroupPerspectiveHandler = null;
        this.disposeCacheHandler = null;
        this.getGroupPerspectiveHandler = null;
        this.getRecordsForHandler = null;
        this.addRecordsHandler = null;
        this.updateRecordsHandler = null;

        this.functionMap.clear();
        this.functionMap = null;
    }

    /**
     * process all incomming messages mapping it to handlers
     * @param args
     */
    onMessage(args) {
        if (this.functionMap.has(args.msg)) {
            this.functionMap.get(args.msg)(args);
        }
    }

    /**
     * create cache from data sent to worker
     * @param args
     */
    createCache(args) {
        if (this.dataCache.has(args.id)) {
            const dataCache = this.dataCache.get(args.id);
            dataCache.data = args.data;
            dataCache.updateAllPerspectives();
        }
        else {
            this.dataCache.set(args.id, new DataCache(args.id, args.data, args.perspectives));
        }


        if (args.perspectives != undefined) {
            for (let perspective of args.perspectives) {

                const a = {
                    id: args.id,
                    perspectiveId: perspective.id,
                    fieldsToGroup: perspective.data.grouping,
                    aggegateOptions: {
                        aggregate: perspective.data.aggregate
                    },
                    sortOptions: perspective.data.sorting,
                    data: args.data
                };

                this.createGroupPerspective(a);
            }
        }

        postMessage({
            msg: "getRecordsForResponse",
            id: args.id,
            data: args.data
        })
    }

    /**
     * Apply a fuzzy search to each record property and return results. Cache original data.
     * @param args - id (initial cache id), filterString
     */
    filterRecords(args) {
        const cachedItems = this.dataCache.get(args.id);
        let results = [];
        
        if (cachedItems != null) {
            if ((args.filterString || "").length === 0) {
                results = cachedItems.data;
            }
            else {
                const filterString = args.filterString.toLowerCase();
                
                // Filter items using some function. Tested performance against for loop and similar results
                results = cachedItems.data.filter(record => Object.values(record).some(v => (v || "").toString().toLowerCase().indexOf(filterString) > -1));
            }
        }
        
        postMessage({
            msg: "filterRecordsResponse",
            id: args.id,
            data: results
        });
    }

    /**
     * Append existing cache with new records
     * @param args
     */
    appendCache(args) {
        if (this.dataCache.has(args.id)) {
            this.dataCache.get(args.id).append(args.data);

            postMessage({
                msg: "appendRecordsForResponse",
                id: args.id,
                data: args.data
            })
        }
    }

    addRecords(args) {
        const cache = this.dataCache.get(args.id);

        let result;

        if (cache.data == null || cache.data.length === 0) {
            cache.setData(args.items);
            result = cache.getItemPathForAllPerspectives(args.items);
        }
        else {
            result = cache.addRecords(args.items);
        }
        postMessage({
            msg: "addRecordsResponse",
            id: args.id,
            data: result
        });
    }


    updateRecords(args) {
        const cache = this.dataCache.get(args.id);
        const result = cache.updateRecords(args.items);
        postMessage({
            msg: "updateRecordsResponse",
            id: args.id,
            data: result
        });
    }


    /**
     * create a group perspective for data cached
     * @param args
     */
    createGroupPerspective(args) {
        const id = args.id;
        const perspectiveId = args.perspectiveId;
        const fieldsToGroup = args.fieldsToGroup;
        const aggegateOptions = args.aggegateOptions;
        const sortOptions = args.sortOptions;
        const data = args.data;

        let dataCache = this.dataCache.get(id);

        if (dataCache == undefined) {
            dataCache = new DataCache(args.id, args.data);
            this.dataCache.set(id, dataCache);
        }
        else {
            if (data != undefined) {
                dataCache.setData(data);
            }
        }

        let perspective = dataCache.getPerspective(perspectiveId);

        if (perspective == null) {
            perspective = dataCache.createPerspective(perspectiveId, fieldsToGroup, aggegateOptions, sortOptions);
        }

        return perspective;
    }

    /**
     * remove perspective
     * @param args
     */
    disposeGroupPerspective(args) {
        const id = args.id;
        const perspectiveId = args.perspectiveId;

        if (this.dataCache.has(id)) {
            const cache = this.dataCache.get(id);
            cache.disposePerspective(perspectiveId);
        }
    }

    /**
     * remove perspectives and cache
     * @param args
     */
    disposeCache(args) {
        const id = args.id;

        if (this.dataCache.has(id)) {
            const cache = this.dataCache.get(id);
            cache.dispose();

            this.dataCache.delete(id);
        }
    }

    /**
     * Return existing perspective
     * @param args
     */
    getGroupPerspective(args) {
        const id = args.id;
        const perspectiveId = args.perspectiveId;

        if (this.dataCache.has(id)) {
            const cache = this.dataCache.get(id);
            const perspective = cache.getPerspective(perspectiveId);

            postMessage({
                msg: "getGroupPerspectiveResponse",
                id: id,
                perspectiveId: perspectiveId,
                data: perspective
            })
        }
    }

    /**
     * Removes items from all perspectives
     * @param args
     */
    removeDataFromGroupPerspectives(args) {
        const id = args.id;

        if (this.dataCache.has(id)) {
            const cache = this.dataCache.get(id);

          
            
            const data = cache.removeItems(args.items);

            postMessage({
                msg: "removeRecordsResponse",
                id: id,
                data: data
            })
        }
    }



    /**
     * Filter records based on args argument
     * @params args
     */
    getRecordsFor(args) {
        const id = args.id;
        const filters = args.filters;

        if (this.dataCache.has(id)) {
            const cache = this.dataCache.get(id);
            const items = cache.getRecordsFor(cache.data, filters);

            postMessage({
                msg: "getRecordsForResponse",
                id: id,
                data: items
            })
        }
    }

}

class DataCache {
    constructor(id, data, perspectives) {
        this.id = id;
        this.data = data;
        this.perpectiveDefinition = perspectives;
        this.perspectiveGrouping = new Map();
        this.sortDirectionMap = new Map([
            ["ascending", this.evaluateAscending],
            ["descending", this.evaluateDescending]
        ])
    }

    dispose() {
        this.data = null;

        this.perspectiveGrouping.clear();
        this.perspectiveGrouping = null;

        this.sortDirectionMap.clear();
        this.sortDirectionMap = null;
    }

    setData(data) {
        this.data = data;
        this.updateAllPerspectives();
    }

    append(data) {
        this.data = this.data.concat(data);
        this.updateAllPerspectives();
    }


    updateRecords(items) {
        const perspectivesUpdated = this._updateItemInPerspectives(items);
        for (const item of items) {
            let oldItemIndex = this.data.findIndex(dataItem => dataItem.id === item.id);
            this.data[oldItemIndex] = item;
        }

        return perspectivesUpdated;
    }

    addRecords(items) {
        let result = this._addItemInPerspectives(items);
        for (const item of items) {
            this.data.push(item);
        }
        return result;
    }

    _addItemInPerspectives(items) {
        let perspectivesUpdated = [];

        for (const perspectiveId of this.perspectiveGrouping.keys()) {
            const definition = this.perpectiveDefinition.find(perspective => perspective.id === perspectiveId);
            const perspective = this.perspectiveGrouping.get(perspectiveId);
            let perspectiveUpdatedItems = [];
            for(const item of items) {

                const result = {
                    perspective: perspectiveId,
                    newItem: item,
                };

                if (definition.data.grouping != null){
                    const group = this._locateItemLowestLevelGroup(definition.data.grouping, item, perspective, true);
                    group.items.push(item);
                    this.updateGroupAggregate(perspective.__definition.aggegateOptions, perspective);
                    result.newItemPath = this._getItemWithPath(definition.data.grouping, item, perspective);
                }
                else {
                    perspective.items.push(item);
                }

                perspectiveUpdatedItems.push(result);
            }

            perspectivesUpdated.push({
                perspective: perspectiveId,
                items: perspectiveUpdatedItems
            });
        }
        return perspectivesUpdated;
    }

    getItemPathForAllPerspectives(items, itemPrefix = "newItem") {
        let perspectives = [];

        for (const perspectiveId of this.perspectiveGrouping.keys()) {
            const definition = this.perpectiveDefinition.find(perspective => perspective.id === perspectiveId);
            const perspective = this.perspectiveGrouping.get(perspectiveId);
            let perspectiveItems = [];
            for(const item of items) {

                const result = {
                    perspective: perspectiveId,
                    [itemPrefix]: item,
                };

                if (definition.data.grouping != null){
                    result[`${itemPrefix}Path`] = this._getItemWithPath(definition.data.grouping, item, perspective);
                }

                perspectiveItems.push(result);
            }

            perspectives.push({
                perspective: perspectiveId,
                items: perspectiveItems
            });
        }
        return perspectives;
    }

    _updateItemInPerspectives(items) {
        let perspectivesUpdated = [];

        for (const perspectiveId of this.perspectiveGrouping.keys()) {
            const definition = this.perpectiveDefinition.find(perspective => perspective.id === perspectiveId);
            const perspective = this.perspectiveGrouping.get(perspectiveId);
            const grouping = definition.data.grouping;

            let perspectiveUpdatedItems = [];

            for (const newItem of items) {
                let oldItemIndex = this.data.findIndex(dataItem => dataItem.id === newItem.id);
                const oldItem = {};
                Object.assign(oldItem, this.data[oldItemIndex]);

                const result = {
                    newItem: newItem,
                    oldItem: oldItem,
                };

                if (grouping != null){
                    const itemGroupingSame = this._isUpdatedItemGroupingSame(oldItem, newItem, grouping);

                    const oldGroup = this._locateItemLowestLevelGroup(grouping, oldItem, perspective, false);
                    let oldPerspectiveItem = oldGroup.items.find(item=> item.id === newItem.id);

                    if (itemGroupingSame === true) {
                        oldPerspectiveItem = newItem;
                    }
                    else {
                        oldGroup.items.splice(oldGroup.items.indexOf(oldPerspectiveItem),1);
                        const newGroup = this._locateItemLowestLevelGroup(grouping, newItem, perspective, true);
                        newGroup.items.push(newItem);
                        this.updateGroupAggregate(perspective.__definition.aggegateOptions, perspective);
                    }
                    result.groupingChanged = itemGroupingSame !== true;
                    result.oldItemPath = this._getItemWithPath(grouping, oldItem, perspective);
                    result.newItemPath = this._getItemWithPath(grouping, newItem, perspective);
                }
                else {
                    this.data[oldItemIndex] = newItem;
                }

                perspectiveUpdatedItems.push(result);
            }

            perspectivesUpdated.push({
                perspective: perspectiveId,
                items: perspectiveUpdatedItems
            });
        }

        return perspectivesUpdated;
    }

    updateGroupAggregate(aggregateOptions, group) {

        if (group.isGroup === true) {

            let allChildren = [];

            for (const subGroup of group.items) {
                const result = this.updateGroupAggregate(aggregateOptions, subGroup);
                if (result != null){
                    if (Array.isArray(result) === true){
                        allChildren = [...allChildren, ...result];
                    }
                    else{
                        allChildren.push(result);
                    }
                }
            }

            group.aggregate = {
                aggregate: aggregateOptions.aggregate,
                value: aggregator[aggregateOptions.aggregate](allChildren, aggregateOptions.field)
            };

            return allChildren;
        }
        else{
            return group;
        }
    }

    _isUpdatedItemGroupingSame(oldItem, newItem, fieldsToGroup) {
        for (const field of fieldsToGroup) {
            if (oldItem[field] !== newItem[field]) {
                return false;
            }
        }
        return true;
    }

    _getItemWithPath(fieldsToGroup, item, group){
        if (group.isGroup) {
            const clonedGroup = this._cloneGroup(group);
            if (group.lowestGroup !== true) {
                const fieldName = fieldsToGroup[group.level];
                let subGroup = group.items.find(groupItem => groupItem.id === item[fieldName]);
                if (subGroup != null && fieldName != null) {
                    // Go to next group in hierarchy
                    clonedGroup.items.push(this._getItemWithPath(fieldsToGroup, item,  subGroup));
                }
            }
            else{
                clonedGroup.items.push(item);
            }
            return clonedGroup;
        }
    }

    _cloneGroup(group) {
        let clonedGroup = {};
        Object.assign(clonedGroup, group);
        clonedGroup.items = [];
        return clonedGroup;
    }


    _locateItemLowestLevelGroup(fieldsToGroup, item, group, createIfNotExist){
        let result;
        if (group.isGroup) {
            if (group.lowestGroup !== true) {
                const fieldName = fieldsToGroup[group.level];
                let subGroup = group.items.find(groupItem => groupItem.id === item[fieldName]);
                // Note: If no group is found create new group for field grouping
                if (subGroup == null && fieldName != null && createIfNotExist === true) {
                    const lastItem = group.items[group.items.length - 1];

                    subGroup = {
                        level: group.level + 1,
                        field: fieldName,
                        title: item[fieldName],
                        id: item[fieldName],
                        index: lastItem == null ? 0 : lastItem.index + 1,
                        isGroup: true,
                        lowestGroup: fieldsToGroup.length - 1 === fieldsToGroup.indexOf(fieldName),
                        items: []
                    };
                    // Add sub group to group
                    group.items.push(subGroup);
                }

                if (subGroup != null && fieldName != null) {
                    // Go to next group in hierarchy
                    result = this._locateItemLowestLevelGroup(fieldsToGroup, item,  subGroup, createIfNotExist);
                }
            }
            else{
                return group;
            }
        }
        return result;
    }

    removeItems(items) {
       // this._removeItemsInArray(this.data, items);
        const perspectiveResult = [];
        const result = this._removeItemInPerspectives(items);
        return result;
    }


    _removeItemInPerspectives(items) {
        let perspectivesUpdated = [];

        for (const perspectiveId of this.perspectiveGrouping.keys()) {
            const definition = this.perpectiveDefinition.find(perspective => perspective.id === perspectiveId);
            const perspective = this.perspectiveGrouping.get(perspectiveId);
            const grouping = definition.data.grouping;

            let perspectiveUpdatedItems = [];

            for (const removeItem of items) {
                let oldItem= this.data.find(dataItem => dataItem.id === removeItem.id);
               
               // MOVE THIS LOWER
                const result = {
                    oldItem: removeItem,
                };

                if (grouping != null){
                    const oldGroup = this._locateItemLowestLevelGroup(grouping, oldItem, perspective, false);
                    let oldPerspectiveItem = oldGroup.items.find(item=> item.id === removeItem.id);
                        oldGroup.items.splice(oldGroup.items.indexOf(oldPerspectiveItem),1);
                        this.updateGroupAggregate(perspective.__definition.aggegateOptions, perspective);
                    result.oldItemPath = this._getItemWithPath(grouping, oldItem, perspective);
                }

                perspectiveUpdatedItems.push(result);
                this.data.splice(this.data.indexOf(oldItem), 1);
            }

            perspectivesUpdated.push({
                perspective: perspectiveId,
                items: perspectiveUpdatedItems
            });
        }

        return perspectivesUpdated;
    }

    _removeItemsFromPerspective(perspectiveGroup, items) {
        
        
        if (this.perspectiveGrouping.get(perspectiveGroup).items != null) {
            this._removeItemsInArray(perspectiveGroup, items);
        }
    }

    _removeItemsInArray(perspectiveId, itemsToRemove) {
        const pathsOfRemovedItems = [];
        const definition = this.perpectiveDefinition.find(perspective => perspective.id == perspectiveId);
        for (const removeItem of itemsToRemove) {
            
            //const sourceItem =  this.perspectiveGrouping.get(perspective).items.find(sourceItem => sourceItem.id === removeItem.id);
            const path = this._getItemWithPath(definition.data.grouping, removeItem, this.perspectiveGrouping.get(perspectiveId));
            
            this.updateGroupAggregate(this.perspectiveGrouping.get(perspectiveId).__definition.aggegateOptions, this.perspectiveGrouping.get(perspectiveId));
            if (sourceItem != null) {
                source.splice(source.indexOf(sourceItem), 1);
            }
        }
    }

    // process all perspectives again
    updateAllPerspectives() {
        this.perspectiveGrouping.forEach((value, key) => {
            const definition = value.__definition;
            this.createPerspective(definition.perspectiveId, definition.fieldsToGroup, definition.aggegateOptions, definition.sortOptions, true);
        })
    }

    /**
     * Remove a perspective from the cache
     * @param perspectiveId
     */
    disposePerspective(perspectiveId) {
        if (this.perspectiveGrouping.has(perspectiveId)) {
            this.perspectiveGrouping.delete(perspectiveId);
        }
    }

    /**
     * Return an existing perspective
     * @param perspectiveId
     */
    getPerspective(perspectiveId) {
        const id = Number(perspectiveId);
        if (this.perspectiveGrouping.has(id)) {
            return this.perspectiveGrouping.get(id);
        }

        return null;
    }

    /**
     * Filter records based on filter array argument
     * @param items
     * @param filters
     */
    getRecordsFor(items, filters) {
        if (!filters) {
            return items;
        }

        let result = items.slice(0);

        result = result.filter(function (el) {
            for (var j = 0; j < filters.length; j++) {
                var fieldName = filters[j].fieldName;
                var value = filters[j].value;

                if (el[fieldName] != value) {
                    return false;
                }
            }
            return true;
        });

        return result;
    }

    /**
     * Create a perspective and group
     * @param perspectiveId
     * @param fieldsToGroup
     * @param aggegateOptions
     */
    createPerspective(perspectiveId, fieldsToGroup, aggegateOptions, sortOptions, override) {
        let result = this.getPerspective(perspectiveId);

        if (!result || override == true) {
            const newPerspective = this.createPerspectiveGroup(fieldsToGroup, aggegateOptions, sortOptions);
            newPerspective.__definition = {
                perspectiveId: perspectiveId,
                fieldsToGroup: fieldsToGroup,
                aggegateOptions: aggegateOptions,
                sortOptions: sortOptions
            };

            this.perspectiveGrouping.set(perspectiveId, newPerspective);
            result = newPerspective;
        }

        postMessage({
            msg: "createGroupPerspectiveResponse",
            id: this.id,
            perspectiveId: perspectiveId,
            data: result
        });

        return result;
    }

    /**
     * Create a grouped and aggregated perspective from the data and store it with a key so that I can access it at any time from other views
     * More than one view can use the same perspective, a example of tha is the grid on master detail and the group chart on the list
     * @param fieldsToGroup: what fields are used in this grouping to define the perspective
     * @param aggegateOptions: what are the calculations that need to be made on the group
     */
    createPerspectiveGroup(fieldsToGroup, aggegateOptions, sortOptions) {
        const dataCopy = this.data.slice(0);

        const root = {
            level: 0,
            title: "None",
            items: dataCopy,
            isGroup: true
        };

        if (dataCopy != null && dataCopy.length !== 0) {
            this.groupRecursive(root, fieldsToGroup, aggegateOptions, sortOptions);
        }

        return root;
    }

    /**
     * Recursivly group items of a group oject grouping it according to level and the field defined for that level.
     * @param group: the group to process
     * @param fieldsToGroup: what are the fields to use while grouping
     * @param aggegateOptions: what aggregate calculations should be used
     */
    groupRecursive(group, fieldsToGroup, aggegateOptions, sortOptions) {
        if (fieldsToGroup == undefined || fieldsToGroup == null) {
            return;
        }

        if (group.level > fieldsToGroup.length - 1) {
            group.aggregate = {
                aggregate: aggegateOptions.aggregate,
                value: aggregator[aggegateOptions.aggregate](group.items, aggegateOptions.field)
            };

            group.lowestGroup = true;
            group.items = this.sortItems(group.items, sortOptions);
            return;
        }

        group.groups = this.group(group.items, fieldsToGroup[group.level], group.level + 1, sortOptions);

        const keys = group.groups.keys();

        for (let key of keys) {
            const childGroup = group.groups.get(key);
            this.groupRecursive(childGroup, fieldsToGroup, aggegateOptions, sortOptions);
        }

        group.aggregate = {
            aggregate: aggegateOptions.aggregate,
            value: aggregator[aggegateOptions.aggregate](group.items, aggegateOptions.field)
        };

        group.items = Array.from(group.groups, items => items[1]);
        delete group.groups;
    }

    /**
     * Create a
     * @param array
     * @param fieldName
     * @param level
     * @returns {any|*}
     */
    group(array, fieldName, level, sortOptions) {
        const result = array.reduce((groupMap, curr) => {
            const key = curr[fieldName];
            const id = curr[fieldName];
            const groupId = groupMap.size;

            if (groupMap.has(key)) {
                groupMap.get(key).items.push(curr);
            }
            else {
                groupMap.set(key, {
                    level: level,
                    field: fieldName,
                    title: key ? key.toString() : "none",
                    id: id,
                    items: [curr],
                    index: groupId,
                    isGroup: true
                })
            }

            return groupMap;
        }, new Map());

        if (sortOptions == undefined) {
            return result;
        }

        return this.sortGroup(result, sortOptions);
    }

    sortGroup(map, sortOptions) {
        const array = Array.from(map);
        const direction = sortOptions[array[0][1].field];

        if (direction == undefined) {
            return map;
        }

        const evaluation = this.sortDirectionMap.get(direction);

        array.sort((a, b) => {
            return evaluation(a[1].title, b[1].title);
        });

        return new Map(array);
    }

    sortItems(array, sortOptions) {
        if (sortOptions == undefined || array.length == 1) {
            return array;
        }

        const fields = Object.keys(sortOptions);
        return array.sort((a, b) => {
            for (let field of fields) {
                const direction = sortOptions[field];
                const result = this.sortDirectionMap.get(direction)(a[field], b[field]);

                if (result == 1) {
                    return 1;
                }
            }

            return 0;
        })
    }

    evaluateAscending(aValue, bValue) {
        if (aValue == bValue) {
            return 0;
        }

        return aValue < bValue ? -1 : 1;
    }

    evaluateDescending(aValue, bValue) {
        if (aValue == bValue) {
            return 0;
        }

        return aValue > bValue ? -1 : 1;
    }
}

const aggregator = {
    count(items) {
        return items.length;
    },

    sum(items, field) {
        let result = 0;

        for (let item of items) {
            result += item[field];
        }

        return result;
    },

    min(items, field) {
        let result = items[0][field];

        for (let item of items) {
            if (item[field] < result) {
                result = item[field];
            }
        }

        return result;
    },

    max(items, field) {
        let result = items[0][field];

        for (let item of items) {
            if (item[field] > result) {
                result = item[field];
            }
        }

        return result;
    },

    ave(items, field) {
        let result = this.sum(items, field);

        result = result / items.length;

        return result;
    }
};

const groupWorker = new GroupWorker();

onmessage = function (event) {
    groupWorker.onMessage(event.data);
};
