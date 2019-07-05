import {ActionDialogManager} from "./../node_modules/pragma-views2/lib/action-dialog-manager.js";
import {Utils} from "./utils.js";

export class DynamicDialogFactory {

    constructor() {
        this._createHandler = this._create.bind(this);
        this._updateHandler = this._update.bind(this);
        this._viewHandler = this._view.bind(this);

        window.eventEmitter.on(`perform-create`, this._createHandler);
        window.eventEmitter.on(`perform-update`, this._updateHandler);
        window.eventEmitter.on(`perform-view`, this._viewHandler);
    }

    dispose() {
        window.eventEmitter.remove(`perform-create`, this._createHandler);
        window.eventEmitter.remove(`perform-update`, this._updateHandler);
        window.eventEmitter.remove(`perform-view`, this._viewHandler);

        this._createHandler = null;
        this._updateHandler = null;
        this._viewHandler = null;
    }

    _create(parameters) {
        const dynamicForm = document.createElement(`dynamic-create`);

        const buttons = [
            {
                id: "saveAndNew",
                title: window.translations.pragmaDialogs.buttons.saveAndNew,
                remote: true,
                callback: async (dialog, button) => {
                    await dynamicForm.saveAndNew(button.activityId);
                }
            },
            {
                id: "save",
                title: window.translations.pragmaDialogs.buttons.saveAndClose,
                remote: true,
                callback: async (dialog, button) => {
                    const result = await dynamicForm.save(button.activityId);
                    if (result === true) {
                        dialog.dispose();
                    }
                }
            }
        ];

        const options = {
            contentElement: dynamicForm,
            animatedCallback: this._onAnimated.bind(this, dynamicForm, parameters),
            buttons: buttons,
            title: `Create ${Utils.resourceTextToPrintText(parameters.remote)}`
        };

        new ActionDialogManager(options);
    }

    _update(parameters) {
        const dynamicForm = document.createElement(`dynamic-update`);

        const buttons = [
            {
                id: "undo",
                title: window.translations.pragmaDialogs.buttons.undo,
                callback: async () => {
                   await dynamicForm.undo();
                }
            },
            {
                id: "save",
                title: window.translations.pragmaDialogs.buttons.save,
                remote: true,
                callback: async (dialog, button) => {
                    await dynamicForm.save(button.activityId);
                }
            }
        ];

        const options = {
            contentElement: dynamicForm,
            animatedCallback: this._onAnimated.bind(this, dynamicForm, parameters),
            buttons: buttons,
            title: `Edit ${Utils.resourceTextToPrintText(parameters.remote)}`
        };

        new ActionDialogManager(options);
    }

    _view(parameters) {
        const dynamicForm = document.createElement(`dynamic-peek`);

        const options = {
            contentElement: dynamicForm,
            animatedCallback: this._onAnimated.bind(this, dynamicForm, parameters),
            title: `View ${Utils.resourceTextToPrintText(parameters.remote)}`
        };

        new ActionDialogManager(options);
    }

    async _onAnimated(dynamicForm, parameters, type, direction, isNewForm) {
        if (isNewForm === true) {
            await dynamicForm.create(parameters);
        }
    }

}