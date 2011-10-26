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

dojo.provide("folio.admin.FilteredSelection");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("folio.Application");
dojo.require("dijit.form.FilteringSelect");
dojo.require("folio.data.Constants");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("folio.data.EntryUtil");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.form.Button");

dojo.require("dojo.parser");

dojo.require("folio.data.EntryUtil");

/**
 * This is a simple drop-down list that displays all folders that a user can edit in a given context.
 * At the moment this is performed by giving a folder as argument and iteratively build the drop-down.
 * This must be changed. Preferably by passing a context as argument, this class will then query the server for all editable folders for the current user.
 * The drop-down does not display system folders i.e. folders that starts with an underscore, except for _top and _all.
 */
dojo.declare("folio.admin.FolderSelect", [dijit._Widget, dijit._Templated, folio.ApplicationView], {
	widgetsInTemplate: true,
	templateString: "<div class='folderselect'><select dojoType='dijit.form.FilteringSelect' dojoAttachPoint='folderSelect' searchAttr='name'></select></div>",
	displayAll: true,
	/**
	 * User is needed to know which folders to show and which not to show
	 */
	user: null,
	topFolder: null,
	folders: null,
	
	constructor: function() {
		this.folders = new Array();
	},
	destroy: function() {
		this.folderSelect.destroy();
		this.inherited(arguments);
	},
	getSupportedActions: function() {
		return ["deleted", "childrenChanged", "userChange"];
	},
	handle: function(event) {
//		console.log("folio.admin.FolderSelect.handle(event)");
		switch (event.action) {
		case "deleted":
			// The support for deletion is not implemented at the moment
			if (event.entry.getUri() == this.getFolder().getUri()) {
				console.log("A list has been deleted, implement a method that takes care of that.");
			}
			break;
		case "childrenChanged":
			// Check to see if the list is here and should be updated
			if (this.folders[event.entry.getUri()]) {
				// Update the list
				this.folders[event.entry.getUri()] = event.entry;
			}
			break;
		case "userChange":
			this.user = event.user;
			this._updateSelection();
			break;
		}
//		console.log(event);
	},
	/**
	 * Displays the top folder and all folders below it, recursively.
	 */
	setTopFolder: function(/*Entry*/listEntry) {
		this.topFolder = listEntry;
		this._updateSelection();
	},
	/**
	 * Sets if the system list _all should be displayed or not.
	 * Default is true.
	 */
	display_all: function(/*boolean*/ doDisplay) {
		this.displayAll = doDisplay;
	},
	/**
	 * Return the entry with the uri folderUri, or null if there is no such folderUri.
	 * This is a help method that can be used to get the entry from the entryUri recieved in the listener method passed as argument to getFolder.
	 */
	getFolder: function(/* String */ folderUri) {
		return this.folders[folderUri];
	},
	/**
	 * Returns the currently selected folder, or null if no folder is selected
	 */
	getSelectedFolder: function() {
		var value = this.folderSelect.get("value");
		if (value) {
			return this.getFolder(value);
		}
		return null;
	},
	/**
	 * Adds a listener to the widget. The listener is fired everytime the user selects a folder from the dropdown.
	 * The listener is a pointer to a function that takes one argument - the uri to the listentry that has been selected.
	 */
	addChangeListener: function(/*function(entryUri)*/ listener) {
		dojo.connect(this.folderSelect, "onChange", listener);
	},
	_updateSelection: function() {
		// Empty the list, or create a new.
		this.folders = [];
		//this.folderSelect.value = "";
		//this.folderSelect.set("value", "");
		this.folderSelect.store = new dojo.data.ItemFileWriteStore({data: {identifier: "id", label: "name", items:[]}});
		if (this.user && this.topFolder) {
			this._recursiveBuildFolders(this.topFolder);
		}
	},
	_recursiveBuildFolders: function(/*Entry*/list) {
		if (list.getBuiltinType() == folio.data.BuiltinType.LIST && !this.folders[list.getUri()]) {
			// Check if the first character not is an underscore, or if it is _top or _all
			if (/^[^_]/.test(list.getId()) || /top/.test(list.getId()) || (this.displayAll && /_all/.test(list.getId()))) {
				// add the list to the filteringselect
				var resourceName = folio.data.getLabel(list);
				this.folderSelect.store.newItem({id: list.getUri(), name: resourceName});
				this.folders[list.getUri()] = list;
				if(/top/.test(list.getId())) {
					this.folderSelect.setValue(list.getUri());
				}
			}
			// Load all the children of the list
			folio.data.getAllChildren(list, dojo.hitch(this, function(children) {
				dojo.forEach(children, dojo.hitch(this, function(child) {
					this._recursiveBuildFolders(child);
				}));
			}));
		}
	}
});

/**
 * Displays a selection of entries in a folder (Entry of type List).
 * The types of the displayed entries can be specified with a call to displayChildrenTypes.
 */
