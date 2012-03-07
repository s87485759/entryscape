/*global dojo, dijit, folio*/
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

dojo.provide("folio.apps.StartPage");
dojo.require("dijit._Widget");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit._Templated");
dojo.require("dijit.form.TextBox");
dojo.require("folio.list.SearchList");

/**
 * Provides a starpage with a welcome message, a search box for portfolios, 
 * users and groups and a listing of recently updated material (entries).
 */
dojo.declare("folio.apps.StartPage", [dijit._Widget, dijit._Templated], {
	//===================================================
	// Public Attributes
	//===================================================
	twoColumn: true,

	//===================================================
	// Private Attributes
	//===================================================
	_includePortfolios: true,
	_includeUsers: true,
	_includeGroups: true,
	

	//===================================================
	// Inherited Attributes
	//===================================================
	templatePath: dojo.moduleUrl("folio.apps", "StartPageTemplate.html"),
    widgetsInTemplate: true,
	attributeMap: dojo.mixin(dojo.clone(dijit.layout.ContentPane.prototype.attributeMap), {
        welcomeMessage: {node: "welcomeMessageNode", type: "innerHTML"},
        welcomeHeader: {node: "welcomeHeaderNode", type: "innerHTML"},
        searchLabel: {node: "searchLabelNode", type: "innerHTML"},
        latestMaterial: {node: "latestMaterialNode", type: "innerHTML"},
        includePortfoliosLabel: {node: "includePortfoliosLabelNode", type: "innerHTML"},
        includeUsersLabel: {node: "includeUsersLabelNode", type: "innerHTML"},
        includeGroupsLabel: {node: "includeGroupsLabelNode", type: "innerHTML"}
	}),
	
	//===================================================
	// I18n attributes
	//===================================================
	welcomeMessage: "",
	welcomeHeader: "",
	searchLabel: "",
	latestMaterial: "",
	includePortfoliosLabel: "",
	includeUsersLabel: "",
	includeGroupsLabel: "",

	//===================================================
	// Inherited methods
	//===================================================
	postCreate: function() {
		this.application = __confolio.application;
		this.inherited("postCreate", arguments);
		if (!this.twoColumn) {
			dojo.style(this.latestMaterialDijit.domNode, "display", "none");
		}
		dojo.connect(this.search, "onKeyUp", this, this._delayedUpdateList);
		dojo.subscribe("/confolio/localeChange", dojo.hitch(this, this._localize));
		dojo.subscribe("/confolio/userChange", dojo.hitch(this, this._userChange));
		if (__confolio.config.startButtons === "true") {
			if (this.user == null) {
				dojo.style(this.startButtonsNode, "display", "");				
			}
			var loginDiv = dojo.create("a", {"class": "startButton"}, this.startButtonsNode);
			dojo.connect(loginDiv, "onclick", this, function() {
				new folio.security.LoginDialog({
					isLogoutNeeded: false, // Whether or not this is actually a logout
					application: this.application
				}).show();
			});

			var signupDiv = dojo.create("a", {"class": "startButton", href: __confolio.viewMap.getHashUrl("signup")}, this.startButtonsNode);
			//dojo.create("img", {src: ""+dojo.moduleUrl("folio.icons_oxygen", "greenbutton.jpg")}, loginDiv);
			//dojo.create("img", {src: ""+dojo.moduleUrl("folio.icons_oxygen", "greenbutton.jpg")}, signupDiv);
			dojo.create("span", {innerHTML: "LOGIN"}, loginDiv);
			dojo.create("span", {innerHTML: "SIGNUP"}, signupDiv);
		}
		this._localize();
	},

	resize: function() {
		this.inherited("resize", arguments);
		this.bc.resize();
	},

		/**
	 * Required by ViewMap to be able to set a nice breadcrumb.
	 * @param {Object} params
	 */
	getLabel: function(params) {
		return "Start";
	},
	show: function(params) {
		this._populateList();
		if (this.twoColumn) {
			this.simpleSearchList.show({builtinType: ["None"], locationType: ["Local", "Link"], sort: "modified+desc", queryType: "solr"});
		}
		this.user = this.application.getUser();
		if (this.user == null && __confolio.config.startButtons === "true") {
			dojo.style(this.startButtonsNode, "display", "");	
		} else {
			dojo.style(this.startButtonsNode, "display", "none");		
		}
	},

	//===================================================
	// Private methods
	//===================================================
	_localize: function() {
		dojo.requireLocalization("folio", "start");
		this.resourceBundle = dojo.i18n.getLocalization("folio", "start"); 
		this.set(this.resourceBundle);
	},
	_userChange: function() {
		this.user = this.application.getUser();
		if (this.user == null && __confolio.config.startButtons === "true") {
			dojo.style(this.startButtonsNode, "display", "");	
		} else {
			dojo.style(this.startButtonsNode, "display", "none");		
		}
		this.resize();
		this.show();
	},
	_populateList: function() {
		if (this.pugList == null) {
			var context = this.application.getStore().getContext(this.application.repository+"_search");
			context.search({locationType: ["Local"], builtinType: ["Context", "User", "Group"], sort: "modified+desc", queryType: "solr", onSuccess: dojo.hitch(this, function(entryResult) {
			folio.data.getList(entryResult, dojo.hitch(this, function(list) {
				this.list = list;
				this._updateList();
			}));
		}),
		onError: dojo.hitch(this, function(error) {
		})});
		}	
	},
	_delayedUpdateList: function() {
		if (this._timer != null) {
			clearTimeout(this._timer);
		}
		this._timer = setTimeout(dojo.hitch(this, this._updateList), 200);
	},
	_updateList: function() {
		dojo.attr(this.listNode, "innerHTML", "");
		var search = this.search.get("value").toLowerCase();
		var acceptCount = 0;
		var page = 0;
		var f = dojo.hitch(this, function() {
			this.list.getPage(page, 40, dojo.hitch(this, function(children) {
				dojo.forEach(children, function(child) {
					if (acceptCount < 20 && child.readAccessToMetadata) {
						if (this._addEntry(child, search)) {
								acceptCount++;
						}
					}
				}, this);
				page++;
				if (acceptCount < 20 && page<this.list.getNumberOfPages(40)) {
					f();
				}
			}));
		});
		f();
	},
	_addEntry: function(child, search) {
		if (child instanceof folio.data.SystemEntry) {
			return;
		}
		var name = folio.data.getLabelRaw(child) || child.name || child.alias || child.getId();
		var config = this.application.getConfig();
		if (search === "" || name.toLowerCase().indexOf(search) !== -1) {
			if (folio.data.isContext(child)) {
				if (this._includePortfolios) {
					var row = dojo.create("div", {"class": "iconTitleRow"}, this.listNode);
					dojo.create("img", {src: ""+config.getIcon("portfolio")}, row);
					dojo.create("a", {innerHTML: name, href: this.application.getHref(this.application.getRepository()+child.getId()+"/entry/_top", "default")}, row);					
					return true;
				}
			} else if (folio.data.isUser(child)) {
				if (this._includeUsers) {
					var row = dojo.create("div", {"class": "iconTitleRow"}, this.listNode);
					dojo.create("img", {src: ""+config.getIcon("user")}, row);
					dojo.create("a", {innerHTML: name, href: this.application.getHref(child.getUri(), "profile")}, row);					
					return true;
				}
			} else if (this._includeGroups){
				var row = dojo.create("div", {"class": "iconTitleRow"}, this.listNode);
				dojo.create("img", {src: ""+config.getIcon("group")}, row);
				dojo.create("a", {innerHTML: name, href: this.application.getHref(child.getUri(), "profile")}, row);				
				return true;
			}
		}
		return false;
	},
	_includePortfoliosChange: function(include) {
		this._includePortfolios = include;
		this._updateList();
	},
	_includeGroupsChange: function(include) {
		this._includeGroups = include;
		this._updateList();
	},
	_includeUsersChange: function(include) {
		this._includeUsers = include;
		this._updateList();
	}	
}
);