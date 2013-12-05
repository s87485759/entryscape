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

dojo.provide("folio.apps.AdministrateFolio");
dojo.require("folio.Application");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.Dialog");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dojox.validate.regexp");

dojo.require("folio.data.Constants");

dojo.require("folio.admin.ACLTab");
dojo.require("folio.admin.PortfolioDetails");
dojo.require("folio.admin.PortfolioQuota");
dojo.require("folio.admin.PortfolioExportImportRemove");
dojo.require("folio.admin.UserRemove");
dojo.require("folio.admin.GroupRemove");
dojo.require("folio.admin.UserDetails");
dojo.require("folio.admin.UserAccess");
dojo.require("folio.admin.UserGroups");
dojo.require("folio.admin.GroupDetails");
dojo.require("folio.admin.GroupAccess");
dojo.require("folio.admin.GroupMembers");

dojo.require("folio.admin.NewPortfolio");
dojo.require("folio.admin.NewGroup");
dojo.require("folio.admin.NewUser");
dojo.require("folio.admin.FilteredSelection");
dojo.require("folio.create.ACL");

dojo.require("folio.security.LoginDialog");

dojo.declare("folio.apps.AdministrateFolio",[dijit.layout._LayoutWidget, dijit._Templated,  dijit._Templated], {
	templatePath: dojo.moduleUrl("folio.apps", "AdministrateFolioTemplate.html"),
	templateString: "",
    widgetsInTemplate: true,

    dataDir: "",
	repository: "",
	startEntry: "",
	startContext: "",
    
	_principals_systemEntries: null,
	_contexts_systemEntries: null,
	
	// The ApplicationViewListener
	listener: null,
	// The current type to be displayed in the tabview
	currentBuiltinType: null,
	entryTabs: [],
	tabContent: [],
	
	// The create dialogs
	createPortfolioDialog: null,
	createUserDialog: null,
	createGroupDialog: null,
	// The create views
	createPortfolio: null,
	createUser: null,
	createGroup: null,
	
	// The createButtons
	createContextBtn: null,
	createUserBtn: null,
	createGroupBtn: null,
	
	/**
	 * Required by ViewMap to be able to set a nice breadcrumb.
	 * @param {Object} params
	 */
	getLabel: function(params) {
		return "admin";
	},
	show: function(params) {
		if (params.entry == null && params.context == null) {
			params.context = this.startContext;
			params.entry = "_top";
		}
		//dojo.publish("/confolio/showEntry", [{entry: params.entry, context: params.context, list: params.list}]);		
	},
	
	startup: function() {
		this.inherited("startup", arguments);
		this.application = __confolio.application;
		
		// Create the listener and register it
//		listener = new folio.apps.Listener();
	//	this.register(listener.viewId, listener);
		
		// Register the folderView and folderSelect
		//this.register(this.folderView.viewId, this.folderView);
		//this.register(this.folderSelect.viewId, this.folderSelect);
		// Add a listener to the folderSelect
		this.folderSelect.addChangeListener(
				dojo.hitch(this, function (entryURI) {
					// Do not know if this line below should be there
					this.displayTabs(null, null);
					var folder = this.folderSelect.getFolder(entryURI);
					this.folderView.displayChildren(folder);
					// Check to see if the user can add entries in this folder
					if (!folder || folder.getId() == "_all") {
						this.createContextBtn.set("disabled", true);
						this.createUserBtn.set("disabled", true);
						this.createGroupBtn.set("disabled", true);
					}
					else {
						this.createContextBtn.set("disabled", false);
						this.createUserBtn.set("disabled", false);
						this.createGroupBtn.set("disabled", false);
					}
			}));
		this.folderView.addChangeListener(dojo.hitch(this, function(entry) {
			// Tell everyone interested
			this.application.publish("showEntry", {entry: entry});
			// Display the entry in the tabview
			this.displayTabs(entry, entry.getBuiltinType());
		}));
		
		//Build the tabview
		//Contexts
		var contextContent = new Array(4);
		var contextTabs = new Array(4);
		contextContent[0] = new folio.admin.PortfolioDetails();
		//this.register(contextContent[0].viewId, contextContent[0]);
		contextTabs[0] = new dijit.layout.ContentPane({title: "Details"});
		contextTabs[0].set("content", contextContent[0]);
		contextTabs[1] = new dijit.layout.ContentPane({title: "ACL"});
		var node = document.createElement("div");
		contextTabs[1].set("content", node);
		contextContent[1] = new folio.admin.ACLTab({}, node);
		contextContent[1].setApplication(this);
		contextContent[2] = new folio.admin.PortfolioQuota();
		contextTabs[2] = new dijit.layout.ContentPane({title: "Quota"});
		contextTabs[2].set("content", contextContent[2]);
		contextContent[3]=new folio.admin.PortfolioExportImportRemove();
		contextTabs[3] = new dijit.layout.ContentPane({title: "Export/Import/Remove"});
		contextTabs[3].set("content", contextContent[3]);
		
		this.tabContent[folio.data.BuiltinType.CONTEXT] = contextContent;
		this.entryTabs[folio.data.BuiltinType.CONTEXT] = contextTabs;

		//Users
		var userContent = new Array(5);
		var userTabs = new Array(5);
		userContent[0] = new folio.admin.UserDetails();
		//this.register(userContent[0].viewId, userContent[0]);
		userTabs[0] = new dijit.layout.ContentPane({title: "Details"});
		userTabs[0].set("content", userContent[0]);
		userTabs[1] = new dijit.layout.ContentPane({title: "ACL"});
		var node = document.createElement("div");
		userTabs[1].set("content", node);
		userContent[1] = new folio.admin.ACLTab({}, node);
		userContent[1].setApplication(this);
		userContent[2] = new folio.admin.UserAccess();
		//this.register(userContent[1].viewId, userContent[2]);
		userTabs[2] = new dijit.layout.ContentPane({title: "Access"});
		userTabs[2].set("content", userContent[2]);
		userContent[3] = new folio.admin.UserGroups();
		//this.register(userContent[3].viewId, userContent[3]);
		userTabs[3] = new dijit.layout.ContentPane({title: "Groups"});
		userTabs[3].set("content", userContent[3]);
		userContent[4] = new folio.admin.UserRemove();
		userTabs[4] = new dijit.layout.ContentPane({title: "Remove"});
		userTabs[4].set("content", userContent[4]);
		
		this.tabContent[folio.data.BuiltinType.USER] = userContent;
		this.entryTabs[folio.data.BuiltinType.USER] = userTabs;
		
		
		//Groups
		var groupContent = new Array(5);
		var groupTabs = new Array(5);
		groupContent[0] = new folio.admin.GroupDetails();
		//this.register(groupContent[0].viewId, groupContent[0]);
		groupTabs[0] = new dijit.layout.ContentPane({title: "Details"});
		groupTabs[0].set("content", groupContent[0]);
		groupTabs[1] = new dijit.layout.ContentPane({title: "ACL"});
		var node = document.createElement("div");
		groupTabs[1].set("content", node);
		groupContent[1] = new folio.admin.ACLTab({}, node);
		groupContent[1].setApplication(this);
		groupContent[2] = new folio.admin.GroupAccess();
		//this.register(groupContent[1].viewId, groupContent[2]);
		groupTabs[2] = new dijit.layout.ContentPane({title: "Access"});
		groupTabs[2].set("content", groupContent[2]);
		groupContent[3] = new folio.admin.GroupMembers();
		//this.register(groupContent[3].viewId, groupContent[3]);
		groupTabs[3] = new dijit.layout.ContentPane({title: "Members"});
		groupTabs[3].set("content", groupContent[3]);
		this.tabContent[folio.data.BuiltinType.GROUP] = groupContent;
		this.entryTabs[folio.data.BuiltinType.GROUP] = groupTabs;
		groupContent[4] = new folio.admin.GroupRemove();
		groupTabs[4] = new dijit.layout.ContentPane({title: "Remove"});
		groupTabs[4].set("content", groupContent[4]);
		
		// Create the create views
		this.createPortfolio = new folio.admin.NewPortfolio();
		//this.register(this.createPortfolio.viewId, this.createPortfolio);
		this.createPortfolio.addCreatedListener(dojo.hitch(this, this.entryCreated));
		this.createPortfolioDialog = new dijit.Dialog({
            title: "Create new portfolio",
            content: this.createPortfolio
        });
		this.createPortfolio.addCancelListener(dojo.hitch(this, function() {this.createPortfolioDialog.hide()}));
		
		this.createUser = new folio.admin.NewUser();
		//this.register(this.createUser.viewId, this.createUser);
		this.createUser.addCreatedListener(dojo.hitch(this, this.entryCreated));
		this.createUserDialog = new dijit.Dialog({
            title: "Create new user",
            content: this.createUser
        });
		this.createUser.addCancelListener(dojo.hitch(this, function() {this.createUserDialog.hide()}));
		
		this.createGroup = new folio.admin.NewGroup();
		//this.register(this.createGroup.viewId, this.createGroup);
		this.createGroup.addCreatedListener(dojo.hitch(this, this.entryCreated));
		this.createGroupDialog = new dijit.Dialog({
            title: "Create new group",
            content: this.createGroup
        });
		this.createGroup.addCancelListener(dojo.hitch(this, function() {this.createGroupDialog.hide()}));
		
		// Create the create buttons
		this.createContextBtn = new dijit.form.Button({label: "New Portfolio", onClick: dojo.hitch(this, this.newContextClicked)});
		this.createUserBtn = new dijit.form.Button({label: "New User", onClick: dojo.hitch(this, this.newUserClicked)});
		this.createGroupBtn = new dijit.form.Button({label: "New Group", onClick: dojo.hitch(this, this.newGroupClicked)});
		this.createContextBtn.set("disabled", true);
		this.createUserBtn.set("disabled", true);
		this.createGroupBtn.set("disabled", true);		
		
		dojo.subscribe("/confolio/userChange", dojo.hitch(this, function() {
			while (this.userField.hasChildNodes()) {
				this.userField.removeChild(this.userField.firstChild);
			}
			var user = this.application.getUser();
			dojo.place(dojo.doc.createTextNode("Welcome "+user.user), this.userField);
			this.update();
		}));
		this.resize();
		
		// Force the user to login
		//Using a try catch due to some uncatched throw in the show method in dialog.
		try {
			if (__confolio.config["showLogin"] !== "true") {
				var ldialog = new folio.security.LoginDialog({application: this.application, userName: "admin"});
				ldialog.show();
			}
		} catch (e) {
			console.log(e)
		}
	},
	resize: function() {
		this.inherited("resize", arguments);
		if (this.applicationContainer) {
			this.applicationContainer.resize();
		}
	},
	
	displayTabs: function(entry, displayType) {
		// if there is something displayed and the types differ-> remove the old tabs
		if (this.currentBuiltinType && this.currentBuiltinType != displayType) {
			var tbs = this.entryTabs[this.currentBuiltinType];
			for (var i in tbs) {
				this.tabContainer.removeChild(tbs[i]);
			}
			delete this.currentBuiltinType;
		}

		if (entry && displayType) {
			var f = dojo.hitch(this, function() {
				var currContent = this.tabContent[displayType];
				var currTabs = this.entryTabs[displayType];
				// set new content in the current tabs and add them if necessary
				for (var j=0;j<currTabs.length;j++) {
					currContent[j].setEntry(entry);
					if (this.currentBuiltinType != displayType) {
						this.tabContainer.addChild(currTabs[j], j);
					}
				}
				this.currentBuiltinType = displayType;
			});
			
			if (entry.needRefresh() || entry.resource === undefined) {
				entry.refresh(f);
			} else {
				f();
			}
		}
	},
	update: function() {
		this.application.store.loadEntry(this.application.getRepository()+"_principals/entry/_systemEntries", {}, dojo.hitch(this, function(entry) {
			this._principals_systemEntries = entry;
			if (this.userGroupRadio.get("checked")) {
				this.selectView();
			}
		}));
		this.application.store.loadEntry(this.application.getRepository()+"_contexts/entry/_systemEntries", {}, dojo.hitch(this, function(entry) {
			this._contexts_systemEntries = entry;
			if (this.portfolioRadio.get("checked")) {
				this.selectView();
			}
		}));
	},
	selectView: function() {
		this.displayTabs(null, null);
		if (this.portfolioRadio.get("checked")) {
			this.displayCreateButtons([folio.data.BuiltinType.CONTEXT]);
			this.folderView.displayChildrenTypes([folio.data.BuiltinType.CONTEXT]);
			this.folderSelect.setTopFolder(this._contexts_systemEntries);
		}
		else if (this.userGroupRadio.get("checked")) {
			this.displayCreateButtons([folio.data.BuiltinType.USER, folio.data.BuiltinType.GROUP]);
			this.folderView.displayChildrenTypes([folio.data.BuiltinType.USER, folio.data.BuiltinType.GROUP]);
			this.folderSelect.setTopFolder(this._principals_systemEntries);
		}
	},
	displayCreateButtons: function(displayTypes) {
		// Remove buttons
		while (this.createArea.hasChildNodes()) {
			this.createArea.removeChild(this.createArea.firstChild);
		}
		// Add buttons
		for (var type in displayTypes) {
			//var child = dojo.doc.createElement('div');
			if (displayTypes[type] == folio.data.BuiltinType.CONTEXT) {
				dojo.place(this.createContextBtn.domNode, this.createArea);
			}
			else if (displayTypes[type] == folio.data.BuiltinType.USER) {
				dojo.place(this.createUserBtn.domNode, this.createArea);
			}
			else if (displayTypes[type] == folio.data.BuiltinType.GROUP) {
				dojo.place(this.createGroupBtn.domNode, this.createArea);
			}
		}
	},
	entryCreated: function(entryUri) {
		this.application.store.loadEntry(entryUri, {}, dojo.hitch(this, function(entry) {
			this.folderView.addChild(entry);
			this.folderView.setSelectedEntry(entryUri);
			switch (entry.getBuiltinType()) {
			case folio.data.BuiltinType.CONTEXT:
				this.createPortfolioDialog.hide();
				break;
			case folio.data.BuiltinType.USER:
				this.createUserDialog.hide();
				break;
			case folio.data.BuiltinType.GROUP:
				this.createGroupDialog.hide();
				break;
			default:
				break;
			}
		}));
	},
	newContextClicked: function() {
		var listEntry = this.folderSelect.getSelectedFolder();
		if (listEntry) {
			this.createPortfolio.setEntry(listEntry);
			this.createPortfolioDialog.show();
		}
	},
	newUserClicked: function() {
		var listEntry = this.folderSelect.getSelectedFolder();
		if (listEntry) {
			this.createUser.setEntry(listEntry);
			this.createUserDialog.show();
		}
	},
	newGroupClicked: function() {
		var listEntry = this.folderSelect.getSelectedFolder();
		if (listEntry) {
			this.createGroup.setEntry(listEntry);
			this.createGroupDialog.show();
		}
	}
});