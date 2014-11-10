/*global define, __confolio*/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/on",
    "dojo/dom",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-attr",
    "dojo/dom-construct",
    "dojo/keys",
    "folio/util/Widget",
    "folio/list/SearchList", //in template
    "folio/util/utils",
    "dojo/text!./StartTemplate.html"
], function (declare, lang, array, on, dom, domClass, domStyle, domAttr, domConstruct, keys,
             Widget, SearchList, utils, template) {



/**
 * Shows profile information, group membership, access to portfolios and folders, and latest material.
 * The profile information includes username, home portfolio and user profile metadata.
 */
return declare([Widget], {
	//===================================================
	// Public Attributes
	//===================================================

	//===================================================
	// Inherited Attributes
	//===================================================
	nls: ["start"],
    templateString: template,

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

		on(this.communitiesButtonNode, "click", lang.hitch(this, this._showCommunities));
		on(this.peopleButtonNode, "click", lang.hitch(this, this._showPeople));
		on(this.recentButtonNode, "click", lang.hitch(this, this._showRecent));
		on(this.searchButtonNode, "click", lang.hitch(this, this._update));
		on(this.searchNode, "keyup", lang.hitch(this, this._delayedUpdate));
        domAttr.set(this.logo, "src", this.application.getConfig().getIcon("logo"))
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

	userChange: function() {
	},
	localeChange: function() {
        this._updateSearchPlaceHolder();
	},

    //===================================================
    // Private methods
    //===================================================

    _showCommunities: function() {
        this._currentTab = "Communities";
		domClass.remove(this.peopleButtonNode, "selected");
		domClass.remove(this.recentButtonNode, "selected");
		domClass.add(this.communitiesButtonNode, "selected");
		domStyle.set(this.peopleNode, "display", "none");
		domStyle.set(this.recentNode, "display", "none");
		domStyle.set(this.communitiesNode, "display", "");
		domStyle.set(this.searchArea, "display", "");
        this._updateSearchPlaceHolder();
		this._currentSearchTerm = ""; //making sure new searchterm  goes through as "" != null.
		domAttr.set(this.searchNode, "value", "");
		this._update();
	},
	
	_delayedUpdate: function(event) {
		if (event.keyCode === keys.ENTER) {
			this._update();
			return;
		}
		if (this._timer != null) {
			clearTimeout(this._timer);
		}
		if (this._timerLock) {
			this._queuedTimer = true;
		} else {
			this._timer = setTimeout(lang.hitch(this, this._update), 200);
		}
	},
	_lockTimer: function() {
		this._timerLock = true;
	},
	_unlockTimer: function() {
		this._timerLock = false;
		if (this._queuedTimer) {
			this._timer = setTimeout(lang.hitch(this, this._update), 200);
			this._queuedTimer = false;
		}
	},

	_update: function() {
		this._lockTimer();
		var searchTerm = domAttr.get(this.searchNode, "value");
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
		domAttr.set(this.communitiesNode, "innerHTML", "");
		var searchcontext = this.application.getStore().getContext(this.application.repository+"_search");
		
		searchcontext.search({term: this._currentSearchTerm, entryType: ["Local"], graphType: ["Group"], queryType: "solr",
			onSuccess: lang.hitch(this, function(entryResult) {
				folio.data.getList(entryResult, lang.hitch(this, function(list) {
					list.getPage(0, 50, lang.hitch(this, function(children) {
						var acceptCount = 0;
						array.forEach(children, function(child) {
							if (acceptCount < 20 && child.readAccessToMetadata) {
								this._createCommunityCard(child);
								acceptCount++;
							}
						}, this);
						this._unlockTimer();
					}));
				}));
			}),
			onError: lang.hitch(this, function(error) {
			})
		});
	},
	
	_createCommunityCard: function(groupEntry) {
		var groupDiv = domConstruct.create("div", {"class": "card distinctBackground"}, this.communitiesNode);
		var imgWrap = domConstruct.create("div", {"class": "principalPicture"}, groupDiv);
		if (this.cookieMonster) {
			domConstruct.create("img", {src: "http://www.northern-pine.com/songs/images/cookie.gif", style: {"max-width": "100px"}}, imgWrap);
		} else {
			var imageUrl = folio.data.getFromMD(groupEntry, folio.data.FOAFSchema.IMAGE) || this.application.getConfig().getIcon("group");
			domConstruct.create("img", {src: imageUrl}, imgWrap);
		}
		var name = folio.data.getLabelRaw(groupEntry) || groupEntry.name || groupEntry.getId();
		domConstruct.create("span", {"innerHTML": name}, groupDiv);

		var navIcons = domConstruct.create("div", {"class": "navIcons"}, groupDiv);
		on(groupDiv, "click", this, lang.hitch(this, function(event) {
			if (navIcons == null || !dom.isDescendant(event.target, navIcons)) {
				this.application.openEntry(groupEntry, "profile");
			}
		}));
		
		domConstruct.create("a", {"class": "icon24 home", href: this.application.getHref(groupEntry, "profile")}, navIcons);
		var hc = groupEntry.getHomeContext();
		if (hc) {
			var hcid = hc.substr(hc.lastIndexOf("/")+1);
			domConstruct.create("a", {"class": "icon24 folder", href: this.application.getHref(this.application.getRepository()+hcid+"/entry/_top", "default")}, navIcons);
		} else {
			domConstruct.create("span", {"class": "icon24 folder disabled"}, navIcons);
		}
	},
	_showPeople: function() {
        this._currentTab = "People";
		domClass.remove(this.recentButtonNode, "selected");
		domClass.remove(this.communitiesButtonNode, "selected");
		domClass.add(this.peopleButtonNode, "selected");
		domStyle.set(this.recentNode, "display", "none");
		domStyle.set(this.communitiesNode, "display", "none");
		domStyle.set(this.peopleNode, "display", "");
		domStyle.set(this.searchArea, "display", "");
        this._updateSearchPlaceHolder();
		this._currentSearchTerm = ""; //making sure new searchterm  goes through as "" != null.
		domAttr.set(this.searchNode, "value", "");
		this._update();
	},

    _updateSearchPlaceHolder: function() {
        switch(this._currentTab) {
            case "Communities":
                domAttr.set(this.searchNode, "placeholder", this.NLS.start.searchCommunities);
                break;
            case "People":
                domAttr.set(this.searchNode, "placeholder", this.NLS.start.searchPeople);
                break;
        }
    },
	
	_updatePeople: function() {
		domAttr.set(this.peopleNode, "innerHTML", "");
		var searchcontext = this.application.getStore().getContext(this.application.repository+"_search");
		searchcontext.search({term: this._currentSearchTerm, entryType: ["Local"], graphType: ["User"], queryType: "solr",
			onSuccess: lang.hitch(this, function(entryResult) {
				folio.data.getList(entryResult, lang.hitch(this, function(list) {
					list.getPage(0, 50, lang.hitch(this, function(children) {
						var acceptCount = 0;
						array.forEach(children, function(child) {
							if (acceptCount < 20 && child.readAccessToMetadata) {
								this._createPeopleCard(child);
								acceptCount++;
							}
						}, this);
						this._unlockTimer();
					}));
				}));
			}),
			onError: lang.hitch(this, function(error) {
			})
		});
	},
	_createPeopleCard: function(personEntry) {
		var userDiv = domConstruct.create("div", {"class": "card distinctBackground"}, this.peopleNode);
		var imgWrap = domConstruct.create("div", {"class": "principalPicture"}, userDiv);
		if (this.cookieMonster) {
			domConstruct.create("img", {src: "http://www.northern-pine.com/songs/images/cookie.gif", style: {"max-width": "100px"}}, imgWrap);
		} else {
            domConstruct.create("img", {src: this.application.getConfig().getIcon("user")}, imgWrap);
            var imageUrl = folio.data.getFromMD(personEntry, folio.data.FOAFSchema.IMAGE);
            if (imageUrl) {
                utils.lazyLoadImage(imgWrap, imageUrl);
            }
		}
		var name = folio.data.getLabelRaw(personEntry) || personEntry.name || personEntry.getId();
		domConstruct.create("span", {"innerHTML": name}, userDiv);
		var navIcons = domConstruct.create("div", {"class": "navIcons"}, userDiv);
		on(userDiv, "click", this, lang.hitch(this, function(event) {
			if (navIcons == null || !dom.isDescendant(event.target, navIcons)) {
				this.application.openEntry(personEntry, "profile");
			}
		}));
		domConstruct.create("a", {"class": "icon24 home", href: this.application.getHref(personEntry, "profile")}, navIcons);
		var hc = personEntry.getHomeContext();
		if (hc) {
			var hcid = hc.substr(hc.lastIndexOf("/")+1);
			domConstruct.create("a", {"class": "icon24 folder", href: this.application.getHref(this.application.getRepository()+hcid+"/entry/_top", "default")}, navIcons);
		} else {
			domConstruct.create("span", {"class": "icon24 folder disabled"}, navIcons);
		}
	},
		
	_showRecent: function() {
		domClass.remove(this.communitiesButtonNode, "selected");
		domClass.remove(this.peopleButtonNode, "selected");
		domClass.add(this.recentButtonNode, "selected");
		domStyle.set(this.communitiesNode, "display", "none");
		domStyle.set(this.peopleNode, "display", "none");
		domStyle.set(this.recentNode, "display", "");
		domStyle.set(this.searchArea, "display", "none");

		this._showingRecent = true;

		//TODO: Perhaps also add Link_Reference to the query.
		this.recentSearchList.show({
			graphType: ["None"],
			entryType: ["Local", "Link"],
			sort: "modified+desc",
			queryType: "solr"
		});
	}
});
});