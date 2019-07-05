import {CustomEventsHandlers} from "./../lib/custom-events-handlers.js";

const customEventsHandlers = new CustomEventsHandlers();
window.customEvents = {
    "edit-query": customEventsHandlers.editQuery
};

const keys = Object.keys(window.customEvents);
for (const key of keys) {
    window.eventEmitter.on(key, window.customEvents[key]);
}