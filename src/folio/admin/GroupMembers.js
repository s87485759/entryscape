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

dojo.provide("folio.admin.GroupMembers");
dojo.require("folio.admin.TabContent");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
//dojo.require("dijit.Dialog");
dojo.require("dijit.form.Button");
dojo.require("folio.admin.GroupMembersEdit");

dojo.require("folio.data.EntryUtil");

dojo.declare("folio.admin.GroupMembers", [dijit._Widget, dijit._Templated, folio.admin.TabContent], {
	templatePath: dojo.moduleUrl("folio.admin", "GroupMembersTemplate.html"),
	widgetsInTemplate: true,
	templateString: "",
	viewId: "folio.admin.GroupMembers",
	user: null,

	postCreate: function() {
		this.inherited("postCreate", arguments);
		this.groupMembersEdit.addGroupMembersAddedListener(
			dojo.hitch(
				this,
				function(group, members) {
					this.setEntry(group);
					if (this.application) {
						this.application.dispatch({action: "childrenChanged", entry: group, source: this});
						for (var i in members) {
							this.application.dispatch({action: "changed", entry: members[i], source: this});
						}
					}
				}
			)
		);
		this.groupTable.addGroupMemberRemovedListener(
			dojo.hitch(
				this,
				function(group, member) {
					this.setEntry(group);
					if (this.application) {
						this.application.dispatch({action: "childrenChanged", entry: group, source: this});
						this.application.dispatch({action: "changed", entry: member, source: this});
					}
				}
			)
		);
	},
	setApplication: function(application) {
		this.inherited("setApplication", arguments);
		this.application.register(this.groupMembersEdit.folderSelect.viewId, this.groupMembersEdit.folderSelect);
		if (this.user) {
			this.loadList();
		}
	},
	loadList: function() {
		this.application.getStore().loadEntry(
				this.application.getRepository()+"_principals/entry/_systemEntries",
				{},
				dojo.hitch(this, function(list) {
//					console.log("folio.admin.GroupMembers.loadList, list = ");
//					console.log(list);
					this.groupMembersEdit.folderSelect.setTopFolder(list);
				})
			);
	},
	getSupportedActions: function() {
		return ["changed", "deleted", "childrenChanged", "userChange"];
	},
	handle: function(event) {
//		console.log("folio.admin.GroupMembers.handle(event)");
//		console.log(event);
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
//		console.log("folio.admin.GroupMembers.setEntry, entry = ");
//		console.log(entry);
		this.inherited("setEntry", arguments);
		this.displayGroupMembers();
		if (this.user && this.application) {
			this.groupMembersEdit.setGroup(this.entry);
		}
		else {
			console.debug("folio.admin.GroupMembers.setEntry, user = ");
			console.debug(user);
			console.debug("folio.admin.GroupMembers.setEntry, application = ");
			console.debug(application);
		}
	},
	displayGroupMembers: function() {
		this.groupTable.displayEntry(this.entry);
	}
});

dojo.declare("folio.admin.GroupTable", [folio.admin.PaginatedTable], {

	groupMemberRemovedListeners: null,
	groupList: null,
	
	constructor: function() {
		this.groupMemberRemovedListeners = new Array();
	},
	getTableHead: function() {
		var tr = dojo.doc.createElement('tr');
		
		var th = dojo.doc.createElement('th');
		dojo.style(th, "width", "200px");
		dojo.place(dojo.doc.createTextNode("Member"), th);
		dojo.place(th, tr);
		
		th = dojo.doc.createElement('th');
		dojo.style(th, "width", "100px");
		dojo.place(dojo.doc.createTextNode("Remove"), th);
		dojo.place(th, tr);
		
		return tr;
	},
	extractArrayFromEntry: function(/* Entry */ entry, onArray) {
		folio.data.getList(
				entry,
				dojo.hitch(
					this,
					function(list) {
						// Sort the members
						this.groupList = list;
						onArray(folio.data.sortEntriesByLabel(list.childrenE));
					}
				),
				dojo.hitch(
					this,
					function(msg) {
						console.error("folio.admin.GroupTable.extractArrayFromEntry, could not get list!");
						console.error(msg);
					}
				)
			);
	},
	getTableRow: function(/* Entry */ entry) {
		var tableRow = dojo.doc.createElement('tr');
		var tdTitle = dojo.doc.createElement('td');
		var divTitle = dojo.doc.createElement('div');
		var tdRemove = dojo.doc.createElement('td');
		var divRemove = dojo.doc.createElement('div');
		var buttonRemove = new dijit.form.Button({label: "x", onClick: dojo.hitch(this, this.removeMemberFromGroup, entry)}, divRemove);

		dojo.place(dojo.doc.createTextNode(folio.data.getLabelRaw(entry) || entry.alias || entry.getId()), divTitle);
		dojo.place(divTitle, tdTitle);
		dojo.place(tdTitle, tableRow);
		dojo.place(buttonRemove.domNode, tdRemove);
		dojo.place(tdRemove, tableRow);
		
		return tableRow;
	},
	removeMemberFromGroup: function(member) {
		for (var i=0; i<this.groupList.childrenE.length; i++) {
			if (member.getId() == this.groupList.childrenE[i].getId()) {
				this.groupList.removeEntry(i);
				this.groupList.save(
					dojo.hitch(
						this,
						function () {
							this.entry.setRefreshNeeded(true);
							this.entry.refresh(
								dojo.hitch(
									this,
									function (group) {
										member.setRefreshNeeded(true);
										member.refresh(
												dojo.hitch(
													this,
													function (user) {
														for (var i in this.groupMemberRemovedListeners) {
															this.groupMemberRemovedListeners[i](group, user);
														}
													}
												),
												dojo.hitch(
													this,
													function (msg) {
														console.error("folio.admin.GroupTable.removeMemberFromGroup, could not refresh User.");
														console.error(msg);
													}
												)
											);
									}
								),
								dojo.hitch(
									this,
									function (msg) {
										console.error("folio.admin.GroupTable.removeMemberFromGroup, could not refresh Group.");
										console.error(msg);
									}
								)
							);
						}
					),
					dojo.hitch(
						this,
						function (msg) {
							console.error("folio.admin.GroupTable.removeMemberFromGroup, could not save list.");
							console.error(msg);
						}
					)
				);
				break;
			}
		}
	},
	/**
	 * Adds a listener.
	 * The listener should take two arguments: the group that the member were removed from and the member that were removed
	 */
	addGroupMemberRemovedListener: function(listener) {
		this.groupMemberRemovedListeners.push(listener);
	}
});