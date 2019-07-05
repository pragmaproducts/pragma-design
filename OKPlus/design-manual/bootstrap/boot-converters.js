import {IntDurationConverter} from "./../node_modules/pragma-views2/baremetal/lib/conveters/int-duration-converter.js";
import {DateTimeToStringConverter} from "../lib/converters/datetime-to-string-converter.js";
import {DatetimeToReadOnlyConverter} from "../lib/converters/datetime-to-readonly-converter.js";
import {DateToStringConverter} from "../lib/converters/date-to-string-converter.js";
import {DateToReadOnlyStringConverter} from "../lib/converters/date-to-readonly-string-converter.js";

window.converters = new Map([
    ["duration", IntDurationConverter],
    ["datetime", DateTimeToStringConverter],
    ["datetimeReadOnly", DatetimeToReadOnlyConverter],
    ["date", DateToStringConverter],
    ["dateReadOnly", DateToReadOnlyStringConverter]
]);
