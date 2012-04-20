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

dojo.provide("folio.admin.UserGroupsEdit");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.Button");
dojo.require("dojox.form.BusyButton");
dojo.require("folio.data.EntryUtil");

dojo.declare("folio.admin.UserGroupsEdit", [dijit._Widget, dijit._Templated], {
	templatePath: dojo.moduleUrl("folio.admin", "UserGroupsEditTemplate.html"),
	widgetsInTemplate: true,
	templateString: "",
	
	groupsJoinedListeners: null,
	// The parent of all group nodes in the list node
	groupsList: null,
	/**
	 * index 0: the domnode
	 * index 1: the entry
	 * index 2: the event handle
	 * index 3: the checkbox widget
	 */
	groupsArray: null,
	selectedFromGroupsArray: null,
	
	application: null,
	
	// The user of type folio.data.Entry
	user: null,
//	 The group children of type folio.data.List
//	groupList: null,
//	 sorted Array of the group children [folio.data.Entry]
//	groupMembers: null,
	memberInGroups: null,
	
	constructor: function() {
		this.groupsJoinedListeners = [];
		this.memberInGroups = [];
		this.groupsArray = [];
		this.selectedFromGroupsArray = [];
	},
	postCreate: function() {
		this.inherited("postCreate", arguments);
		this.folderSelect.addChangeListener(
			dojo.hitch(this, function (entryURI) {
				this.clearGroupsList();
				this.buildGroupsList(this.folderSelect.getFolder(entryURI));
			}
		));
		var contentPane = new dijit.layout.ContentPane({}, this.groupsPane);
		contentPane.set("style", "height: 250px; width: 200px;");
		this.groupsList = dojo.doc.createElement('div');
		contentPane.set("content", this.groupsList);
	},
	setApplication: function(application) {
		this.application = application;
	},
	setUser: function(/* Entry */ user) {
		this.user = user;
		if (user) {
			folio.data.loadUserGroups(
				__confolio.application.getStore(),
				user,
				dojo.hitch(this, function(array) {
//					console.log("folio.admin.UserGroupsEdit.setUser, got groups that the user is a member of.");
					this.memberInGroups = folio.data.sortEntriesByLabel(array);
//					console.log("folio.admin.UserGroupsEdit.setUser, sorted the groups");
					this.clearGroupsList();
//					console.log("folio.admin.UserGroupsEdit.setUser, cleared the grouplist");
					this.groupsArray = [];
					this.selectedFromGroupsArray = [];
					this.setNrSelectedInGroupsList(0);
//					console.log("folio.admin.UserGroupsEdit.setUser, cleaned up and created new arrays");
					var selectedFolder = this.folderSelect.getSelectedFolder();
					if (selectedFolder) {
//						console.log("folio.admin.UserGroupsEdit.setUser, building groupsList");
						this.buildGroupsList(selectedFolder);
//						console.log("folio.admin.UserGroupsEdit.setUser, built groupsList");
					}
				}),
				dojo.hitch(this, function(array) {
					console.error("folio.admin.UserGroupsEdit.setUser, could not load JSON.");
					console.error(msg);
				})
			);
		}
		else {
			this.memberInGroups = [];
			this.clearGroupsList();
			this.groupsArray = [];
			this.selectedFromGroupsArray = [];
			this.setNrSelectedInGroupsList(0);
			
			var selectedFolder = this.folderSelect.getSelectedFolder();
			if (selectedFolder) {
				this.buildGroupsList(selectedFolder);
			}
		}
	},
	buildGroupsList: function(/* Entry */ list) {
//		console.log("folio.admin.buildGroupsList, start");
		folio.data.getAllChildren(
			list,
			dojo.hitch(
				this,
				function(children) {
//					console.log("folio.admin.buildGroupsList, got children");
					var sortedChildren = folio.data.sortEntriesByLabel(children);
//					console.log("folio.admin.buildGroupsList, sorted children");
					var number = 0;
					for (var i in sortedChildren) {
						if(sortedChildren[i].getBuiltinType() == folio.data.BuiltinType.GROUP) {
//							console.log("folio.admin.buildGroupsList, looping");
							var arr = null;
							var indexInSelectedFromGroupsArray = this.getIndexFromNestedArray(sortedChildren[i], this.selectedFromGroupsArray);
//							console.log("folio.admin.buildGroupsList, indexInSelectedFromGroupsArray = "+indexInSelectedFromGroupsArray);
							if (indexInSelectedFromGroupsArray >= 0) {
								arr = this.selectedFromGroupsArray[indexInSelectedFromGroupsArray];
								dojo.place(arr[0], this.groupsList);
							}
							else {
//								console.log("folio.admin.buildGroupsList, else");
								var childDiv = dojo.doc.createElement('div');
								dojo.toggleClass(childDiv, "listentry");
								
								var checkDiv = dojo.doc.createElement('div');
								var checkBox = new dijit.form.CheckBox({checked: false}, checkDiv);

								var c = sortedChildren[i];
								var title = folio.data.getLabelRaw(c) || c.alias || c.getId();
								var titleSpan = dojo.doc.createElement('span');
								dojo.toggleClass(titleSpan, "titleCls");
								title = dojo.doc.createTextNode(title);
//								console.log("folio.admin.buildGroupsList, created html nodes");
								// Save the stuff
								arr = [];
								arr[0] = childDiv;
								arr[1] = sortedChildren[i];
								// Check if the user already is a member of the group
								if (this.getIndexFromArray(sortedChildren[i], this.memberInGroups) >= 0) {
									dojo.toggleClass(childDiv, "groupmbr");
									checkBox.set("disabled", true);
									arr[2] = null;
								}
								else {
									arr[2] = dojo.connect(checkBox, "onChange", dojo.hitch(this, this.entrySelectedFromGroupssList, arr));
								}
								arr[3] = checkBox;
								dojo.place(title, titleSpan);
								dojo.place(checkBox.domNode, childDiv);
								dojo.place(titleSpan, childDiv);
								dojo.place(arr[0], this.groupsList);
							}
							this.groupsArray[number] = arr;
							number++;
						}
					}
				}
			),
			dojo.hitch(
				this,
				function(msg) {
					console.error("folio.admin.UserGroupsEdit.buildGroupsList, could not load children!");
					console.error(msg);
				}
			)
		);
	},
	entrySelectedFromGroupssList: function(/* [Arr] */ arr, checked) {
//		console.log("folio.admin.UserGroupsEdit.entrySelectedFromUsersList, arr = ");
//		console.log(arr);
//		console.log("folio.admin.UserGroupsEdit.entrySelectedFromUsersList, checked = "+checked);
		if (checked) {
			dojo.toggleClass(arr[0], "selected");
			this.selectedFromGroupsArray.push(arr);
			this.setNrSelectedInGroupsList(this.selectedFromGroupsArray.length);
		}
		else {
			var index = this.getIndexFromNestedArray(arr[1], this.selectedFromGroupsArray);
			dojo.toggleClass(arr[0], "selected");
			this.selectedFromGroupsArray.splice(index, 1);
			this.setNrSelectedInGroupsList(this.selectedFromGroupsArray.length);
		}
	},
	getIndexFromNestedArray: function(/* Entry */ entry, /* [Array of [arrays]] */ array) {
		for (var i=0; i<array.length; i++) {
			if (array[i][1].getId() == entry.getId()) {
				return i;
			}
		}
		return -1;
	},
	getIndexFromArray: function(/* Entry */ entry, /* [Entry] */ array) {
		for (var i=0; i<array.length; i++) {
			if (array[i].getId() == entry.getId()) {
				return i;
			}
		}
		return -1;
	},
	setNrSelectedInGroupsList: function(/* int */ selected) {
		this.nrSelectedInGroupsList.innerHTML = selected;
	},
	clearGroupsList: function() {
		while (this.groupsList.hasChildNodes()) {
			this.groupsList.removeChild(this.groupsList.firstChild);
		}
	},
	joinGroupsClicked: function() {
//		console.log("folio.admin.joinGroupsClicked, start");
		var refreshedGroups = [];
		var numRefs = 0;
		for (var i in this.selectedFromGroupsArray) {
//			console.log("folio.admin.joinGroupsClicked, loop");
			folio.data.getList(
				this.selectedFromGroupsArray[i][1],
				dojo.hitch(
					this,
					function(groupList) {
//						console.log("folio.admin.joinGroupsClicked, got groupList");
						groupList.addEntry(this.user);
						groupList.save(
							dojo.hitch(
								this,
								function () {
//									console.log("folio.admin.joinGroupsClicked, saved groupList");
									this.selectedFromGroupsArray[i][1].setRefreshNeeded(true);
									this.selectedFromGroupsArray[i][1].refresh(
										dojo.hitch(
											this,
											function(refGroup) {
//												console.log("folio.admin.joinGroupsClicked, refreshed group");
												refreshedGroups.push(refGroup);
												++numRefs;
//												console.log("folio.admin.joinGroupsClicked, numRefs="+numRefs);
//												console.log("folio.admin.joinGroupsClicked, this.selectedFromGroupsArray.length="+this.selectedFromGroupsArray.length);
												if (numRefs == this.selectedFromGroupsArray.length) {
													this.updateUserAndSendMessages(refreshedGroups);
												}
											}
										),
										dojo.hitch(
											this,
											function(msg) {
												console.error("folio.admin.GroupMembersEdit.joinGroupsClicked, could not refresh group.");
												console.error(msg);
												if (++numRefs == this.selectedFromGroupsArray.length) {
													this.updateUserAndSendMessages(refreshedGroups);
												}
											}
										)
									);
								}
							),
							dojo.hitch(
								this,
								function (msg) {
									console.error("folio.admin.GroupMembersEdit.joinGroupsClicked, could not save list.");
									console.error(msg);
									this.doneBtn.cancel();
								}
							)
						);
					}
				),
				dojo.hitch(
					this,
					function(msg) {
						console.error("folio.admin.UserGroupsEdit.joinGroupsClicked, could not get list!");
						console.error(msg);
						this.doneBtn.cancel();
					}
				)
			);
		}
	},
	updateUserAndSendMessages: function(groupArray) {
		this.user.setRefreshNeeded(true);
		this.user.refresh(
			dojo.hitch(
				this,
				function(refUser) {
					for (var i in this.groupsJoinedListeners) {
						this.groupsJoinedListeners[i](refUser, groupArray);
					}
					this.doneBtn.cancel();
				}
			),
			dojo.hitch(
				this,
				function(msg) {
					console.error("folio.admin.GroupMembersEdit.updateUserAndSendMessages, could not refresh user.");
					console.error(msg);
					this.doneBtn.cancel();
				}
			)
		);
	},
	cancelClicked: function() {
		// Important, copy selectedFromGroupsArray so that no items are removed from it while iterating over it
		var selArr = dojo.map(this.selectedFromGroupsArray, function(item){return item;});
		for (var index in selArr) {
			var arr = selArr[index];
			arr[3].set("checked", false);
		}
	},
	addGroupsJoinedListener: function(listener) {
		this.groupsJoinedListeners.push(listener);
	}
});