dojo.declare("folio.admin.FolderView", [dijit._Widget, dijit._Templated, folio.ApplicationView], {
	widgetsInTemplate: false,
	templateString: "<div dojoAttachPoint='childContainer' class='folderview'></div>",
	// To be used in case pagination should be possible
	rows: 20,
	folder: null,
	selectedIndex: -1,
	displayTypes: null,
	listNodes: null,
	entries: null,
	changeListeners: null,
	
	constructor: function() {
		this.selectedIndex = -1;
		this.displayTypes = new Array();
		this.changeListeners = new Array();
	},
	destroy: function() {
		this.inherited(arguments);
	},
	getSupportedActions: function() {
		return ["changed", "deleted", "childrenChanged", "userChange"];
	},
	handle: function(event) {
//		console.log("folio.admin.FolderView.handle(event)");
		switch (event.action) {
		case "changed":
			this.updateChild(event.entry);
			break;
		case "deleted":
			// The support for deletion is not implemented at the moment
			if (event.entry.getUri() == this.getFolder().getUri()) {
				console.log("An entry has been deleted, implement a method that takes care of that.");
			}
			break;
		case "childrenChanged":
			// Is handled in the administrateFolio class
			break;
		case "userChange":
			break;
		}
//		console.log(event);
	},
	/**
	 * Displays the built in types defined in the array passed as argument.
	 */
	displayChildrenTypes: function(/* [folio.data.BuiltinType] */ types) {
		this.displayTypes = types;
		this.rebuildList();
	},
	/**
	 * Displays the children of the list
	 */
	displayChildren: function(/* Entry of type list */ list) {
		this.folder = list;
		this.rebuildList();
	},
	/**
	 * Adds a listener to the widget. The listener is fired every time the user selects an item from the list.
	 * The listener is a pointer to a function that takes one argument - the entry that has been selected.
	 */
	addChangeListener: function(/*function(entry)*/ listener) {
		this.changeListeners.push(listener);
	},
	rebuildList: function() {
		this.childContainer.innerHTML = "";
		this.listNodes = new Array();
		this.entries = new Array();
		this.selectedIndex = -1;
		if (this.folder) {
			folio.data.getAllChildren(
				this.folder,
				dojo.hitch(
					this,
					function(children) {
						var childrenToDisplay = new Array();
						for (var i in children) {
							if (this.shouldDisplay(children[i])) {
								childrenToDisplay[childrenToDisplay.length] = children[i];
							}
						}
						var index = 0;
						var sortedChildren = folio.data.sortEntriesByLabel(childrenToDisplay);
						for (var j in sortedChildren) {
							this._addChild(sortedChildren[j], index);
							index++;
						}
					}
				),
				function(msg) {console.error("folio.admin.FolderView.rebuildList, "+ msg);}
			);
		}
	},
	shouldDisplay: function(/* Entry */ entry) {
		for (var i in this.displayTypes) {
			if (this.displayTypes[i] == entry.getBuiltinType()) {
				return true;
			}
		}
		return false;
	},
	addChild: function(/* Entry */ entry) {
		this.entries.push(entry);
		var list = folio.data.sortEntriesByLabel(this.entries);
		this.childContainer.innerHTML = "";
		this.listNodes = new Array();
		this.entries = new Array();
		this.selectedIndex = -1;
		var index = 0;
		for (var i in list) {
			this._addChild(list[i], index);
			index++;
		}
	},
	_addChild: function(/* Entry */ entry, number) {
		var child = dojo.doc.createElement('div');
		dojo.toggleClass(child, "listEntry");
		dojo.connect(child, "onclick", dojo.hitch(this, this.handleEvent, number));
		
		child.innerHTML = this.getIconHtml(entry) + this.getTitleHtml(entry);
		this.listNodes[number] = child;
		this.entries[number] = entry;
		dojo.place(child, this.childContainer);
	},
	getIconHtml: function(entry) {
		return "<img class='iconCls' src= '"+folio.data.getIconPath(entry) +"'></img>";
	},
	getTitleHtml: function(entry) {
		var title = folio.data.getLabel(entry);
		return "<span class='titleCls'>"+title+"</span>";
	},
	/**
	 * Updates a displayed entry, if it is currently displayed.
	 */
	updateChild: function(/* Entry */ entry) {
		if (this.getSelectedEntry() && (this.getSelectedEntry().getUri() == entry.getUri())) {
			this.listNodes[this.selectedIndex].innerHTML = this.getIconHtml(entry) + this.getTitleHtml(entry);
		}
		else {
			for (var i in this.entries) {
				if (this.entries[i].getUri() == entry.getUri()) {
					this.listNodes[i].innerHTML = this.getIconHtml(entry) + this.getTitleHtml(entry);
					break;
				}
			}
		}
	},
	getSelectedEntry: function() {
		if (this.selectedIndex != -1) {
			return this.entries[this.selectedIndex];
		}
		return null;
	},
	setSelectedEntry: function(entryUri) {
		for (var index=0; index<this.entries.length; index++) {
			if (this.entries[index].getUri() == entryUri) {
				this.setSelectedIndex(index);
				break;
			}
		}
	},
	handleEvent: function(index, event) {
		event.stopPropagation();
		this.setSelectedIndex(index);
	},
	setSelectedIndex: function(index) {
		if (this.entries[index]) {
			if (this.selectedIndex != -1) {
				dojo.toggleClass(this.listNodes[this.selectedIndex], "selected");
			}
			dojo.toggleClass(this.listNodes[index], "selected");
			this.selectedIndex = index;
			if (this.entries[index].needRefresh()) {
				this.entries[index].refresh(
					dojo.hitch(
						this,
						function(entry) {
							this.entries[index] = entry;
							for (var i in this.changeListeners) {
								this.changeListeners[i](entry);
							}
						}
					),
					function(msg) {console.error("folio.admin.FolderView.setSelectedIndex, "+msg);}
				);
			}
			else {
				for (var i in this.changeListeners) {
					this.changeListeners[i](this.entries[index]);
				}
			}
		}
		else {
			console.error("folio.admin.FolderView.setSelectedIndex, index " + index + "does not excist in the list!");
		}
	}
});

