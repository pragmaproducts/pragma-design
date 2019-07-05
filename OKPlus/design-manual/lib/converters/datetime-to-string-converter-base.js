import {ConverterBase} from "./converter-base.js";
import {DateUtils} from "./date-utils.js";

/**
 * This converter are to be used with HTML5 input datetime-local control. Things to take note of:
 *  - It deals with UTC to local timezone conversions
 *  - It is to be used with HTML5 input controls since the convert will return a specific
 *    formatted date.
 *  - convertBack will always return a isoString() formatted date.
 *      2018-10-15T08:39:53.9955550Z
 **/
export class DateTimeToStringConverterBase extends ConverterBase {
    
    _padStart(value, padLength = 2) {
        return value.toString().padStart(padLength, "0");
    };

    convert(value, target) {
        let result = null;
        if (super.doConvert(value, target)) {            
            if ((value != null) && (value !== "")) {
                if (DateUtils.isValid(value)) {
                    result = this.convertFormatter(value);
                }
            }
        }
        else {
            result = value;
        }

        return result;
    }

    convertBack(value) {
        let result = null;
        if ((value != null) && (value !== "")) {
            if (DateUtils.isValid(value)) {
                result = this.convertBackFormatter(value);
            }
        }
        else {
            result = null;
        }

        return result;
    }
    
    convertBackFormatter(value) {
        return new Date(value).toISOString();
    }

    convertFormatter(value) {
        return new Date(value).toLocaleString();
    }
}