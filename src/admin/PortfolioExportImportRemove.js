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

dojo.provide("folio.admin.PortfolioExportImportRemove");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.Dialog");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.CheckBox");


dojo.require("dojox.form.BusyButton");
dojo.require("dojox.form.Uploader");
dojo.require("dojox.form.uploader.plugins.IFrame");

dojo.require("folio.admin.TabContent");


dojo.declare("folio.admin.PortfolioExportImportRemove", [dijit._Widget, dijit._Templated, folio.admin.TabContent], {
	templatePath: dojo.moduleUrl("folio.admin", "PortfolioExportImportRemoveTemplate.html"),
	widgetsInTemplate: true,
	
	/*
	 * Inhereted method called to initialize all tabs
	 * @param {Object} entry
	 */
	setEntry: function(/* Entry */ entry) {
		this.inherited("setEntry", arguments);
		this.entry = entry;
		this._createNewFileUpload();
		this.removeButton.set('disabled', false);
		dojo.attr(this.importMsgAreaNode, 'innerHTML','');
		dojo.attr(this.deleteMsgAreaNode, 'innerHTML','');
	},
	_exportPortfolio: function(){
		var uriString = this.entry.getResourceUri()+"/export"
		var includeOnlyMD = this.onlyMDCheckboxDijit.get("value");
		if(includeOnlyMD){
			uriString+="?metadataOnly";
		}
		var newWindow = window.open(uriString,"_blank");
	},
	_showRemoveDialog: function(){
		this.RMDialog.show();
	},
	_closeRMDialog: function () {
		this.RMDialog.hide();
	},
	_removeContext: function(){
		var contextet = this.entry.getContext();
		var storet = contextet.getStore();
		this.application.getCommunicator().deleteEntry(this.entry).then(
			dojo.hitch(this, function(argv){
				dojo.attr(this.deleteMsgAreaNode, 'innerHTML','Context successfully removed!');
				this.application.dispatch({action: "childrenChanged", entry: this.entry, source: this});
				this.removeButton.set('disabled', true);
				this.RMDialog.hide();
			}),
			dojo.hitch(this, function(argv){
				//TODO: Display a message somewhere...
				dojo.attr(this.deleteMsgAreaNode, 'innerHTML','Removal of this context failed!');
			})
		);
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
	   this.fileUploadChangeArea.appendChild(this.fileUploadChange.domNode); 
	},
	onUploadFieldChange: function() {
		//var newFileArray = this.fileUploadChange.fileInput.files;
		var anyFileGiven = dojo.isString(this.fileUploadChange.inputNode.value) && this.fileUploadChange.inputNode.value != "";
		if(anyFileGiven){
		//if(newFileArray.length>0){
	       this.fileSaveButton.set('disabled', false);
		} else {
	   		this.fileSaveButton.set('disabled', true);
		} 
	},
	changeUploadedFile: function(){
		
		var _newForm; 
        if(dojo.isIE){
                  // just to reiterate, IE is a steaming pile of code. 
                  _newForm = document.createElement('<form enctype="multipart/form-data" method="post">');
                  _newForm.encoding = "multipart/form-data";
        }else{
                  // this is how all other sane browsers do it
                  _newForm = document.createElement('form');
                  _newForm.setAttribute("enctype","multipart/form-data");
         }
		 _newForm.appendChild(this.fileUploadChange.fileInput);
         dojo.body().appendChild(_newForm);
		 dojo.io.iframe.send({
                  url: this.application.getCommunicator().insertAuthParams(this.entry.getResourceUri()+"/import"),
				/*
				 * preventCache added to make sure that changes are detected in IE
				 * (example: if a user changes the title of an entry, the entry will 
				 * still seem to have the same title until the user manually empties 
				 * the cache and reloads the page)
				 */
				  preventCache: true,
                  form: _newForm,
				  load: dojo.hitch(this, function (data, ioArgs){
				  	console.log("Smooth...");
					this._createNewFileUpload();
					this.fileSaveButton.cancel();
					this.fileSaveButton.set('disabled', true);
					dojo.attr(this.importMsgAreaNode, 'innerHTML','Import successful!');
				  }),
				  error:dojo.hitch(this, function (data, ioArgs){
				  	console.log("Error");
					this._createNewFileUpload();
					this.fileSaveButton.cancel();
					this.fileSaveButton.set('disabled', true);
					dojo.attr(this.importMsgAreaNode, 'innerHTML','Import failed, try again');
				  })
          });	
	}
});
