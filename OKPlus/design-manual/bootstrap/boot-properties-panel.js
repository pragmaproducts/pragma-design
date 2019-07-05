export class PropertiesPanelManager {

    constructor() {
        if (window.eventEmitter != null) {
            this.showPropertiesPanelHandler = this.showPropertiesPanel.bind(this);
            window.eventEmitter.on("toggle-properties-panel", this.showPropertiesPanelHandler);
        }
    }

    dispose() {
        if (window.eventEmitter != null) {
            this.showPropertiesPanelHandler = null;
            window.eventEmitter.remove("toggle-properties-panel", this.showPropertiesPanelHandler);
        }
    }

    showPropertiesPanel(args = {}) {
        const intent = args.intent || "toggle";

        if (intent !== "visible" && document.propertiesPanel != null) {

           this._detachPropertiesPanel();
        }
        else {
            this._attachPropertiesPanel(args);
        }
    }

    _attachPropertiesPanel(args) {

        if (document.propertiesPanel == null) {
            const mainContainer = document.querySelector(".main-container");
            const main = document.querySelector(".main");

            document.propertiesPanel = document.createElement("properties-panel");
            mainContainer.appendChild(document.propertiesPanel);

            //test this event handler
            requestAnimationFrame(()=>{
                document.propertiesPanel.wrapper.addEventListener("animationend",
                    () => {
                        //test if margin is set up
                        main.classList.add('properties-panel-margin');
                        if (args.callback != null) {
                            args.callback();
                        }
                    }, {once:true});
                document.propertiesPanel.classList.add("visible");
            });
        }
        else{
            if (args.callback != null) {
                args.callback();
            }
        }
    }

    _detachPropertiesPanel() {

        if (document.propertiesPanel != null) {
            const main = document.querySelector(".main");

            //test this class removal
            document.propertiesPanel.classList.remove("visible");

            //test this event handler
            document.propertiesPanel.wrapper.addEventListener("animationend",
                () => {
                    //test if margin is removed
                    main.classList.remove('properties-panel-margin');
                    document.propertiesPanel.parentNode.removeChild(document.propertiesPanel);
                    delete document.propertiesPanel;
                }, {once: true});
        }
    }
}

new PropertiesPanelManager();


