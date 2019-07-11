import {DateTimeToStringConverterBase} from "./datetime-to-string-converter-base.js";

/**
 * This converter are to be used with HTML5 input datetime-local control. Things to take note of:
 *  - It deals with UTC to local timezone conversions
 *  - It is to be used with HTML5 input controls since the convert will return a specific
 *    formatted date.
 *  - convertBack will always return a isoString() formatted date.
 *      2018-10-15T08:39:53.9955550Z
 **/
export class DateTimeToStringConverter extends DateTimeToStringConverterBase {
    
   convertFormatter(value) {
       const date = new Date(value);
       // Take note that getMonth() is zero-based
       //  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getMonth
       const year = this._padStart(date.getFullYear(), 4);
       const month = this._padStart(date.getMonth() + 1);
       const day = this._padStart(date.getDate());
       const hours = this._padStart(date.getHours());
       const minutes = this._padStart(date.getMinutes());
       const seconds = this._padStart(date.getSeconds());
       const milliSeconds = this._padStart(date.getMilliseconds(), 3);

       // HTML5 input control requires     yyyy-MM-ddThh:mm:ss.sss
       //  - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/datetime-local
       return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliSeconds}`;
   }
}