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

dojo.provide("folio.navigation.NavigationBar");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.Menu");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.Dialog");
dojo.require("folio.editor.UserEditor");
// remove this line
dojo.require("dijit.form.FilteringSelect");
dojo.requireLocalization("dijit.form", "validate");
dojo.require("folio.security.LoginDialog");
dojo.require("folio.editor.ResourceEditor");


/**
 * A header containing:
 * - logo (to be styled via theme)
 * - login / logout
 * - quick/simple search (inputfield + button)
 * - user information (if logged in) including: 
 *  -- username
 *  -- user settings
 *  -- quicklink to homecontext
 * - about link
 * - help link
 */
dojo.declare("folio.navigation.NavigationBar", [dijit._Widget, dijit._Templated, folio.ApplicationView], {
	//===================================================
	// Public attributes
	//===================================================
    searchFolderChecked:false,
	searchAllChecked: false,
	searchToBeAnnotatedChecked: false,
	searchFieldClicked: false,
	showHelp: true,
	showAbout: true,
	
	//===================================================
	// Inherited attributes
	//===================================================
	attributeMap: dojo.mixin(dojo.clone(dijit.layout.ContentPane.prototype.attributeMap), {
        aboutLink: {node: "aboutLinkNode", type: "innerHTML"},
        helpLink: {node: "helpLinkNode", type: "innerHTML"},
        greeting: {node: "greetingNode", type: "innerHTML"},
        userField: {node: "userFieldNode", type: "innerHTML"},
        homeLink: {node: "homeLinkNode", type: "innerHTML"},
        settings: {node: "settingsNode", type: "innerHTML"},
        searchLabel: {node: "searchButtonNode", type: "attribute", attribute: "title"},
        languageLabel: {node: "languageLabelNode", type: "innerHTML"}
	}),
	supportedLanguageMap: __confolio.config["supportedLanguageMap"],
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("folio", "navigation/NavigationBarTemplate.html"),	
	//===================================================
	// I18n attributes
	//===================================================
	aboutLink: "",
	noAbout: "",
	helpLink: "",
	noHelp: "",
	greeting: "",
	userField: "",
	homeLink: "",
	contextLabel: "",
	searchLabel: "",
	searchFieldMessage: "",
	changeUserDialogTitle: "",
	
	//===================================================
	// Inherited methods
	//===================================================	
	constructor: function(args) {
		this.list = args.list;
	},
	getSupportedActions: function() {
		return ["showContext", "showEntry", "entryChange", "localeChange", "userChange"];
	},
	handle: function(event) {
		switch (event.action) {
		case "showEntry":
		    if(folio.data.isListLike(event.entry)){
				this.setActiveFolder(event.entry.getResourceUri());
			}
			if (this.context) {
				return;
			}
			break;
		case "showContext":
			this.context = event.entry.getContext().getId();
			this.setActiveFolder(event.entry.getContext().getUri()+'/resource/_top');
			break;
		case "change":
			if (event.entry.getResourceUri() == event.entry.getResourceUri()) {
				var res = event.entry.getResource();
				this.user = res.name;
				this.userField.innerHTML=this.user;
				this.application.setUser(res);
			}
			break;
		case "localeChange":
			var lang = dojo.locale;
			if (!this.supportedLanguageMap.hasOwnProperty(lang) &&
			  this.supportedLanguageMap.hasOwnProperty(lang.slice(0, 2))) {
				lang = lang.slice(0, 2);
			}
			this.localeChanger.ignoreChange = true;
			this.localeChanger.set("value", lang);
			this.localeChanger.ignoreChange = false;
			this.localize();
			break;
		case "userChange":
			this._loginAdjustments();
			break;
		}
	},
	setActiveFolder: function(folder) {
		this.folder = folder;
	},
	postCreate: function() {
		this.inherited("postCreate", arguments);
		if (this.showHelp) {
			dojo.style(this.helpLinkSpan, "display", "");
			dojo.attr(this.helpLinkNode, "href", __confolio.viewMap.getHashUrl("help", {}));
		}
		if (this.showAbout) {
			dojo.style(this.aboutLinkSpan, "display", "");
			dojo.attr(this.aboutLinkNode, "href", __confolio.viewMap.getHashUrl("about", {}));
		}
		var config = this.application.getConfig();
		dojo.connect(this.searchField, "onKeyUp", this, function(evt) {
			if(evt.keyCode == dojo.keys.ENTER) {
				dojo.stopEvent(evt);
				this._doSearch(this.searchField.get("value"));
			}
		});
		var data = [];
		if (config.supportedLanguageMap) {
			this.supportedLanguageMap = config.supportedLanguageMap;
		}
		for (lang in this.supportedLanguageMap) {
			data.push({value: lang, label: this.supportedLanguageMap[lang]});
		}
		this.localeChanger.set("store", new dojo.data.ItemFileReadStore({data: {identifier: "value", items: data}}));
		if (this.supportedLanguageMap[dojo.locale] != undefined) {
			this.localeChanger.set("value", dojo.locale);
		} else if (this.supportedLanguageMap[dojo.locale.substring(0,2)] != undefined) {
			this.localeChanger.set("value", dojo.locale.substring(0,2));
		}
		setTimeout(dojo.hitch(this, function() {
			dojo.connect(this.localeChanger, "onChange", this, this._changeLocaleClicked);
		}), 100);
		this.localize();
		this._loginAdjustments();
	},
	localize: function() {
		dojo.requireLocalization("folio", "navigationBar");
		this.resourceBundle = dojo.i18n.getLocalization("folio", "navigationBar"); 
		this.set(this.resourceBundle);
		if (!this.user) {
			this.set("userField", this.resourceBundle.guestUser);
			this.loginStatusNode.innerHTML= this.resourceBundle.loginLink;
		} else {
			this.loginStatusNode.innerHTML= this.resourceBundle.logoutLink;
		}
	},
	//===================================================
	// Private methods
	//===================================================
	_loginAdjustments: function() {
		this.user = this.application.getUser();
		if (this.user) {
			this.userId = this.user.id;
			dojo.attr(this.userFieldNode, "innerHTML", this.user.user);
			dojo.attr(this.userFieldNode, "href", this.application.getHref(this.application.getRepository()+"_principals/entry/"+this.userId, "profile")); //this.user.user
			dojo.attr(this.loginStatusNode, "innerHTML", this.resourceBundle.logoutLink);
		} else {
			this.userId = undefined;
			dojo.attr(this.userFieldNode, "innerHTML", this.resourceBundle.guestUser);
			dojo.attr(this.userFieldNode, "href", "");
			dojo.attr(this.loginStatusNode, "innerHTML", this.resourceBundle.loginLink);
			this.home = undefined;
		}
		if (this.user && this.user.homecontext) {
			this.home = this.user.homecontext;
			dojo.style(this.homeLinkNodeWrapper, "display", "");
			dojo.style(this.settingsLinkNodeWrapper, "display", "");
			dojo.attr(this.homeLinkNode, "href", this.application.getHref(this.application.getRepository()+this.user.homecontext+"/resource/_top", "default"));
		} else {
			dojo.style(this.homeLinkNodeWrapper, "display", "none");
			dojo.style(this.settingsLinkNodeWrapper, "display", "none");
		}
	},
	_doSearch: function(term) {
		this.application.open("search", {term: term});
	},

	//===================================================
	// Template connected methods
	//===================================================
	_clearSearchField: function() {
		if (!this.searchFieldClicked) {
			this.searchFieldClicked = true;
			this.searchField.set("value", "");
		}
	},
	_searchClicked: function() {
		this._doSearch(this.searchField.get("value"));
	},
	_homeClicked: function() {
		if (this.home) {
			this.application.openEntry(this.application.repository+this.home+"/entry/_top");
		} else {
			this.application.message(this.resourceBundle.notLoggedInNoHomeMessage);
		}
	},
	_settingsClicked: function() {
		dojo.publish("/confolio/showResourceEditor", [{width: "400px", height: "250px", context: "_principals", entry: this.userId, widgetClass: folio.editor.UserEditor, dialogTitle: this.changeUserDialogTitle}]);
	},
	_userFieldClicked: function() {
		dojo.publish("/confolio/showResourceEditor", [{width: "400px", height: "250px", context: "_principals", entry: this.userId, widgetClass: folio.editor.UserEditor, dialogTitle: this.changeUserDialogTitle}]);
	},
	_loginLinkClicked: function() {
		new folio.security.LoginDialog({
			isLogoutNeeded: !(!this.user), // Whether or not this is actually a logout
			application: this.application
		}).show(true);
	},
	_changeLocaleClicked: function() {
		/***
		 *** This method belongs to the FilteringSelect in NavigationBarTemplate, remove when done.
		 ***/
		if (this.application) {
			//window.alert("NavigationBar.changeLocaleClicked: " + dijit.byId("localeChanger").getValue());
			if (!this.localeChanger.ignoreChange && this.localeChanger.get("value") != "no_select") {
				this.application.setLocale(this.localeChanger.get("value"));
			}
		}
	},
	
	//===================================================
	// Apply Locale on template dijit
	//===================================================
	_setSearchFieldMessageAttr: function(value) {
		this.searchField.set("value", value);
		this.searchFieldMessage = value;
	}
});