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

dojo.provide("folio.admin.UserGroups");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("folio.data.Constants");
dojo.require("folio.data.EntryUtil");
dojo.require("dijit.form.Button");

dojo.require("folio.admin.UserGroupsEdit");

dojo.declare("folio.admin.UserGroups", [dijit._Widget, dijit._Templated, folio.admin.TabContent], {
	templatePath: dojo.moduleUrl("folio.admin", "UserGroupsTemplate.html"),
	widgetsInTemplate: true,
	templateString: "",
	viewId: "folio.admin.UserGroups",
	user: null,
	
	postCreate: function() {
		this.inherited("postCreate", arguments);
		this.userGroupsEdit.addGroupsJoinedListener(
			dojo.hitch(
				this,
				function(user, groups) {
					this.setEntry(user);
					if (this.application) {
						this.application.dispatch({action: "changed", entry: user, source: this});
						for (var i in groups) {
							this.application.dispatch({action: "childrenChanged", entry: groups[i], source: this});
						}
					}
				}
			)
		);
		this.groupTable.addLeftGroupListener(
			dojo.hitch(
				this,
				function(user, group) {
					this.setEntry(user);
					if (this.application) {
						this.application.dispatch({action: "childrenChanged", entry: group, source: this});
						this.application.dispatch({action: "changed", entry: user, source: this});
					}
				}
			)
		);
	},
	setApplication: function(application) {
		this.inherited("setApplication", arguments);
		this.groupTable.setApplication(this.application);
		this.application.register(this.userGroupsEdit.folderSelect.viewId, this.userGroupsEdit.folderSelect);
		this.userGroupsEdit.setApplication(application);
		if (this.user) {
			this.loadList();
		}
	},
	loadList: function() {
		this.application.getStore().loadEntry(
			this.application.getRepository()+"_principals/entry/_systemEntries",
			{},
			dojo.hitch(this, function(list) {
				this.userGroupsEdit.folderSelect.setTopFolder(list);
			})
		);
	},
	getSupportedActions: function() {
		return ["changed", "deleted", "childrenChanged", "userChange"];
	},
	handle: function(event) {
		switch (event.action) {
		case "deleted":
			// Check if the currently displayed group has been deleted
			if (this.entry && this.entry.getUri() == event.entry.getUri()) {
				this.setEntry(null);
			}
			break;
		case "changed":
		case "childrenChanged":
			// Check if the children of the displayed group has changed
			if (this.entry && this.entry.getUri() == event.entry.getUri()) {
				this.setEntry(event.entry);
			}
			break;
		case "userChange":
			this.user = event.user;
			if (this.application) {
				this.loadList();
			}
			break;
		}
	},
	setEntry: function(/* Entry */ entry) {
		this.inherited("setEntry", arguments);
		this.displayUserGroups();
		if (this.user && this.application) {
			this.userGroupsEdit.setUser(this.entry);
		}
		else {
			console.debug("folio.admin.UserGroups.setEntry, user = ");
			console.debug(user);
			console.debug("folio.admin.UserGroups.setEntry, application = ");
			console.debug(application);
		}
	},
	displayUserGroups: function() {
		if (this.entry) {
			this.groupTable.displayEntry(this.entry);
		}
	}
});

dojo.declare("folio.admin.UserGroupsTable", [folio.admin.PaginatedTable], {
	leftGroupListeners: null,
	application: null,
	groupArray: null,
	
	constructor: function() {
		this.leftGroupListeners = new Array();
	},
	setApplication: function(application) {
		this.application = application;
	},
	getTableHead: function() {
		var tr = dojo.doc.createElement('tr');
		
		var th = dojo.doc.createElement('th');
		dojo.style(th, "width", "200px");
		dojo.place(dojo.doc.createTextNode("Group"), th);
		dojo.place(th, tr);
		
		th = dojo.doc.createElement('th');
		dojo.style(th, "width", "100px");
		dojo.place(dojo.doc.createTextNode("Remove user from group"), th);
		dojo.place(th, tr);
		
		return tr;
	},
	extractArrayFromEntry: function(/* Entry */ entry, onArray) {
		folio.data.loadUserGroups(
			__confolio.application.getStore(),
			entry,
			dojo.hitch(this, function(array) {
				onArray(folio.data.sortEntriesByLabel(array));
			}),
			dojo.hitch(this, function(array) {
				console.error("folio.admin.UserGroupsTable.extractArrayFromEntry, could not load JSON.");
				console.error(msg);
			})
		);
	},
	getTableRow: function(/* Entry */ entry) {
		var tableRow = dojo.doc.createElement('tr');
		var tdTitle = dojo.doc.createElement('td');
		var divTitle = dojo.doc.createElement('div');
		var tdRemove = dojo.doc.createElement('td');
		var divRemove = dojo.doc.createElement('div');
		var buttonRemove = new dijit.form.Button({label: "x", onClick: dojo.hitch(this, this.removeMemberFromGroup, entry)}, divRemove);

		dojo.place(dojo.doc.createTextNode(folio.data.getLabel(entry)), divTitle);
		dojo.place(divTitle, tdTitle);
		dojo.place(tdTitle, tableRow);
		dojo.place(buttonRemove.domNode, tdRemove);
		dojo.place(tdRemove, tableRow);

		return tableRow;
	},
	removeMemberFromGroup: function(group) {
		folio.data.getList(
				group,
				dojo.hitch(
					this,
					function(list) {
						for (var i=0; i<list.childrenE.length; i++) {
							if (this.entry.getId() == list.childrenE[i].getId()) {
								list.removeEntry(i);
								list.save(
									dojo.hitch(this, function () {
										this.displayEntry(this.entry);
										this.entry.setRefreshNeeded(true);
										this.entry.refresh(dojo.hitch(this, function(refUser) {
											group.setRefreshNeeded(true);
											group.refresh(dojo.hitch(this, function(refGroup) {
												for (var i in this.leftGroupListeners) {
													this.leftGroupListeners[i](refUser, refGroup);
												}
											}), dojo.hitch(this, function(msg) {
												console.error("folio.admin.UserGroupsTable.removeMemberFromGroup, could not refresh Group.");
												console.error(msg);
											}));
										}), dojo.hitch(this, function(msg) {
											console.error("folio.admin.UserGroupsTable.removeMemberFromGroup, could not refresh User.");
											console.error(msg);
										}));
										
									}),
									dojo.hitch(this, function (msg) {
										console.error("folio.admin.UserGroupsTable.removeMemberFromGroup, could not save list");
										console.error(msg);
									}));
								break;
							}
						}
					}
				),
				dojo.hitch(
						this,
						function(msg) {
							console.error("folio.admin.UserGroupsTable.removeMemberFromGroup, could not get List.");
							console.error(msg);
						}
				)
			);
	},
	addLeftGroupListener: function(listener) {
		this.leftGroupListeners.push(listener);
	}
});