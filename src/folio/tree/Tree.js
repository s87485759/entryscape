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

dojo.provide("folio.tree.Tree");
dojo.require("folio.tree.TreeModel");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout._LayoutWidget");
dojo.require("dijit.Tree");
dojo.require("folio.Application");
dojo.require("dojox.layout.ExpandoPane");
dojo.require("dojox.html.metrics");

dojo.declare("folio.tree.Tree", [dijit.layout._LayoutWidget, dijit._Templated, folio.ApplicationView], {
	// A very simple list view using a table where every item 
	// in the list is listed on one row.
	//
	context: null,
	initialized: false,
	showing: false,
	
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("folio.tree", "TreeTemplate.html"),
	constructor: function(args) {
	},
	getSupportedActions: function() {
		return ["changed", "deleted", "childrenChanged", "clear", "showEntry", "userChange", "localeChange", "viewState"];
	},

	resize: function() {
		this.inherited("resize", arguments);
		this.pinnedTreeDijit.resize();
		this._resizeFloatingTree();
	},
	handle: function(event) {
		switch(event.action) {
		case "changed":
			this.tree._onItemChange(event.entry);
			break;
		case "deleted":
			this.tree._onItemDelete(event.entry);
			break;
		case "childrenChanged":
			this.tree.model.getChildren(event.entry, dojo.hitch(this, function(children) {
				this.tree._onItemChildrenChange(event.entry, children);
			}));
		case "userChange":
			if (this.context != null) {
				this.initTree(this.context.getId());
			}
			break;
		case "showEntry":
			var newList = event.list || event.entry;
			if (this.folderItem != null &&  newList != null && this.folderItem.getUri() === newList.getUri()) {
				return;
			}
			var newContext = folio.data.isContext(newList) ? newList.getId() : newList.getContext().getId();

			if (!this.tree || (this.contextId !== newContext)) {
				this.initTree(newContext);
			}
			this.folderItem  = newList;	
			this.expandToNode(newList, dojo.hitch(this, function() {
				this.tree.set("selectedItems", [newList]);
/*				var treeNodeArr = (this.tree._itemNodeMap || this.tree._itemNodesMap)[this.tree.model.getIdentity(newList)];
				if (treeNodeArr && treeNodeArr.length > 0) {
					this.tree.set("selectedNode", treeNodeArr[0]);
					//this.tree._selectNode(treeNodeArr[0]);
				}*/
			}));
			break;
		case "clear":
			if (this.tree) {
				this.pinnedTreeDijit.removeChild(this.ePane);
				this.tree = null;
			}
			break;
		case "localeChange":
			if (this.tree) {
				if (this.ePane) {
					this.pinnedTreeDijit.removeChild(this.ePane);
				}
				this.tree = null;
			}
			if (this.initialized) {
				this.initTree(this.context.getId());
			}
			break;
		case "viewState":
			if (event.treeVisible === true) {
				this.showTree();				
			} else if (event.treeVisible === false) {
				this.hideTree();
			}
			break;
		}
	},
	showTree: function() {
		if (this.pinned) {
			this.floatTree();
		}
		this.showing = true;
		dojo.style(this.floatingTreeNode, "display", "");
		this.tree.resize();
		this._resizeFloatingTree();
		var left = -dojo.marginBox(this.floatingTreeNode).w;
		dojo.style(this.floatingTreeNode, "left", left);
		dojo.animateProperty({node: this.floatingTreeNode, 
							  properties:  {left: 0},
							  duration: 500
        			 }).play();
	},
	hideTree: function() {
		if (this.pinned) {
			this.floatTree();
		}
		dojo.animateProperty({node: this.floatingTreeNode, 
							  properties:  {left: -dojo.marginBox(this.floatingTreeNode).w},
							  duration: 500,
							  onEnd: dojo.hitch(this, function() {
							  			dojo.style(this.floatingTreeNode, "display", "none");
							  })
        			 }).play();
		this.showing = false;
	},
	togglePinTree: function() {
		if (this.pinned) {
			this.floatTree();
		} else {
			this.pinTree();
		}
	},
	floatTree: function() {
		this.pinnedTreeDijit.removeChild(this.ePane);
		dojo.place(this.movableBlockNode, this.floatingTreeNode, "first");
		dojo.style(this.floatingTreeNode, "display", "");
		this.pinned = false;
		var config = this.application.getConfig();
		dojo.attr(this.pushpinNode, "src", config.getIcon("pushpin", "22x22"));
		this._resizeFloatingTree();
	},
	pinTree: function() {
		var width = dojo.marginBox(this.floatingTreeNode).w+dojox.html.metrics.getScrollbar().w;
		this.ePane = new dijit.layout.ContentPane({splitter: true, style: "width: "+width+"px", region: "left"});
		this.pinnedTreeDijit.addChild(this.ePane);
		var div = dojo.create("div", {"class": "pinnedNode"});
		this.ePane.attr("content", div);
		dojo.place(this.movableBlockNode, div, "first");
		dojo.style(this.floatingTreeNode, "display", "none");
		this.pinned = true;
		var config = this.application.getConfig();
		dojo.attr(this.pushpinNode, "src", config.getIcon("pushpin_pressed", "22x22"));
	},
	expandToNode: function(entry, callback) {
		var expand = dojo.hitch(this, function(branch, index) {
			if (index >= branch.length-1) {
				callback();
				return;
			}
			var treeNodeArr = (this.tree._itemNodeMap || this.tree._itemNodesMap)[this.tree.model.getIdentity(branch[index])];
			if (treeNodeArr && treeNodeArr.length > 0) {
				var node = treeNodeArr[0];
				if (node.isExpanded) {
					expand(branch, index+1);
				} else {
					this.tree._expandNode(node).addCallback(function() {
						expand(branch, index+1);
					});
				}				
			}
		});		
		entry.getContext().getEntryBranch(entry, function(branch) {
			expand(branch, 0);
		});
	},
	initTree: function(contextId) {
		this.initialized = true;
		this.contextId = contextId;
		this.context = this.application.getStore().getContextFor({base: this.application.getRepository(), contextId: contextId, entryId: "_top"});
		var treeModel = new folio.tree.TreeModel({store: this.store, application: this.application, onlyLists: true, 
			context: this.context,root: null});
		if (this.tree != null) {
			this.tree.destroy();
		}
		this.tree = new dijit.Tree({region: "left", model: treeModel, persist: false, showRoot: false,
					onClick: dojo.hitch(this, function(entry) {
						if (folio.data.isLinkLike(entry)) {
							folio.data.getLinkedLocalEntry(entry, dojo.hitch(this, function(linkedEntry) {
								window.location = this.application.getHref(linkedEntry);
							}));
						} else {
							window.location = this.application.getHref(entry);
						}
//						this.application.openEntry(entry);
					}),
					onLoad: dojo.hitch(this, this._resizeFloatingTree)
				}, dojo.create("div", null, this.treeNode));
		this.tree.startup();
	},
	postCreate: function() {
		this.inherited("postCreate", arguments);
        this.pinnedTreeDijit.set("gutters", false);
		dojo.style(this.floatingTreeNode, "opacity","0.90");
		dojo.style(this.floatingTreeNode, "left", "-400px");
		var config = this.application.getConfig();
		dojo.attr(this.pushpinNode, "src", config.getIcon("pushpin", "22x22"));
		dojo.connect(this.pushpinNode, "onclick", this, this.togglePinTree);
	},
	_resizeFloatingTree: function() {
		if (this.showing === false) {
			return;
		} 
		var containerBox = dojo.marginBox(this.domNode);
		dojo.style(this.floatingTreeNode, "width", "auto");
		var treeBox = dojo.marginBox(this.floatingTreeNode);

//		if (treeBox.h > containerBox.h) {
//			dojo.marginBox(this.floatingTreeNode, {h: containerBox.h, w: treeBox.w+dojox.html.metrics.getScrollbar().w});
		dojo.marginBox(this.floatingTreeNode, {h: containerBox.h});
//		} else {
	//		dojo.marginBox(this.floatingTreeNode, {h: containerBox.h});
		//}
	}
});