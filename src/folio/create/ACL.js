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

dojo.provide("folio.create.ACL");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.ComboBox");
dojo.require("dijit.form.Button");
dojo.require("dojox.grid.DataGrid");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dijit.form.Button");
dojo.require("folio.util.Dialog");
dojo.require("dijit.TitlePane");

dojo.require("rforms.view.SortedStore");

dojo.declare("folio.create.ACL", [dijit.layout._LayoutWidget, dijit._Templated], {
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("folio", "create/ACLTemplate.html"),	
	advanced: false,
	open: false,
	autoHeight: 6,
	constructor: function(args) {
		dojo.requireLocalization("folio", "acl");
		this.resourceBundle = dojo.i18n.getLocalization("folio", "acl");
		dojo.mixin(this, this.resourceBundle);
	},
	startup: function() {
		if (this._started) {
			return;
		}
		this.containerNode = this.domNode;
		this.inherited("startup", arguments);
		this.aclGrid.selection.onChanged = dojo.hitch(this, function() {
			var selected = this.aclGrid.selection.getSelected();
			if (selected.length == 0) {
				this.removeButton.setDisabled(true);
			} else {
				var entryId = this.aclEntryStore.getValue(selected[0], "entryId");
				var owned = this.aclEntryStore.getValue(selected[0], "owned");
				this.removeButton.setDisabled(owned || entryId == "_guest" || entryId == "_users");
			}
		});
		this.aclEntryStore = new dojo.data.ItemFileWriteStore({data: {identifier: "entryId", items: []}});
		this.aclGrid.query={ entryId: '*' };
		this.aclContextStore = new dojo.data.ItemFileWriteStore({data: {identifier: "entryId", items: []}});
		this.aclGrid.query={ entryId: '*' };
		this.aclGrid.onStyleRow = dojo.hitch(this, function myStyleRow(row){
       /* The row object has 4 parameters, and you can set two others to provide your own styling
          These parameters are :
            -- index : the row index
           -- selected: whether or not the row is selected
           -- over : whether or not the mouse is over this row
           -- odd : whether or not this row index is odd. */
       		var item = this.aclGrid.getItem(row.index);
       		if (this.aclGrid.store.getValue(item, "owner")) {
              row.customStyles += "background:#EDEDED;";
 	        }
 	        this.aclGrid.focus.styleRow(row);
 	        this.aclGrid.edit.styleRow(row);
    	});
	},
	principalChoosen: function(principal) {
		this.addContactButton.setDisabled(principal == undefined);
	},
	postCreate: function() {
		this.inherited("postCreate", arguments);
		this.advancedButton.set("label", this.advancedButtonTextMore);
		this.overrideContextButton.set("label", this.overrideContextButtonTextOverride);
		this.headLabel.innerHTML = this.headLabelTextDefault;
		dojo.connect(this.titlePaneDijit, "toggle", dojo.hitch(this, function() {
			this.aclGrid.resize();
		}));
	},
	destroy: function() {
		//Do nothing since this is a template that is inserted in a ContentPane, 
		//all children widgets have already been found and destroyed.
		//If we attempt to destroy them again we will get errors.
	},
	launchOld: function(entry) {
		//TODO make sure contact list does not contain entries that are already in ACL.
		this._updateIsLocal(folio.data.isLocal(entry));
		this.context = entry.getContext();
		this._loadContacts(dojo.hitch(this, function() {
			var list = folio.data.getACLList(entry);
			if (list.length > 0) {
				this._markUsedPrincipalsInContacts(list);
				//this.aclGrid.setStore(this.aclEntryStore);

				//Init the context ACL store as well, just if we decide to switch back to defaults.
				this.context.getOwnEntry(dojo.hitch(this, function(entry) {
					var clist = folio.data.getACLList(entry);
					this._populateContextStore(clist); //Ignore if advanced since only resource access in context is relevant for this entry

					//Init entry Entry ACL store
					this._populateEntryStoreWithOnlyOwnersFromContext(clist);
					this.advanced = this._populateEntryStore(list);
					this.toggleOverride();
					this.toggleAdvancedModeDisplay();
					
					this._loadLabels(this.aclContextStore, dojo.hitch(this, this._initOwnerNote, list));
					this._loadLabels(this.aclEntryStore, dojo.hitch(this, function() {
//						this.aclGrid.setStore(this.aclEntryStore);						
					}));
				}));
			} else {
				this._initNew();
			}
		}));
	},
	launchNew: function(context, isLocal) { //TODO, if created in list, the ACL should be copied from the list.
		this._updateIsLocal(isLocal);
		this.context = context;
		this._loadContacts(dojo.hitch(this, this._initNew)); //What to do on error?
	},
	_updateIsLocal: function(isLocal) {
		if (isLocal) {
			dojo.style(this.advancedButton.domNode, "display", "");
		} else {
			dojo.style(this.advancedButton.domNode, "display", "none");			
		}
	},
	_initNew: function() {
		this.context.getOwnEntry(dojo.hitch(this, function(entry) {
			var list = folio.data.getACLList(entry);
			this._markUsedPrincipalsInContacts(list);
			this._populateContextStore(list); //Ignore if advanced since only resource access is relevant for current entry.
			this._populateEntryStorewithAccesFromContext(list); //Copy from context, ignore if advanced since copy only from resource access in context.
			this._loadLabels(this.aclEntryStore);
			this._loadLabels(this.aclContextStore, dojo.hitch(this, this._initOwnerNote, list));
			this.aclGrid.setStore(this.aclContextStore);
		}));
	},
	_initOwnerNote: function(list, items) {
		var owners = "";
		for (var nr=0;nr<list.length;nr++) {
			var row = list[nr];
			if (row.admin) {
				dojo.forEach(items, function(item) {
				if (this.aclContextStore.getValue(item, "entryId") == row.entryId) {
					owners += this.aclContextStore.getValue(item, "label")+", ";
				}	
				}, this);
			}
		}
		owners = owners.substring(0, owners.length-2);
		owners = owners.split("&").join("&amp;").split( "<").join("&lt;").split(">").join("&gt;");
		dojo.attr(this.ownerNoteNode, "innerHTML", this.ownerNote + ": " + owners);
	},
	_loadLabels: function(store, onFinish) {
		store.fetch({query: {entryId: "*"}, scope: this, onComplete: function(items) {
			var itemsCount = items.length;
			dojo.forEach(items, function(item) {
				var uri = store.getValue(item, "uri");
				if (uri) {
					this.context.store.loadEntry(uri, {limit: -1}, dojo.hitch(this, function(entry) {
						store.setValue(item, "label", this._getLabel(entry) || entry.alias || entry.getId());
						itemsCount--;
						if (itemsCount == 0 && onFinish) {
							onFinish(items);							
						}
					}));
				}				
			},this);
		  }
		});
	},
	_getLabel: function(entry) {
		var name = "";
		if(entry.name){
			var name = entry.name;
		} else if (entry.getResource()) {
			name = entry.getResource().name;
		} else if (entry.resource){
			name = entry.resource.name;
		}
		if (!name) {
			name = "<<" + entry.getId() + ">>";
		} else {
			name = "<" + name + ">";
		}
		//var name = entry.name ? "<"+entry.name+">" : "<<"+entry.getId()+">>";
		var label = folio.data.getLabelRaw(entry);
		return label == undefined ? name : label + " "+ name;
	},
	_loadContacts: function(onFinish, onError) {
		this.context.getStore().loadEntry({entryId: "_all", contextId: "_principals", base: this.context.getBaseURI()}, {limit: -1}, dojo.hitch(this, function(entry) {
			folio.data.getAllChildren(entry, dojo.hitch(this, function(children) {
				this._setAvailablePrincipals(children);
				onFinish();
				}), onError);
			}), onError);
	},
	_populateEntryStore: function(list) {
		return this._populateStore(list, this.aclEntryStore, true);
	},
	_populateEntryStoreWithOnlyOwnersFromContext: function(list) {
		return this._populateStore(dojo.clone(list), this.aclEntryStore, false, true, true);
	},
	_populateEntryStorewithAccesFromContext: function(list) {
		return this._populateStore(dojo.clone(list), this.aclEntryStore, true, true);
	},
	_populateContextStore: function(list) {
		return this._populateStore(list, this.aclContextStore, false);
	},
	_populateStore: function(list, store, addGuestAndUsers, markAdminAsOwner, excludeNonOwners) {
		var advancedMode = false;
		var guestIncluded = false;
		var usersIncluded = false;
		for (var nr=0;nr<list.length;nr++) {
			var row = list[nr];
			if (row.admin) {
				if (markAdminAsOwner) {
					row.owner = true;
				}
			} else if (excludeNonOwners){
				continue;
			}
			//Below has double functionality, when copy from context only resource is relevant.
			//And when populating from existing entry ACL we can use either of resource or metadata access in non advanced mode.
			row.read = row.rread || row.admin;
			row.write = row.rwrite || row.admin;
			for (var att in ["rread", "rwrite", "mread", "mwrite", "admin"]) {
				if (row[att] == undefined) {
					row[att] = false;
				}
			}
			if (store._itemsByIdentity == undefined || store._itemsByIdentity[row.entryId] == undefined) {
				store.newItem(row);
				//Check for advancedMode for new items.
				if (row.mread != row.rread || row.mwrite != row.rwrite || (!row.owner && row.admin)) {
					advancedMode = true;
				}
			} else if (row.owner){
				store.setValue(store._itemsByIdentity[row.entryId], "owner", true);
			}
			if (row.entryId == "_guest") {
				guestIncluded = true;
			}
			if (row.entryId == "_users") {
				usersIncluded = true;
			}
		}
		if (addGuestAndUsers) {
			if (!guestIncluded) {
				store.newItem({entryId: "_guest", uri: this.context.getBase()+"_principals/resource/_guest", read: false, write: false});			
			}
			if (!usersIncluded) {
				store.newItem({entryId: "_users", uri: this.context.getBase()+"_principals/resource/_users", read: false, write: false});
			}
		}
		store.save();
		return advancedMode;
	},
	_setAvailablePrincipals: function(children) {
		this.principalStore = new rforms.view.SortedStore({data: {identifier: "entryId", items: []}, sortBy:"label"});
		for (var i=0; i<children.length;i++) {
			var child = children[i];
			this.principalStore.newItem({entryId: child.getId(), label: this._getLabel(child), present: false});	
		}
		this.principalSelect.set("store", this.principalStore);
	},
	_markUsedPrincipalsInContacts: function(principals) {
		for (var i=0; i<principals.length;i++) {
			this.principalStore.fetchItemByIdentity({identity: principals[i].entryId, 
				onItem: dojo.hitch(this, function(item) {
					if (item != undefined) {
						this.principalStore.setValue(item, "present", true);
		    		    this.principalStore.save();						
					}
			})});
		}
	},
	resize: function(size) {
		this.aclGrid.resize();
	},
	toggleOverride: function() {
		if (this.overrideContext) {
			this.overrideContext = false;
			//this.headLabel.innerHTML = "Default access";
			this.headLabel.innerHTML = this.headLabelTextDefault;
			if (this.advanced) {
				this.toggleAdvancedMode();
			}
			this.aclGrid.selection.setMode("none");
			this.aclGrid.layout.setColumnVisibility(1, true);
			this.aclGrid.layout.setColumnVisibility(2, true);
			this.aclGrid.layout.setColumnVisibility(3, false);
			this.aclGrid.layout.setColumnVisibility(4, false);
			this.aclGrid.setStore(this.aclContextStore);
			//this.overrideContextButton.set("label", "Override portfolio defaults");
			this.overrideContextButton.set("label", this.overrideContextButtonTextOverride);
			this.advancedButton.setDisabled(true);
			dojo.style(this.controllsDiv, "display", "none");
			dojo.style(this.ownerNoteNode, "display", "none");
		} else {
			this.overrideContext = true;
			//this.headLabel.innerHTML = "Specify access";
			this.headLabel.innerHTML = this.headLabelTextSpecify;
			this.aclGrid.selection.setMode("single");
			this.aclGrid.layout.setColumnVisibility(1, false);
			this.aclGrid.layout.setColumnVisibility(2, false);
			this.aclGrid.layout.setColumnVisibility(3, true);
			this.aclGrid.layout.setColumnVisibility(4, true);
			this.aclGrid.setStore(this.aclEntryStore);
			//this.overrideContextButton.set("label", "Return to portfolio defaults");
			this.overrideContextButton.set("label", this.overrideContextButtonTextDefault);
			this.advancedButton.setDisabled(false);
			dojo.style(this.controllsDiv, "display", "");
			dojo.style(this.ownerNoteNode, "display", "");
		}
	},
	toggleAdvancedMode: function() {
		this.advanced = !this.advanced;
		this.toggleAdvancedModeDisplay();
		this.toggleAdvancedModeData();
	},
	toggleAdvancedModeDisplay: function() {
		var state = this.advanced === true;
			this.aclGrid.layout.setColumnVisibility(3, !state);
			this.aclGrid.layout.setColumnVisibility(4, !state);
			this.aclGrid.layout.setColumnVisibility(5, state);
			this.aclGrid.layout.setColumnVisibility(6, state);
			this.aclGrid.layout.setColumnVisibility(7, state);
			this.aclGrid.layout.setColumnVisibility(8, state);
			this.aclGrid.layout.setColumnVisibility(9, state);
		if (this.advanced) {
			this.advancedButton.set("label", this.advancedButtonTextLess);
		} else {
			this.advancedButton.set("label", this.advancedButtonTextMore);
		}
	},
	toggleAdvancedModeData: function() {
		console.log("advanced button clicked");
		if (this.advanced) {
			//Let simple settings be carried over to advanced settings.
			this.aclEntryStore.fetch({query: {entryId: "*"}, 
				onItem: dojo.hitch(this, function(item) {
					var read = this.aclEntryStore.getValue(item, "read") || false;
					var write = this.aclEntryStore.getValue(item, "write") || false;
					this.aclEntryStore.setValue(item, "mread", read);
					this.aclEntryStore.setValue(item, "rread", read);
					this.aclEntryStore.setValue(item, "rwrite", write);
					this.aclEntryStore.setValue(item, "mwrite", write);
				})});		
		} else {
			//Let advanced settings (metadata rights rule) be carried over to simple.
			this.aclEntryStore.fetch({query: {entryId: "*"}, 
				onItem: dojo.hitch(this, function(item) {
					this.aclEntryStore.setValue(item, "read", this.aclEntryStore.getValue(item, "mread") || false);
					this.aclEntryStore.setValue(item, "write", this.aclEntryStore.getValue(item, "mwrite") || false);
				})});
		}
	},
	addContactClicked: function() {
		var principal = this.principalSelect.getValue();
		if (principal) {
			this.principalStore.fetchItemByIdentity({identity: principal, 
				onItem: dojo.hitch(this, function(item) {
			        this.aclEntryStore.newItem({entryId: principal, label: this.principalStore.getValue(item, "label"), read: false, write: false});
	    		    this.aclEntryStore.save();
	    		    this.principalStore.setValue(item, "present", true);
	    		    this.principalStore.save();
	    		    this.principalSelect.setValue(null);
	    		    this.addContactButton.setDisabled(true);
				})});
		}
	},
	removeRow: function() {
		//Only one selection, since only one selection is allowed (grid attribute)
		//and removeButton is not active if no selection is made (or _guest or _user are choosen)
		var selectedItem = this.aclGrid.selection.getSelected()[0];
		this.principalStore.fetchItemByIdentity({identity: this.aclEntryStore.getValues(selectedItem, "entryId"), 
                    onItem: dojo.hitch(this, function(item) {
                    	this.principalStore.setValue(item, "present", false);
	                   	this.aclEntryStore.deleteItem(selectedItem);
	                   	this.removeButton.setDisabled(true);
			            this.aclEntryStore.save();
	    				this.principalStore.save();
			})});
	},
	hasACL: function() {
		return this.overrideContext;
	},
	exportAclToList: function(onFinish) {
		var items = [];
		this.aclEntryStore.fetch({query: {entryId: "*"}, 
			onItem: dojo.hitch(this, function(item) {
				items.push(item);
			}),
			onComplete: dojo.hitch(this, function() {
				var nlist = [];
				for(var nr=0; nr<items.length;nr++) {
				//	if (!this.aclEntryStore.getValue(items[nr], "owner")) {
						nlist.push(this._exportItem(items[nr]));
				//	}
				}
				onFinish(nlist);
			})});
	},
	_exportItem: function(item) {
		var row = {entryId: this.aclEntryStore.getValue(item, "entryId")};
		var keys = ["mread", "mwrite", "rread", "rwrite", "admin"];
		if (this.advanced) {
			for (var i=0; i<keys.length; i++) {
				row[keys[i]] = this.aclEntryStore.getValue(item, keys[i]);
			}
		} else {
			var read = this.aclEntryStore.getValue(item, "read");
			row["rread"] = read;
			row["mread"] = read;				
			var write = this.aclEntryStore.getValue(item, "write");
			row["rwrite"] = write;
			row["mwrite"] = write;
			row["admin"] = this.aclEntryStore.getValue(item, "admin");
		}
		return row;
	}
});

