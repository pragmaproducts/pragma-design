import {DateTimeToStringConverterBase} from "./datetime-to-string-converter-base.js";

export class DateToReadOnlyStringConverter extends DateTimeToStringConverterBase {
    convertFormatter(value) {
        return new Date(value).toLocaleDateString();
    }
}