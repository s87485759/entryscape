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
dojo.require("folio.list.EditBar");
dojo.require("folio.list.Pagination");
dojo.require("dojo.fx");
dojo.require("folio.entry.Details");
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
	rounded: false,
	isPasteDisabled: true,
	isPasteIntoDisabled: true,
	titleClickFirstExpands: false,
	floatingExpand: true,
	selectionExpands: false,
	childAnimationDuration: 40,
	useAnimations: false,
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
	setPasteDisabled: function(disabled) {
		this.isPasteDisabled = disabled;
		var pasteElt = dojo.query(".paste", this.listHeadDijit.containerNode);
		if (disabled) {
		    pasteElt.addClass("disabledEntryButton");
		} else {
		    pasteElt.removeClass("disabledEntryButton");
		}
	},
	setPasteIntoDisabled: function(disabled) {
		this.isPasteIntoDisabled = disabled;
		var pasteElts = dojo.query(".paste", this.listChildrenDijit.containerNode);
		if (disabled) {
		    pasteElts.addClass("disabledEntryButton");
		} else {
		    pasteElts.removeClass("disabledEntryButton");
		}
	},

	//=================================================== 
	// Inherited methods 
	//===================================================
	constructor: function() {
		this.editBar = new folio.list.EditBar({list: this});
		this.pagination = new folio.list.Pagination({list: this});
	},
	postCreate: function() {
		this.inherited("postCreate", arguments);
		if (this.headLess) {
			this.borderContainerDijit.removeChild(this.listHeadDijit);
		}
		if (this.controlsLess) {
			dojo.style(this.listControlsDijit.domNode, "display", "none");
		}
		
		dojo.connect(dojo.doc, "keypress", dojo.hitch(this, this.handleKeyPress));
		dojo.addClass(this.listControlsNode, "editBar");
		this.listControlsNode.appendChild(this.editBar.domNode);
		this.listPaginationNode.appendChild(this.pagination.domNode);
		if (this.rounded) {
			dojo.addClass(this.domNode, "roundedList");
		} else {
			dojo.addClass(this.domNode, "cleanList");			
		}
		if (this.floatingExpand) {
			dojo.addClass(this.domNode, "floatingExpand");
		}
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
		this.editBar.setActiveFolder(folderEntry);
		this.selectedIndex = -1;
		this.faded = false;
		this.newChildren = null;
		folio.data.getList(folderEntry, dojo.hitch(this, function(list) {
			//The if-case is to cover up when the list-entry is actually is a reference to a list-Entry
			//which means that the folder/list in the UI is entered via a reference and therefore some adjustments have to be made
			if(folio.data.isReference(folderEntry) && this.application.repository && folderEntry.getExternalMetadataUri().indexOf(this.application.repository,0)>-1){
				this.list = list.entry;
			}
			this.editBar.setActiveFolder(this.list);
			var p = page != undefined ? page : 0;
			this.currentPage = p;
			list.getPage(p, 0, dojo.hitch(this, function(children) {
			this.pagination.update(list, p);
				this.newChildren = children;
				if (this.faded) {
					this._rebuildList();
					if (callback) {
						callback();
					}
				}
			this.editBar.updateButtons();
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
		if (!this.useAnimations || this.iconMode || this.selectionExpands === false) {
			if (this.selectedIndex != -1) {
				var hideNode = this.listNodes[this.selectedIndex];
				dojo.removeClass(hideNode, "selected");
				if (!this.iconMode && this.selectionExpands !== false) {
					var hideExpandNode = dojo.query(".expandCls", hideNode)[0];
					dojo.style(hideExpandNode, "display", "none");
					dojo.style(hideExpandNode, "height", "0px");
				}
			}
			this.doChangeFocus(index, dontPublish);
			if (index != -1) {
				var showNode = this.listNodes[index];
				dojo.addClass(showNode, "selected");
				if (!this.iconMode  && this.selectionExpands !== false) {
					var showExpandNode = dojo.query(".expandCls", showNode)[0];
					dojo.style(showExpandNode, "display", "");
					dojo.style(showExpandNode, "height", "70px");
				}
			}
		} else {
			this.focusBlock = true;
			if (index != -1) {
				var showNode = this.listNodes[index];
				var showExpandNode = dojo.query(".expandCls", showNode)[0];
				var showAnim = dojo.animateProperty({
						node:showExpandNode,
					duration: this.childAnimationDuration,
						properties: {
							height: 70
						},
					beforeBegin: dojo.hitch(this, function() {
						dojo.addClass(showNode, "selected");
						dojo.style(showExpandNode, "display", "");
					}),
					onEnd: dojo.hitch(this, function() {
						this.focusBlock = false;
						this.doChangeFocus(index, dontPublish);
					})
				});
			}
			if (this.selectedIndex != -1) {
				var hideNode = this.listNodes[this.selectedIndex];
				var hideExpandNode = dojo.query(".expandCls", hideNode)[0];
				var hideAnim = dojo.animateProperty({
						node:hideExpandNode,
					duration: this.childAnimationDuration,
						properties: {
		  				height: 0
						},
					onEnd: dojo.hitch(this, function() {
						dojo.removeClass(hideNode, "selected");
						dojo.style(hideExpandNode, "display", "none");
						if (index == -1) {
							this.focusBlock = false;
							this.doChangeFocus(index, dontPublish);
						}
					})
				});
			}
			
			if (index != -1 && this.selectedIndex != -1) {
				if (this.floatingExpand) {
	//				dojo.fx.combine([hideAnim, showAnim]).play();				
					dojo.fx.chain([hideAnim, showAnim]).play();
				} else {
					dojo.fx.combine([hideAnim, showAnim]).play();				
				}
			} else if (index != -1) {
				showAnim.play();
			} else if (this.selectedIndex != -1){
				hideAnim.play();
			}
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
	showDetails: function(detailsNode, entry) {
		var viewport = dijit.getViewport();
		var width = Math.floor((viewport.w < 600 ? viewport.w: 600 ) * 0.70),
			height = Math.floor((viewport.h < 700 ? viewport.h: 700) * 0.70);
		folio.util.launchToolKitDialog(detailsNode, function(innerNode, onReady) {
			dojo.style(innerNode, {
										width: width+"px",
                                        height: height +"px",
                                        overflow: "auto",
                                        position: "relative"    // workaround IE bug moving scrollbar or dragging dialog
				});

			dojo.addClass(innerNode, "confolio");
			dojo.addClass(innerNode, "mainPanel");
			var details = new folio.entry.Details({
					application: __confolio.application,
					style: {"width": "100%", "height": "100%"},
					doFade: false
				}, dojo.create("div", {}, innerNode));
			details.startup();
			if (folio.data.isListLike(entry)) {
				details._parentListUrl = entry.getUri();
			} else 	if (folio.data.isContext(entry)) {
				details._parentListUrl = entry.getContext().getBaseURI()+entry.getId() +"/entry/_systemEntries";
			}
			details.editContentButtonDijit.set("label", "Edit");
			details.update(entry);
			details.contentViewDijit.show(entry);
			//Make sure that someDijit is finished rendering, or at least has some realistic size before making the following calls.
			dijit.focus(details.domNode);
			onReady();
			details.resize();
		}, {x: viewport.w-75, y: 100, noArrow: true});
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
		
		if (this.titleClickFirstExpands) {
			dojo.addClass(childrenContainer, "titleClickFirstExpands");
		}
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
		if (!this.user) {
			dojo.style(this.editBar.domNode, "display", "none");
		} else {
			dojo.style(this.editBar.domNode, "display", "");
		}
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


		//Buttons and description (include when children has buttons on expand)
		if (this.selectionExpands === true) {
			//Description
			dojo.create("div", {"class": "descCls", "innerHTML": desc.replace(/(\r\n|\r|\n)/g, "<br/>")}, headContainer);
			
			var buts = dojo.create("div", {"class": "butsCls"}, headContainer);
			if (this.includeDetails) {
				dojo.create("span", {"class": "details", "innerHTML": this.resourceBundle.details}, buts);
			}
			if (this.user) {			
				//Comment
				if (__confolio.config["possibleToCommentEntry"] === "true") {
					var isNotSystemEntry = !(this.list instanceof folio.data.SystemEntry) ? "" : "disabledEntryButton";
					dojo.create("span", {
						"class": "comment link " + isNotSystemEntry,
						"innerHTML": this.resourceBundle.comment
					}, buts);
				}	
				//Edit
				var listMDModifiable = this.list.isMetadataModifiable() ? "": "disabledEntryButton";
				dojo.create("span", {"class": "edit link "+listMDModifiable, "innerHTML": this.resourceBundle.edit}, buts);
				
				//Admin
				var hasListAdminRights = this.list.possibleToAdmin() ? "" : "disabledEntryButton";
				dojo.create("span", {"class": "admin link "+hasListAdminRights, "innerHTML": this.resourceBundle.admin}, buts);
				
				//Empty trash
				if (this.list.getId() == "_trash") {
					var removeNode = dojo.create("span", {"class": "remove link disabledEntryButton", "innerHTML": this.resourceBundle.empty}, buts);
					this.list.getContext().getOwnEntry(dojo.hitch(this,function(contextEntry){
						if(contextEntry.possibleToAdmin() && folio.data.getChildCount(this.list) !== 0) {
							//Only allowed if owner of context and there is something to empty.
							dojo.removeClass(removeNode, "disabledEntryButton");
						}
					}));
				}
				
				//Copy
				var listMDAndResAccessible = (this.list.isMetadataAccessible() && this.list.isResourceAccessible()) ? "": "disabledEntryButton";
				dojo.create("span", {"class": "copy link "+listMDAndResAccessible, "innerHTML": this.resourceBundle.copy}, buts);
				
				//Cut
				var hasListAdminRightsAndNotSystemEntry = this.list.possibleToAdmin() && !(this.list instanceof folio.data.SystemEntry)? "" : "disabledEntryButton";
				dojo.create("span", {"class": "cut link "+hasListAdminRightsAndNotSystemEntry, "innerHTML": this.resourceBundle.cut}, buts);
	
				//Paste			
				var pasteAllowed = this.isPasteDisabled && this.list.isResourceModifiable() ? "disabledEntryButton" : "";
				dojo.create("span", {"class": "paste link "+pasteAllowed, "innerHTML": this.resourceBundle.paste}, buts);
			}
		}

		//Sorter and Refresher
		var listControls = dojo.create("div", {"class": "expandCls"}, headContainer);
		//Head Metadata
		var nr = folio.data.getChildCount(this.list);
		var childCount = this.resourceBundle.items+":&nbsp;"+(nr != undefined ? nr : "?");
/*		var mod = this.list.getModificationDate();
		mod = mod ? mod : this.list.getCreationDate();
		mod = mod ? mod.slice(0,10) : "";
		mod = this.resourceBundle.modified + ":&nbsp;"+mod;*/
//		dojo.create("div", {"class": "expandTopCls", "innerHTML": childCount+"&nbsp;&nbsp;&nbsp;"+mod}, headContainer);
		dojo.create("span", {"class": "sortCls", style: {"verticalAlign": "middle", "margin-right": "1em"}, "innerHTML": childCount}, listControls);
		
		this._insertSorter(dojo.create("div", {"class": "sortCls"}, listControls));
		this._insertRefreshButton(dojo.create("span", {"class": "icon refresh"}, listControls));
		
		var comments = mde.getComments();
		if (comments.length > 0) {
			dojo.create("span", {"title": ""+comments.length+" comments", "class": "comment operation icon"}, listControls);			
		}
		dojo.create("span", {"class": "menu operation icon"}, listControls);		

		dojo.connect(headContainer, "oncontextmenu", dojo.hitch(this, this.showMenu, mde, -1));
		dojo.connect(headContainer, "onclick", dojo.hitch(this, this.handleEvent, -1));
		this.listHeadDijit.set("content", headContainer);
	},
	_insertSorter : function(sortNode) {
		dojo.create("span", {style: {"verticalAlign": "middle"}, innerHTML: this.resourceBundle.sortLabel+":&nbsp;"}, sortNode);
		this.orderChanger = new dijit.form.FilteringSelect({name: "orderChanger", searchAttr: "label", autocomplete: true, style: "width:8em;vertical-align: middle"}, 
			dojo.create("select", null, sortNode));
					
		if (this.orderConnector) {
			dojo.disconnect(this.orderConnector);
		} else {
			this.order = "title"			
		}
		this.orderChanger.set("store", new dojo.data.ItemFileReadStore({
            data: {identifier: "value", items: [{value:"none", label: this.resourceBundle.sortByNone},
						   {value:"title", label: this.resourceBundle.sortByTitle},
						   {value:"titleD", label: this.resourceBundle.sortByTitleReverse},
						   {value:"modified", label: this.resourceBundle.sortByModified},
						   {value:"modifiedD", label: this.resourceBundle.sortByModifiedReverse}]}
        }));
		this.orderChanger.set("value", this.order);
		this.orderConnector = dojo.connect(this.orderChanger, "onChange", this, this._changeOrderClicked);
	},
	_changeOrderClicked: function() {
		if (this.order == this.orderChanger.get("value")) {
			return;
		}
		this.order = this.orderChanger.get("value");
		switch(this.order) {
			case "title":
				this.application.getCommunicator().setSort({sortBy: "title", prio: "List"});
				break;
			case "modified":
				this.application.getCommunicator().setSort({sortBy: "modified", prio: "List"});
				break;
			case "titleD":
				this.application.getCommunicator().setSort({sortBy: "title", prio: "List", descending: true});
				break;
			case "modifiedD":
				this.application.getCommunicator().setSort({sortBy: "modified", prio: "List", descending: true});
				break;
			case "none":
				this.application.getCommunicator().setSort({});
		}
		dojo.publish("/confolio/orderChange", [{}]);
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
				if (this.selectionExpands === true) {
					var expandable = dojo.create("div", {"class": "expandCls selected"}, childNode); //Adding the selected class since not right background otherwise when in floating mode
					this._insertDescription(child, expandable);
					var bottomInfo = dojo.create("div", {"class": "bottomInfo selected"}, expandable);
					this._insertChildCountIfList(child, bottomInfo);
					this._insertModifiedDate(child, bottomInfo);
					this._insertEditButtons(child, expandable);
				}
				
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
			this.getHrefForEntry(child, f);
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

			if (this.titleClickFirstExpands) {
				var sNode = dojo.create("span", {"class": "titleCls", "innerHTML": folio.data.getLabel(child)}, childNode);
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
		if (!this.selectionExpands && !this.iconMode) {
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
		o.push({action: "remove", enabled: (child.possibleToAdmin() && this.list.isResourceModifiable() && this.list.isMetadataModifiable), label: (isTrashFolder ? this.resourceBundle.empty : this.resourceBundle.remove)});
		o.push({action: "copy", enabled: (child.isMetadataAccessible() && child.isResourceAccessible() && !isTrashFolder), label: this.resourceBundle.copy}); //ChildMD and Resource is accessible
		o.push({action: "cut", enabled: child.possibleToAdmin() && !(child instanceof folio.data.SystemEntry), label: this.resourceBundle.cut}); //entry admin rights + not system entry
		if (child.getBuiltinType() == folio.data.BuiltinType.LIST && !this.isPasteIntoDisabled) {
			o.push({action: "paste", enabled: child.isResourceModifiable(), label: this.resourceBundle.pasteInto});
		}

		//add to contacts is possible, remains to check if user is already in contacts (requires asynchrous call).
		if (child.getBuiltinType() == folio.data.BuiltinType.USER && this.user.homecontext) {
		    var homeContext = this.application.getStore().getContext(this.application.repository+this.user.homecontext);
			homeContext.loadEntryFromId("_contacts", {}, dojo.hitch(this, function (result) {
				//TODO, this check needs to be rewritten, depends on specific jdil format.
				if (result && result.resource && result.resource.children) {
					var userResUri = user.getResourceUri();
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
