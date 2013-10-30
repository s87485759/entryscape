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

dojo.provide("folio.list.List");
dojo.require("folio.list.AbstractList");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.layout._LayoutWidget");
dojo.require("folio.data.Entry");
dojo.require("folio.list.ListControls");
dojo.require("dojo.fx");
dojo.require("folio.entry.Details");
dojo.require("folio.create.CreateMenu");
dojo.require("folio.editor.RFormsLabelEditor");

/**
 * Provides a listing of entries.
 */
dojo.declare("folio.list.List", [folio.list.AbstractList, dijit.layout._LayoutWidget, dijit._Templated], {
	//=================================================== 
	// Public Attributes 
	//===================================================
	fadeDuration: 150,
	listNodes: [],
	headLess: false,
	controlsLess: false,
	includeDetailsButton: false,
	openFolderLink: false,
	detailsLink: false,

	//=================================================== 
	// Inherited Attributes 
	//===================================================
	region: "",
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("folio.list", "ListTemplate.html"),

	//=================================================== 
	// Private Attributes 
	//===================================================
	_entry2Icon: {"_top": "folder_home", "_contacts": "contact", "_featured": "spread", "_feeds": "rss", "_trash": "trashcan_full"},

	//=================================================== 
	// Public API
	//===================================================
	//===================================================
	// Inherited methods
	//===================================================
	postCreate: function() {
		this.inherited("postCreate", arguments);
		if (this.headLess) {
			this.borderContainerDijit.removeChild(this.listHeadDijit);
		}
		if (this.controlsLess) {
			dojo.style(this.listControlsDijit.domNode, "display", "none");
		}

//        this._insertSorter(dojo.create("div", {"class": "sortCls"}, this.sorterNode));

        dojo.addClass(this.domNode, "cleanList");
		dojo.connect(this.listChildrenDijit, "onClick", dojo.hitch(this, this.handleEvent, -1));
		dojo.connect(this.listChildrenDijit, "onMouseMove", dojo.hitch(this, function(ev) {
			if (dojo.hasClass(ev.target, "iconCls") && !this.iconMode) {
				var parent = ev.target.parentNode;
				while (parent != null && !dojo.hasClass(parent, "listEntry")) {
					parent = parent.parentNode;
				}
				var k=0, e=parent;
				while (e) {
					e = e.previousSibling
					k=k+1;
				}
				this.handleEvent(k-1, ev);
			}
		}));
	},
	startup: function() {
		this.inherited("startup", arguments);
        this.listControls.setListViewer(this);
	},
	getChildren: function() {
		return [this.borderContainerDijit];
	},
	resize: function(size) {
		this.inherited("resize", arguments);
		if (this.borderContainerDijit != null) {
			this.borderContainerDijit.resize();			
		}
	},
	showList: function(folderEntry, page, callback) {
		this.inherited("showList", arguments);
//		this.editBar.setActiveFolder(folderEntry);
		this.selectedIndex = -1;
		this.faded = false;
		this.newChildren = null;
		folio.data.getList(folderEntry, dojo.hitch(this, function(list) {
			//The if-case is to cover up when the list-entry is actually is a reference to a list-Entry
			//which means that the folder/list in the UI is entered via a reference and therefore some adjustments have to be made
			if(folio.data.isReference(folderEntry) && this.application.repository && folderEntry.getExternalMetadataUri().indexOf(this.application.repository,0)>-1){
				this.list = list.entry;
			}
//			this.editBar.setActiveFolder(this.list);
			var p = page != undefined ? page : 0;
			this.currentPage = p;
			list.getPage(p, 0, dojo.hitch(this, function(children) {
			this.listControls.update(list, p);
				this.newChildren = children;
				if (this.faded) {
					this._rebuildList();
					if (callback) {
						callback();
					}
				}
//			this.editBar.updateButtons();
			}));
		}));
		dojo.fadeOut({
				node: this.listChildrenDijit.domNode,
				duration: this.fadeDuration,
				onEnd: dojo.hitch(this, function() {
					this.faded = true;
					if (this.newChildren) {
						this._rebuildList();
						if (callback) {
							callback();
						}
					}
				})
			}).play();
	},
	/**
	 * Extracts the className for the tag (but only for spans) firing the event
	 * Only takes the first class 
	 * (so the returned value for tags will only be the first class 
	 * even if there are several classes)
	 * @param {Object} event
	 */
	extractActionFromEvent: function(event) {
		if (event.target.tagName == "SPAN" || event.target.tagName == "IMG") {
			var action, spaceIndex = event.target.className.indexOf(" ");
			if (spaceIndex != -1) {
				action = event.target.className.slice(0, spaceIndex);
			} else {
				action = event.target.className;
			}
			if (dojo.indexOf(this._acceptedActions, action) != -1) {			
				return action;
			}
		}
	},
	handleEvent: function(index, event) {
		//If clicking on the same row when rename editor is open, do nothing as it is only about moving the cursor.
		if (this._renameEditor && event && event.target && this.selectedIndex > 0 
				&& dojo.isDescendant(event.target, this.listNodes[this.selectedIndex])) {
			return;
		}
		this._do_rename();
		this.inherited("handleEvent", arguments);
	},
	changeFocus: function(index, dontPublish) {
		if (this.focusBlock) {
			return;
		}
        if (this.selectedIndex != -1) {
            var hideNode = this.listNodes[this.selectedIndex];
            dojo.removeClass(hideNode, "selected");
        }
        this.doChangeFocus(index, dontPublish);
        if (index != -1) {
            var showNode = this.listNodes[index];
            dojo.addClass(showNode, "selected");
        }
	},
	isFocus: function (entry) {
		if (this.selectedIndex == -1 || this.listChildren == null) {
			return false;
		}
		return this.listChildren[this.selectedIndex].getId() === entry.getId(); 
	},
	focus: function(folder, entry) {
		//This only works when there is only one page or the focused entry is on the first page.
		var page = this.currentPage != null ? this.currentPage : 0;
		var f = dojo.hitch(this, function() {
			var index = 0;
			for (var i=0;i<this.listChildren.length;i++) {
				if (entry === this.listChildren[i]) {
					index = i;
					break;
				}
			}
			if (!this.isFocus(entry)) {
				this.changeFocus(index, true);
			}	
		});
		if (folder !== this.list || this.currentPage != page) {
			this.showList(folder, page, f);
		} else {
			f();
		}
	},

    focusAndRename: function(newEntry) {
        setTimeout(dojo.hitch(this, function() {
            this.focus(this.list, newEntry);
            this.renameFocused(true);
        }), this.fadeDuration*3);
    },

	showDetails: function(detailsNode, entry) {
        folio.entry.Details.show(detailsNode, entry);
	},
	showMenu: function(entry, index, event) {
		console.log("launch menu");
		var self = this, menu = new dijit.Menu({});
		this._getEditActions(entry, function(eas) {
			dojo.forEach(eas, function(ea) {
				 menu.addChild(new dijit.MenuItem({
                    label: ea.label,
					disabled: !ea.enabled,
					onClick: function() {
						self["_handle_"+ea.action](entry, index, event);
					}
                }));
			});
			menu.startup();
			dojo.stopEvent(event);

			//WARNING, using private method in Menu, since there is no public method available.
			menu._scheduleOpen(event.target, null, {x: event.pageX, y: event.pageY});
			if (self.selectedIndex != index) {
				self.changeFocus(index);
			}
		});
	},
	//=================================================== 
	// Private methods
	//===================================================
	_rebuildList: function() {
		this.listChildren = this.newChildren;
		this.listNodes = [];
		if (!this.headLess) {
			this.listHeadDijit.set("content", "");//Just to clear if the asynchronous call is slow.
			if (this.list.getId() == "_systemEntries") {
				this.list.getContext().getOwnEntry(dojo.hitch(this, this._updateHead));
			} else {
				this._updateHead();
			}
		}

		var childrenContainer = dojo.create("div", {style: {"height": "100%"}});
		dojo.connect(childrenContainer, "oncontextmenu", dojo.hitch(this, this._showHeaderMenu));
		
		for (var i=0; i<this.listChildren.length; i++) {
			var childNode = dojo.create("div", null, childrenContainer);
			this.listNodes[i] = childNode;
			if (this.listChildren[i] && this.listChildren[i].needRefresh()) {
				this.listChildren[i].refresh(dojo.hitch(this,function(cn, tmpi, refreshedEntry){
					this._insertChild(refreshedEntry, tmpi, cn);
				}, childNode, i));
			}
			else {
				this._insertChild(this.listChildren[i], i, childNode);
			}
		}
		this.listChildrenDijit.set("content", childrenContainer);
		this.resize();
			
		dojo.fadeIn({
				node: this.listChildrenDijit.domNode,
				duration: this.fadeDuration
		}).play();
	},

	//=================================================== 
	// Private methods for generating the head
	_showHeaderMenu: function(event) {
		this.showMenu(this._headEntry, -1, event);
	},
	_updateHead: function(mdEntry) {
		var headContainer = dojo.create("div");
		var mde = mdEntry || this.list;
		this._headEntry = mde;
		var config = this.application.getConfig();
		
		dojo.create("img", {"class": "iconCls", "src": config.getIcon(mde)}, headContainer);
		
		var desc = folio.data.getDescription(mde);
		
		//Title
		dojo.create("div", {"class": "titleCls", "title": desc, "innerHTML": folio.data.getLabel(mde)}, headContainer);

		//Sorter and Refresher
		var listControls = dojo.create("div", {"class": "expandCls"}, headContainer);
		//Head Metadata

        var newicon;
        if (this.list.isResourceModifiable()) {
            newicon = dojo.create("span", {"class": "new icon24 operation"}, listControls);
            this.connect(newicon, "mouseover", this._handle_new);
            this.createMenu = new folio.create.CreateMenu({list: this}, dojo.create("div", {}, listControls));
        } else {
            newicon = dojo.create("span", {"class": "new icon24 operation disabled", title: "You do not have sufficient rights to create entries in this folder."}, listControls);
        }

		this._insertRefreshButton(dojo.create("span", {"class": "refresh icon24"}, listControls));

		var comments = mde.getComments();
		if (comments.length > 0) {
			dojo.create("span", {"title": ""+comments.length+" comments", "class": "comment operation icon"}, listControls);			
		}
		dojo.create("span", {"class": "menu operation icon24"}, listControls);

		dojo.connect(headContainer, "oncontextmenu", dojo.hitch(this, this.showMenu, mde, -1));
		dojo.connect(headContainer, "onclick", dojo.hitch(this, this.handleEvent, -1));
		this.listHeadDijit.set("content", headContainer);
	},
	_insertRefreshButton: function(refreshNode){
		dojo.attr(refreshNode, "title", "Press to refresh list");
		dojo.connect(refreshNode, "onclick", dojo.hitch(this, function() {
			this.list.setRefreshNeeded();
			this.refresh();
		}));
	},
	
	//=================================================== 
	// Private methods for generating a child starts here
	_refreshChild: function(index) {
		this._insertChild(this.listChildren[index], index, this.listNodes[index], true);
	},
    _handle_new: function(entry, index, event) {
        this.createMenu.show(this.list);
    },
    _handle_rename: function(entry, index, event, select) {
		var child = this.listChildren[index];
		if (child.isMetadataModifiable()) {
			dojo.removeClass(this.domNode, "no_user_select");
			var node = this.listNodes[index];
			this._renameEditor = new folio.editor.RFormsLabelEditor({entry: child, select: select}, dojo.create("div", null, node));
			this._renameEditor.focus();			
		}
	},
	_do_rename: function() {
		if (this._renameEditor) {
			this._renameEditor.save();
		}
		return this._abort_rename();
	},
	_abort_rename: function() {
		if (this._renameEditor) {
			dojo.addClass(this.domNode, "no_user_select");
			this._renameEditor.destroy();
			delete this._renameEditor;
			dijit.focus(this.domNode);
			return true;
		}
	},
	_insertChild: function(child, number, childNode, refresh) {

		if (refresh === true) { 
			dojo.attr(childNode, "innerHTML", "");
		} else {
			dojo.connect(childNode, "onclick", dojo.hitch(this, this.handleEvent, number));
			dojo.connect(childNode, "oncontextmenu", dojo.hitch(this, this.showMenu, child, number));
		}
		
		var f = dojo.hitch(this, function(hrefObj) {
			if (this.iconMode) {
				this._insertEntryAsIcon(child, childNode, number);
			} else {
				this._insertIcon(child, childNode, hrefObj);
				//Capture doubleclicks
				if (refresh !== true) {
					dojo.connect(childNode, "dblclick", dojo.hitch(this, function() {
						if (hrefObj.blankTarget) {
							window.open(hrefObj.href, "_blank");
						} else {
							window.location = hrefObj.href;							
						}
					}));
				}
				
				var rowNode = dojo.create("div", {"class": "singleLine"}, childNode);

				// The child is set to refresh (i.e. info.graph is removed) in method this._insertTitle 
				//and therefor has to be performed last. 
				this._insertTitle(child, rowNode, null, hrefObj);
				dojo.addClass(childNode, "listEntry");
				dojo.toggleClass(childNode, "evenRow", number%2 != 0); //First row is 0, hence we mark number 1 as even.
			}
		});

		//Preparing the hrefObj for the child.
		if ((folio.data.isWebContent(child) || folio.data.isListLike(child) || 
			folio.data.isContext(child) || folio.data.isUser(child)) && child.isResourceAccessible()) {
			this.application.getHrefLinkLike(child, f);
		} else {
			f();
		}
	},
	_insertIcon: function(child, childNode, hrefObj) {
		var config = this.application.getConfig();
		if (hrefObj != null) {
			childNode = dojo.create("a", {"class": "iconCls", "href": hrefObj.href}, childNode);
			if (hrefObj.blankTarget) {
				dojo.attr(childNode, "target", "_blank");
			}
		}
		dojo.create("img", {"class": "iconCls", "src": config.getIcon(child, "16x16")}, childNode);
		if (folio.data.isLinkLike(child)) {
			dojo.create("img", {"class": "iconCls", style: {"position": "absolute", "left": "5px"}, "src": ""+config.getIcon("link", "16x16")}, childNode);
		}
	},
	_insertModifiedDate: function(child, childNode) {
		var mod = child.getModificationDate() || child.getCreationDate();
		mod = mod ? mod.slice(0,10) : "";
		dojo.create("div", {
				"class": "modCls", 
				"innerHTML": "<span class=\"modified\">" + this.resourceBundle.modified + "</span>:&nbsp;"+mod
			}, childNode);
	},
	_insertChildCountIfList: function(child, childNode) {
		if (folio.data.isListLike(child)) {
			var nr = folio.data.getChildCount(child);
			dojo.create("div", {
				"class": "modCls",
				"innerHTML": "<span class=\"modified\">" + this.resourceBundle.items + "</span>:&nbsp;"+(nr != undefined ? nr : "?")+"&nbsp;&nbsp;&nbsp;"
				}, childNode);
		}
	},
	_insertTitle: function(child, childNode, noDownload, hrefObj) {
		var rowOperations = dojo.create("div",  {"class": "rowOperations"}, childNode);
		
		if (hrefObj != null) {
		    if (noDownload == null && (child.getLocationType() == folio.data.LocationType.LOCAL && 
			  child.getBuiltinType() == folio.data.BuiltinType.NONE)  && !this.iconMode) {
				var download = dojo.create("a", {"href": child.getResourceUri()+"?download", "title": "Download", "class": "operation externalLink"}, rowOperations);
				dojo.create("span", {"class": "download operation icon"}, download);
		    }


			var aNode = dojo.create("a", {"href": hrefObj.href, "class": "titleCls", "innerHTML": folio.data.getLabel(child)}, childNode);
			if (hrefObj.blankTarget) {
				dojo.attr(aNode, "target", "_blank");
			}

			if (hrefObj.blankTarget && !this.iconMode) {
				var linkArrow = dojo.create("a", {"href": hrefObj.href, "target": "_blank", "title": "Open in new window or tab", "class": "externalLink"}, childNode);
				dojo.create("span", {"class": "external operation icon"}, linkArrow);
			}
		} else {
			dojo.create("span", {"class": "titleCls disabledTitleCls", "innerHTML": folio.data.getLabel(child)}, childNode);
		}
		if (this.openFolderLink && !this.iconMode) {
			dojo.create("span", {"class": "openfolder operation icon", "title": "Show in folder"}, rowOperations);
		}
		if (!this.iconMode && __confolio.config["possibleToCommentEntry"] === "true") {
			var comments = child.getComments();
			if (comments.length > 0) {
				dojo.create("span", {"title": ""+comments.length+" comments", "class": "comment operation icon"}, rowOperations);				
			}
		}
		if (this.detailsLink && !this.iconMode) {
			dojo.create("span", {"class": "details operation icon", "title": "Open details"}, rowOperations);
		}
		if (!this.iconMode) {
			dojo.create("span", {"class": "menu operation icon", "title": "Open menu"}, rowOperations);
		}
	},
	_insertDescription: function(child, childNode) {
		dojo.create("div", {"class": "descCls", "innerHTML": folio.data.getDescription(child).replace(/(\r\n|\r|\n)/g, "<br/>")}, childNode);
	},
	_getEditActions: function(child, callback) {
		var o = [];
		var isTrashFolder = child.getId() === "_trash";
		if (!this.user) {
			callback(o);
		}

		if (this.includeDetails) {
			o.push({action: "details", enabled: true, label: this.resourceBundle.details});
		}

		o.push({action: "edit", enabled: child.isMetadataModifiable(), label: this.resourceBundle.edit});
		o.push({action: "rename", enabled: child.isMetadataModifiable(), label: this.resourceBundle.rename});
		if (__confolio.config["possibleToCommentEntry"] === "true") {
			o.push({action: "comment", enabled: true, label: this.resourceBundle.comment}); //is not a system entry
		}
		o.push({action: "admin", enabled: child.possibleToAdmin(), label: this.resourceBundle.admin});
        o.push({action: "rights", enabled: child.possibleToAdmin(), label: this.resourceBundle.rights});
		o.push({action: "remove", enabled: (child.possibleToAdmin() && this.list.isResourceModifiable() && this.list.isMetadataModifiable), label: (isTrashFolder ? this.resourceBundle.empty : this.resourceBundle.remove)});
		o.push({action: "copy", enabled: (child.isMetadataAccessible() && child.isResourceAccessible() && !isTrashFolder), label: this.resourceBundle.copy}); //ChildMD and Resource is accessible
		o.push({action: "cut", enabled: child.possibleToAdmin() && !(child instanceof folio.data.SystemEntry), label: this.resourceBundle.cut}); //entry admin rights + not system entry

        if (child.getBuiltinType() == folio.data.BuiltinType.LIST && !this.isPasteIntoDisabled) {
            var cb = this.application.getClipboard();
			o.push({action: "paste", enabled: cb != null && cb.entry != null && child.isResourceModifiable(), label: this.resourceBundle.pasteInto});
		}

		//add to contacts is possible, remains to check if user is already in contacts (requires asynchrous call).
		if (child.getBuiltinType() == folio.data.BuiltinType.USER && this.user && this.user.homecontext) {
		    var homeContext = this.application.getStore().getContext(this.application.repository+this.user.homecontext);
			homeContext.loadEntryFromId("_contacts", {}, dojo.hitch(this, function (result) {
				//TODO, this check needs to be rewritten, depends on specific jdil format.
				if (result && result.resource && result.resource.children) {
					var childList=result.resource.children;
					for (var iter=0; iter<childList.length; iter++) {
						var mdStub=childList[iter].info["sc:resource"];
						if(mdStub&&mdStub["@id"] === childResUri){
							var isInContacts = true;
							break;
						}
					}
					o.push({action: "add", enabled: !isInContacts, label: this.resourceBundle.add});
				} else {
					o.push({action: "add", enabled: true, label: this.resourceBundle.add});
				}
				callback(o);
			}));
		} else {
			callback(o);
		}
	},
	_insertEditButtons: function(child, childNode) {
		var buts = dojo.create("div", {"class": "butsCls selected"}, childNode);
		this._getEditActions(child, function(eas) {
			dojo.forEach(eas, function(ea) {
				dojo.create("span", {"class": ea.action+" link "+(ea.enabled ?  "" : "disabledEntryButton"), "innerHTML": ea.label}, buts);
			});
		});
	},
	_insertEntryAsIcon: function(child, childNode, number) {
		var iconStr;
		var config = this.application.getConfig();
		if (this.list.getId() == "_systemEntries") {
			iconStr = this._entry2Icon[child.getId()];
			if (iconStr) {
				iconStr = ""+dojo.moduleUrl("folio", "icons_oxygen/"+ iconStr +".png");
			} else {
				iconStr = config.getIcon(child);					
			}
		} else {
			iconStr = config.getIcon(child);
		}
		if (iconStr) {
			dojo.addClass(childNode, "iconView");
			dojo.connect(childNode,"ondblclick", dojo.hitch(this.application, function() {
					this.application.publish("showEntry", {entry: child});
				}));
			
			var label = folio.data.getLabel(child);
			dojo.create("img", {src: iconStr}, childNode);

			if (folio.data.isLinkLike(child)) {
				dojo.create("img", {"class": 'iconCls', "style": {"position": "absolute", "left": 0}, "src": ""+config.getIcon("link", "16x16")}, childNode);
			}
			this._insertTitle(child, childNode, true);
//			dojo.create("div", {"class": "entryLabel", "innerHTML": label}, childNode);
		}
	},
	_insertIcons: function() {
		folio.data.getAllChildren(this.systemEntries, dojo.hitch(this, function(children) {
			this.icons.innerHTML = "";
			for (var i=0;i<children.length;i++) {
				var entry = children[i];
				var iconStr = this._entry2Icon[entry.getId()];
				if (iconStr) {
					var div = document.createElement("div");
					if (this.selectedEntryId == entry.getId()) {
						dojo.toggleClass(div, "selected");
						this.selectedDiv = div;
					}
					dojo.connect(div, "onclick", dojo.hitch(this, this.select, div, entry));
					var src = ""+dojo.moduleUrl("folio", "icons_oxygen/"+ iconStr +".png");
					var label = folio.data.getLabel(entry);
					div.innerHTML="<img src='"+src+"'/><br/><center>"+label+"</center>";
					this.icons.appendChild(div);
				}
			}
		}));
	}
});
