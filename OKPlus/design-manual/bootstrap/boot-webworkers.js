import {GroupWorker} from "./../node_modules/pragma-views2/lib/group-worker.js";

window.groupWorker = new GroupWorker();

window.eventEmitter.emit("progress");
