import {DateTimeToStringConverterBase} from "./datetime-to-string-converter-base.js";

/**
 * This converter are to be used for readonly display of dates only. Things to take note of:
 *  - It deals with UTC to local timezone conversions
 */
export class DatetimeToReadOnlyConverter extends DateTimeToStringConverterBase {
    convertFormatter(value) {
        return new Date(value).toLocaleString();
    }
}