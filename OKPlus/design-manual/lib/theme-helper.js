export class ThemeHelper {

    constructor() {
        this.alphas = [10,30,50,80];
    }

    dispose() {
        this.alphas = null;
    }

    getProperty(variable) {
       return getComputedStyle(document.documentElement).getPropertyValue(variable);
    }
    
    setProperty(variable, value) {
        document.documentElement.style.setProperty(variable, value);
    }

    setColorProperty(variable, value) {
        if (value.includes("#")){
            value = this.convertToRgbString(value, 100);
        } 
        document.documentElement.style.setProperty(variable, value);
        for (let alpha of this.alphas) {
            const alphaPropertyValue =this.getProperty(`${variable}-${alpha}`);
            if (alphaPropertyValue){
                if (value.includes("#")){
                    value = this.convertToRgbString(value, alpha);
                }
                else{
                    let colorParts = value.split(",");
                    colorParts.splice(colorParts.length-1, 1, ` ${alpha/100})`);
                    value = colorParts.join(",")
                }
                this.setProperty(`${variable}-${alpha}`, value);    
            } 
        } 
    }

    convertToRgbString(newColorInHex, alpha){
        if (newColorInHex == undefined) return "black";

        let r = parseInt(newColorInHex.slice(1, 3), 16),
            g = parseInt(newColorInHex.slice(3, 5), 16),
            b = parseInt(newColorInHex.slice(5, 7), 16);
        return `rgba(${r},${g},${b}, ${alpha/100})`;
    }

    rgbaToHex (rgba) {
        if(!rgba.trim().startsWith('rgb'))
            return rgba;
        let parts = rgba.substring(rgba.indexOf("(")).split(","),
            r = parseInt(parts[0].substring(1).trim(), 10),
            g = parseInt(parts[1].trim(), 10),
            b = parseInt(parts[2].trim(), 10);
        return (this.getHex(r, g, b));
    }

    getHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    
}

export class Theme {

    constructor() {
        this.themeHelper = new ThemeHelper();
    }

    dispose() {
        this.themeHelper = null;
    }
    get fontSizeBase() {
        const fontSize = this.themeHelper.getProperty("--font-size-base");
        return parseFloat(fontSize);
        
    }

    set fontSizeBase(newValue) {
        if ((typeof newValue === 'string' && !newValue.includes("rem")) || typeof newValue  == 'number'){
            newValue = newValue + "rem";
        } 
        this.themeHelper.setProperty("--font-size-base", newValue);
    }
    
    get colorBrandDark() {
       return this.themeHelper.getProperty("--color-brand-dark");
    }

    set colorBrandDark(newValue) {
        this.themeHelper.setColorProperty("--color-brand-dark", newValue)
    }

    get colorBrandLight() {
        return this.themeHelper.getProperty("--color-brand-light");
    }

    set colorBrandLight(newValue) {
        this.themeHelper.setColorProperty("--color-brand-light", newValue)
    }

    get colorUI1() {
        return this.themeHelper.getProperty("--color-ui-1");
    }

    set colorUI1(newValue) {
        this.themeHelper.setColorProperty("--color-ui-1", newValue)
    }

    get colorUI2() {
        return this.themeHelper.getProperty("--color-ui-2");
    }

    set colorUI2(newValue) {
        this.themeHelper.setColorProperty("--color-ui-2", newValue)
    }

    get colorUI3() {
        return this.themeHelper.getProperty("--color-ui-3");
    }

    set colorUI3(newValue) {
        this.themeHelper.setColorProperty("--color-ui-3", newValue)
    }

    get colorUI4() {
        return this.themeHelper.getProperty("--color-ui-4");
    }

    set colorUI4(newValue) {
        this.themeHelper.setColorProperty("--color-ui-4", newValue)
    }

}