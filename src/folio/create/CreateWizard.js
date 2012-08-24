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

dojo.provide("folio.create.CreateWizard");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.Toolbar");
dojo.require("dojox.form.BusyButton");
dojo.require("dijit.form.Button");
dojo.require("folio.create.Create");
dojo.require("folio.create.Upload");
dojo.require("folio.create.LinkTo");
dojo.require("folio.editor.RFormsEditorPlain");
dojo.require("folio.Application");
dojo.require("dijit.Dialog");


dojo.require("rdfjson.Graph");

dojo.declare("folio.create.CreateWizard", [dijit._Widget, dijit._Templated], {
	attributeMap: dojo.mixin(dojo.clone(dijit.layout.ContentPane.prototype.attributeMap), {
        conditionText: {node: "conditionNode", type: "innerHTML"}
	}),

	cancelButtonLabel: "",
	nextButtonLabel: "",
	finishButtonLabel: "",
	busyButtonLabel: "",
	hasCondition: false,
	forceNext: false,
	conditionText: "",
	
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("folio", "create/CreateWizardTemplate.html"),	
	constructor: function(args) {
	},
	postCreate: function() {
		this.inherited("postCreate", arguments);
		if (__confolio.config["showCreateCondition"] === "true") {
			this.hasCondition = true;
		}
		if (__confolio.config["forceNextInCreate"] === "true") {
			this.forceNext = true;
		}
		this.localize();
		this.reset();
	},
	localize: function() {
		dojo.requireLocalization("folio", "createWizard");
		this.resourceBundle = dojo.i18n.getLocalization("folio", "createWizard");
		this.set(this.resourceBundle);
	},
	launch: function(type, context, folder, onFinish, onCancel) {
		this.context = context;
		this.parentList = folder;

		switch (type) {
		case "upload":
			this.dialogWidget = new folio.create.Upload({});
			break;
		case "create":
			this.dialogWidget = new folio.create.Create({});
			break;
		case "linkto":
			this.dialogWidget = new folio.create.LinkTo({});
			break;
		}
		dojo.connect(this.dialogWidget, "onChange", this, this.conditionCheckChanged);
		this.cp.set("content", this.dialogWidget);
		this.dialogWidget.startup();
		this.dialogWidget.launch(context, folder);
		this.onFinish = onFinish;
		this.onCancel = onCancel;
	},
	nextClicked: function() {
		this.nextButton.set("disabled", true);
		this.finishButton.set("disabled", false);
		dojo.style(this.conditionRow, "display", "none");
		this.nextState = true;
		var resourceURI;
		if(this.dialogWidget instanceof folio.create.LinkTo){
			resourceURI=this.dialogWidget.getURL();
		} else {
			resourceURI=this.context.getBase() + this.context.getId()+"/resource/_newId";
		}
		this.dialogWidget.getCreateObject(dojo.hitch(this, function(co) {
			this.co = co;
			var node = dojo.create("div");
			this.cp.set("content", node);
			this.apPlain = new folio.editor.RFormsEditorPlain({}, node);
			var md = new rdfjson.Graph(dojo.clone(this.co.metadata));
			this.application.getItemStore(dojo.hitch(this, function(itemStore) {
				var ap = this.application.getConfig().getDefaultMP();
				this.apPlain.show(md, null, resourceURI, itemStore.detectTemplate(md, resourceURI, ap.items));
			}));
		}));
	},
	finishClicked: function() {
		if (this.apPlain && !this.apPlain.isWithinCardinalityConstraints()) {
			this.finishButton.cancel();
			this.apPlain.showErrors();
			return;
		}
		this.cancelButton.set("disabled", true);	
		var self = this;
		if (this.co) {
			var md = this.apPlain.getMetadata();
			this.co.metadata = md;
			this.createEntry(this.co);
		} else {
			this.dialogWidget.getCreateObject(dojo.hitch(this, this.createEntry));
		}
	},
	createEntry: function(co) {
		this.co = this.co || co;
		this.co.context = this.context;
		this.co.parentList = this.parentList;
		if (this.co.context) {
			this.co.context.createEntry(this.co,
					dojo.hitch(this, function(entry) {
						//Upload file if there is a file.
						if (this.co.parentList && this.application) {
							this.co.parentList.setRefreshNeeded();
							this.application.publish("childrenChanged", {entry: this.co.parentList, source: this});
						}
						if (this.onFinish) {
							this.onFinish(this.co);
						}
						this.reset();
					}), dojo.hitch(this, function(mesg) {
						if (this.onCancel) {
							this.onCancel(mesg);
						}
						this.reset();
					}));
		} else if (self.onFinish){
			this.onFinish(this.co);
			this.reset();
		}
	},
	reset: function() {
		this.co = null;
		this.apPlain = null;
		this.finishButton.cancel();
		this.finishButton.set("disabled", true);
		this.nextButton.set("disabled", true);
		this.cancelButton.set("disabled", false);
		dojo.style(this.conditionRow, "display", this.hasCondition ? "" : "none");
		this.conditionCheck.set("checked", false);
//		this.nextButton.set("disabled", this.hasCondition && !this.conditionCheck.get("checked"));
	},
	conditionNodeClicked: function() {
		this.conditionCheck.set("checked", !this.conditionCheck.get("checked"));
		this.conditionCheckChanged();
	},
	conditionCheckChanged: function() {
		if (this.dialogWidget) {
			var isNotReady = (this.hasCondition && !this.conditionCheck.get("checked")) || !this.dialogWidget.isReady();
			this.nextButton.set("disabled", isNotReady);
			this.finishButton.set("disabled", this.forceNext || isNotReady);			
		}
	},
	cancelClicked: function() {
		if (this.onCancel) {
			this.onCancel();
		}
		this.reset();
	},
	_setCancelButtonLabelAttr: function(value) {
		this.cancelButton.set("label", value);
		this.cancelButtonLabel = value;
	},
	_setNextButtonLabelAttr: function(value) {
		this.nextButton.set("label", value);
		this.nextButtonLabel = value;
	},
	_setFinishButtonLabelAttr: function(value) {
		this.finishButton.set("label", value);
		this.finishButton._label = value; //Seems like a bug in BusyButton
		this.finishButtonLabel = value;
	},
	_setBusyButtonLabelAttr: function(value) {
		this.finishButton.set("busyLabel", value);
		this.busyButtonLabel = value;
	}
});


