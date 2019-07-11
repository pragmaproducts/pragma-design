

import {Bootloader} from "./../lib/constants.js"
const initialisationSteps = [
    Bootloader.componentCss,
    Bootloader.viewContainer,
    Bootloader.routeListener
];

const maxProgress = initialisationSteps.length;
let loadingProgress = 0;
let progress = document.createElement("progress");
let parent = document.querySelector(".loading");

progress.setAttribute("max", maxProgress);
progress.style = "position: absolute; width: 100%";
parent.appendChild(progress);

function handleProgress(args) {    
    requestAnimationFrame(() => {
        if (progress != null) {            
            if (initialisationSteps.find(x => x === args) != null) {
                loadingProgress++;

                progress.value = loadingProgress;
                if (loadingProgress >= maxProgress) {
                    document.body.removeChild(parent);
                    parent = null;
                    progress = null;
                }
            }
        }
    });
    
}

window.eventEmitter.on("progress", handleProgress);
