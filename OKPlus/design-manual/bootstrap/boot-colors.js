const colorStorage = localStorage.getItem("application-colors");

if(colorStorage != null) {
    const colors = JSON.parse(colorStorage);
    const keys = Object.keys(colors);
    for (let varName of keys) {
        const color = colors[varName];
        document.documentElement.style.setProperty(varName, color);
    }
}