dojo.declare("folio.create.CreateWizardDialog", [dijit.Dialog,  folio.ApplicationView], {
	uploadFileTitle: "",
	createObjectTitle: "",
	linkToWebResourceTitle: "",
	
	constructor: function(args) {
	},
	postCreate: function() {
		this.inherited("postCreate", arguments);
		this.localize();

		//make sure the various store are initalized.
		folio.create.getMimeTypeStore(this.application.getConfig());
		folio.create.getCreateTypeStore(this.application.getConfig());
		folio.create.getMixedTypeStore(this.application.getConfig());		
		folio.create.getCreateLanguages(this.application.getConfig());

		if (this.createWizard) {
			this.createWizard.application=this.application;
		}
	},
	localize: function() {
		dojo.requireLocalization("folio", "createWizard");
		this.resourceBundle = dojo.i18n.getLocalization("folio", "createWizard");
		this.set(this.resourceBundle);
	},
	getSupportedActions: function() {
		return ["showCreateWizard", "localeChange"];
	},
	startup: function() {
		this.inherited("startup", arguments);
		this.doLayout=true;
//		this.createWizard = new folio.create.CreateWizard({});
		this.set("content", "<div dojoType=\"folio.create.CreateWizard\"></div>");
		this.createWizard = this.getDescendants()[0];
		if (this.application) {
			this.createWizard.application = this.application;
//			this._singleChild.application=this.application;
		}
	},
	handle: function(event) { //type, context, folder, onFinish, onCancel) {
		switch (event.action) {
			case "showCreateWizard":
				var self = this;
				this.setNiceTitle(event.type);
				this.createWizard.launch(event.type, event.entry.getContext(), event.entry, function(args){
					self.hide();
					if (event.onFinish) {
						event.onFinish(args);
					}
				}, function(mesg){
					self.hide();
					if (event.onCancel) {
						event.onCancel(mesg);
					}
				});
				
				var viewport = dijit.getViewport();
				dojo.style(this.createWizard.domNode, {
                                        width: Math.floor(viewport.w * 0.60)+"px",
                                        overflow: "auto",
                                        position: "relative"    // workaround IE bug moving scrollbar or dragging dialog
                                });
				this.show();
				break;
			case "localeChange":
				this.localize();
				this.createWizard.localize();
				break;
		}
	},
	setNiceTitle: function(type) {
		switch(type) {
		case "upload":
			this.titleNode.innerHTML = this.uploadFileTitle;
			break;
		case "create":
			this.titleNode.innerHTML = this.createObjectTitle;
			break;
		case "linkto":
			this.titleNode.innerHTML = this.linkToWebResourceTitle;
			break;
		}
	},
	getCreateWizard: function() {
		return this.createWizard;
	}
});


dojo.declare("folio.create.CreateWizardPane", [dijit.layout.ContentPane,  folio.ApplicationView], {
	constructor: function(args) {
	},
	getSupportedActions: function() {
		return ["showView"];
	},
	startup: function() {
		this.inherited("startup", arguments);
		this.doLayout=true;
		this.set("content", "<div dojoType=\"folio.create.CreateWizard\"></div>");
		this.createWizard = this.getDescendants()[0];
		if (this.application) {
			this.createWizard.application = this.application;
		}
	},
	applicationViewInit: function() {
		//make sure the various store are initalized.
		folio.create.getMimeTypeStore(this.application.getConfig());
		folio.create.getCreateTypeStore(this.application.getConfig());
		folio.create.getMixedTypeStore(this.application.getConfig());
		folio.create.getCreateLanguages(this.application.getConfig());

		if (this.createWizard) {
			this.createWizard.application=this.application;
		}
	},
	handle: function(event) { //type, context, folder, onFinish, onCancel) {
		this.createWizard.launch(event.type, event.context, event.entry, function(args) {
			if (event.onFinish) {
				event.onFinish(args);
			}
		},
		function(mesg) {
			if (event.onCancel) {
				event.onCancel(mesg);
			}
		});
	},
	getCreateWizard: function() {
		return this.createWizard;
	}
});