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

dojo.provide("folio.admin.GroupMembersEdit");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.Button");
dojo.require("dojox.form.BusyButton");
dojo.require("folio.data.EntryUtil");

dojo.declare("folio.admin.GroupMembersEdit", [dijit._Widget, dijit._Templated], {
	templatePath: dojo.moduleUrl("folio.admin", "GroupMembersEditTemplate.html"),
	widgetsInTemplate: true,
	templateString: "",
	
	groupMembersAddedListener: null,
	
	// The parent of all users in the list
	usersList: null,
	/**
	 * index 0: the domnode
	 * index 1: the entry
	 * index 2: the event handle
	 * index 3: the checkbox widget
	 */
	usersArray: null,
	selectedFromUsersArray: null,
	
	// The group of type folio.data.Entry
	group: null,
	// The group children of type folio.data.List
	groupList: null,
	// sorted Array of the group children [folio.data.Entry]
	groupMembers: null,
	
	constructor: function() {
		this.groupMembersAddedListener = new Array();
		this.groupMembers = new Array();
		this.usersArray = new Array();
		this.selectedFromUsersArray = new Array();
	},
	postCreate: function() {
		this.inherited("postCreate", arguments);
		this.folderSelect.addChangeListener(
			dojo.hitch(this, function (entryURI) {
				this.clearUsersList();
				this.buildUsersList(this.folderSelect.getFolder(entryURI));
			}
		));
		var contentPane = new dijit.layout.ContentPane({}, this.usersPane);
		contentPane.set("style", "height: 250px; width: 200px;");
		this.usersList = dojo.doc.createElement('div');
		contentPane.set("content", this.usersList);
	},
	setGroup: function(/* Entry */ group) {
		this.group = group;
		if (group) {
			folio.data.getList(
					this.group,
					dojo.hitch(
						this,
						function(list) {
							this.groupList = list;
							// Sort the members
							this.groupMembers = folio.data.sortEntriesByLabel(list.childrenE);
							this.clearUsersList();
							this.usersArray = new Array();
							this.selectedFromUsersArray = new Array();
							this.setNrSelectedInUsersList(0);
							
							var selectedFolder = this.folderSelect.getSelectedFolder();
							if (selectedFolder) {
								this.buildUsersList(selectedFolder);
							}
						}
					),
					dojo.hitch(
						this,
						function(msg) {
							console.error("folio.admin.GroupMembersEdit.setGroup, could not get list!");
							console.error(msg);
						}
					)
				);
		}
		else {
			this.groupList = null;
			this.groupMembers = new Array();
			this.clearUsersList();
			this.usersArray = new Array();
			this.selectedFromUsersArray = new Array();
			this.setNrSelectedInUsersList(0);
			
			var selectedFolder = this.folderSelect.getSelectedFolder();
			if (selectedFolder) {
				this.buildUsersList(selectedFolder);
			}
		}
	},
	buildUsersList: function(/* Entry */ list) {
		folio.data.getAllChildren(
			list,
			dojo.hitch(
				this,
				function(children) {
					var sortedChildren = folio.data.sortEntriesByLabel(children);
					var number = 0;
					for (var i in sortedChildren) {
						if(sortedChildren[i].getBuiltinType() == folio.data.BuiltinType.USER) {
							var arr = null;
							var indexInSelectedFromUsersArray = this.getIndexFromNestedArray(sortedChildren[i], this.selectedFromUsersArray);
							if (indexInSelectedFromUsersArray >= 0) {
								arr = this.selectedFromUsersArray[indexInSelectedFromUsersArray];
								dojo.place(arr[0], this.usersList);
							}
							else {
								var childDiv = dojo.doc.createElement('div');
								dojo.toggleClass(childDiv, "listentry");
								
								var checkDiv = dojo.doc.createElement('div');
								var checkBox = new dijit.form.CheckBox({checked: false}, checkDiv);

								var c = sortedChildren[i];
								var title = folio.data.getLabelRaw(c) || c.alias || c.getId();
								var titleSpan = dojo.doc.createElement('span');
								dojo.toggleClass(titleSpan, "titleCls");
								var title = dojo.doc.createTextNode(title);
								
								// Save the stuff
								arr = new Array();
								arr[0] = childDiv;
								arr[1] = sortedChildren[i];
								// Check if the user already is a member of the group
								if (this.getIndexFromArray(sortedChildren[i], this.groupMembers) >= 0) {
									dojo.toggleClass(childDiv, "groupmbr");
									checkBox.set("disabled", true);
									arr[2] = null;
								}
								else {
									arr[2] = dojo.connect(checkBox, "onChange", dojo.hitch(this, this.entrySelectedFromUsersList, arr));
								}
								arr[3] = checkBox;
								dojo.place(title, titleSpan);
								dojo.place(checkBox.domNode, childDiv);
								dojo.place(titleSpan, childDiv);
								dojo.place(arr[0], this.usersList);
							}
							this.usersArray[number] = arr;
							number++;
						}
					}
				}
			),
			dojo.hitch(
				this,
				function(msg) {
					console.error("folio.admin.GroupMembersEdit.buildUsersList, could not load children!");
					console.error(msg);
				}
			)
		);
	},
	entrySelectedFromUsersList: function(/* [Arr] */ arr, checked) {
//		console.log("folio.admin.GroupMembersEdit.entrySelectedFromUsersList, arr = ");
//		console.log(arr);
//		console.log(checked);
		if (checked) {
			dojo.toggleClass(arr[0], "selected");
			this.selectedFromUsersArray.push(arr);
			this.setNrSelectedInUsersList(this.selectedFromUsersArray.length);
		}
		else {
			var index = this.getIndexFromNestedArray(arr[1], this.selectedFromUsersArray);
			dojo.toggleClass(arr[0], "selected");
			this.selectedFromUsersArray.splice(index, 1);
			this.setNrSelectedInUsersList(this.selectedFromUsersArray.length);
		}
	},
	getIndexFromNestedArray: function(/* Entry */ entry, /* [Array of [arrays]] */ array) {
//		console.log("folio.admin.GroupMembersEdit.getIndexFromNestedArray, entry = ");
//		console.log(entry);
//		console.log("folio.admin.GroupMembersEdit.getIndexFromNestedArray, array = ");
//		console.log(array);
		for (var i=0; i<array.length; i++) {
			if (array[i][1].getId() == entry.getId()) {
				return i;
			}
		}
		return -1;
	},
	getIndexFromArray: function(/* Entry */ entry, /* [Entry] */ array) {
//		console.log("folio.admin.GroupMembersEdit.getIndexFromArray, entry = ");
//		console.log(entry);
		for (var i=0; i<array.length; i++) {
			if (array[i].getId() == entry.getId()) {
				return i;
			}
		}
		return -1;
	},
	setNrSelectedInUsersList: function(/* int */ selected) {
		this.nrSelectedInUsersList.innerHTML = selected;
	},
	clearUsersList: function() {
		while (this.usersList.hasChildNodes()) {
			this.usersList.removeChild(this.usersList.firstChild);
		}
	},
	addGroupMembersClicked: function() {
//		console.log("folio.admin.GroupMembersEdit.addGroupMembersClicked");
		// Save the group
		if (this.groupList) {
			for (var i in this.selectedFromUsersArray) {
				this.groupList.addEntry(this.selectedFromUsersArray[i][1]);
			}
			this.groupList.save(
				dojo.hitch(this, function () {
//					console.log("folio.admin.GroupMembersEdit.addGroupMembersClicked, saved the list");
					this.group.setRefreshNeeded(true);
					this.group.refresh(
						dojo.hitch(
							this,
							function(group) {
								var refreshedUsers = new Array();
								var usersLoaded = 0;
								for (var i in this.selectedFromUsersArray) {
									this.selectedFromUsersArray[i][1].setRefreshNeeded(true);
									this.selectedFromUsersArray[i][1].refresh(
										dojo.hitch(
											this,
											function(user) {
												refreshedUsers.push(user);
												++usersLoaded;
												if (usersLoaded == this.selectedFromUsersArray.length) {
													// Alert the listeners
													for (var i in this.groupMembersAddedListener) {
														this.groupMembersAddedListener[i](group, refreshedUsers);
													}
													this.doneBtn.cancel();
												}
											}
										),
										dojo.hitch(
											this,
											function(msg) {
												++usersLoaded;
												console.error("folio.admin.GroupMembersEdit.addGroupMembersClicked, could not refresh user.");
												console.error(msg);
												if (usersLoaded == this.selectedFromUsersArray.length) {
													// Alert the listeners
													for (var i in this.groupMembersAddedListener) {
														this.groupMembersAddedListener[i](group, refreshedUsers);
													}
													this.doneBtn.cancel();
												}
												this.doneBtn.cancel();
											}
										)
									);
								}
							}
						),
						dojo.hitch(
							this,
							function(msg) {
								console.error("folio.admin.GroupMembersEdit.addGroupMembersClicked, could not refresh group.");
								console.error(msg);
								this.doneBtn.cancel();
							}
						)
					);
				}), dojo.hitch(this, function (msg) {
					console.error("folio.admin.GroupMembersEdit.addGroupMembersClicked, could not save list.");
					console.error(msg);
					this.doneBtn.cancel();
				}));
		}
	},
	cancelClicked: function() {
		// Important, copy selectedFromUsersArray so that no items are removed from it while iterating over it
		var selArr = dojo.map(this.selectedFromUsersArray, function(item){return item});
		for (var index in selArr) {
			var arr = selArr[index];
			arr[3].set("checked", false);
		}
	},
	addGroupMembersAddedListener: function(listener) {
		this.groupMembersAddedListener.push(listener);
	}
});