folio.create.showACLDialog = function(application, entry, dialogTitle) {
	var acl = new folio.create.ACL({open: true});
	var dialog = application.getDialog();
	var onFinish = function() {
		//TODO currently it always saves, should only save when acl is modified.
		if (acl.hasACL()) {
			acl.exportAclToList(function(list) {
					folio.data.setACLList(entry, list);
					entry.saveInfo(function() {
							dialog.done();
						}, function(message) {
							application.message(message);
							dialog.done();
						});
				});
		} else {
			folio.data.setACLList(entry, []);
			entry.saveInfo(function() {
					dialog.done();
				}, function(message) {
					application.message(message);
					dialog.done();
				});
		}
	};
	dialog.clearButtons();
	dialog.addStandardButtons(onFinish);
	dialog.show(acl, dialogTitle);
	acl.launchOld(entry);	
};

dojo.declare("folio.create.Bool", dojox.grid.cells.Bool,  {
    // summary:
    // grid cell that provides a standard checkbox that is always disabled
    _valueProp: "checked",
    formatEditing: function(inDatum, inRowIndex){
		return '<input class="dojoxGridInput" disabled="true" type="checkbox"' + (inDatum ? ' checked="checked"' : '') + ' style="width: auto" />';
    },
    doclick: function(e){
    }
});
		
		
folio.create.Bool.markupFactory = function(node, cell){
	dojox.grid.cells.AlwaysEdit.markupFactory(node, cell);
}

dojo.declare("folio.create.BoolCheck", dojox.grid.cells.Bool,  {
    // summary:
    // grid cell that provides a standard checkbox that is always disabled
    _valueProp: "checked",
    formatEditing: function(inDatum, inRowIndex){
    	if (this.grid._getItemAttr(inRowIndex, "owner")) {
			return '<input class="dojoxGridInput" disabled="true" type="checkbox"' + (inDatum ? ' checked="checked"' : '') + ' style="width: auto" />';
    	} else {
			return '<input class="dojoxGridInput" type="checkbox"' + (inDatum ? ' checked="checked"' : '') + ' style="width: auto" />';    		
    	}
    }
});
		
		
folio.create.BoolCheck.markupFactory = function(node, cell){
	dojox.grid.cells.AlwaysEdit.markupFactory(node, cell);
}