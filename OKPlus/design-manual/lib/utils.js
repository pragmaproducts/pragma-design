export class Utils {
    static urlParameters(url) {
        const divide = url.split("?");

        if (divide.length < 2) {
            return {};
        }

        const params = divide[1].split("&");

        const result = {};
        for (let p of params) {
            const keyValuePair = p.split("=");
            result[keyValuePair[0]] = keyValuePair[1];
        }

        return result;
    }

    static resourceTextToPrintText(stringValue, capitalize = false) {
        let result = (stringValue || "").replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1").trim();
        if (capitalize === true) {
            result = result.charAt(0).toUpperCase() + result.slice(1);
        }
        return result;
    }

    /**
     * Util function for constructing notification dialog messages
     * @param message
     * @param dialogType
     * @param buttonType
     * @param callback
     */
    static showMessageDialog(message, dialogType, buttonType, callback) {
        window.eventEmitter.emit("show-message", {
            type: dialogType,
            message: message,
            buttons: buttonType,
            callback: callback
        });
    }
}