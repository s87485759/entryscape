/*global define, __confolio*/
define(["dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/_base/array",
    "dojo/_base/connect",
    "dojo/dom",
    "dojo/dom-style",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "folio/util/Widget",
    "folio/navigation/PrincipalInfo", //in template
    "folio/list/SearchList", //in template
    "folio/list/List", //in template
    "folio/util/utils",
    "dojo/text!./ProfileTemplate.html"
], function (declare, lang, on, array, connect, dom, domStyle, domClass, domConstruct, domAttr, Widget,
             PrincipalInfo, SearchList, List, utils, template) {

    /**
     * Shows profile information, group membership, access to portfolios and folders, and latest material.
     * The profile information includes username, home portfolio and user profile metadata.
     */
    return declare([Widget], {
        //===================================================
        // Public and inherited Attributes
        //===================================================
        twoColumn: true,
        nls: ["profile"],
        templateString: template,

        //===================================================
        // Inherited methods
        //===================================================
        postCreate: function () {
            this.inherited("postCreate", arguments);
            this.application = __confolio.application;
            this.featuredList.application = __confolio.application;

            this.connect(this.foldersButtonNode, "click", this._showFolders);
            this.connect(this.communitiesButtonNode, "click", this._showCommunities);
            this.connect(this.membersButtonNode, "click", this._showMembers);
            this.connect(this.featuredButtonNode, "click", this._showFeatured);
            this.connect(this.recentButtonNode, "click", this._showRecent);
            connect.subscribe("/confolio/childrenChanged", lang.hitch(this, this._childrenChanged));
        },

        /**
         * Required by ViewMap to be able to set a nice breadcrumb.
         * @param {Object} params
         */
        getLabel: function (params) {
            return "userProfile";
        },
        show: function (params) {
            //The latest parameters are saved in order to be reused when some kind of change occurs (such as a user logs in or out)
            this.lastParams = params;
            this.entryUri = this.application.getRepository().replace(/:/g, "\\%3A") + "_principals/resource/" + params.entry;


            var f = lang.hitch(this, function (entry) {
                this.showEntry(entry);
            });
            this.application.getStore().loadEntry({
                    base: this.application.getRepository(),
                    contextId: "_principals",
                    entryId: params.entry},
                {},
                function (entry) {
                    if (entry.resource == null || entry.needRefresh()) {
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
        showEntry: function (entry) {
            this.entry = entry;
            delete this._currCommEntry;
            delete this._currFolderEntry;
            delete this._currFeaturedEntry;
            delete this._currRecentEntry;
            domStyle.set(this.foldersNode, "display", "none");
            if (folio.data.isUser(this.entry)) {
                domStyle.set(this.membersButtonNode, "display", "none");
                domStyle.set(this.communitiesButtonNode, "display", "");
                domStyle.set(this.membersNode, "display", "none");
                this._getHomeContext(lang.hitch(this, function () {
                    this.principalInfoDijit.show(this.entry);
                    this._showCommunities();
                    this._updateRightPane();
                }));
            } else {
                domStyle.set(this.membersButtonNode, "display", "");
                domStyle.set(this.communitiesButtonNode, "display", "none");
                domStyle.set(this.communitiesNode, "display", "none");
                delete this.homeContext;
                this._getHomeContext(lang.hitch(this, function () {
                    this.principalInfoDijit.show(this.entry);
                    this._showMembers();
                    this._updateRightPane();
                }));
            }
        },

        //===================================================
        // Private methods
        //===================================================
        userChange: function () {
            this.featuredList.use = this.user;

            if (this.lastParams && this.entry) {
                this.entry.setRefreshNeeded();
                this.show(this.lastParams);
            }
        },

        _childrenChanged: function (args) {
            if (this.entry && args.entry === this.entry.getId() && args.context === "_principals") {

            }
        },

        _getHomeContext: function (callback) {
            delete this.homeContext;
            var hc = this.entry.getHomeContext();
            if (hc != null) {
                this.application.getStore().loadEntry(hc,
                    {},
                    lang.hitch(this, function (entry) {
                        this.homeContext = entry;
                        callback();
                    }));
            } else {
                callback();
            }
        },
        _showCommunities: function () {
            domClass.remove(this.foldersButtonNode, "selected");
            domClass.add(this.communitiesButtonNode, "selected");
            domStyle.set(this.communitiesNode, "display", "");
            domStyle.set(this.foldersNode, "display", "none");
            if (this.entry === this._currCommEntry) {
                return;
            }
            this._currCommEntry = this.entry;
            domAttr.set(this.communitiesNode, "innerHTML", "");
            var addGroup = lang.hitch(this, function (groupEntry) {
                var groupDiv = domConstruct.create("div", {"class": "card distinctBackground"}, this.communitiesNode);
                var imgWrap = domConstruct.create("div", {"class": "principalPicture"}, groupDiv);
                domConstruct.create("img", {src: "" + this.application.getConfig().getIcon("group")}, imgWrap);
                var name = folio.data.getLabelRaw(groupEntry) || groupEntry.name || groupEntry.getId();
                domConstruct.create("span", {"innerHTML": name}, groupDiv);
                var navIcons = domConstruct.create("div", {"class": "navIcons"}, groupDiv);
                on(groupDiv, "click", this, lang.hitch(this, function (event) {
                    if (navIcons == null || !dom.isDescendant(event.target, navIcons)) {
                        this.application.openEntry(groupEntry, "profile");
                    }
                }));
                domConstruct.create("a", {"class": "icon24 home", href: this.application.getHref(groupEntry, "profile")}, navIcons);
                var hc = groupEntry.getHomeContext();
                if (hc) {
                    var hcid = hc.substr(hc.lastIndexOf("/") + 1);
                    domConstruct.create("a", {"class": "icon24 folder", href: this.application.getHref(this.application.getRepository() + hcid + "/entry/_top", "default")}, navIcons);
                } else {
                    domConstruct.create("span", {"class": "icon24 folder disabled"}, navIcons);
                }
            });
            array.forEach(this.entry.getGroups(), lang.hitch(this, function (groupUri) {
                this.application.getStore().loadEntry(groupUri, {}, addGroup);
            }));
        },
        _showMembers: function () {
            domClass.remove(this.foldersButtonNode, "selected");
            domClass.add(this.membersButtonNode, "selected");
            domStyle.set(this.membersNode, "display", "");
            domStyle.set(this.foldersNode, "display", "none");
            domAttr.set(this.membersNode, "innerHTML", "");
            folio.data.getAllChildren(this.entry, lang.hitch(this, function (children) {
                var cs = array.map(children, function (c) {
                    return {e: c, n: folio.data.getLabelRaw(c) || c.name || c.getId()};
                });
                cs.sort(function (e1, e2) {
                    return e1.n > e2.n;
                });
                array.forEach(cs, function (child) {
                    var userDiv = domConstruct.create("div", {"class": "card distinctBackground"}, this.membersNode);
                    var imgWrap = domConstruct.create("div", {"class": "principalPicture"}, userDiv);
                    var imageUrl = folio.data.getFromMD(child.e, folio.data.FOAFSchema.IMAGE);
                    var imageDefault = this.application.getConfig().getIcon("user");
                    if (window.location.href.indexOf("cookieMonster=true") !== -1) {
                        domConstruct.create("img", {src: "http://www.northern-pine.com/songs/images/cookie.gif"}, imgWrap);
                    } else {
                        domConstruct.create("img", {src: imageDefault}, imgWrap);
                        if (imgWrap) { //If an profilepicture is available, try to load it, if it exists it will replace the default image.
                            utils.lazyLoadImage(imgWrap, imageUrl);
                        }
                    }
                    domConstruct.create("span", {"innerHTML": child.n}, userDiv);
                    var navIcons = domConstruct.create("div", {"class": "navIcons"}, userDiv);
                    on(userDiv, "click", this, lang.hitch(this, function (event) {
                        if (navIcons == null || !dom.isDescendant(event.target, navIcons)) {
                            this.application.openEntry(child.e, "profile");
                        }
                    }));

                    domConstruct.create("a", {"class": "icon24 home", href: this.application.getHref(child.e, "profile")}, navIcons);
                    var hc = child.e.getHomeContext();
                    if (hc) {
                        var hcid = hc.substr(hc.lastIndexOf("/") + 1);
                        domConstruct.create("a", {"class": "icon24 folder", href: this.application.getHref(this.application.getRepository() + hcid + "/entry/_top", "default")}, navIcons);
                    } else {
                        domConstruct.create("span", {"class": "icon24 folder disabled"}, navIcons);
                    }
                }, this);
            }));
        },
        _showFolders: function () {
            domClass.add(this.foldersButtonNode, "selected");
            domClass.remove(this.communitiesButtonNode, "selected");
            domClass.remove(this.membersButtonNode, "selected");
            domStyle.set(this.communitiesNode, "display", "none");
            domStyle.set(this.membersNode, "display", "none");
            domStyle.set(this.foldersNode, "display", "");
            if (this.entry === this._currFolderEntry) {
                return;
            }
            this._currFolderEntry = this.entry;

            domAttr.set(this.foldersNode, "innerHTML", "");
            this.accessToContexts = [];
            var context = this.application.getStore().getContext(this.application.repository + "_search");
            context.search({term: "(resource.rw:" + this.entryUri + "+OR+admin:" + this.entryUri + ")", entryType: ["Local"], graphType: ["Context", "List"], sort: "modified+desc", queryType: "solr",
                onSuccess: lang.hitch(this, function (entryResult) {
                    folio.data.getList(entryResult, lang.hitch(this, function (list) {
                        list.getPage(0, 50, lang.hitch(this, function (children) {
                            var acceptCount = 0;
                            var contextIds = {};
                            array.forEach(children, function (child) {
                                if (folio.data.isContext(child)) {
                                    contextIds[child.getId()] = true;
                                }
                            });
                            array.forEach(children, function (child) {
                                if (acceptCount < 20 && child.readAccessToMetadata && !contextIds[child.getContext().getId()]) {
                                    if (this._addFolderEntry(child)) {
                                        acceptCount++;
                                    }
                                }
                            }, this);
                        }));
                    }));
                }),
                onError: lang.hitch(this, function (error) {
                })
            });
        },
        _addFolderEntry: function (entry) {
            var config = this.application.getConfig();
            var title, row, imgWrap;
            if (folio.data.isList(entry)) {
                title = folio.data.getLabelRaw(entry);
                if (title) {
                    row = domConstruct.create("div", {"class": "card distinctBackground"}, this.foldersNode);
                    imgWrap = domConstruct.create("div", {"class": "img-wrap"}, row);
                    domConstruct.create("img", {"class": "context", src: "" + config.getIcon("folder")}, imgWrap);
                    domConstruct.create("a", {innerHTML: title, href: this.application.getHref(entry.getUri(), "default")}, row);
                    return true;
                }
            } else {
                title = folio.data.getLabelRaw(entry) || entry.getId();
                row = domConstruct.create("div", {"class": "card distinctBackground"}, this.foldersNode);
                imgWrap = domConstruct.create("div", {"class": "img-wrap"}, row);
                domConstruct.create("img", {"class": "context", src: "" + config.getIcon("portfolio")}, imgWrap);
                domConstruct.create("a", {innerHTML: title, href: this.application.getHref(this.application.getRepository() + entry.getId() + "/entry/_top", "default")}, row);
                this.accessToContexts.push(entry);
            }
        },

        _updateRightPane: function () {
            if (this.homeContext) {
                this.application.getStore().loadEntry({
                        base: this.application.getRepository(),
                        contextId: this.homeContext.getId(),
                        entryId: "_featured"},
                    {},
                    lang.hitch(this, function (featuredE) {
                        folio.data.getAllChildren(featuredE, lang.hitch(this, function (children) {
                            if (children.length > 0) {
                                this._featuredEntry = featuredE;
                                this._featuredDisabled = false;
                                domClass.remove(this.featuredButtonNode, "disabled");
                                domAttr.set(this.featuredButtonNode, "title", "");
                                this._showFeatured();
                            } else {
                                this._featuredDisabled = true;
                                domClass.add(this.featuredButtonNode, "disabled");
                                domAttr.set(this.featuredButtonNode, "title", "No featured material available");
                                this._showRecent();
                            }
                        }));
                    }));
            } else {
                this._featuredDisabled = true;
                domClass.add(this.featuredButtonNode, "disabled");
                domAttr.set(this.featuredButtonNode, "title", "No featured material available");
                this._showRecent();
            }
        },
        _showFeatured: function () {
            //TODO if nothing to show, then maybe activate the noFeaturedMaterialNode block?
            if (this._featuredDisabled) {
                return;
            }
            domClass.add(this.featuredButtonNode, "selected");
            domClass.remove(this.recentButtonNode, "selected");
            domStyle.set(this.featuredNode, "display", "");
            domStyle.set(this.recentNode, "display", "none");
            if (this._featuredEntry === this._currFeaturedEntry) {
                return;
            }
            this._currFeaturedEntry = this._featuredEntry;
            this.featuredList.showList(this._featuredEntry);
        },

        _showRecent: function () {
            domClass.remove(this.featuredButtonNode, "selected");
            domClass.add(this.recentButtonNode, "selected");
            domStyle.set(this.featuredNode, "display", "none");
            domStyle.set(this.recentNode, "display", "");
            this._showingRecent = true;
            if (this.entry === this._currRecentEntry) {
                return;
            }
            this._currRecentEntry = this.entry;
            //TODO: Perhaps also add Link_Reference to the query.

            var term;
            if (folio.data.isUser(this.entry)) {
                term = "(creator:" + this.entryUri + "+OR+contributors:" + this.entryUri + ")";
            } else if (this.homeContext != null) {
                term = "context:" + this.homeContext.getResourceUri().replace(/:/g, "\\%3A");
            }
            if (term != null) {
                this.recentSearchList.show({
                    term: term,
                    graphType: ["None"],
                    entryType: ["Local", "Link"],
                    sort: "modified+desc",
                    queryType: "solr"
                });
            }
        },

        _addToContactList: function () {
            //Leave empty by default
        }
    });
});