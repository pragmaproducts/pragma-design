import {DynamicDialogFactory} from "../lib/dynamic-dialog-factory.js";
import {DialogManager} from "../node_modules/pragma-views2/lib/dialog-manager.js";

window.dialogManager = new DialogManager();
window.dynamicDialogManager = new DynamicDialogFactory();

