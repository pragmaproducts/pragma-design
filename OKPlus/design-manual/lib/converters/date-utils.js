
export class DateUtils {

    static extractDate(dateTimeIsoString) {
        let result = null;        
        if ((dateTimeIsoString != null) && (dateTimeIsoString !== "")) {
            const dateMatch = dateTimeIsoString.match("\\d{4}-\\d{2}-\\d{2}");
            if ((dateMatch != null) && (dateMatch.length === 1)) {
                const dateParts = dateMatch[0].split("-");
                if ((dateParts != null) && (dateParts.length === 3)) {
                    result = {
                        year: dateParts[0],
                        month: dateParts[1],
                        day: dateParts[2],
                    };
                }
            }
        }

        return result;
    }

    static isValid(dateTimeIsoString) {
        let dateValid = false;
        const date = this.extractDate(dateTimeIsoString);
        if (date != null) {
            dateValid = (date.year > 0) && (date.year < 10000) && ((date.month >= 1) && (date.month <= 12)) && ((date.day >= 1) && (date.day <= 31));
        }

        return dateValid;
    }
}