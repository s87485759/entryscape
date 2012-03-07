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

dojo.provide("folio.apps.Profile");
dojo.require("dijit.layout._LayoutWidget");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit._Templated");
dojo.require("dijit.form.TextBox");
dojo.require("folio.list.SearchList");
dojo.require("folio.editor.RFormsPresenter");


/**
 * Shows profile information, group membership, access to portfolios and folders, and latest material.
 * The profile information includes username, home portfolio and user profile metadata.
 */
dojo.declare("folio.apps.Profile", [dijit.layout._LayoutWidget, dijit._Templated], {
	//===================================================
	// Public Attributes
	//===================================================
	twoColumn: true,

	//===================================================
	// Inherited Attributes
	//===================================================
	templatePath: dojo.moduleUrl("folio.apps", "ProfileTemplate.html"),
    widgetsInTemplate: true,
	attributeMap: dojo.mixin(dojo.clone(dijit.layout.ContentPane.prototype.attributeMap), {
        homeContextLabel: {node: "homeContextLabelNode", type: "title"},
        rightsHeader: {node: "rightsHeaderNode", type: "innerHTML"},
        latestMaterial: {node: "latestMaterialNode", type: "innerHTML"}
	}),
	
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
		this.application = __confolio.application;
		this.inherited("postCreate", arguments);
		if (!this.twoColumn) {
			dojo.style(this.latestMaterialDijit.domNode, "display", "none");
		}

		dojo.subscribe("/confolio/localeChange", dojo.hitch(this, this._localize));
		dojo.subscribe("/confolio/userChange", dojo.hitch(this, this._userChange));
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
		return "userProfile";
	},
	show: function(params) {
		//The latest parameters are saved in order to be reused when some kind of change occurs (such as a user logs in or out)
		this.lastParams =params;
		
		this.entryId = params.entry;
		this.entryUri = this.application.getRepository().replace(/:/g, "\\%3A")+"_principals/resource/"+this.entryId;

		var f = dojo.hitch(this, function(entry){
			this.showEntry(entry);
		});

		this.application.getStore().loadEntry({base: this.application.getRepository(), 
		                 contextId: "_principals", 
						 entryId: this.entryId}, 
						 {},
						 function(entry) {
							if (entry.resource == null) {
								entry.setRefreshNeeded();
								entry.refresh(f);
							} else {
								f(entry);
							}
						 }
			);
	},
	/*This method is called when the new entry has been loaded. Since the entry is loaded asynchronously
	 *this method can be extended in classes that inherits this one. In that way you can be certain that
	 *the entry has been loaded (and the variable this.entry has been properly set).
	*/
	showEntry: function(entry){
		this.entry = entry;
		this._showProfilePicture();
		this._showProfileInfo();
		this.generalProfilePaneDijit.set("title", this.generalProfile);
		if (folio.data.isUser(this.entry)) {
			dojo.attr(this.principalLabelNode, "innerHTML", this.userLabel);
			//				dojo.attr(this.principalNameLabelNode, "innerHTML", this.userNameLabel);
			dojo.attr(this.memberHeaderNode, "innerHTML", this.memberOfHeader);
			dojo.style(this.homeContextRowNode, "display", "");
			this._showGroups();
			this._showRights();
			//TODO: Perhaps also add Link_Reference to the query.
			this.simpleSearchList.show({
				term: "(creator:" + this.entryUri + "+OR+contributors:" + this.entryUri + ")",
				builtinType: ["None"],
				locationType: ["Local", "Link"],
				sort: "modified+desc",
				queryType: "solr"
			});
		} else {
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
		}
	},

	//===================================================
	// Private methods
	//===================================================
	_userChange: function() {
		//Update the view of the currently displayed profile
		//since the new user might have other ACL-restrictions on the things shown
		this.user = this.application.getUser();
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
		var backup = folio.data.isUser(this.entry) ? ""+config.getIcon("user_picture_frame") : ""+config.getIcon("group_picture_frame")
		dojo.create("img", {src: imageUrl || backup, style: {width: "100px"}}, this.profilePictureNode);
		//"http://www.northern-pine.com/songs/images/cookie.gif"
	},
	_showProfileInfo: function() {
		//User info
		var name = folio.data.getLabelRaw(this.entry) || this.entry.resource.name;
		dojo.attr(this.principalNode, "innerHTML", name);

		if (folio.data.isUser(this.entry)) {
			dojo.removeClass(this.principalNameLabelNode, "groupImage");
			dojo.addClass(this.principalNameLabelNode, "userImage");
		} else {
			dojo.removeClass(this.principalNameLabelNode, "userImage");
			dojo.addClass(this.principalNameLabelNode, "groupImage");			
		}
		//Username
		if (this.entry && this.entry.resource && this.entry.resource.name) {
			dojo.attr(this.principalNameNode, "innerHTML", this.entry.resource.name);
		} else {
			dojo.attr(this.principalNameNode, "innerHTML", "");
		}
		//Homecontext
		if (this.entry && this.entry.resource && this.entry.resource.homecontext) {
			this.application.getStore().loadEntry({base: this.application.getRepository(), 
		                 contextId: "_contexts", 
						 entryId: this.entry.resource.homecontext}, 
						 {},
						 dojo.hitch(this, function(entry){
						 	var name = folio.data.getLabelRaw(entry) || entry.alias || entry.getId();
							dojo.attr(this.homeContextNode, "innerHTML", name);
							dojo.attr(this.homeContextNode, "href", this.application.getHref(this.application.getRepository()+entry.getId()+"/entry/_top", "default"));
							if(entry.quota && entry.quota.quotaFillLevel !== undefined){//In case the quota is given, displays both the actual size + percentage used
								var quota =" ("+folio.data.bytesAsHumanReadable(entry.quota.quotaFillLevel);
								if (entry.quota.quota !== -1) {
									quota +="/" + folio.data.bytesAsHumanReadable(entry.quota.quota) +
									", " +
									folio.data.percentageCalculator(entry.quota.quotaFillLevel, entry.quota.quota) +
									")";
								} else {
									quota += ")"
								}
								dojo.attr(this.homeContextQuotaNode, "innerHTML", quota);
							} else {
								dojo.attr(this.homeContextQuotaNode, "innerHTML", "");
							}
						 })
			);
		} else {
			dojo.attr(this.homeContextNode, "innerHTML", "");
		}
		//User metadata
		this.profileMDInfoDijit.show(this.entry);
	},
	_showGroups: function() {
		dojo.attr(this.memberNode, "innerHTML", "");
		var addGroup = dojo.hitch(this, function(groupEntry) {
			var groupDiv = dojo.create("div", {"class": "iconTitleRow"}, this.memberNode);
			dojo.create("img", {src: ""+this.application.getConfig().getIcon("group")}, groupDiv);
			var name = folio.data.getLabelRaw(groupEntry) || groupEntry.name || groupEntry.getId();
			dojo.create("a", {href: this.application.getHref(groupEntry, "profile"), "innerHTML": name}, groupDiv);
		});
		dojo.forEach(this.entry.getGroups(), dojo.hitch(this, function(groupUri) {
			this.application.getStore().loadEntry(groupUri, {}, addGroup);
		}));
	},
	_showMembers: function() {
		dojo.attr(this.memberNode, "innerHTML", "");
		folio.data.getAllChildren(this.entry, dojo.hitch(this, function(children) {
			dojo.forEach(children, function(child) {
				var userDiv = dojo.create("div", {"class": "iconTitleRow"}, this.memberNode);
				dojo.create("img", {src: ""+this.application.getConfig().getIcon("user")}, userDiv);
				var name = folio.data.getLabelRaw(child) || child.name || child.getId();
				dojo.create("a", {href: this.application.getHref(child, "profile"), "innerHTML": name}, userDiv);				
			}, this);
		}));		
	},
	_showRights: function(callback) {
		dojo.attr(this.rightsNode, "innerHTML", "");
		this.accessToContexts = [];
		var context = this.application.getStore().getContext(this.application.repository+"_search");
		context.search({term: "(resource.rw:"+this.entryUri+"+OR+admin:"+this.entryUri+")", locationType: ["Local"], builtinType: ["Context", "List"], sort: "modified+desc", queryType: "solr",
			onSuccess: dojo.hitch(this, function(entryResult) {
				folio.data.getList(entryResult, dojo.hitch(this, function(list) {
					list.getPage(0, 50, dojo.hitch(this, function(children) {
						var acceptCount = 0;
						dojo.forEach(children, function(child) {
							if (acceptCount < 20 && child.readAccessToMetadata) {
								if (this._addRightsEntry(child)) {
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
	_addRightsEntry: function(entry) {
		var config = this.application.getConfig();
		if (folio.data.isList(entry)) {
			var title = folio.data.getLabelRaw(entry);
			if (title) {
				var row = dojo.create("div", {"class": "iconTitleRow"}, this.rightsNode);
				dojo.create("img", {"class": "context", src: ""+config.getIcon("folder")}, row);
				dojo.create("a", {innerHTML: title, href: this.application.getHref(entry.getUri(), "default")}, row);
				return true;
			}			
		} else {
			var title = folio.data.getLabelRaw(entry) || entry.getId();
			var row = dojo.create("div", {"class": "iconTitleRow"}, this.rightsNode);
			dojo.create("img", {"class": "context", src: ""+config.getIcon("portfolio")}, row);
			dojo.create("a", {innerHTML: title, href: this.application.getHref(this.application.getRepository()+entry.getId()+"/entry/_top", "default")}, row);
			this.accessToContexts.push(entry);
		}
	},
	_addToContactList: function(){
		//Leave empty by default
	}
});