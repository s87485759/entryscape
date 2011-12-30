dojo.provide("folio.navigation.Breadcrumbs");
dojo.require("folio.Application");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.Button");
dojo.require("dijit.layout._LayoutWidget");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.TooltipDialog");
dojo.require("dojox.collections.SortedList");
dojo.require("dojox.collections.Dictionary");
dojo.require("folio.navigation.CommandLine");
dojo.require("folio.navigation.FDO");
	
/**
 * Provides a breadcrumb list where you can see the folder hierarchy.
 * You can switch between the folders in the current branch without 
 * the breadcrumbs being cut of, the selected folder is shown as pressed.
 * Before every breadcrumb there is a dropdown dialog which allows you to see 
 * and select other folders on the same level.
 */
dojo.declare("folio.navigation.Breadcrumbs", [dijit.layout._LayoutWidget, dijit._Templated, folio.navigation.FDO, folio.ApplicationView], {
	 
	//=================================================== 
	// Inherited Attributes 
	//=================================================== 
	templatePath: dojo.moduleUrl("folio.navigation", "BreadcrumbsTemplate.html"),
	widgetsInTemplate: true, //Because Details has subwidgets

	//=================================================== 
	// Internal Attributes 
	//===================================================	 
	_listListMode: true,
	_CLIMode: false,
	_crumbChoices: null,

	//=================================================== 
	// Public API 
	//===================================================	 
	setCurrentFolder: function(folderEntry) {
		if (folderEntry.getId() == "_systemEntries") {
			folderEntry.getContext().getOwnEntry(dojo.hitch(this, this.setCurrentFolder));
		} else {
			this._setCurrentFolder(folderEntry);
		}
	},
	 
	//=================================================== 
	// Inherited methods 
	//=================================================== 
	constructor: function(args) {
		this.stack = [];
	},
	getSupportedActions: function() {
		return ["changed", "deleted", "clear", "showEntry", "userChange", "localeChange"];
	},	
	resize: function(size) {
		this.inherited("resize", arguments);		
		if (this._CLIMode) {
			var box = dojo.contentBox(this.domNode);
			var bbox = dojo.contentBox(this.bcNode);
			dojo.marginBox(this.CLIDijit.domNode, {w: box.w, h: box.h-bbox.h});
			this.CLIDijit.resize();
		}
	},
	handle: function(event) {
		switch (event.action) {
		case "localeChange":
			this._localize();
			break;
		case "showEntry":
			if (!event.list) { //Avoid focus events within current list.
				this.setCurrentFolder(event.entry);
			} else if (this.current === null) {
				this.setCurrentFolder(event.list);				
			} else if (this.current !== event.list){
				this.setCurrentFolder(event.list);
			}
			break;
		case "deleted":
		case "clear":
			if (this.stack.length> 0) {
				this.application.getStore().loadEntry(this.stack[this.stack.length-1].getEntryUri(), 
					{limit: 0, sort: null}, dojo.hitch(this, this.setCurrentFolder));
			} 
			break;
		case  "userChange":
			//TODO
			break;
		}
	},
	setApplication: function() {
		this.inherited("setApplication", arguments);
		this.init();
	},
	postCreate: function() {
		this.containerNode = this.domNode;
		this.inherited("postCreate", arguments);
		this.afterPostCreate = true;
		this.init();
	},
	init: function() {
		if (this.application === undefined || this.afterPostCreate === undefined) {
			return;
		}
		this.application.getStore().loadEntry(this.application.repository+"_contexts/entry/_all", 
		{},
		dojo.hitch(this, function(entry) {
			if (folio.data.isList(entry)) {
				var f = function(children) {
					var nchilds = dojo.map(children, function(child) {
			    		var alias = child.alias;
			    		return {entryId: child.getId(), hasAlias: alias != undefined, alias: alias || child.getId()};
			    	});
				};
				folio.data.getAllChildren(entry, dojo.hitch(this, f));
			}
		}),
		null);
		this._localize();
		this._listListMode = true;
		dojo.toggleClass(this.listListModeNode, "selected");

		if (this.application.getConfig()["CLI"] === "true") {
			dojo.style(this.CLIModeNode, "display", "");
			dojo.attr(this.CLIModeNode, "src", dojo.moduleUrl("folio", "icons_oxygen/22x22/shellscript.png"));
			dojo.connect(this.CLIModeNode, "onclick", this, this._toggleCLIMode);
			this.CLIDijit.fdo = this;			
		}
	},
	/**
	 * @see folio.navigation.FDO#cdEntryUri
	 */
	cdEntryUri: function(entryUri, callback) {
		if (entryUri == this.stack[0].getUri()) {
			this.application.dispatch({action: "showContext", entry: this.stack[index]});
		} else {
			this.application.dispatch({action: "showEntry", entry: entryUri});			
		}
		callback(this.code.SUCCESS);
	},

	 
	//=================================================== 
	// Private methods 
	//===================================================	
	_toggleTree: function() {
		this.treeVisible = !this.treeVisible;
		dojo.toggleClass(this.showTreeNode, "distinctBackground");
		if (this.treeVisible) {
			this.application.publish("viewState", {treeVisible: true});
		} else {
			this.application.publish("viewState", {treeVisible: false});
		}
	},
	_showListLikeList: function() {
		if (this._listListMode) {
			return;
		}
		this._listListMode = true;
		dojo.toggleClass(this.listListModeNode, "distinctBackground");
		dojo.toggleClass(this.iconListModeNode, "distinctBackground");
		this.application.publish("viewState", {listViewMode: "list"});
	},
	_showListLikeIcons: function() {
		if (!this._listListMode) {
			return;
		}
		this._listListMode = false;
		dojo.toggleClass(this.listListModeNode, "distinctBackground");
		dojo.toggleClass(this.iconListModeNode, "distinctBackground");
		this.application.publish("viewState", {listViewMode: "icon"});
	},
	_toggleCLIMode: function() {
		if (this._CLIMode) {
			this._CLIMode = false;
			dojo.style(this.CLIDijit.domNode, "display", "none");
			dojo.style(this.domNode, "height", "");
		} else {
			this._CLIMode = true;
			dojo.style(this.CLIDijit.domNode, "display", "");
			dojo.style(this.domNode, "height", "100%");
		}
		dojo.toggleClass(this.CLIModeNode, "selected");
		this.getParent().resize();
	},
	_localize: function() {
		dojo.requireLocalization("folio", "overview");
		var resourceBundle = dojo.i18n.getLocalization("folio", "overview");
		this.set(resourceBundle);
	},

	_setCurrentFolder: function(folderEntry) {
		if (this.choicesDialogDijit) {
			dijit.popup.close(this.choicesDialogDijit);
		}
		this.current = folderEntry;
		if (dojo.indexOf(this.stack, folderEntry) != -1) {
			this._draw();
			return;
		}
		if (folio.data.isContext(folderEntry)) {
			this.stack = [folderEntry];			
			this._draw();
			return;
		}
		var parentUri = folderEntry.getReferrents()[0];
		var parentLocation = -1;
		dojo.forEach(this.stack, function(parent, index) {
			if (parent.getResourceUri() === parentUri) {
				parentLocation = index;
			}
		});
		if (parentLocation == -1) {
			//no connection, to the current breadcrumb, reset and find the new parents
			this.stack = [folderEntry];
			this._findParents(folderEntry);
		} else if (parentLocation == this.stack.length-1) {
			//Went into a subfolders of the last breadcrumb.
			this.stack.push(folderEntry);
			this._draw();
		} else {
			//Went into a subfolder of some of the breadcrumbs.
			this.stack = this.stack.slice(0, parentLocation+1);
			this.stack.push(folderEntry);
			this._draw();			
		}
	},
	
	/**
	 * The entry is added to the stack, find and also add its parents to the stack. 
	 */
	_findParents: function(entry) {
		var referents = entry.getReferrents();
		if (entry instanceof folio.data.SystemEntry || referents.length == 0) {
			if (entry.getId() != "_systemEntries") {
				entry.getContext().getOwnEntry(dojo.hitch(this, function(contextEntry) {
					this.stack.splice(0,0,contextEntry);
					this._draw();				
				}));
			}
			return; //at the top of the branch.
		}
		this.application.getStore().loadEntry(referents[0], {limit: 0, sort: null}, dojo.hitch(this, function(parent) {
			this.stack.splice(0,0,parent);
			this._findParents(parent);
		}));
	},
	_draw: function() {
		//draw the breadcrumbs.
		dojo.attr(this.breadcrumbs, "innerHTML", "");
		if (this.crumbDijits) {
			dojo.forEach(this.crumbDijits, function(inst) {inst.destroy();});
		}
		this.crumbDijits = [];
		var trail = false;
		dojo.forEach(this.stack, dojo.hitch(this, function(crumb, index) {
			var label = index == 0 ? this._getContextLabel(crumb): folio.data.getLabel(crumb);
			var cls = crumb == this.current ? "label selected" : "label";
			var crumbNode = dojo.create("div", {"class": "crumb"}, this.breadcrumbs);
			if (index === 0) {
				dojo.create("span", {"class": "crumbSeparatorRectangular distinctBackground"}, crumbNode);
			} else {
				var arrow = dojo.create("span", {"class": "crumbSeparatorArrow distinctBackground"}, crumbNode);
				dojo.create("div", null, arrow);
			}
			var sep = dojo.create("span", {"class": "icon menu"}, crumbNode);
			dojo.connect(sep, "onclick", dojo.hitch(this,this._showChoicesDialog, sep, crumbNode));
			if (crumb == this.current) {
				trail = true;
				dojo.create("span", {innerHTML: label}, crumbNode);
			} else {
				var ael = dojo.create("a", {innerHTML: label, href: this.application.getHref(crumb, "default")}, crumbNode);
				if (trail) {
					dojo.addClass(ael, "trail");
				}				
			}
			//this.crumbDijits.push(new dijit.form.Button({label:label},dojo.create("div", null, crumbNode)));
//			arr.push("<span class='crumb'><span class='choices'><span class='choicesLabel'>▼</span></span><span class='"+cls+"'>"+label+"</span></span>");
		}));
	},
	_showChoicesDialog: function(sep, crumb) {
		var index = dojo.indexOf(this.breadcrumbs.children, crumb);

		var f = dojo.hitch(this, function(entry) {
			folio.data.getChildren(entry, dojo.hitch(this, function(children) {
				var prepareDialog = dojo.hitch(this, function(innerNode, onReady) {
					if(children && children.length>0){
						if (children.length > 20) {
							dojo.style(innerNode, "height", "300px");
							dojo.style(innerNode, "overflow", "auto");
						}
						children.sort(dojo.hitch(this, function(a,b){
							var aa=folio.data.getLabel(a);
							var bb=folio.data.getLabel(b);
							if(aa>bb){
								return 1
							} else if (aa<bb){
								return -1										
							} else {
								return 0
							}
						}
						));
					}
					dojo.forEach(children, function(child, index) {
						if (this.current === child) {
							dojo.create("span", {innerHTML: folio.data.getLabel(child)}, innerNode);
						} else {
							dojo.create("a", {href: this.application.getHref(child), innerHTML: folio.data.getLabel(child)}, innerNode);						
						}
						dojo.create("br", {}, innerNode);
					}, this);
					dijit.focus(innerNode);
					onReady();
				});
				this.choicesDialogDijit = folio.util.launchToolKitDialog(sep, prepareDialog);				
			}));
		});
		if (index > 1) {
			f(this.stack[index-1]);
		} else if (index == 1) {
			//TODO: for unlisted folders this will not work... 
			this.application.getStore().loadEntry(this.stack[index].getContext().getUri()+"/entry/_systemEntries", {limit: 0, sort: null}, f);
		} else  if (index == 0){
			f = dojo.hitch(this, function(entry) {
				folio.data.getAllChildren(entry, dojo.hitch(this, function(children) {
					var prepareDialog = dojo.hitch(this, function(innerNode, onReady) {
 						
						if (children.length > 20) {
							dojo.style(innerNode, "height", "300px");
							dojo.style(innerNode, "overflow", "auto");
						}
						children.sort(dojo.hitch(this, function(a,b){
							var aa= this._getContextLabel(a).toLowerCase();
							var bb= this._getContextLabel(b).toLowerCase();
							if(aa>bb){
								return 1
							} else if (aa<bb){
								return -1										
							} else {
								return 0
							}
						}));

						dojo.forEach(children, function(child) {
							if (child.isResourceAccessible()) {
								if (this.current === child) {
									dojo.create("span", {innerHTML: this._getContextLabel(child)}, innerNode);
								} else {
									dojo.create("a", {href: this.application.getHref(child.getResourceUri()+"/resource/_top"), innerHTML: this._getContextLabel(child)}, innerNode);
								}
								dojo.create("br", {}, innerNode);
							}
			    		}, this);
						dijit.focus(innerNode);
						onReady();
					});
					this.choicesDialogDijit = folio.util.launchToolKitDialog(sep, prepareDialog);
				}));
			});
			this.application.getStore().loadEntry(this.application.repository+"_contexts/entry/_all", {}, f, null);
		}
	},
	_getContextLabel: function(entry) {
		return folio.data.getLabelRaw(entry) || entry.alias || entry.getId();
	}
});