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

dojo.provide("folio.create.Upload");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.StackContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dijit.form.TextBox");
dojo.require("folio.editor.MinimalMetadata");
dojo.require("folio.create.ACL");
dojo.require("dojox.form.FileInput");

dojo.declare("folio.create.Upload", [dijit._Widget, dijit._Templated], {
	attributeMap: dojo.mixin(dojo.clone(dijit.layout.ContentPane.prototype.attributeMap), {
		fileUploadLabel: {node: "fileUploadLabel", type: "innerHTML"},
		mimeTypeLabel: {node: "mimeTypeLabel", type: "innerHTML"},
		uploadTypeLabel: {node: "uploadTypeLabel", type: "innerHTML"}
    }),
	fileUploadLabel: "",
	mimeTypeLabel: "",
	uploadTypeLabel: "",
	browseButtonLabel: "",
	cancelButtonLabel: "",
	advancedUploadButtonLabelMoreDetails: "",
	advancedUploadButtonLabelLessDetails: "",
	
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("folio", "create/UploadTemplate.html"),
	postCreate: function() {
		this.inherited("postCreate", arguments);
		this.localize();
		dojo.connect(this.fileUpload.fileInput, "onchange", this, function() {
			//To let the changed value be set properly.
			setTimeout(dojo.hitch(this, this.onChange), 1);
		});
		dojo.connect(this.fileUpload.cancelNode, "onclick", this, function() {
			dojo.connect(this.fileUpload.fileInput, "onchange", this, "onChange");
			this.onChange();
		});
		dojo.connect(this.metadata, "onChange", this, "onChange");
		this.advancedUploadButton.set("label", this.advancedUploadButtonLabelMoreDetails);
	},
	onChange: function() {
		//connect to this function.
	},
	isReady: function() {
		return dojo.isString(this.fileUpload.inputNode.value) && this.fileUpload.inputNode.value != "" && this.metadata.isReady();
	},
	localize: function() {
		dojo.requireLocalization("folio", "upload");
		this.resourceBundle = dojo.i18n.getLocalization("folio", "upload");
		this.set(this.resourceBundle);
	},
	launch: function(context, folder) {
		this.context = context;
    	this.uploadType.store=folio.create.mixedTypeStore;
    	this.uploadType.query={scheme: "aT", rT: "informationresource"};
    	this.uploadType.set("value", "");
    	this.mimeType.store=folio.create.mimeTypeStore;
    	this.mimeType.set("value", " "); //Note, need to keep the blankspace in order to set "Detect" as the default value
    	this.acl.launchNew(context);
	},
	typeSelected: function(typ) {
		this.selectedType = typ;
	},
	mimeTypeSelected: function(typ) {
		if(typ && typ !== ' '){
			dojo.attr(this.mimeTypeWarning, "innerHTML", this.resourceBundle.mimeTypeWarningLabel);
		} else {
			dojo.attr(this.mimeTypeWarning, "innerHTML", "");
		}
		this.selectedMimeType = typ;
	},
	toggleUploadAdvancedMode:function (){
		this.advanced = !this.advanced;
		if(this.advanced){
			dojo.style(this.uploadAdvancedBlock,"display","block");
		}else {
			dojo.style(this.uploadAdvancedBlock,"display","none");
		}
		if (this.advanced) {
			this.advancedUploadButton.set("label", this.advancedUploadButtonLabelLessDetails);
		} else {
			this.advancedUploadButton.set("label", this.advancedUploadButtonLabelMoreDetails);
		}
	},
	getCreateObject: function(onFinish) {
		var obj = {metadata: this.metadata.getMetadata(this.context.getBase() + this.context.getId()+"/resource/_newId").exportRDFJSON(), 
				   params: {representationType: "informationresource",
						   locationType: "local",
						   builtinType: "none"}};
		if (this.selectedType != undefined && this.selectedType != "") {
			var graphToAdd = this.metadata.getMetadata(this.context.getBase() + this.context.getId()+"/resource/_newId");
			graphToAdd.create(this.context.getBase() + this.context.getId()+"/resource/_newId",folio.data.RDFSchema.TYPE,{"type":"uri","value":this.selectedType}, true)
			obj.metadata = graphToAdd.exportRDFJSON();
		}
		//Input from FileDialog is sent along so that background upload (in an iframe) can take place.
		if (this.fileUpload.fileInput.value) {
			obj.fileInput = this.fileUpload.fileInput;
			dojo.style(obj.fileInput, "display", "none");
		}
		
		if (this.acl.hasACL()) {
			this.acl.exportAclToList(dojo.hitch(this, function(list) {
				var helpObj = folio.data.createEntryGraphFromACLList(this.context, list);
				if (this.selectedMimeType != undefined && this.selectedMimeType != "") {
					folio.data.addMimeType(helpObj.info, helpObj.resURI, this.selectedMimeType);
				}
				obj.info = helpObj.info.exportRDFJSON();
				onFinish(obj);
			}));
		} else {
			if (this.selectedMimeType != undefined && this.selectedMimeType != "") {
				var helpObj = folio.data.createNewEntryHelperObj(this.context);
				folio.data.addMimeType(helpObj.info, helpObj.resURI, this.selectedMimeType);
				obj.info = helpObj.info.exportRDFJSON();
			}
			onFinish(obj);
		}
	},
	_setBrowseButtonLabelAttr: function(value) {
		this.fileUpload.titleNode.innerHTML = value;
		this.fileUpload.set("label", value);
		this.browseButtonLabel = value;
	},
	_setCancelButtonLabelAttr: function(value) {
		this.fileUpload.cancelNode.innerHTML = value;
		this.fileUpload.set("cancelText", value);
		this.cancelButtonLabel = value;
	}
});