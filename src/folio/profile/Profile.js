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
		this._showProfilePicture();
		dojo.style(this.foldersNode, "display", "none");
		if (folio.data.isUser(this.entry)) {
			dojo.style(this.membersButtonNode, "display", "none");
			dojo.style(this.communitiesButtonNode, "display", "");
			dojo.style(this.membersNode, "display", "none");	
			this._getHomeContext(dojo.hitch(this, function() {
				this._showProfileInfo();
				this._showCommunities();
				this._updateRightPane();
			}));
		} else {
			dojo.style(this.membersButtonNode, "display", "");
			dojo.style(this.communitiesButtonNode, "display", "none");			
			dojo.style(this.communitiesNode, "display", "none");
			delete this.homeContext;
			this._showProfileInfo();
			this._showMembers();
			this._updateRightPane();
		}
	/*//Below old group case.
 		dojo.attr(this.principalLabelNode, "innerHTML", this.groupLabel);
			//				dojo.attr(this.principalNameLabelNode, "innerHTML", this.groupNameLabel);
			dojo.attr(this.memberHeaderNode, "innerHTML", this.membershipHeader);
			dojo.style(this.homeContextRowNode, "display", "none");
			this._showMembers();
			this._showRights(dojo.hitch(this, function(){
				var context = this.accessToContexts.length > 0 ? this.accessToContexts[0].getId() : null;
				//TODO: Perhaps also add Link_Reference to the query
				if (context) {
					console.log("Soker med 1: " + context);
					var baseURIForContext = this.entry.getContext().getBaseURI();
					context = baseURIForContext.replace(/:/g, "\\%3A") + context;
					console.log("Soker med 2: " + context);
					this.simpleSearchList.show({
						term: "(resource.rw:" + this.entryUri + "+OR+admin:" + this.entryUri + "+OR+context:" + context + ")",
						builtinType: ["None"],
						locationType: ["Local", "Link"],
						sort: "modified+desc",
						queryType: "solr"
					});
				} else {
					this.simpleSearchList.show({
						term: "(resource.rw:" + this.entryUri + "+OR+admin:" + this.entryUri + ")",
						builtinType: ["None"],
						locationType: ["Local", "Link"],
						sort: "modified+desc",
						queryType: "solr"
					});
				}
			}));
		}*/
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
	_showProfilePicture: function() {
		dojo.attr(this.profilePictureNode, "innerHTML", "");
		var imageUrl = folio.data.getFromMD(this.entry, folio.data.FOAFSchema.IMAGE);
		var config = this.application.getConfig();
		var backup = folio.data.isUser(this.entry) ? ""+config.getIcon("user_picture_frame") : ""+config.getIcon("group_picture_frame");
		if (window.location.href.indexOf("cookieMonster=true") !== -1) {
			dojo.create("img", {src: "http://www.northern-pine.com/songs/images/cookie.gif", style: {"max-width": "100px"}}, this.profilePictureNode);
		} else {
			dojo.create("img", {src: imageUrl || backup, style: {"max-width": "100px"}}, this.profilePictureNode);
		}
	},
	
	_getHomeContext: function(callback) {
		delete this.homeContext;
		if (this.entry && this.entry.resource && this.entry.resource.homecontext) {
			this.application.getStore().loadEntry({
					base: this.application.getRepository(), 
					contextId: "_contexts", 
					entryId: this.entry.resource.homecontext}, 
					{},
					dojo.hitch(this, function(entry) {
						this.homeContext = entry;
						callback();
					}));
		} else {
			callback();
		}
	},
	_showProfileInfo: function() {
		//User info
		var name = folio.data.getLabelRaw(this.entry) || this.entry.resource.name;
		dojo.attr(this.principalNameNode, "innerHTML", name);

		//Homecontext
		dojo.style(this.profileIconsNode, "display", "none");
		if (this.homeContext) {
			var name = folio.data.getLabelRaw(this.homeContext) || this.homeContext.alias || this.homeContext.getId();
			dojo.attr(this.homeContextNode, "title", name);
			dojo.attr(this.homeContextNode, "href", this.application.getHref(this.application.getRepository()+this.homeContext.getId()+"/entry/_top", "default"));
			dojo.style(this.profileIconsNode, "display", "");
			dojo.attr(this.profileDescriptionNode, "innerHTML", folio.data.getDescription(this.homeContext));
			//In case the quota is given, displays both the actual size + percentage used
			if(this.homeContext.quota && this.homeContext.quota.quotaFillLevel !== undefined){
				var quota =" ("+folio.data.bytesAsHumanReadable(this.homeContext.quota.quotaFillLevel);
				if (this.homeContext.quota.quota !== -1) {
					quota +="/" + folio.data.bytesAsHumanReadable(this.homeContext.quota.quota) +
							", " +
							folio.data.percentageCalculator(this.homeContext.quota.quotaFillLevel, this.homeContext.quota.quota) +
							")";
				} else {
					quota += ")";
				}
				dojo.attr(this.homeContextQuotaNode, "innerHTML", quota);
			} else {
				dojo.attr(this.homeContextQuotaNode, "innerHTML", "");
			}
		}
		//User metadata
//		this.profileMDInfoDijit.show(this.entry);
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
			var imgWrap = dojo.create("div", {"class": "img-wrap"}, groupDiv);
			dojo.create("img", {src: ""+this.application.getConfig().getIcon("group")}, imgWrap);
			var name = folio.data.getLabelRaw(groupEntry) || groupEntry.name || groupEntry.getId();
			dojo.create("a", {href: this.application.getHref(groupEntry, "profile"), "innerHTML": name}, groupDiv);
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
			dojo.forEach(children, function(child) {
				var userDiv = dojo.create("div", {"class": "card distinctBackground"}, this.membersNode);
				var imgWrap = dojo.create("div", {"class": "img-wrap"}, userDiv);
				var imageUrl = folio.data.getFromMD(child, folio.data.FOAFSchema.IMAGE) || this.application.getConfig().getIcon("user");
				if (window.location.href.indexOf("cookieMonster=true") !== -1) {
					dojo.create("img", {src: "http://www.northern-pine.com/songs/images/cookie.gif", style: {"max-width": "100px"}}, imgWrap);
				} else {
					dojo.create("img", {src: imageUrl || backup, style: {"max-width": "100px"}}, imgWrap);
				}
				var name = folio.data.getLabelRaw(child) || child.name || child.getId();
				dojo.create("a", {href: this.application.getHref(child, "profile"), "innerHTML": name}, userDiv);				
			}, this);
		}));
	},
	_showFolders: function(callback) {
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
						if (callback) {
							callback();
						}
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
		this.recentSearchList.show({
			term: "(creator:" + this.entryUri + "+OR+contributors:" + this.entryUri + ")",
			builtinType: ["None"],
			locationType: ["Local", "Link"],
			sort: "modified+desc",
			queryType: "solr"
		});
	},
	
	_addToContactList: function(){
		//Leave empty by default
	}
});