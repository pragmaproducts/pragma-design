window.translations = {
    applicationTitle: "On Key Plus",
    assist: {
        globalFeaturesTitle: "Data Actions"
    },
    screens: {
        dashboard: "Dashboard",
        details: "Details",
        globalCreate: "Global Create",
        globalEdit: "Global Edit",
        globalPreview: "Global Preview"
    },
    actions: {
        create: "Create",
        edit: "Edit",
        preview: "Preview",
        customize: "Customize",
        createNew: "Create New"
    },
    pragmaMessages:{
        headings:
            {
                title: "Notifications",
                systemErrors: "System Errors",
                validationErrors: "Validation Errors",
                systemWarnings: "System Warnings",
                systemInformation: "System Information",
                errorCode: "ERROR CODE"
            },
        buttons: {
            "moreInfo": "More Info",
            "lessInfo": "Less Info",
        }
    },
    labels: {
        accept: "Accept",
        close: "Close",
        start: "Start",
        cancel: "Cancel",
        filter: "Filter",
        clear: "Clear"
    },
    crudToolbar: {
        labels: {
            create: "Create",
            delete: "Delete",
            refresh: "Refresh",
            details: "Details",
            navigateToDetails: "Navigate to details",
            queryBuilder: "Query Builder"
        },
        deleteMessages: {
            noRecordSelected: "Please select a record to delete.",
            batchDeleteNotSupported: "You can't remove multiple records at once."
        }
    },
    dynamicDelete: {
        confirmMessageSingle : "Are you sure you want to remove the selected record?",
        confirmMessageMultiple : "Are you sure you want to remove the selected records?"
    },
    model: {
        dirtyModelConfirmation: "You have unsaved changes to this record which will be lost. Are you sure you want to continue?"
    },
    matchUpdate: {
        noRecordSelected: "Please select at least one record to batch update.",
        emptyFieldConfirmation: "You have empty fields. Please note empty fields will be cleared. Are you sure you want to continue?",
        notificationSummary: "Processing of ${this.batchSize} ${this.resourceName} updates complete. ${this.successCount} Successful. ${this.failCount} Failures.",
        fieldSelectionError: "You must select at least one field in order to proceed"
    },
    crossReference: {
        titles: {
            lookupType: "Select Target Entity",
            lookupSource: "Select Source Field",
            lookupTarget: "Select Target Field",
            crossReference: "${this.resourceName} Cross References"
        },
        messages: {
            noRecordSelected: "Please select at least one record to cross reference.",
            noCrossReferencesAvailable: "No cross references available for ${this.resourceName}.",
            noScreen: "Unable to redirect. Currently there is no dashboard view for ${this.resourceName} available."
        },
        buttons: {
            continue: "Continue",
            cancel: "Cancel"
        },
        labels: {
            targetEntity: "Target Entity",
            sourceField: "Source Field",
            targetField: "Target Field"
        }
    },
    pragmaDialogs: {
        buttons: {
            ok: "Ok",
            cancel: "Cancel",
            accept: "Accept",
            reject: "Reject",
            yes: "Yes",
            no: "No",
            saveAndNew: "Save And New",
            save: "Save",
            saveAndClose: "Save And Close",
            undo: "Undo",
        }
    },
    dialog: {
        titles: {
            warning: "Warning",
            information: "Information",
            error: "Error",
            notification: "Notification"
        }
    },
    pragmaNotificationDetail: {
        buttons: {
            expand: "Expand Notification Detail Panel",
            collapse: "Collapse Notification Detail Panel"
        }
    },
    lookups: {
        defaultTitle: "Lookup",
        messages: {
            noRecords: "No records available for lookup"
        }

    },
    selection: {
        selectAll: "Select all",
        selectGroup: "Select group",
        selectRecord: "Select record",
    },
    queryBuilder: {
        titles: {
            queryBuilder: "Query Builder",
            resourceNavigator: "Choose Fields",
            expressionBuilder: "On Key Query Language Expression Builder"
        },
        description: {
            expressionBuilder: "On Key Query Language Expression Builder"
        },
        labels: {
            cancel: "Cancel",
            accept: "Accept",
            apply: "Apply",
            addField: "Add Field",
            removeField: "Remove Field",
            addFilterCriteria: "Add Filter Criteria",
            selectVisualisation: "Select Visualisation",
            criteria: "Query String",
            queryString: "Query String"
        },
        messages: {
            noFieldsSelected: "There are no data source fields currently selected. Please select at least one to continue.",
            outOfSync: "The query string and expression graph is currently Out Of Sync, please sync to continue."
        }
    },
    pragmaBranch: {
        labels: {
            expand: "Expand",
            collapse: "Collapse"
        }
    },
    system: {
        systemUpdated: "On Key has been updated, please click 'Ok' to use latest version."
    },
    globalCrud: {
        title: "Data Actions"
    },
    designer: {
        theme: {
            title: "Colours / Theme",
            menu: {
                theme: "Theme",
                menu: "Menu",
                group: {
                    global: "Global",
                    appBar: "App Bar",
                    fonts: "Fonts",
                    headings: "Headings",
                    base: "Base",
                    dialogModal: "Dialog and Modals",
                    states: "States",
                    buttons: "Buttons",
                    node: "Node",
                },
                item: {
                    "--c-global-bg": "Global Background",
                    "--c-filter-bar": "Filter Bar",
                    "--c-surface-bg": "Surface Background",
                    "--c-app-bar": "App Bar Background",
                    "--c-icon": "App Bar Icon Colour",
                    "--c-icon-active": "App Bar Icon Active Colour",
                    "--c-icon-active-bg": "Appbar Icon Active Background Colour",
                    "--c-text": "Text Colour",
                    "--c-placeholder-text": "Placeholder Text Colour",
                    "--c-header-bar": "Heading Background",
                    "--c-heading": "Heading Colour",
                    "--c-subheading": "Subheading Colour",
                    "--c-accent": "Accent Colour",
                    "--c-sidebar-header": "Assist Bar",
                    "--c-group-bar": "Group Bar",
                    "--c-group-item-bg": "Group Items Background",
                    "--c-border": "Border",
                    "--c-global-dark-bg": "Dark Background",
                    "--c-text-light": "Text Light",
                    "--c-overlay": "Overlay",
                    "--c-font-label": "Labels",
                    "--c-footer-bar": "Footer Bar",
                    "--c-hover": "Hover",
                    "--c-item-selected": "Item Selected",
                    "--c-disabled": "Disabled",
                    "--c-focus": "Focus",
                    "--c-error": "Error",
                    "--c-warning": "Warning",
                    "--c-success": "Success",
                    "--c-sc-selected": "Selected Selection Control",
                    "--c-sc-unselected": "Unselected Selection Control",
                    "--c-switch-on-bc": "Switch On Background",
                    "--c-switch-off-bg": "Switch Off Background",
                    "--c-p-button-bg": "Primary Button Background",
                    "--c-p-button": "Primary Button Text",
                    "--c-s-button": "Secondary Button Text",
                    "--c-node-fill": "Node Background",
                    "--c-node-border": "Node Border",
                    "--c-node-line": "Node Separator",
                    "--c-node-active": "Node Active",
                    "--c-node-icon": "Node Icons"
                }
            },
            description: {
                "--c-global-bg": "The background appears behind all other surfaces in the app",
                "--c-filter-bar": "The background colour for the filter bar",
                "--c-surface-bg": "The baseline colour for sheets and surfaces, such as menus, dialogs, and modals",
                "--c-app-bar": "Background colour of the app bar",
                "--c-icon": "Default state of the icons in the app bar",
                "--c-icon-active": "Active state colour of the icons in the app bar",
                "--c-icon-active-bg": "Background colour of the active icons in the app bar",
                "--c-text": "Default text colour through out the app",
                "--c-placeholder-text": "Placeholder text colour in input fields",
                "--c-header-bar": "Background colour of the dashboard and dialog headers",
                "--c-heading": "The text colour of the heading in the dashboard and dialog headers",
                "--c-subheading": "The text colour of the subheadings in the grid headers and group headers",
                "--c-accent": "The secondary colour found throughout the app",
                "--c-sidebar-header": "All main header background in the Assist, Properties Panel and side bars",
                "--c-group-bar": "The group bar background colour",
                "--c-group-item-bg": "The background colour of the parent item in the grid, tree view and list view",
                "--c-border": "All borders and input field colours",
                "--c-global-dark-bg": "Modal box background colour",
                "--c-text-light": "Text displayed on dark background - mainly the modal",
                "--c-overlay": "The colour of the overlay of all pop ups",
                "--c-font-label": "Label and descriptor text colour",
                "--c-footer-bar": "Background colour of the dialog box",
                "--c-hover": "The default colour on mouse hover",
                "--c-item-selected": "The background colour of a selected item in the grid, tree view and list view",
                "--c-disabled": "Text colour and item colour of a disabled element",
                "--c-focus": "The default colour on a focused item",
                "--c-error": "Default error colour",
                "--c-warning": "Default warning colour",
                "--c-success": "Default success colours",
                "--c-sc-selected": "Default colour of a selected selection control item such as radio button and switch button",
                "--c-sc-unselected": "Default colour of an un selected selection control item such as radio button and switch button",
                "--c-switch-on-bc": "Background colour of the active state of a switch",
                "--c-switch-off-bg": "Background colour of the de-active state of a switch",
                "--c-p-button-bg": "Primary button background colour",
                "--c-p-button": "Primary button text colour",
                "--c-s-button": "Secondary button text colour",
                "--c-node-fill": "Node item background colour",
                "--c-node-border": "Node item border colour",
                "--c-node-line": "Node seperator line between icon and title",
                "--c-node-active": "Node active background colour",
                "--c-node-icon": "Node icon colours"
            }
        }

    },
    contextMenu: {
        labels: {
            defaultTitle: "Context Menu",
            close: "Close Context Menu"
        }
    },
    assetTypeTree: {
        contextMenuTitle: "Options"
    },
    dateTime: {
        heading: "Select Date",
        select: "select",
        iconAria: "Open date picker"
    },
    calendar: {
        forwardButton: "Next month",
        backButton: "Previous month",
        monthSelect: "Month Select",
        yearSelect: "Year Select",
        dateHeader: "DATE"
    },
    queryParameters: {
        valuesRequired: "Please ensure all query parameter values are supplied."
    }
};
