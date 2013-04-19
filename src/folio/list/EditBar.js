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

dojo.provide("folio.list.EditBar");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.Button");

dojo.require("rdfjson.Graph");

dojo.declare("folio.list.EditBar", [dijit._Widget, dijit._Templated, folio.ApplicationView], {
	attributeMap: dojo.mixin(dojo.clone(dijit.layout.ContentPane.prototype.attributeMap), {
        createNew: {node: "createNewTextNode", type: "innerHTML"}
	}),
	createNew: "",
	copyButtonLabel: "",
	pasteButtonLabel: "",
	uploadButtonLabel: "",
	linkButtonLabel: "",
	createButtonLabel: "",
	folderButtonLabel: "",
	textButtonLabel: "",
	
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("folio.list", "EditBarTemplate.html"),	
	constructor: function(args) {
		this.list = args.list;
	},
	postCreate: function() {
		this.inherited("postCreate", arguments);
		if (__confolio.config["showTextButton"] === "false") {
			dojo.style(this.textButton.domNode, "display", "none");
		}
		if (__confolio.config["showCreateObjectButton"] === "true") {
			dojo.style(this.createButton.domNode, "display", "");
		}
		
		this.localize();
	},
	getSupportedActions: function() {
		//console.log("EditBar.getSupportedActions");
		return ["localeChange", "showContext", "showEntry", "focusOn", "clipboardChange", "userChange"];
	},
	handle: function(event) {
		switch (event.action) {
		case "localeChange":
			//console.log("EditBar.handle(event.action='localeChange')");
			this.localize();
			break;
		case "focusOn":
		   this.updateCopyButton(event.entry);
		   break;
		case "showEntry":
		case "showContext":
			if (event.list) {
				this.folder = event.list;
			} else {
				this.folder = event.entry;				
			}
		case "clipboardChange":
		   this.updateButtons();
		   break;
		case "userChange":
		   //this.updateButtons();
		   break;
		}
	},
	localize: function() {
		dojo.requireLocalization("folio", "editBar");
		this.resourceBundle = dojo.i18n.getLocalization("folio", "editBar"); 
		this.set(this.resourceBundle);
	},
	updateButtons: function() {
		var cb = this.application.getClipboard();
		if(!this.folder.isResourceModifiable() || this._isCreationForbidden()){
			this.uploadButton.set("disabled",true);
			this.linkButton.set("disabled",true);
			this.createButton.set("disabled",true);
			this.textButton.set("disabled",true);
			this.folderButton.set("disabled",true);
			this.pasteButton.set("disabled",true);
			this.list.setPasteDisabled(true);
		} else {
			this.uploadButton.set("disabled",false);
			this.linkButton.set("disabled",false);
			this.createButton.set("disabled",false);
			this.textButton.set("disabled",false);
			this.folderButton.set("disabled",false);
			this._isPasteForbidden(dojo.hitch(this, function(pasteForbidden) {
				this.pasteButton.set("disabled", pasteForbidden);
				this.list.setPasteDisabled(pasteForbidden);
			}))
		}
		this.list.setPasteIntoDisabled(cb == undefined || cb.entry == undefined);
	},
	_isPasteForbidden: function(callback) {
		var cb = this.application.getClipboard()
		if (cb == undefined || cb.entry == undefined) {
			callback(true);
			return;
		}

		if (cb.entry.getContext() != this.folder.getContext()) {
			if (cb.operation == "cut") {
				if((folio.data.isList(cb.entry) && !folio.data.isLinkLike(cb.entry))
					|| (cb.entry.getReferrents().length > 1)
					|| (cb.entry instanceof folio.data.SystemEntry)) {
					callback(true);
					return;
				}
				if (!folio.data.isLinkLike(cb.entry) 
					&& (folio.data.isUser(cb.entry) 
					|| folio.data.isGroup(cb.entry)
					|| folio.data.isContext(cb.entry))) {
						callback(true);
						return;
					}
			}
		} else {
			folio.data.getList(this.folder, dojo.hitch(this, function(list) {
			list.loadChildrenIds(dojo.hitch(this, function(childrenIds) {
				callback(dojo.some(childrenIds, function(childId) {
					return childId == cb.entry.getId();
				}));
			  }));
			}));
			return;
		}
		callback(false);
	},
	updateCopyButton: function(entry) {
		var canCopy = entry.isMetadataAccessible() && entry.isResourceAccessible();
		this.copyButton.set("disabled", !canCopy);
	},
	setActiveFolder: function(folder) {
		this.folder = folder;
	},
	uploadClicked: function() {
		this.getEntryOrReferencedEntry(this.folder, dojo.hitch(this, function(entry) {
			this.list.application.publish("showCreateWizard", {type: "upload", entry: entry});
		}));
	},
	linkClicked: function() {
		this.getEntryOrReferencedEntry(this.folder, dojo.hitch(this, function(entry) {
			this.list.application.publish("showCreateWizard", {type: "linkto", entry: entry});
		}));
	},
	createClicked: function() {
		this.getEntryOrReferencedEntry(this.folder, dojo.hitch(this, function(entry) {
			this.list.application.publish("showCreateWizard", {type: "create", entry: entry});
		}));
	},
	copyClicked: function() {
		this.list.application.setClipboard({
			entry: this.list.getSelectedEntry(),
			operation: "copy"
		});
	},
	pasteClicked: function(folder) {
		if (!folder) {
		    folder = this.folder;
		}
		var cb = this.application.getClipboard();
		if (cb) {
			 //-------------OutOfContext
			if (cb.entry.getContext() != folder.getContext()) {
				if (cb.operation == "copy") {
					this.copyOutOfContext(folder);
				} else { //cut == move
					this.moveOutOfContext(folder);
				}
			//--------------InContext
			} else {
				if (cb.operation == "copy") {
					this.copyInContext(folder);
				} else { //cut == move
					this.moveInContext(folder);
				}
			}
		}
	},
	copyOutOfContext: function(folder) {
		this.createReference(folder);
	},
	createReference: function(folder) {
		var cb = this.application.getClipboard();
		if(cb.entry.getLocationType() == folio.data.LocationType.REFERENCE){
			var linkEntry = {
				context: folder.getContext(),
			    parentList: folder,
			    params: {
			       representationType: "informationresource",
			       locationType: "reference",
			       "cached-external-metadata": cb.entry.getExternalMetadataUri(),
			       resource: cb.entry.getResourceUri() 
		        }
			};
		} else if (cb.entry.getLocationType() == folio.data.LocationType.LINK_REFERENCE){
		   var linkEntry = {
			   context: folder.getContext(),
			   parentList: folder,
			   metadata: cb.entry.getLocalMetadata().exportRDFJSON(),
			   params: {
			      representationType: "informationresource",
			      locationType: "linkreference",
			      "cached-external-metadata": cb.entry.getExternalMetadataUri(),
			      resource: cb.entry.getResourceUri()
		       }
		   };
		} else {
		   var linkEntry = {
			   context: folder.getContext(),
			   parentList: folder,
			   params: {
			      representationType: "informationresource",
			      locationType: "reference",
			      "cached-external-metadata": cb.entry.getLocalMetadataUri(),
			      resource: cb.entry.getResourceUri()
		       }
		   };
		}
		if (folio.data.isGroup(cb.entry)) {
			linkEntry.params.builtinType = "group";			
		} else if (folio.data.isUser(cb.entry)) {
			linkEntry.params.builtinType = "user";			
		} else if (folio.data.isListLike(cb.entry)) {
			linkEntry.params.builtinType = "list";
		}  else if (folio.data.isContext(cb.entry)) {
			linkEntry.params.builtinType = "context";			
		}
		var updateEntry = function(entry) {
			folio.data.getList(folder, dojo.hitch(this, function(list) {
				list.loadMissing(dojo.hitch(this, function() {
					/*TODO: Remove everything below if the two lines of code below does the trick
					list.addEntry(entry); //TODO: Should not be done, reference is created with the parent given
					list.save(dojo.hitch(this, function() { //Not be done
						folder.setRefreshNeeded(); //Not be done.
						this.application.publish("childrenChanged", {entry: folder, source: this});
					}));*/
					folder.setRefreshNeeded();
					this.application.publish("childrenChanged", {entry: folder, source: this});
				}))
			}));
		};
		folder.getContext().createEntry(linkEntry, dojo.hitch(this, updateEntry));
	},
	
	moveOutOfContext: function(folder) {
		var cb = this.application.getClipboard();
		if (folio.data.isList(cb.entry) && !folio.data.isLinkLike(cb.entry)) {
			this.application.message(this.resourceBundle.unableToMoveFolders); //This one says: "Folders cannot currently be cut and pasted into other portfolio."
			return;
		}
		if (cb.entry.getReferrents().length > 1) {
			this.application.message(this.resourceBundle.resourceInManyFoldersUnableToCut); //This one says: "Cut resource appears in more than one folder and cannot be cut and pasted into another portfolio."
			return;
		}
		if (cb.entry instanceof folio.data.SystemEntry) {
			this.application.message(this.resourceBundle.resourceIsSystemFolderUnableToCut);//This one says: "Cut resource is a special system resource and cannot be cut and pasted into another portfolio."
			return;
		}
		this.moveInContext(folder);
	},
	copyInContext: function(folder) {
		var cb = this.application.getClipboard();
		if (folio.data.isList(cb.entry)) { //& !folio.data.isLinkLike(cb.entry)) {
			//All lists should be created as reference regardless of the locationType of the original entry as the external MD is referred to in a correct way
			this.createReference(folder);
			return;
		}
		folder.setRefreshNeeded();
		folio.data.getList(folder, dojo.hitch(this, function(list) {
			list.loadMissing(dojo.hitch(this, function(childrenE) {
				if (dojo.some(childrenE, function(child) {
					return child.getId() == cb.entry.getId();
				})) {
					this.application.message(this.resourceBundle.resourceOnlyOnceInAFolder);//This one says: "Paste failed since an entry is only allowed once in every folder\n and the entry in the clipboard is already a member of this folder!"
					return;	
				}
				list.addEntry(cb.entry);
				list.save(dojo.hitch(this, function() {
						cb.entry.setRefreshNeeded();
						folder.setRefreshNeeded();
						this.application.publish("childrenChanged", {entry: folder, source: this});
					}),
					dojo.hitch(this, function(response, ioargs) {
						//In case of status-code 412, ie that the list has been modified after the time
						//specified in the request (IfUnmodifiedSince), we try one more time to do the changes
						if (response.status === 412) {
							folder.setRefreshNeeded();
							folio.data.getList(folder, dojo.hitch(this,function(list){
								list.addEntry(cb.entry);
								list.save(dojo.hitch(this, function(){
									cb.entry.setRefreshNeeded();
									folder.setRefreshNeeded();
									this.application.publish("childrenChanged", {entry: folder, source: this});
							       }), 
								   dojo.hitch(this, function(){
								   	  list.removeEntry(list.getSize() - 1);
									  this.application.message(this.resourceBundle.pasteFailed); //This one says:"Paste failed when making the copy"
							       }));
							   }),
							   dojo.hitch(this, function(){
								   list.removeEntry(list.getSize() - 1);
								   this.application.message(this.resourceBundle.pasteFailed); //This one says:"Paste failed when making the copy"
							   }));
						} else {
							// Since the paste failed, remove the entry from the cached list object
							//  so that is in the same state as before the attempted paste
							list.removeEntry(list.getSize() - 1);
							this.application.message(this.resourceBundle.pasteFailedWhenCopying); //This one says:"Paste failed when making the copy"
						}
					}));
			}));
		}));		
	},
	moveInContext: function(folder) {
		var cb = this.application.getClipboard();
		folio.data.getList(folder, dojo.hitch(this, function(list) {
			list.loadMissing(dojo.hitch(this, function(childrenE) {
				if (dojo.some(childrenE, function(child) {
					return child.getId() === cb.entry.getId() && child.getContext().getId() === cb.entry.getContext().getId(); //Second condition needed as moveInContext is called by MoveOutOfContext!
				})) {
					this.application.message(this.resourceBundle.resourceOnlyOnceInAFolder);//This one says: "Paste failed since an entry is only allowed once in every folder\n and the entry in the clipboard is already a member of this folder!"
					return;	
				}
				folder.getContext().moveEntryHere(cb.entry, cb.from, folder, 
					dojo.hitch(this, function() {
						this.application.setClipboard(null);
						this.application.publish("childrenChanged", {entry: folder, source: this});
						this.application.publish("childrenChanged", {entry: cb.from, source: this});
						this.application.getMessages().message("Paste suceeded");						
					}),
					dojo.hitch(this, function() {
						this.application.getMessages().error(this.resourceBundle.pasteFailed);
//						this.application.message(this.resourceBundle.pasteFailed); //This one says:"Paste failed"
					}));
			}));
		}));
	},
	pasteClicked_old: function() {
		var cb = this.list.application.getClipboard();
		if (cb) {
			if (cb.entry.getContext() != this.folder.getContext() && cb.operation != "copy") {
				this.list.application.message(this.resourceBundle.moveEntryToOtherContextErrorMessage);
				return;
			}
			var update = null;
			if (cb.operation == "copy") {
				update = dojo.hitch(this.list, function(){
					cb.entry.setRefreshNeeded();
					cb.entry.refresh(dojo.hitch(this, this.refresh));
				});
			} else { //Cut case
				var self = this;
				update = function(){
					
					folio.data.getList(cb.from, dojo.hitch(this, function(list) {
						list.loadMissing(dojo.hitch(this, function() {
							list.removeEntry(cb.index);
							list.save(function() {
								cb.entry.setRefreshNeeded();
								cb.entry.refresh(function() {
									self.application.publish("childrenChanged", {entry: self.folder, source: self});
								});
							});
						}));
					}));
				};
			}
			if (cb.entry.getContext() == this.folder.getContext()) {
				folio.data.getList(this.folder, dojo.hitch(this, function(list) {
					list.loadMissing(dojo.hitch(this, function(childrenE) {
						if (dojo.some(childrenE, function(child) {
							return child.getId() == cb.entry.getId();
						})) {
							this.list.application.message(this.resourceBundle.resourceOnlyOnceInAFolder);//This one says: "Paste failed since an entry is only allowed once in every folder\n and the entry in the clipboard is already a member of this folder!"
							return;	
						}
						list.addEntry(cb.entry);
						list.save(update); //no onError..!!!
					}))
				}));
			} else {
				var linkEntry = {
					context: this.folder.getContext(),
					parentList: this.folder,
					params: {
					representationType: "informationresource",
					locationType: "reference",
					builtinType: cb.entry.getBuiltinType(),
					metadata: cb.entry.getLocalMetadataUri(),
					resource: cb.entry.getResourceUri()
				}};
				var updateEntry = function(entry) {
					folio.data.getList(this.folder, dojo.hitch(this, function(list) {
						list.loadMissing(dojo.hitch(this, function() {
							list.addEntry(entry);
							list.save(update);
						}))
					}));
				};
				this.folder.getContext().createEntry(linkEntry, dojo.hitch(this, updateEntry));
				//this.folder.getContext().createEntry(linkEntry, function(){ this.folder.saveResource(update); });
			}
/*			var f = function(parent) {
				parent.getResource().push({context: cb.entry.getContext().getId(), entry: cb.entry.getId()});
				parent.saveResource(update);
			}
			if (folio.data.isReference(this.folder)) {
				this.folder.getContext().store.getReferencedEntry(f);
			} else {
				f(this.folder);
			}	*/
		}
	},
	getEntryOrReferencedEntry: function(entry, onComplete) {
		if (folio.data.isReference(entry)) {
			folio.data.getLinkedLocalEntry(entry, onComplete);
		} else {
			onComplete(entry);
		}
	},
	textClicked: function() {
		this.getEntryOrReferencedEntry(this.folder, dojo.hitch(this, this.textClickedImpl));		
	},
	folderClicked: function() {
		this.getEntryOrReferencedEntry(this.folder, dojo.hitch(this, this.folderClickedImpl));
	},
	textClickedImpl: function(entry) {
		var mdGraph = new rdfjson.Graph();
		var contextToUse = entry.getContext(); 
		mdGraph.create(contextToUse.getBase() + contextToUse.getId()+"/resource/_newId",
						  folio.data.DCTermsSchema.TITLE,
						  {"type":"literal","value":"New Text"}, true);
		var md = mdGraph.exportRDFJSON();

		var helpObj = folio.data.createNewEntryHelperObj(entry.getContext());
		folio.data.addMimeType(helpObj.info, helpObj.resURI, "text/html+snippet");
		var args = {
				context: entry.getContext(),
				parentList: entry,
				metadata: md,
				info: helpObj.info.exportRDFJSON(),
				params: {locationType: "local",
						builtinType: "none"}};
		var self = this;
		entry.getContext().createEntry(args, function(newEntry) {
			self.folder.setRefreshNeeded();
			self.list.application.publish("childrenChanged", {entry: self.folder, source: self});
			setTimeout(function() {
				self.list.focus(entry, newEntry);
				self.list.renameFocused(true);
			}, self.list.fadeDuration*3);
		}, function(mesg) {
			self.list.application.publish("message", {message: this.resourceBundle.unableToCreateFolderErrorMessage, source: self});
		});
	},
	folderClickedImpl: function(entry) {
		var mdGraph = new rdfjson.Graph();
		var contextToUse = entry.getContext(); 
		mdGraph.create(contextToUse.getBase() + contextToUse.getId()+"/resource/_newId",
						  folio.data.DCTermsSchema.TITLE,
						  {"type":"literal","value":"New folder"}, true);
		var md = mdGraph.exportRDFJSON();
		var args = {
				context: contextToUse,
				parentList: entry,
				metadata: md,
				params: {locationType: "local",
						builtinType: "list"}};
		var self = this;
		contextToUse.createEntry(args, function(newEntry) {
			self.folder.setRefreshNeeded();
			self.list.application.publish("childrenChanged", {entry: self.folder, source: self});
			setTimeout(function() {
				self.list.focus(entry, newEntry);
				self.list.renameFocused(true);				
			}, self.list.fadeDuration*3);
		}, function(mesg) {
			self.list.application.publish("message", {message: this.resourceBundle.unableToCreateFolderErrorMessage, source: self});
		});
	},
	/*
	 * Returns true if the current folder is one of the "Top folders" of a 
	 * portfolio where you are not supposed to change 
	 */
	_isCreationForbidden: function(){
		if(!this.folder){
			return false;
		} else {
			var entryID = this.folder.getId();
			return entryID === "_thrash" || entryID === "_latest" || 
			       entryID === "_comments" || entryID === "_unlisted" ||
				   entryID === "_contacts";
		}
	},
	_setCopyButtonLabelAttr: function(value) {
		this.copyButton.set("label", value);
		this.copyButtonLabel = value;
	},
	_setPasteButtonLabelAttr: function(value) {
		this.pasteButton.set("label", value);
		this.pasteButtonLabel = value;
	},
	_setUploadButtonLabelAttr: function(value) {
		this.uploadButton.set("label", value);
		this.uploadButtonLabel = value;
	},
	_setLinkButtonLabelAttr: function(value) {
		this.linkButton.set("label", value);
		this.linkButtonLabel = value;
	},
	_setCreateButtonLabelAttr: function(value) {
		this.createButton.set("label", value);
		this.createButtonLabel = value;
	},
	_setTextButtonLabelAttr: function(value) {
		this.textButton.set("label", value);
		this.textButtonLabel = value;
	},
	_setFolderButtonLabelAttr: function(value) {
		this.folderButton.set("label", value);
		this.folderButtonLabel = value;
	}
});