/** 
 * A pagination class that can be used with folio.admin.FolderView.
 */
dojo.declare("folio.admin.SimpleFolderPagination", [dijit._Widget, dijit._Templated], {
	widgetsInTemplate: false,
	templateString: 
		"<div class='pagination'>" +
			"<span class='paginator' style='width: 25%;'>" +
				"\<\<" +
			"</span>" +
			"<span class='paginator'>" +
				"\<" +
			"</span>" +
			"<span class='paginator'>" +
				"\>" +
			"</span>" +
			"<span class='paginator'>" +
				"\>\>" +
			"</span>" +
		"</div>"

});

/**''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''****/


/**
 * This widget combines a folio.admin.FolderSelect and a folio.admin.FolderView.
 * When a user selects a folder from the FolderSelect part, its content is displayed in the FolderView.
 */
dojo.declare("folio.admin.FolderList", [dijit._Widget, dijit._Templated], {
	widgetsInTemplate: true,
	
	templateString:
//		"<div dojoType='dijit.layout.BorderContainer' gutters='false'>" +
//			"<div dojoType='dijit.layout.ContentPane' region='top'><div dojoType='folio.admin.FolderSelect' dojoAttachPoint='folderSelect'></div></div>" +
//			"<div dojoType='dijit.layout.ContentPane' region='center'><div dojoType='folio.admin.FolderView' dojoAttachPoint='folderView'></div></div>" +
//		"</div>",
	
	"<div dojoType='dijit.layout.BorderContainer' gutters='false' dojoAttachPoint='top'>" +
		"<div dojoType='dijit.layout.ContentPane' region='top' splitter='true'><div>top</div></div>" +
		"<div dojoType='dijit.layout.ContentPane' region='center'>" +
			"<div>apa</div>" +
			"<div>apa</div>" +
			"<div>apa123</div>" +
		"</div>" +
		"<div dojoType='dijit.layout.ContentPane' region='bottom' splitter='true'><div>bottom</div></div>" +
	"</div>",

	postCreate: function() {
//		this.inherited("postCreate", arguments);
//		this.folderSelect.addChangeListener(
//			dojo.hitch(this, function (entryURI) {
//				this.folderView.displayChildren(this.folderSelect.getFolder(entryURI));
//		}));
	},
	destroy: function() {
//		this.folderSelect.destroy();
//		this.folderView.destroy();
//		//this.container.destroy();
//		this.inherited(arguments);
	},
	resize: function(size) {

	},
	getSupportedActions: function() {
		return ["userChange"];
	},
	handle: function(event) {
//		switch (event.action) {
//		case "userChange":
//			// Should rebuild the dropdown
//		break;
//		}
	},
	getSelectedEntry: function() {
//		return this.folderView.getSelectedEntry();
	},
	/**
	 * Adds a listener to this widget. The listener is fired every time the user selects an item from the folio.admin.FolderView.
	 * The listener is a pointer to a function that takes one argument - the entry that has been selected.
	 */
	addChangeListener: function(/*function(entry)*/ listener) {
//		this.folderView.addChangeListener(listener);
	},
	/**
	 * Displays the built in types defined in the array passed as argument.
	 */
	displayChildrenTypes: function(/* [folio.data.BuiltinType] */ types) {
//		this.folderView.displayChildrenTypes(types);
	},
	/**
	 * Displays the top folder and all folders below it, recursively.
	 */
	setTopFolder: function(/*Entry*/listEntry) {
//		this.folderSelect.setTopFolder(listEntry);
	}
});