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

dojo.provide("folio.create.LinkTo");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.StackContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("folio.editor.MinimalMetadata");
dojo.require("folio.create.ACL");
dojo.require("folio.data.util");

dojo.declare("folio.create.LinkTo", [dijit._Widget, dijit._Templated], {
	attributeMap: dojo.mixin(dojo.clone(dijit.layout.ContentPane.prototype.attributeMap), {
		URLLabel: {node: "URLLabel", type: "innerHTML"},
		linkTypeLabel: {node: "linkTypeLabel", type: "innerHTML"},
		downloadableLabel: {node: "downloadableLabel", type: "innerHTML"},
		formatLabel: {node: "formatLabelText", type: "innerHTML"},
		externalInfoLabel: {node: "externalInfoLabel", type: "innerHTML"},
		mdInfoLabel: {node: "mdInfoLabelText", type: "innerHTML"}
	}),
	URLLabel: "",
	linkTypeLabel: "",
	advancedButtonLabelMoreDetails: "",
	advancedButtonLabelLessDetails: "",
	downloadableLabel: "",
	formatLabel: "",
	externalInfoLabel: "",
	mdInfoLabel: "",
	
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("folio", "create/LinkToTemplate.html"),	
	formatVisible: true,
	mdInfoVisible: false,
	advanced: false,
	constructor: function(args) {
	},
	postCreate: function() {
		this.inherited("postCreate", arguments);
		this.updateVisibility();
		this.localize();
		this.advancedButton.set("label", this.advancedButtonLabelMoreDetails);
		this.URL.set("regExp", folio.data.uriRegexpStr);
		this.URL.intermediateChanges = true;
		dojo.connect(this.URL, "onChange", this, "onChange");
		dojo.connect(this.metadata, "onChange", this, "onChange");
	},
	onChange: function() {
		//connect to this one
	},
	isReady: function() {
		return this.URL.isValid() && this.metadata.isReady();
	},
	localize: function() {
		dojo.requireLocalization("folio", "linkTo");
		this.resourceBundle = dojo.i18n.getLocalization("folio", "linkTo");
		this.set(this.resourceBundle);
	},
	launch: function(context, folder) {
		this.context = context;
    	this.linkType.store=folio.create.mixedTypeStore;
//    	this.linkType.query={scheme: "aT", rT: "informationresource"};
    	this.linkType.query={rT: "informationresource"};
    	this.linkType.set("value", "");
    	this.mimeType.store=folio.create.mimeTypeStore;
    	this.mimeType.set("value", "");
    	this.acl.launchNew(context);
	},
	typeSelected: function(type) {
		if (type && type !=="" ) {
			this.selectedType = type;
			var self = this;
			this.scheme = folio.create.mixedTypeStore.get(type).scheme;
		}
	},
	mimeTypeSelected: function(type) {
		this.selectedMimeType = type;
	},
	changedRepType: function() {
		this.formatVisible = !this.formatVisible;
		if (this.formatVisible) {
	    	this.linkType.query={rT: "informationresource"};
	    	this.linkType.reset();
	    	this.linkType.query={rT: "namedresource"};
		} else {
	    	this.linkType.reset();
		}

		this.updateVisibility();
	},
	changedLocType: function() {
		this.mdInfoVisible = !this.mdInfoVisible;
		this.updateVisibility();
	},
	updateVisibility: function() {
		if (this.advanced) {
			this.advancedBlock.style.display="";
		} else {
			this.advancedBlock.style.display="none";
		}
		if (this.mdInfoVisible && this.advanced) {
			this.mdInfoURL.set("disabled", false);
			dojo.removeClass(this.mdInfoURL.domNode, "grayedOut");
			dojo.removeClass(this.mdInfoLabelText, "grayedOut");
		} else {
			this.mdInfoURL.set("disabled", true);
			dojo.addClass(this.mdInfoURL.domNode, "grayedOut");
			dojo.addClass(this.mdInfoLabelText, "grayedOut");
		}
		if (this.formatVisible && this.advanced) {
			this.mimeType.set("disabled", false);
			dojo.removeClass(this.formatLabelText, "grayedOut");
		} else {
			this.mimeType.set("disabled", true);
			dojo.addClass(this.formatLabelText, "grayedOut");
		}
	},
	toggleAdvancedMode: function() {
		this.advanced = !this.advanced;
		if (this.advanced) {
			this.advancedButton.set("label", this.advancedButtonLabelLessDetails);
		} else {
			this.advancedButton.set("label", this.advancedButtonLabelMoreDetails);
		}
		this.updateVisibility();
	},
	getCreateObject: function(onFinish) {
		var obj = {metadata: this.metadata.getMetadata(this.URL.get("value")).exportRDFJSON(), 
				   params: {resource: encodeURIComponent(this.URL.get("value"))}};
		var mt;
		if (this.formatVisible) {
			obj.params.representationType = "informationresource";
			mt = this.mimeType.get("value");
		} else {
			obj.params.representationType = "namedresource";
		}
		if (this.mdInfoVisible) {
			obj.params.locationType = "linkreference";
			obj.params.metadata = encodeURIComponent(this.mdInfoURL.get("value"));
		} else {
			obj.params.locationType = "link";
		}
		if (this.scheme=="bT") {
			obj.params.builtinType = this.selectedType;
		} else {
			obj.params.builtinType = "none";
			if (this.selectedType != undefined && this.selectedType != "") {
				var graphToAdd = this.metadata.getMetadata(this.URL.get("value"));
				graphToAdd.create(this.URL.get("value"),folio.data.RDFSchema.TYPE,{"type":"uri","value":this.selectedType}, true);
				obj.metadata = graphToAdd.exportRDFJSON();
			}
		}
		if (this.acl.hasACL()) {
			this.acl.exportAclToList(dojo.hitch(this, function(list) {
				var helpObj = folio.data.createEntryGraphFromACLList(this.context, list);
				if (mt != undefined && mt != "") {
					folio.data.addMimeType(helpObj.info, this.URL.get("value"), mt);
				}
				obj.info = helpObj.info.exportRDFJSON();
				onFinish(obj);
			}));
		} else {
			if (mt != undefined && mt != "") {
				var helpObj = folio.data.createNewEntryHelperObj(this.context);
				folio.data.addMimeType(helpObj.info, this.URL.get("value"), mt);
				obj.info = helpObj.info.exportRDFJSON();
			}
			onFinish(obj);
		}
	},
	getURL: function() {
		return this.URL.get("value");
	}
});