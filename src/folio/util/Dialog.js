/*
 * Copyright (c) 2007-2010
 *
 * This file is part of Confolio.
 *
 * Confolio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Confolio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Confolio. If not, see <http://www.gnu.org/licenses/>.
 */

dojo.provide("folio.util.Dialog");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.Toolbar");
dojo.require("dijit.TooltipDialog");
dojo.require("dojox.form.BusyButton");
dojo.require("dijit.form.Button");
dojo.require("folio.create.Create");
dojo.require("folio.create.Upload");
dojo.require("folio.create.LinkTo");
dojo.require("folio.Application");
dojo.require("dijit.Dialog");

dojo.declare("folio.util.ButtonsBelow", [dijit.layout._LayoutWidget, dijit._Templated], {
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("folio", "util/ButtonsBelowTemplate.html"),
	constructor: function(args) {
	},
	addButton: function(button) {
		this.buttonRow.appendChild(button.domNode);
	},
	clearButtons: function() {
		this.buttonRow.innerHTML = "";
	},
	show: function(widget) {
		this.widget = widget;
		this.contentPane.set("content", widget);
	},
	resize: function() {
		if (this.widget && this.widget.resize) {
			this.widget.resize();
		}
	},
	postCreate: function() {
                this.containerNode = this.domNode; //Neccessary for ff3.5 bug.
                this.inherited("postCreate", arguments);
    }
});

dojo.declare("folio.util.Dialog", dijit.Dialog, {
	constructor: function(args) {
	},
	startup: function() {
		this.inherited("startup", arguments);
		this.doLayout=true;
		this.set("content", "<div dojoType=\"folio.util.ButtonsBelow\"></div>");
		this.buttonsBelow = this.getDescendants()[0];
	},
	clearButtons: function() {
		this.buttonsBelow.clearButtons();
	},
	addButton: function(button) {
		this.buttonsBelow.addButton(button);
	},
	show: function(widget, title) {
		this.setNiceTitle(title);
		this.buttonsBelow.show(widget);
		this.inherited(arguments);
	},
	setNiceTitle: function(title) {
		this.titleNode.innerHTML = title;
	}
});

dojo.declare("folio.util.StandardDialog", folio.util.Dialog, {
	/*
	 * Adds a cancel and a finish button.
	 * If cancel is pressed the dialog is closed directly.
	 * If finish is pressed the cancel button is disabled and the finish button
	 * is showing an animation indicating progress.
	 * When the background process has finished the dialog should be closed and the
	 * cancel and finish buttons should revert to the initial state.
	 * This is achieved by calling the done function.
	 */
	addStandardButtons: function(onFinish, onCancel) {
		dojo.requireLocalization("folio", "standardDialog");
		var rb = dojo.i18n.getLocalization("folio", "standardDialog");
		this.addCancelButton(onCancel, rb);
		this.addFinishButton(onFinish, rb);
	},
	addFinishButton: function(onFinish, rb) {	
		if (!rb) {
			dojo.requireLocalization("folio", "standardDialog");
			rb = dojo.i18n.getLocalization("folio", "standardDialog");			
		}
		this.finishButton = new dojox.form.BusyButton({label: rb.finishButtonLabel, busyLabel: rb.busyButtonLabel, 
			onClick: dojo.hitch(this, function() {
				if (this.cancelButton) {
					this.cancelButton.set("disabled", true);		
				}
				if (onFinish) {
					onFinish();
				}
			})});
		this.buttonsBelow.addButton(this.finishButton);
	},
	addCancelButton: function(onCancel, rb) {
		if (!rb) {
			dojo.requireLocalization("folio", "standardDialog");
			rb = dojo.i18n.getLocalization("folio", "standardDialog");			
		}
		this.cancelButton = new dijit.form.Button({label: rb.cancelButtonLabel, onClick: dojo.hitch(this, function() {
			this.hide();
			if (onCancel) {
				onCancel();
			}
		})});
		this.buttonsBelow.addButton(this.cancelButton);		
	},
	/*
	 * Call this method to launch the dialog.
	 */
	show: function(widget, title) {
		if (this.cancelButton) {
			this.cancelButton.set("disabled", false);
		}
		this.inherited(arguments);
	},
	/*
	 * Call this method to indicate that the background process intitiated on finish now has completed.
	 */
	done: function() {
		if (this.finishButton) {
			this.finishButton.cancel();
		}
		this.hide();
	}
});

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
 * 	should be called when the appropriate content of the tooltipdialog has been set.
 * @param {Object} onClose - will be called when the tooltipdialog is closed.
 */
folio.util.connectToolKitDialog = function(domNode, prepareDialog, onClose) {
	var nodeConnector;
		
	var connectNode = function() {
		nodeConnector = dojo.connect(domNode, "onclick", openTDialog);
	};
	var disconnectNode = function() {
		dojo.disconnect(nodeConnector);
	};
	var openTDialog = function() {
		disconnectNode();
		
		//Prepare the TooltipDialog and its internal historyList.
		var tooltipDialog = new dijit.TooltipDialog({});
		tooltipDialog._onBlur = function() {
			dijit.popup.close(tooltipDialog);
		};
		tooltipDialog.openPopup = function() {
			dijit.popup.open({
				popup: tooltipDialog,
				around: domNode,
				onClose: dojo.hitch(null, function() {
					tooltipDialog.destroy();					
					onClose && onClose();
					setTimeout(connectNode, 500);
				})
			});
		};
		if (prepareDialog) {
			var node = dojo.create("div");
			tooltipDialog.setContent(node);
			prepareDialog(node, function() {
				tooltipDialog.openPopup();
			});
		}
	};
	connectNode();
};

folio.util.TooltipDialog = dojo.declare(dijit.TooltipDialog, {
	orient: function() {
	}
});

/**
 * Similar to connectToolKitDialog but should be called after a click already has been made.
 * The method connectToolKitDialog starts listening for clicks on the provided domNode, this method simply launches a dialog
 * around the given domNode.
 * 
 */
folio.util.launchToolKitDialog = function(domNode, prepareDialog, params) {
	params = params || {around: domNode};
	if (folio.util._currentDomNode === domNode) {
		return;
	}
	folio.util._currentDomNode = domNode;
	params = params || {};
	
	//Prepare the TooltipDialog and its internal historyList.
	var tooltipDialog;
	if (params.noArrow) {
		tooltipDialog = new folio.util.TooltipDialog({});		
	} else {
		tooltipDialog = new dijit.TooltipDialog({});
	}
	tooltipDialog._onBlur = function() {
		dijit.popup.close(tooltipDialog);
	};
	
	tooltipDialog.openPopup = function() {
		dijit.popup.open(dojo.mixin({}, params, {
			popup: tooltipDialog,
			onClose: dojo.hitch(null, function() {
				tooltipDialog.destroy();					
				params.onClose && qparams.onClose();
				setTimeout(function() {delete folio.util._currentDomNode;}, 500);
			})
		}));
	};
	if (prepareDialog) {
		var node = dojo.create("div");
		tooltipDialog.setContent(node);
		prepareDialog(node, function() {
			tooltipDialog.openPopup();
		});
	}
	return tooltipDialog;
};
