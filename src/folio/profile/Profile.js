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

dojo.provide("folio.profile.Profile");
dojo.require("dijit._Widget");
dojo.require("dijit.layout.StackContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit._Templated");
dojo.require("dijit.form.TextBox");
dojo.require("folio.list.SearchList");
dojo.require("folio.navigation.PrincipalInfo");
dojo.require("folio.editor.RFormsPresenter");


/**
 * Shows profile information, group membership, access to portfolios and folders, and latest material.
 * The profile information includes username, home portfolio and user profile metadata.
 */
dojo.declare("folio.profile.Profile", [dijit._Widget, dijit._Templated], {
	//===================================================
	// Public Attributes
	//===================================================
	twoColumn: true,

	//===================================================
	// Inherited Attributes
	//===================================================
	templatePath: dojo.moduleUrl("folio.profile", "ProfileTemplate.html"),
    widgetsInTemplate: true,
	
	//===================================================
	// I18n attributes
	//===================================================
	userLabel: "",
	groupLabel: "",
	userNameLabel: "",
	groupNameLabel: "",
	homeContextLabel: "",
	memberOfHeader: "",
	membershipHeader: "",
	rightsHeader: "",
	latestMaterial: "",
	generalProfile: "",

	//===================================================
	// Inherited methods
	//===================================================
	postCreate: function() {
		this.inherited("postCreate", arguments);
		this.application = __confolio.application;		
		this.featuredList.application = __confolio.application;

		dojo.connect(this.foldersButtonNode, "onclick", this, this._showFolders);
		dojo.connect(this.communitiesButtonNode, "onclick", this, this._showCommunities);
		dojo.connect(this.membersButtonNode, "onclick", this, this._showMembers);
		dojo.connect(this.featuredButtonNode, "onclick", this, this._showFeatured);
		dojo.connect(this.recentButtonNode, "onclick", this, this._showRecent);

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
		//The latest parameters are saved in order to be reused when some kind of change occurs (such as a user logs in or out)
		this.lastParams =params;
		this.entryUri = this.application.getRepository().replace(/:/g, "\\%3A")+"_principals/resource/"+params.entry;

		
		var f = dojo.hitch(this, function(entry){this.showEntry(entry);});
		this.application.getStore().loadEntry({
			base: this.application.getRepository(), 
		    contextId: "_principals",
			entryId: params.entry}, 
			{},
			function(entry) {
				if (entry.resource == null) {
					entry.setRefreshNeeded();
					entry.refresh(f);
				} else {
					f(entry);
				}
			});
	},
	/*This method is called when the new entry has been loaded. Since the entry is loaded asynchronously
	 *this method can be extended in classes that inherits this one. In that way you can be certain that
	 *the entry has been loaded (and the variable this.entry has been properly set).
	*/
	showEntry: function(entry){
		this.entry = entry;
		delete this._currCommEntry;
		delete this._currFolderEntry;
		delete this._currFeaturedEntry;
		delete this._currRecentEntry;
		dojo.style(this.foldersNode, "display", "none");
		if (folio.data.isUser(this.entry)) {
			dojo.style(this.membersButtonNode, "display", "none");
			dojo.style(this.communitiesButtonNode, "display", "");
			dojo.style(this.membersNode, "display", "none");	
			this._getHomeContext(dojo.hitch(this, function() {
				this.principalInfoDijit.show(this.entry);
				this._showCommunities();
				this._updateRightPane();
			}));
		} else {
			dojo.style(this.membersButtonNode, "display", "");
			dojo.style(this.communitiesButtonNode, "display", "none");			
			dojo.style(this.communitiesNode, "display", "none");
			delete this.homeContext;
			this._getHomeContext(dojo.hitch(this, function() {
				this.principalInfoDijit.show(this.entry);
				this._showMembers();
				this._updateRightPane();
			}));
		}
	},

	//===================================================
	// Private methods
	//===================================================
	_userChange: function() {
		//Update the view of the currently displayed profile
		//since the new user might have other ACL-restrictions on the things shown
		this.user = this.application.getUser();
		this.featuredList.use = this.user;

		if (this.lastParams) {
			this.entry.setRefreshNeeded();
			this.show(this.lastParams);
		}
	},
	_localize: function() {
		dojo.requireLocalization("folio", "profile");
		this.resourceBundle = dojo.i18n.getLocalization("folio", "profile"); 
		this.set(this.resourceBundle);
	},
		
	_getHomeContext: function(callback) {
		delete this.homeContext;
		var hc = this.entry.getHomeContext();
		if (hc != null) {
			this.application.getStore().loadEntry(hc, 
					{},
					dojo.hitch(this, function(entry) {
						this.homeContext = entry;
						callback();
					}));
		} else {
			callback();
		}
	},
	_showCommunities: function() {
		dojo.removeClass(this.foldersButtonNode, "selected");
		dojo.addClass(this.communitiesButtonNode, "selected");
		dojo.style(this.communitiesNode, "display", "");
		dojo.style(this.foldersNode, "display", "none");
		if (this.entry === this._currCommEntry) {
			return;
		}
		this._currCommEntry = this.entry;
		dojo.attr(this.communitiesNode, "innerHTML", "");
		var addGroup = dojo.hitch(this, function(groupEntry) {
			var groupDiv = dojo.create("div", {"class": "card distinctBackground"}, this.communitiesNode);
			var imgWrap = dojo.create("div", {"class": "principalPicture"}, groupDiv);
			dojo.create("img", {src: ""+this.application.getConfig().getIcon("group")}, imgWrap);
			var name = folio.data.getLabelRaw(groupEntry) || groupEntry.name || groupEntry.getId();
			dojo.create("span", {"innerHTML": name}, groupDiv);
			var navIcons = dojo.create("div", {"class": "navIcons"}, groupDiv);
			dojo.connect(groupDiv, "onclick", this, dojo.hitch(this, function(event) {
				if (navIcons == null || !dojo.isDescendant(event.target, navIcons)) {
					this.application.openEntry(groupEntry, "profile");
				}
			}));
			dojo.create("a", {"class": "icon24 home", href: this.application.getHref(groupEntry, "profile")}, navIcons);
			var hc = groupEntry.getHomeContext();
			if (hc) {
				var hcid = hc.substr(hc.lastIndexOf("/")+1);
				dojo.create("a", {"class": "icon24 folder", href: this.application.getHref(this.application.getRepository()+hcid+"/entry/_top", "default")}, navIcons);
			} else {
				dojo.create("span", {"class": "icon24 folder disabled"}, navIcons);
			}
		});
		dojo.forEach(this.entry.getGroups(), dojo.hitch(this, function(groupUri) {
			this.application.getStore().loadEntry(groupUri, {}, addGroup);
		}));
	},
	_showMembers: function() {
		dojo.removeClass(this.foldersButtonNode, "selected");
		dojo.addClass(this.membersButtonNode, "selected");
		dojo.style(this.membersNode, "display", "");
		dojo.style(this.foldersNode, "display", "none");
		if (this.entry === this._currMemEntry) {
			return;
		}
		this._currMemEntry = this.entry;
		dojo.attr(this.membersNode, "innerHTML", "");
		folio.data.getAllChildren(this.entry, dojo.hitch(this, function(children) {
			var cs = dojo.map(children, function(c) {
				return {e: c, n: folio.data.getLabelRaw(c) || c.name || c.getId()};
			});
			cs.sort(function(e1, e2) {
				return e1.n > e2.n;
			});
			dojo.forEach(cs, function(child) {
				var userDiv = dojo.create("div", {"class": "card distinctBackground"}, this.membersNode);
				var imgWrap = dojo.create("div", {"class": "principalPicture"}, userDiv);
				var imageUrl = folio.data.getFromMD(child.e, folio.data.FOAFSchema.IMAGE) || this.application.getConfig().getIcon("user");
				if (window.location.href.indexOf("cookieMonster=true") !== -1) {
					dojo.create("img", {src: "http://www.northern-pine.com/songs/images/cookie.gif", style: {"max-width": "100px"}}, imgWrap);
				} else {
					dojo.create("img", {src: imageUrl || backup, style: {"max-width": "100px"}}, imgWrap);
				}
				dojo.create("span", {"innerHTML": child.n}, userDiv);
				var navIcons = dojo.create("div", {"class": "navIcons"}, userDiv);
				dojo.connect(userDiv, "onclick", this, dojo.hitch(this, function(event) {
					if (navIcons == null || !dojo.isDescendant(event.target, navIcons)) {
						this.application.openEntry(child.e, "profile");
					}
				}));

				dojo.create("a", {"class": "icon24 home", href: this.application.getHref(child.e, "profile")}, navIcons);
				var hc = child.e.getHomeContext();
				if (hc) {
					var hcid = hc.substr(hc.lastIndexOf("/")+1);
					dojo.create("a", {"class": "icon24 folder", href: this.application.getHref(this.application.getRepository()+hcid+"/entry/_top", "default")}, navIcons);
				} else {
					dojo.create("span", {"class": "icon24 folder disabled"}, navIcons);
				}
			}, this);
		}));
	},
	_showFolders: function() {
		dojo.addClass(this.foldersButtonNode, "selected");
		dojo.removeClass(this.communitiesButtonNode, "selected");
		dojo.removeClass(this.membersButtonNode, "selected");
		dojo.style(this.communitiesNode, "display", "none");
		dojo.style(this.membersNode, "display", "none");
		dojo.style(this.foldersNode, "display", "");
		if (this.entry === this._currFolderEntry) {
			return;
		}
		this._currFolderEntry = this.entry;
		
		dojo.attr(this.foldersNode, "innerHTML", "");
		this.accessToContexts = [];
		var context = this.application.getStore().getContext(this.application.repository+"_search");
		context.search({term: "(resource.rw:"+this.entryUri+"+OR+admin:"+this.entryUri+")", locationType: ["Local"], builtinType: ["Context", "List"], sort: "modified+desc", queryType: "solr",
			onSuccess: dojo.hitch(this, function(entryResult) {
				folio.data.getList(entryResult, dojo.hitch(this, function(list) {
					list.getPage(0, 50, dojo.hitch(this, function(children) {
						var acceptCount = 0;
						dojo.forEach(children, function(child) {
							if (acceptCount < 20 && child.readAccessToMetadata) {
								if (this._addFolderEntry(child)) {
									acceptCount++;
								}
							}
						}, this);
					}));
				}));
			}),
			onError: dojo.hitch(this, function(error) {
			})
		});
	},
	_addFolderEntry: function(entry) {
		var config = this.application.getConfig();
		var title, row, imgWrap;
		if (folio.data.isList(entry)) {
			title = folio.data.getLabelRaw(entry);
			if (title) {
				row = dojo.create("div", {"class": "card distinctBackground"}, this.foldersNode);
				imgWrap = dojo.create("div", {"class": "img-wrap"}, row);
				dojo.create("img", {"class": "context", src: ""+config.getIcon("folder")}, imgWrap);
				dojo.create("a", {innerHTML: title, href: this.application.getHref(entry.getUri(), "default")}, row);
				return true;
			}
		} else {
			title = folio.data.getLabelRaw(entry) || entry.getId();
			row = dojo.create("div", {"class": "card distinctBackground"}, this.foldersNode);
			imgWrap = dojo.create("div", {"class": "img-wrap"}, row);
			dojo.create("img", {"class": "context", src: ""+config.getIcon("portfolio")}, imgWrap);
			dojo.create("a", {innerHTML: title, href: this.application.getHref(this.application.getRepository()+entry.getId()+"/entry/_top", "default")}, row);
			this.accessToContexts.push(entry);
		}
	},
	
	_updateRightPane: function() {
		if (this.homeContext) {
			this.application.getStore().loadEntry({
					base: this.application.getRepository(), 
					contextId: this.homeContext.getId(), 
					entryId: "_featured"}, 
					{},
					dojo.hitch(this, function(featuredE) {
						folio.data.getAllChildren(featuredE, dojo.hitch(this, function(children) {
							if (children.length > 0) {
								this._featuredEntry = featuredE;
								this._featuredDisabled = false;
								dojo.removeClass(this.featuredButtonNode, "disabled");
								dojo.attr(this.featuredButtonNode, "title", "");
								this._showFeatured();
							} else {
								this._featuredDisabled = true;
								dojo.addClass(this.featuredButtonNode, "disabled");
								dojo.attr(this.featuredButtonNode, "title", "No featured material available");
								this._showRecent();
							}
						}));
					}));
		} else {
			this._featuredDisabled = true;
			dojo.addClass(this.featuredButtonNode, "disabled");
			dojo.attr(this.featuredButtonNode, "title", "No featured material available");
			this._showRecent();			
		}
	},
	_showFeatured: function() {
		if (this._featuredDisabled) {
			return;
		}
		dojo.addClass(this.featuredButtonNode, "selected");
		dojo.removeClass(this.recentButtonNode, "selected");
		dojo.style(this.featuredNode, "display", "");
		dojo.style(this.recentNode, "display", "none");
		if (this._featuredEntry === this._currFeaturedEntry) {
			return;
		}
		this._currFeaturedEntry = this._featuredEntry;
		this.featuredList.showList(this._featuredEntry);
	},
	
	_showRecent: function() {
		dojo.removeClass(this.featuredButtonNode, "selected");
		dojo.addClass(this.recentButtonNode, "selected");
		dojo.style(this.featuredNode, "display", "none");
		dojo.style(this.recentNode, "display", "");
		this._showingRecent = true;
		if (this.entry === this._currRecentEntry) {
			return;
		}
		this._currRecentEntry = this.entry;
		//TODO: Perhaps also add Link_Reference to the query.
		
		var term;
		if (folio.data.isUser(this.entry)) {
			term = "(creator:" + this.entryUri + "+OR+contributors:" + this.entryUri + ")";
		} else if (this.homeContext != null){
			term = "context:"+this.homeContext.getResourceUri().replace(/:/g, "\\%3A");
		}
		if (term != null) {
			this.recentSearchList.show({
				term: term,
				builtinType: ["None"],
				locationType: ["Local", "Link"],
				sort: "modified+desc",
				queryType: "solr"
			});
		}
	},
	
	_addToContactList: function(){
		//Leave empty by default
	}
});