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

dojo.provide("folio.start.Start");
dojo.require("dijit._Widget");
dojo.require("dijit.layout.StackContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit._Templated");
dojo.require("dijit.form.TextBox");
dojo.require("folio.list.SearchList");
dojo.require("folio.editor.RFormsPresenter");


/**
 * Shows profile information, group membership, access to portfolios and folders, and latest material.
 * The profile information includes username, home portfolio and user profile metadata.
 */
dojo.declare("folio.start.Start", [dijit._Widget, dijit._Templated], {
	//===================================================
	// Public Attributes
	//===================================================
	twoColumn: true,

	//===================================================
	// Inherited Attributes
	//===================================================
	templatePath: dojo.moduleUrl("folio.start", "StartTemplate.html"),
    widgetsInTemplate: true,
	
	//===================================================
	// I18n attributes
	//===================================================

	//===================================================
	// Easter egg attribute
	//===================================================
	cookieMonster: window.location.href.indexOf("cookieMonster=true") !== -1,

	//===================================================
	// Private attributes
	//===================================================
	_currentSearchTerm: null,
	
	//===================================================
	// Inherited methods
	//===================================================
	postCreate: function() {
		this.inherited("postCreate", arguments);
		this.application = __confolio.application;		

		dojo.connect(this.communitiesButtonNode, "onclick", this, this._showCommunities);
		dojo.connect(this.peopleButtonNode, "onclick", this, this._showPeople);
		dojo.connect(this.recentButtonNode, "onclick", this, this._showRecent);
		dojo.connect(this.searchButtonNode, "onclick", this, this._update);
		dojo.connect(this.searchNode, "onkeyup", this, this._delayedUpdate);


		dojo.subscribe("/confolio/localeChange", dojo.hitch(this, this._localize));
		dojo.subscribe("/confolio/userChange", dojo.hitch(this, this._userChange));
		this._localize();
	},

	/**
	 * Required by ViewMap to be able to set a nice breadcrumb.
	 * @param {Object} params
	 */
	getLabel: function(params) {
		return "userProfile";
	},
	show: function(params) {
		if (this._first !== false) {
			this._showCommunities();
			this._first = false;
		} 
	},

	//===================================================
	// Private methods
	//===================================================
	_userChange: function() {
	},
	_localize: function() {
/*		dojo.requireLocalization("folio", "profile");
		this.resourceBundle = dojo.i18n.getLocalization("folio", "profile"); 
		this.set(this.resourceBundle);*/
	},
	
	_showCommunities: function() {
		dojo.removeClass(this.peopleButtonNode, "selected");
		dojo.removeClass(this.recentButtonNode, "selected");
		dojo.addClass(this.communitiesButtonNode, "selected");
		dojo.style(this.peopleNode, "display", "none");
		dojo.style(this.recentNode, "display", "none");
		dojo.style(this.communitiesNode, "display", "");
		dojo.style(this.searchArea, "display", "");
		dojo.attr(this.searchNode, "placeholder", "seach for communities");
		
		this._currentTab = "Communities";
		this._currentSearchTerm = ""; //making sure new searchterm  goes through as "" != null.
		dojo.attr(this.searchNode, "value", "");
		this._update();
	},
	
	_delayedUpdate: function(event) {
		if (event.keyCode === dojo.keys.ENTER) {
			this._update();
			return;
		}
		if (this._timer != null) {
			clearTimeout(this._timer);
		}
		if (this._timerLock) {
			this._queuedTimer = true;
		} else {
			this._timer = setTimeout(dojo.hitch(this, this._update), 200);
		}
	},
	_lockTimer: function() {
		this._timerLock = true;
	},
	_unlockTimer: function() {
		this._timerLock = false;
		if (this._queuedTimer) {
			this._timer = setTimeout(dojo.hitch(this, this._update), 200);
			this._queuedTimer = false;
		}
	},

	_update: function() {
		this._lockTimer();
		var searchTerm = dojo.attr(this.searchNode, "value");
		if (searchTerm === "" || searchTerm === null || searchTerm.length <3) {
			searchTerm = null;
		} else {
			searchTerm = "title:"+searchTerm;
		}
		if (this._currentSearchTerm === searchTerm) {
			this._unlockTimer();
			return;
		}
		this._currentSearchTerm = searchTerm;
		this["_update"+this._currentTab]();
	},
	
	_updateCommunities: function() {
		dojo.attr(this.communitiesNode, "innerHTML", "");
		var searchcontext = this.application.getStore().getContext(this.application.repository+"_search");
		
		searchcontext.search({term: this._currentSearchTerm, locationType: ["Local"], builtinType: ["Group"], queryType: "solr",
			onSuccess: dojo.hitch(this, function(entryResult) {
				folio.data.getList(entryResult, dojo.hitch(this, function(list) {
					list.getPage(0, 50, dojo.hitch(this, function(children) {
						var acceptCount = 0;
						dojo.forEach(children, function(child) {
							if (acceptCount < 20 && child.readAccessToMetadata) {
								this._createCommunityCard(child);
								acceptCount++;
							}
						}, this);
						this._unlockTimer();
					}));
				}));
			}),
			onError: dojo.hitch(this, function(error) {
			})
		});
	},
	
	_createCommunityCard: function(groupEntry) {
		var groupDiv = dojo.create("div", {"class": "card distinctBackground"}, this.communitiesNode);
		var imgWrap = dojo.create("div", {"class": "img-wrap"}, groupDiv);
		if (this.cookieMonster) {
			dojo.create("img", {src: "http://www.northern-pine.com/songs/images/cookie.gif", style: {"max-width": "100px"}}, imgWrap);
		} else {
			var imageUrl = folio.data.getFromMD(groupEntry, folio.data.FOAFSchema.IMAGE) || this.application.getConfig().getIcon("group");
			dojo.create("img", {src: imageUrl}, imgWrap);
		}
		var name = folio.data.getLabelRaw(groupEntry) || groupEntry.name || groupEntry.getId();
		dojo.create("a", {href: this.application.getHref(groupEntry, "profile"), "innerHTML": name}, groupDiv);
	},
	_showPeople: function() {
		dojo.removeClass(this.recentButtonNode, "selected");
		dojo.removeClass(this.communitiesButtonNode, "selected");
		dojo.addClass(this.peopleButtonNode, "selected");
		dojo.style(this.recentNode, "display", "none");
		dojo.style(this.communitiesNode, "display", "none");
		dojo.style(this.peopleNode, "display", "");
		dojo.style(this.searchArea, "display", "");
		dojo.attr(this.searchNode, "placeholder", "seach for people");

		this._currentTab = "People";
		this._currentSearchTerm = ""; //making sure new searchterm  goes through as "" != null.
		dojo.attr(this.searchNode, "value", "");
		this._update();
	},
	
	_updatePeople: function() {
		dojo.attr(this.peopleNode, "innerHTML", "");
		var searchcontext = this.application.getStore().getContext(this.application.repository+"_search");
		searchcontext.search({term: this._currentSearchTerm, locationType: ["Local"], builtinType: ["User"], queryType: "solr",
			onSuccess: dojo.hitch(this, function(entryResult) {
				folio.data.getList(entryResult, dojo.hitch(this, function(list) {
					list.getPage(0, 50, dojo.hitch(this, function(children) {
						var acceptCount = 0;
						dojo.forEach(children, function(child) {
							if (acceptCount < 20 && child.readAccessToMetadata) {
								this._createPeopleCard(child);
								acceptCount++;
							}
						}, this);
						this._unlockTimer();
					}));
				}));
			}),
			onError: dojo.hitch(this, function(error) {
			})
		});		
	},
	_createPeopleCard: function(personEntry) {
		var userDiv = dojo.create("div", {"class": "card distinctBackground"}, this.peopleNode);
		var imgWrap = dojo.create("div", {"class": "img-wrap"}, userDiv);
		if (this.cookieMonster) {
			dojo.create("img", {src: "http://www.northern-pine.com/songs/images/cookie.gif", style: {"max-width": "100px"}}, imgWrap);
		} else {
			var imageUrl = folio.data.getFromMD(personEntry, folio.data.FOAFSchema.IMAGE) || this.application.getConfig().getIcon("user");
			dojo.create("img", {src: imageUrl}, imgWrap);
		}
		var name = folio.data.getLabelRaw(personEntry) || personEntry.name || personEntry.getId();
		dojo.create("a", {href: this.application.getHref(personEntry, "profile"), "innerHTML": name}, userDiv);		
	},
		
	_showRecent: function() {
		dojo.removeClass(this.communitiesButtonNode, "selected");
		dojo.removeClass(this.peopleButtonNode, "selected");
		dojo.addClass(this.recentButtonNode, "selected");
		dojo.style(this.communitiesNode, "display", "none");
		dojo.style(this.peopleNode, "display", "none");
		dojo.style(this.recentNode, "display", "");
		dojo.style(this.searchArea, "display", "none");

		this._showingRecent = true;

		//TODO: Perhaps also add Link_Reference to the query.
		this.recentSearchList.show({
			builtinType: ["None"],
			locationType: ["Local", "Link"],
			sort: "modified+desc",
			queryType: "solr"
		});
	}
});