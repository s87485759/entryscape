/*global define, __confolio*/
define([
    "exports",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/on",
    "dijit/layout/_LayoutWidget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/layout/ContentPane", //Used in template
    "dijit/TooltipDialog",
    "dojox/form/BusyButton",
    "dijit/form/Button",
    "dijit/Dialog",
    "dijit/popup",
    "dojo/text!./ButtonsBelowTemplate.html"
], function (exports, declare, lang, domConstruct, domStyle, on, _LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin,
             ContentPane, TooltipDialog, BusyButton, Button, Dialog, popup, template) {

    var ButtonsBelow = declare([_LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        addButton: function (button) {
            this.buttonRow.appendChild(button.domNode);
        },
        clearButtons: function () {
            this.buttonRow.innerHTML = "";
        },
        show: function (widget) {
            this.widget = widget;
            this.contentPane.set("content", widget);
        },
        resize: function () {
            if (this.widget && this.widget.resize) {
                this.widget.resize();
            }
        },
        postCreate: function () {
            this.containerNode = this.domNode; //Neccessary for ff3.5 bug.
            this.inherited("postCreate", arguments);
        }
    });

    exports.ButtonsBelow = ButtonsBelow;

    exports.Dialog = declare(Dialog, {
        startup: function () {
            this.inherited("startup", arguments);
            this.doLayout = true;
            var node =  domConstruct.create("div");
            this.set("content", node);
            this.buttonsBelow = new ButtonsBelow({}, node);
        },
        clearButtons: function () {
            this.buttonsBelow.clearButtons();
        },
        addButton: function (button) {
            this.buttonsBelow.addButton(button);
        },
        show: function (widget, title) {
            this.setNiceTitle(title);
            this.buttonsBelow.show(widget);
            this.inherited(arguments);
        },
        setNiceTitle: function (title) {
            this.titleNode.innerHTML = title;
        }
    });

    exports.StandardDialog = declare(exports.Dialog, {
        /*
         * Adds a cancel and a finish button.
         * If cancel is pressed the dialog is closed directly.
         * If finish is pressed the cancel button is disabled and the finish button
         * is showing an animation indicating progress.
         * When the background process has finished the dialog should be closed and the
         * cancel and finish buttons should revert to the initial state.
         * This is achieved by calling the done function.
         */
        addStandardButtons: function (onFinish, onCancel) {
            require(["dojo/i18n!folio/nls/standardDialog"], lang.hitch(this, function (rb) {
                if (onFinish != null) {
                    this.addFinishButton(onFinish, rb);
                }
                if (onCancel != null) {
                    this.addCancelButton(onCancel, rb);
                }
            }));
        },
        addFinishButton: function (onFinish, rb) {
            var f = lang.hitch(this, function (bundle) {
                this.finishButton = new BusyButton({label: bundle.finishButtonLabel, busyLabel: bundle.busyButtonLabel,
                    onClick: lang.hitch(this, function () {
                        if (this.cancelButton) {
                            this.cancelButton.set("disabled", true);
                        }
                        if (onFinish) {
                            onFinish(lang.hitch(this, function(positiveResult) {
                                if (positiveResult) {
                                    this.done();
                                } else {
                                    this.finishButton.cancel();
                                }
                            }));
                        }
                    })});
                this.buttonsBelow.addButton(this.finishButton);
            });
            if (rb != null) {
                f(rb);
            } else {
                require(["dojo/i18n!folio/nls/standardDialog"], f);
            }
        },
        setFinishButtonDisabled: function(disabled) {
            this.finishButton.set("disabled", disabled);
        },
        addCancelButton: function (onCancel, rb) {
            var f = lang.hitch(this, function (bundle) {
                this.cancelButton = new Button({label: bundle.cancelButtonLabel, onClick: lang.hitch(this, function () {
                    this.hide();
                    if (onCancel) {
                        onCancel();
                    }
                })});
                this.buttonsBelow.addButton(this.cancelButton);
            });

            if (rb != null) {
                f(rb);
            } else {
                require(["dojo/i18n!folio/nls/standardDialog"], f);
            }
        },
        addDoneButton: function (onDone, rb) {
            var f = lang.hitch(this, function (bundle) {
                this.doneButton = new Button({label: bundle.doneButtonLabel, onClick: lang.hitch(this, function () {
                    this.hide();
                    if (onDone) {
                        onDone();
                    }
                })});
                this.buttonsBelow.addButton(this.doneButton);
            });

            if (rb != null) {
                f(rb);
            } else {
                require(["dojo/i18n!folio/nls/standardDialog"], f);
            }
        },        /*
         * Call this method to launch the dialog.
         */
        show: function (widget, title) {
            if (this.cancelButton) {
                this.cancelButton.set("disabled", false);
            }
            this.inherited(arguments);
        },
        /*
         * Call this method to indicate that the background process initiated on finish now has completed.
         */
        done: function () {
            if (this.finishButton) {
                this.finishButton.cancel();
            }
            this.hide();
        }
    });

    exports.showStandardDialog = function(widget, title, onFinish, onCancel) {
        var d = new exports.StandardDialog();
        d.startup();
        d.addStandardButtons(onFinish, onCancel);
        d.show(widget, title);
        return d;
    };

    /**
     * Should be called like this:
     *
     * //This prepareDialog is just an example.
     * var prepareDialog = function(innerNode, onReady) {
     * 		var someDijit = new someDijit({}, innerNode);
     *
     * 		//Make sure that someDijit is finished rendering, or at least has some realistic size before making the following calls.
     * 		dijit.focus(someDijit.domNode);
     * 		onReady();
     * };
     *
     * var onClose = function() {
     *		//Do something on close
     * };
     *
     * folio.util.connectToolKitDialog(launchNode, prepareDialog, onDialogClose);
     *
     * Note that the prepareDialog will be called multiple times, once for each time the user clicks on
     * the node. The provided tooltipdialog will be new for each time.
     *
     *
     * @param {Object} domNode - where the tooltipdialog will be launched around
     * @param {Object} prepareDialog - a callback function which is called with the parameter of the tooltipDialog which openPopup method
     *    should be called when the appropriate content of the tooltipdialog has been set.
     * @param {Object} onClose - will be called when the tooltipdialog is closed.
     */
    exports.connectToolKitDialog = function (domNode, prepareDialog, onClose) {
        var nodeConnector;

        var connectNode = function () {
            nodeConnector = on(domNode, "click", openTDialog);
        };
        var openTDialog = function () {
            nodeConnector.remove();

            //Prepare the TooltipDialog and its internal historyList.
            var tooltipDialog = new TooltipDialog({});
            tooltipDialog._onBlur = function () {
                popup.close(tooltipDialog);
            };
            tooltipDialog.openPopup = function () {
                popup.open({
                    popup: tooltipDialog,
                    around: domNode,
                    onClose: lang.hitch(null, function () {
                        tooltipDialog.destroy();
                        onClose && onClose();
                        setTimeout(connectNode, 500);
                    })
                });
            };
            if (prepareDialog) {
                var node = domConstruct.create("div");
                tooltipDialog.setContent(node);
                prepareDialog(node, function () {
                    tooltipDialog.openPopup();
                });
            }
        };
        connectNode();
    };

    var _TooltipDialog = declare(TooltipDialog, {
        orient: function () {
        },
        postCreate: function() {
            this.inherited("postCreate", arguments);
            domStyle.set(this.connectorNode, "display", "none");
        }
    });

    var _currentDomNode;

    /**
     * Similar to connectToolKitDialog but should be called after a click already has been made.
     * The method connectToolKitDialog starts listening for clicks on the provided domNode, this method simply launches a dialog
     * around the given domNode.
     *
     */
    exports.launchToolKitDialog = function (domNode, prepareDialog, params) {
        params = params || {around: domNode};
        if (_currentDomNode === domNode) {
            return;
        }
        _currentDomNode = domNode;
        params = params || {};

        //Prepare the TooltipDialog and its internal historyList.
        var tooltipDialog;
        if (params.noArrow) {
            tooltipDialog = new _TooltipDialog({});
        } else {
            tooltipDialog = new TooltipDialog({});
        }
        tooltipDialog._onBlur = function () {
            popup.close(tooltipDialog);
        };

        tooltipDialog.openPopup = function () {
            popup.open(lang.mixin({}, params, {
                popup: tooltipDialog,
                onClose: lang.hitch(null, function () {
                    tooltipDialog.destroy();
                    params.onClose && qparams.onClose();
                    setTimeout(function () {
                        _currentDomNode = null
                    }, 500);
                })
            }));
        };
        if (prepareDialog) {
            var node = domConstruct.create("div");
            tooltipDialog.setContent(node);
            prepareDialog(node, function () {
                tooltipDialog.openPopup();
            });
        }
        return tooltipDialog;
    };
});
