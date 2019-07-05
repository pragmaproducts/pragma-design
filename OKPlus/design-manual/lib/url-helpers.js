export function readUrlHash() {
    const paths = [];
    for (const path of window.location.hash.split("/")) {
        paths.push(path.split("?")[0])
    }
    return paths;
}

export function readQueryString() {
    const queryString = window.location.hash.split("?")[1];
    let params = {};
    if (queryString != null) {
        for (const param of decodeURIComponent(queryString).split("&")) {
            const keyValue = param.split("=");
            params[keyValue[0]] = keyValue[1];
        }
    }
    return params;
}
