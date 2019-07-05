import {DateTimeToStringConverterBase} from "./datetime-to-string-converter-base.js";

/**
 * This converter are to be used with HTML5 input type='date' control. Things to take note of:
 *  - With dates we do not worry about UTC since it is just a date.
 *  - Both control and server work with ISOString.
 *  - Vanilla javascript functions does not provide proper conversion
 *  - The validation part in the _convert method is needed since the control fires even though user input is not done.
 **/
export class DateToStringConverter extends DateTimeToStringConverterBase {   

    _formatDate(value) {
        // Take note that getMonth() is zero-based
        //  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getMonth
        const date = new Date(value);
        const year = this._padStart(date.getFullYear(), 4);
        const month = this._padStart(date.getMonth() + 1);
        const day = this._padStart(date.getDate());

        // HTML5 input control requires     yyyy-MM-dd
        //  - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date
        return `${year}-${month}-${day}`;
    }

    convertBackFormatter(value) {
        return this._formatDate(value)
    }
    
    convertFormatter(value) {
        return this._formatDate(value)   
    }
}
 