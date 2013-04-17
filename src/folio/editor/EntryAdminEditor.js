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

dojo.provide("folio.editor.EntryAdminEditor");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.layout.ContentPane");

dojo.require("folio.create.ACL");
dojo.require("folio.data.util");

dojo.declare("folio.editor.EntryAdminEditorDialog", [dijit.Dialog, folio.ApplicationView], {
	postCreate: function() {
		this.inherited("postCreate", arguments);
		var node = dojo.create("div");
		this.set("content", node);
		this.eae = new folio.editor.EntryAdminEditor({}, node);
		this.eae.dialog = this;
		this.eae.startup();
	},
	getSupportedActions: function() {
		return ["localeChange", "entryAdmin"];
	},
	handle: function(event) {
		switch (event.action) {
		case "entryAdmin":
			this.showEntryAdminDialog(event.entry);
			break;
		case "localeChange":
			this.eae.localize();
			break;
		}
	},
	showEntryAdminDialog:function(entry) {
		this.eae.showEntryAdminDialog(entry);
		var viewport = dijit.getViewport();
		dojo.style(this.domNode, {
                            width: Math.floor(viewport.w * 0.70)+"px"
                    });
		dijit.focus(this.eae.domNode);
		this.show();
	}
});

dojo.declare("folio.editor.EntryAdminEditor", [dijit._Widget, dijit._Templated], {
	attributeMap: dojo.mixin(dojo.clone(dijit.layout.ContentPane.prototype.attributeMap), {
		linkDestinationText: {node: "linkDestinationTextNode", type: "innerHTML"},
		replaceFileText: {node: "replaceFileTextNode", type: "innerHTML"},
		typeOfFileText: {node: "typeOfFileTextNode", type: "innerHTML"}
	}),
	linkDestinationText: "",
	saveLinkButtonLabel: "",
	replaceFileText: "",
	browseButtonLabel: "",
	typeOfFileText: "",
	fileSaveButtonLabel: "",
	saveAccessControlButtonLabel: "",
	closeButtonLabel: "",
	browseButtonCancelLabel: "",
	recursiveACL: "",
	recursiveACLWarningNote: "",
	recursiveACLWarning: "",
	
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("folio", "editor/EntryAdminTemplate.html"),
	
	postCreate: function(args){
		this.inherited("postCreate", arguments);
		this._createNewFileUpload();
		this.localize();
		this.containerNode  = this.domNode;
		this.inherited("startup", arguments);
	},
	getSupportedActions: function() {
		return ["adminEntryEdit", "localeChange"];
	},
	showEntryAdminDialog:function(entry) {
		this.entry = entry;
		var locType = this.entry.getLocationType();
		var builtinType = this.entry.getBuiltinType();
		if(builtinType === folio.data.BuiltinType.NONE){
		   if(locType === folio.data.LocationType.LOCAL){//Different dialog depending on the Location Type
			   this._createNewFileUpload();
			   dojo.style(this.FileChangePane, "display", "block");
			   var localResource = this.entry.getResource();
			   this.changeFileMimeType.set("store", folio.create.mimeTypeStore);
			   //var fileMimeT = this.entry.getMimeType();
			   //if(fileMimeT){
			   //	 this.changeFileMimeType.attr('value', fileMimeT);
			   //} else {
			   this.changeFileMimeType.set("value", "");
			   this.changeFileMimeType.set("displayedValue", "Detect");
			   //}
		   } else if (locType === folio.data.LocationType.LINK ||
		               locType === folio.data.LocationType.LINK_REFERENCE ||
					   locType === folio.data.LocationType.REFERENCE){
               dojo.style(this.URLChangePane, "display", "block");
			   this.originalUrl = this.entry.getResourceUri();
			   this.ChangeURL.set('value', this.originalUrl);
			   this.ChangeURL.set("regExp", folio.data.uriRegexpStr);
			   this.updateLinkButton.set('disabled', true);
			   dojo.connect(this.ChangeURL, "validate", this, function(){
			   	  var isValueValid = this.ChangeURL.isValid();
				  var isOriginal = this.originalUrl === this.ChangeURL.get('value');
			      this.updateLinkButton.set('disabled', !isValueValid || isOriginal);
				  this.changeLinkMessageArea.set('content', "");
			   });
		   }
		} else if(builtinType === folio.data.BuiltinType.LIST && 
		          locType === folio.data.LocationType.LOCAL){
			   dojo.style(this.divForRecursiveACL, "display", "inline");
			   this.setACLRecursiveForList.set("checked","true");
		}
		dojo.attr(this.setACLRecursiveLabel, "innerHTML", this.recursiveACL);
		dojo.attr(this.recursiveWarningDiv, "innerHTML", "<b>"+this.recursiveACLWarningNote+":</b> " + this.recursiveACLWarning);
		var node = document.createElement("div");
		this.aclContenPane.set('content', node);
		this.acl = new folio.create.ACL({open: true}, node);
		this.acl.startup();
		this.acl.launchOld(this.entry);
	},
	onFinish: function(){
			dojo.style(this.FileChangePane,"display", "none");
			dojo.style(this.URLChangePane, "display", "none");
			dojo.style(this.divForRecursiveACL, "display", "none");
			this.setACLRecursiveForList.set("checked","false");
			this.dialog.hide();
			this.clean();
	},
	onChangeURLClick: function(){
		var newURL = this.ChangeURL.getValue();
		this.entry.setResourceUri(newURL);
		this.entry.saveInfo(dojo.hitch(this,function(){
			   this.updateLinkButton.cancel();
			   this.updateLinkButton.set('disabled', true);
			   this.changeLinkMessageArea.set('content', this.resourceBundle.uploadedAndChangedLink);
			   this.entry.setRefreshNeeded();
				this.entry.refresh(dojo.hitch(this, function(entry){
					this.dialog.application.dispatch({action: "changed", entry: entry, source: this});
					this.dialog.application.getStore().updateReferencesTo(entry);
				}));
		   }), dojo.hitch(this, function () {
			   this.updateLinkButton.cancel();
			   this.updateLinkButton.set('disabled', true);
			   this.changeLinkMessageArea.set('content', this.resourceBundle.failedChangeLink);
			   this.entry.setRefreshNeeded();
		   }));
	},
	onUploadFieldChange: function(){
		//var newFileArray = this.fileUploadChange.fileInput.files;
		var anyFileGiven = dojo.isString(this.fileUploadChange.inputNode.value) && this.fileUploadChange.inputNode.value != "";
		if(anyFileGiven){
		//if(newFileArray.length>0){
		   this.changeFileMimeType.set('disabled', false);
	       this.fileSaveButton.set('disabled', false);
		} else {
			this.changeFileMimeType.set('disabled', true);
	   		this.fileSaveButton.set('disabled', true);
		} 
	},
	clean: function() {
		this.ChangeURL.set('value', '');
		this.changeLinkMessageArea.set('content', '');
		this.changeFileMessageArea.set('content', '');
		this.updateLinkButton.set('disabled', true);
		this.changeFileMimeType.set('disabled', true);
	    this.fileSaveButton.set('disabled', true);
	},
	onACLSaveButtonClicked: function() {
		console.log('Saving ACL...');
		if (this.acl.hasACL()) {
			this.acl.exportAclToList(dojo.hitch(this,function(list) {
					folio.data.setACLList(this.entry, list);
					this.entry.saveInfoWithRecusiveACL(this.setACLRecursiveForList.get("checked"), 
					                                    dojo.hitch(this,function() {
							this.saveacl.cancel();
							if(this.setACLRecursiveForList.get("checked")){
						       this.entry.getContext().getStore().clearCache();
							   this.dialog.application.dispatch({action: "orderChange"});
							}
						}), 
						dojo.hitch(this,function(message) {
							this.saveacl.cancel();
							this.dialog.application.message(message);
							this.dialog.done();
						}));
				}));
		} else {
			folio.data.setACLList(this.entry, []);
			this.entry.saveInfoWithRecusiveACL(this.setACLRecursiveForList.get("checked"),
			                                dojo.hitch(this, function() {
					this.saveacl.cancel();
					if(this.setACLRecursiveForList.get("checked")){
						this.entry.getContext().getStore().clearCache();
						this.dialog.application.dispatch({action: "orderChange"});
					}
				}), dojo.hitch(this, function(message) {
					this.saveacl.cancel();
					this.dialog.application.message(message);
					this.dialog.done();
				}));
		}
	},
	changeUploadedFile: function(){
		var contextForEntry = this.entry.getContext();
		var resUri = this.entry.getResourceUri();
		if (this.changeFileMimeType.isValid() && this.changeFileMimeType.get('value') !== " ") {//Needs to be a space as that is the value for "Detect"
			resUri = resUri + "?mimeType=" + this.changeFileMimeType.get('value');
		}
		this.changeFileMessageArea.set('content', this.resourceBundle.replacingFile);
		contextForEntry.communicator.putFile(resUri, this.fileUploadChange.fileInput,
		   dojo.hitch(this,function(){
			   this.entry.refresh();
			   var self = this;
			   setTimeout(function() {
			   		self.fileSaveButton.cancel();
					self.fileSaveButton.set('disabled', true);
			   }, 1);

			   this.changeFileMimeType.set('disabled', true);
			   this.changeFileMessageArea.set('content', this.resourceBundle.uploadedAndChangedFile);
			   this._createNewFileUpload();
		   }), function () {
		   	   console.log("Funkade INTE att ändra fil!")
			   this.fileSaveButton.cancel();
			   this.changeFileMimeType.set('disabled', true);
	           this.fileSaveButton.set('disabled', true);
			   this.changeFileMessageArea.set('content', this.resourceBundle.failedChangeFile);
			   this._createNewFileUpload();
		   });
	},
	toggleRecursiveWarning: function(){
		if(this.setACLRecursiveForList.get("checked")){
			dojo.style(this.recursiveWarningDiv, "display", "block");
		} else {
			dojo.style(this.recursiveWarningDiv, "display", "none");
		}
	},
	fileMimeTypeChanged: function(){
		//if(this.changeFileMimeType.isValid()){
		//   var mimeValue = this.changeFileMimeType.attr('value');
		//   this.entry.setMimeType(mimeValue);
		//}
		//this.mimeTypeChanged = true;
	},
	_createNewFileUpload: function(){
		if(this.fileUploadChange){
		   this.fileUploadChangeArea.removeChild(this.fileUploadChange.domNode);	
		}
		this.fileUploadChange = new dojox.form.FileInput();
		this.fileUploadChange.startup();
			   dojo.connect(this.fileUploadChange.fileInput, "onchange", this, "onUploadFieldChange");
		       dojo.connect(this.fileUploadChange.cancelNode, "onclick", this, function() {
			       dojo.connect(this.fileUploadChange.fileInput, "onchange", this, "onUploadFieldChange");
			       this.onUploadFieldChange();
		       });
	   this.localize();
	   this.fileUploadChangeArea.appendChild(this.fileUploadChange.domNode); 
	},
	localize: function() {
		dojo.requireLocalization("folio", "entryAdminEditor");
		this.resourceBundle = dojo.i18n.getLocalization("folio", "entryAdminEditor");
		this.set(this.resourceBundle);
	},
	_setSaveLinkButtonLabelAttr: function(value) {
		this.updateLinkButton.set("label", value);
		this.updateLinkButton._label = value;
		this.saveLinkButtonLabel = value;
	},
	_setBrowseButtonLabelAttr: function(value) {
		this.fileUploadChange.titleNode.innerHTML = value;
		this.fileUploadChange.set("label", value);
		this.browseButtonLabel = value;
	},
	_setBrowseButtonCancelLabelAttr: function(value) {
		this.fileUploadChange.cancelNode.innerHTML = value;
		//this.fileUploadChange.attr("label", value);
		this.browseButtonCancelLabel = value;
	},
	_setFileSaveButtonLabelAttr: function(value) {
		this.fileSaveButton.set("label", value);
		this.fileSaveButton._label = value;
		this.fileSaveButtonLabel = value;
	},
	_setSaveAccessControlButtonLabelAttr: function(value) {
		this.saveacl.set("label", value);
		this.saveacl._label =  value;
		this.saveAccessControlButtonLabel = value;
	},
	_setCloseButtonLabelAttr: function(value) {
		this.aclSaveButton.set("label", value);
		this.closeButtonLabel = value;
	}	
});
