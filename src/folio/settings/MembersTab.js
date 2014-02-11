/*global define, __confolio*/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/connect",
    "dojo/on",
    "dojo/_base/array",
    "dojo/dom",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dojo/dom-geometry",
    "folio/util/Widget",
    "dojox/form/BusyButton",
    "folio/editor/RFormsEditorPlain",
    "folio/editor/RFormsPresenter",
    "rdfjson/Graph",
    "dojo/text!./MembersTabTemplate.html"
], function (declare, lang, connect, on, array, dom, domClass, style, construct, attr, geom, Widget, BusyButton, RFormsEditorPlain, RFormsPresenter, Graph, template) {

    /**
     * Shows list of members, supports finding new users to add as members and remove old members.
     */
    return declare([Widget], {
        //===================================================
        // Inherited Attributes
        //===================================================
        templateString: template,
        nls: ["settings"],

        //===================================================
        // Private Attributes
        //===================================================
        _currentListState: "members",

        //===================================================
        // Inherited methods
        //===================================================
        postCreate: function () {
            this.application = __confolio.application;
            this.inherited("postCreate", arguments);
            this.connect(this._membersChoiceDijit, "onClick", lang.hitch(this, this._listStateUpdate, "members"));
            this.connect(this._nonMembersChoiceDijit, "onClick", lang.hitch(this, this._listStateUpdate, "nonmembers"));
            this.connect(this._allUsersChoiceDijit, "onClick", lang.hitch(this, this._listStateUpdate, "allusers"));
            this._searchTermDijit.validator = function(val) {
                return val.length === 0 || val.length >= 3;
            }
            on(this._scrollBoxNode, "scroll", lang.hitch(this, this._listScrolling));
        },

        showEntry: function (entry) {
            this.entry = entry;
            this._principalACL = folio.data.getACLList(entry);
            //Update editor
            this._updateList();
            var homeContextUri = this.entry.getHomeContext();
            if (homeContextUri != null) {
                this.application.getStore().loadEntry(homeContextUri, {},
                    lang.hitch(this, function(homeContext) {
                        this._homeContext = homeContext;
                        this._homeContextACL = folio.data.getACLList(this._homeContext);
                    }));
            }
        },

        //===================================================
        // Private methods
        //===================================================
        _localize: function() {},
        _listScrolling: function(args) {
            var bb = geom.position(this._scrollBoxNode);
            var inbb = geom.position(this._memberListNode);
            var left = inbb.y+inbb.h - bb.y -bb.h; //How many pixels left to scroll down to bottom.
            if (left < 180 && !this._allUsersLoaded) {
                this._loadNextPage();
            }
        },
        _listStateUpdate: function(choice) {
            this._currentListState = choice;
            this._updateList();
        },
        _updateSearchTerm: function() {
            if (this._searchTermTimeout) {
                clearTimeout(this._searchTermTimeout);
            }
            this._searchTermTimeout = setTimeout(lang.hitch(this, function() {
                delete this._searchTermTimeout;
                var val = this._searchTermDijit.get("value");
                if (val.length === 0 || val.length >= 3) {
                    this._currentSearchTerm = val;
                    this._updateList();
                }
            }), 200);
        },
        _updateList: function() {
            if (this._currentSearchTerm === this._lastSearchTerm && this._currentListState === this._lastListState && this._lastEntry === this.entry) {
                return;
            }
            this._lastSearchTerm = this._currentSearchTerm;
            this._lastListState = this._currentListState;
            this._lastEntry = this.entry;
            attr.set(this._memberListNode, "innerHTML", "");
            style.set(this._loadingMessage, "display", "");

            var searchcontext = this.application.getStore().getContext(this.application.repository+"_search");
            var params = {entryType: ["Local"], graphType: ["User"], queryType: "solr"};
            if (this._currentSearchTerm != null && this._currentSearchTerm != "") {
                params.term = "title:"+this._currentSearchTerm;
            }
            if (this._currentListState == "members") {
                params.folders = [this.entry.getResourceUri()];
            } else if (this._currentListState === "nonmembers") {
                params.excludeLists = [this.entry.getResourceUri()];
            }
            params.onSuccess = lang.hitch(this, function(entryResult) {
                folio.data.getList(entryResult, lang.hitch(this, function(list) {
                    this._currentList = list;
                    this._currentLastPage = -1;
                    this._allUsersLoaded = false;
                    this._loadNextPage();
                }));
            });
            params.onError = lang.hitch(this, function(error) {});
            searchcontext.search(params);
        },
        _loadNextPage: function() {
            if (this._loading) {
                return;
            }
            this._loading = true;
            style.set(this._loadingMessage, "display", "");

            this._currentList.getPage(this._currentLastPage+1, 50, lang.hitch(this, function(children) {
                this._currentLastPage++;
                if (children.length<50) {
                    this._allUsersLoaded = true;
                }
                array.forEach(children, function(child) {
                    if (child.readAccessToMetadata) {
                        this._createPeopleCard(child);
                    }
                }, this);
                style.set(this._loadingMessage, "display", "none");
                this._loading = false;
            }));
        },
        _createPeopleCard: function(personEntry, replaceNode) {
            var refs = personEntry.getGroups(), group = this.entry.getResourceUri();
            var isMember = array.some(refs, function(ref) {
                return ref === group;
            });
            var isOwner = array.some(this._principalACL, function(ac) {
                return  ac.admin === true && ac.entryId === personEntry.getId();
            });
            var memberCls = isMember ? isOwner ? " owner" : " member" : "";
            var userDiv;
            if (replaceNode) {
                userDiv = construct.create("div", {"class": "card distinctBackground"+memberCls}, replaceNode, "replace");
            } else {
                userDiv = construct.create("div", {"class": "card distinctBackground"+memberCls}, this._memberListNode);
            }
            var imgWrap = construct.create("div", {"class": "principalPicture"}, userDiv);
            if (this.cookieMonster) {
                construct.create("img", {src: "http://www.northern-pine.com/songs/images/cookie.gif", style: {"max-width": "100px"}}, imgWrap);
            } else {
                var imageUrl = folio.data.getFromMD(personEntry, folio.data.FOAFSchema.IMAGE) || this.application.getConfig().getIcon("user");
                construct.create("img", {src: imageUrl}, imgWrap);
            }
            var name = folio.data.getLabelRaw(personEntry) || personEntry.name || personEntry.getId();
            construct.create("span", {"innerHTML": name}, userDiv);
            var navIcons = construct.create("div", {"class": "navIcons"}, userDiv);
            on(userDiv, "onclick", lang.hitch(this, function(event) {
                if (navIcons == null || !dom.isDescendant(event.target, navIcons)) {
                    this.application.openEntry(personEntry, "profile");
                }
            }));
            if (isOwner) {
                on(construct.create("span", {"class": "icon24 toolDelete"}, navIcons), "click", lang.hitch(this, this._toggleOwner, personEntry, userDiv, false));
            } else if (isMember) {
                on(construct.create("span", {"class": "icon24 toolAdd"}, navIcons), "click", lang.hitch(this, this._toggleOwner, personEntry, userDiv, true));
                on(construct.create("span", {"class": "icon24 delete"}, navIcons), "click", lang.hitch(this, this._toggleMember, personEntry, userDiv, false));
            } else {
                on(construct.create("span", {"class": "icon24 new"}, navIcons), "click", lang.hitch(this, this._toggleMember, personEntry, userDiv, true));
            }
            construct.create("a", {"class": "icon24 home", href: this.application.getHref(personEntry, "profile")}, navIcons);
        },
        _toggleOwner: function(memberEntry, node, add) {
            var acl = lang.clone(this._principalACL), id = memberEntry.getId();
            if (add) {
                acl.push({uri: memberEntry.getUri(), entryId: id, admin: true});
            } else {
                if (this.user && memberEntry.getId() === this.user.id) {
                    alert("You cannot demote yourself from owner to a regular user for security reasons.\nContact another owner to do it for you.");
                    return;
                }
                acl = array.filter(acl, function(ac) {
                    return ac.admin !== true || ac.entryId !== id;
                });
            }
            folio.data.setACLList(this.entry, acl);
            var savef = lang.hitch(this, function() {
                this.entry.setRefreshNeeded();
                this.entry.refresh(lang.hitch(this, function() {
                    this.application.publish("changed", {entry: this.entry, source: this});
                    this._principalACL = acl;
                    this._toggleOwnerOfHomeContext(memberEntry, add);
                    this._createPeopleCard(memberEntry, node);
                }));
            });
            this.entry.saveInfo(savef, function() {});
        },
        _toggleOwnerOfHomeContext: function(memberEntry, add) {
            if (this._homeContext != null) {
                var mid = memberEntry.getId();
                if (add) {
                    if (!array.some(this._homeContextACL, function(ac) {
                        if (ac.entryId === mid) {
                            ac.admin = true;
                            return true;
                        }
                    })) {
                        this._homeContextACL.push({entryId: mid, admin: true});
                    }
                } else {
                    this._homeContextACL = array.filter(this._homeContextACL, function(ac) {
                        if (ac.entryId === mid && ac.admin) {
                            delete ac.admin;
                        }
                        return ac.mread || ac.mwrite || ac.rread || ac.rwrite || ac.admin;
                    });
                }
                folio.data.setACLList(this._homeContext, this._homeContextACL);
                this._homeContext.saveInfo(function() {}, function() {}); //TODO better handling if things go wrong.
            }
        },
        _toggleMember: function(memberEntry, node, add) {
            if (this.user && !add && memberEntry.getId() === this.user.id) {
                alert("You cannot remove yourself from a group where you are an owner for security reasons.\nContact another owner to do it for you.");
                return;
            }

            var savef = lang.hitch(this, function() {
                memberEntry.setRefreshNeeded();
                this.entry.setRefreshNeeded();
                this.application.publish("childrenChanged", {entry: this.entry, source: this});
                memberEntry.refresh(lang.hitch(this, function() {
                    this.entry.refresh(lang.hitch(this, function() {
                        if (this._currentListState === "allusers") {
                            this._createPeopleCard(memberEntry, node);
                        } else {
                            construct.destroy(node);
                        }
                    }));
                }));
            });
            folio.data.getList(this.entry, function(list) {
                list.loadMissing(function(childrenE) {
                    if (add) {
                        list.addEntry(memberEntry);
                    } else {
                        list.removeEntryId(memberEntry.getId());
                    }
                    list.save(savef);
                });
            });
        }
    });
});