/*global define, __confolio*/
define(["dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/connect",
    "dojo/_base/array",
    "dojo/on",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dojo/_base/fx",
    "dojo/fx",
    "dojo/fx/easing",
    "dijit/form/Select",
    "dijit/form/Button",
    "folio/util/Widget",
    "folio/util/dialog",
    "dojox/form/FileInput",
    "rdfjson/Graph",
    "rforms/model/Engine",
    "dojo/text!./RightsDialogTemplate.html"
], function (declare, lang, connect, array, on, domClass, style, construct, attr, fx, corefx, easing, Select,
             Button, Widget, dialog, FileInput, Graph, Engine, template) {

    /**
     * Show a dialog for creating all kinds of things.
     */
    return declare(Widget, {
        //===================================================
        // Public Attributes
        //===================================================
        entry: null,

        //===================================================
        // Inherited Attributes
        //===================================================
        templateString: template,
        nls: ["common", "acl"],

        //===================================================
        // Public API
        //===================================================
        show: function() {
            this.dialog = dialog.showStandardDialog(this, this.NLS.acl.dialogTitle, lang.hitch(this, this._finish), lang.hitch(this, this.onHide));
            this.dialog.setFinishButtonDisabled(true);
        },

        onHide: function() {
        },

        //===================================================
        // Inherited methods
        //===================================================


        postCreate: function() {
            this.inherited("postCreate", arguments);
            if (this.entry.getBuiltinType() === folio.data.BuiltinType.LIST) {
                style.set(this.applyRecursiveBlock, "display", "");
            }
            this.entry.getContext().getOwnEntry(lang.hitch(this, function(contextEntry) {
                this._entryACLList = folio.data.getACLList(this.entry);
                this._contextEntryACLList = folio.data.getACLList(contextEntry);

                this._setOverride(this._entryACLList.length > 0);
                this.setI18nState(this._overridden ? 2 : 1);
                this._idx(lang.hitch(this, this._render));
            }));
        },

        localeChange: function() {
//           this.url.set("invalidMessage", this.NLS.create.addressIsInvalid);
            this._options = [
                { label: this.NLS.acl.noAccess, value: "none" },
                { label: this.NLS.acl.canRead, value: "read" },
                { label: this.NLS.acl.canReadMetadata, value: "mread"},
                { label: this.NLS.acl.canWrite, value: "write" },
                { label: this.NLS.acl.isOwner, value: "admin" }
            ];
        },

        //===================================================
        // Private methods
        //===================================================
        _finish: function(callback) {
            if (!this._overridden) {
                folio.data.setACLList(this.entry, []);
            } else {
                folio.data.setACLList(this.entry, this._entryACLList);
            }

            var recursive = false;
            if (this.entry.getBuiltinType() === folio.data.BuiltinType.LIST && this.applyRecursive.get("checked")) {
                recursive = true;
            }
            this.entry.saveInfoWithRecusiveACL(recursive,
                lang.hitch(this,function() {
                    if(recursive){
                        this.entry.getContext().getStore().clearCache();
                        this.application.dispatch({action: "orderChange"});
                    }
                    callback(true);
                }),
                lang.hitch(this,function(message) {
                    this.application.message(message);
                    callback(false);
                }));
        },

        _idx: function(callback) {
            this._entryIdx = {};

            var store = this.application.getStore();
            var cd = this._entryACLList.length + this._contextEntryACLList.length;
            var cdFnc = function() {
                cd--;
                if (cd === 0) {
                    callback();
                }
            };
            var suc = lang.hitch(this, function(entry) {
                this._entryIdx[entry.getResourceUri()] = entry;
                cdFnc();
            });
            var load = function(ac) {
                store.loadEntry(ac.uri, {}, suc, cdFnc);
            };
            array.forEach(this._contextEntryACLList, load);
            array.forEach(this._entryACLList, load);
        },

        _render: function() {
            this._renderOwners();
            attr.set(this.shareBlock, "innerHTML", "");
            this._renderGuestAndUsers();
            this._renderCustom();
        },

        _renderOwners: function() {
            attr.set(this.owners, "innerHTML", "");
            array.forEach(this._contextEntryACLList, lang.hitch(this, function(ac) {
                if (ac.admin) {
                    var entry = this._entryIdx[ac.uri];
                    this._renderPrincipal(folio.data.isUser(entry), folio.data.getLabel(entry), this.owners);
                }
            }));
        },

        _renderGuestAndUsers: function() {
            var guestAC, usersAC;
            var list = this._overridden ? this._entryACLList : this._contextEntryACLList;
            array.forEach(list, lang.hitch(this, function(ac) {
                if (ac.entryId === "_guest") {
                    guestAC = ac;
                } else if (ac.entryId === "_users") {
                    usersAC = ac;
                }
            }));
            var principalBase = this.application.getRepository()+"_principals/resource/";
            if (guestAC == null) {
                guestAC = {entryId: "_guest", uri: principalBase+"_guest"};
                list.push(guestAC);
            }
            if (usersAC == null) {
                usersAC = {entryId: "_users", uri: principalBase+"_users"};
                list.push(usersAC);
            }
            this._renderCustomRow(guestAC, true, this.NLS.acl["public"], false);
            this._renderCustomRow(usersAC, false, this.NLS.acl["users"], false);
            //Actually do the rendering of guest and users.
        },

        _renderCustom: function() {
            if (this._overridden) {
                array.forEach(this._entryACLList, lang.hitch(this, function(ac) {
                    if (ac.entryId !== "_guest" && ac.entryId !== "_users") {
                        this._renderRow(ac);
                    }
                }));
            } else {
                array.forEach(this._contextEntryACLList, lang.hitch(this, function(ac) {
                    if (!ac.admin && ac.entryId !== "_guest" && ac.entryId !== "_users") {
                        this._renderRow(ac);
                    }
                }));
            }
        },
        _renderRow: function(ac) {
            var entry = this._entryIdx[ac.uri];
            this._renderCustomRow(ac, folio.data.isUser(entry), folio.data.getLabel(entry), true);
        },
        _renderCustomRow: function(ac, isUser, label, canRemove) {
            var row = construct.create("div", null, this.shareBlock);
            this._renderPrincipal(isUser, label, construct.create("div", {"class": "principalLabel"}, row));
            var access, txt;
            if (ac.admin) {
                access = "admin";
                txt = this.NLS.acl.isOwner;
            } else if (ac.rwrite) {
                access = "write";
                txt = this.NLS.acl.canWrite;
            } else if (ac.rread) {
                access = "read";
                txt = this.NLS.acl.canRead;
            } else if (ac.mread) {
                access = "mread";
                txt = this.NLS.acl.canReadMetadata;
            } else {
                access = "none";
                txt = this.NLS.acl.noAccess;
            }

            if (this._overridden) {
                var self = this;
                var f = function() {
                    delete ac.admin;
                    delete ac.rread;
                    delete ac.rwrite;
                    delete ac.mread;
                    delete ac.mwrite;
                    switch (this.get("value")) {
                        case "admin":
                            ac.admin = true;
                            break;
                        case "write":
                            ac.rwrite = true;
                            ac.mwrite = true;
                            break;
                        case "read":
                            ac.rread = true;
                        case "mread":
                            ac.mread = true;
                    }
                    self.dialog.setFinishButtonDisabled(false);
                }
                new Select({onChange: f, options: this._options, value: access}, construct.create("div", null, construct.create("div", {"class": "accessRights"}, row)));
            } else {
                construct.create("div", {"innerHTML": txt}, construct.create("div", {"class": "accessRights"}, row));
            }
            if (canRemove) {
                var node = construct.create("span", {"class": "icon delete"}, construct.create("div", {"class": "removeRow"}, row));
                on(node, "click", lang.hitch(this, function() {
                    this._entryACLList = array.filter(this._entryACLList, function(elem) {
                        return elem !== ac;
                    }, this);
                    this._addPrincipalSearchChange();
                    this._render();
                    this.dialog.setFinishButtonDisabled(false);
                }));
            } else {
                construct.create("span", {"class": "icon delete disabled"}, construct.create("div", {"class": "removeRow"}, row));
            }
        },

        _renderPrincipal: function(isUser, label, parent, underlineSubstr) {
            var pnode = construct.create("div", {"class": "principal"}, parent);
            if (isUser) {
                construct.create("img", {"src": this.application.getConfig().getIcon("user", "16x16")}, pnode);
            } else {
                construct.create("img", {"src": this.application.getConfig().getIcon("group", "16x16")}, pnode);
            }
            if (underlineSubstr == null || label.indexOf(underlineSubstr) === -1) {
                construct.create("span", {"innerHTML": label}, pnode);
            } else {
                var idx = label.indexOf(underlineSubstr);
                construct.create("span", {"innerHTML": label.substr(0,idx)}, pnode);
                construct.create("span", {"class": "match", "innerHTML": label.substr(idx, underlineSubstr.length)}, pnode);
                construct.create("span", {"innerHTML": label.substr(idx+underlineSubstr.length)}, pnode);
            }
            return pnode;
        },
        _renderAddPrincipal: function(isUser, label, parent, underlineSubstr) {
            var node = this._renderPrincipal(isUser, label, parent, underlineSubstr);
            construct.create("span", {"class":"icon new"}, node);
        },

        _setOverride: function(to) {
            if (to) {
                this._overridden = true;
                this.setI18nState(2);
                this.principalSearch.set("disabled", false);
                this.principalSearch.set("placeholder", this.NLS.acl.principalSearchPlaceHolder);
                if (this._entryACLList.length == 0) {
                    array.forEach(this._contextEntryACLList, lang.hitch(this, function(ac) {
                        if (ac.rwrite) {
                            this._entryACLList.push({entryId: ac.entryId, uri: ac.uri, rwrite: true, mwrite: true});
                        } else if (ac.rread) {
                            this._entryACLList.push({entryId: ac.entryId, uri: ac.uri, rread: true, mread: true});
                        }
                    }))
                }
                this.dialog && this.dialog.setFinishButtonDisabled(false);
                this.applyRecursive.set("disabled", false);
            } else {
                this._overridden = false;
                this.setI18nState(1);
                attr.set(this.searchResults, "innerHTML", "");
                this.principalSearch.set("value", "");
                this.principalSearch.set("disabled", true);
                this.dialog && this.dialog.setFinishButtonDisabled(false);
                this.applyRecursive.set("disabled", false);
            }
        },
        _overrideChange: function(to) {
            this._setOverride(!this._overridden);
            this._render();
        },
        _addPrincipalSearchChange: function() {
            if (this._principalSearchTimer) {
                clearTimeout(this._principalSearchTimer);
            }
            this._principalSearchTimer = setTimeout(lang.hitch(this, function() {
                delete this._principalSearchTimer;
                this.searchFor = this.principalSearch.get("value");

                var searchcontext = this.application.getStore().getContext(this.application.repository+"_search");
                var params = {entryType: ["Local"], resourceType: ["User", "Group"], queryType: "solr"};
                params.term = "title:"+this.searchFor;
                params.onSuccess = lang.hitch(this, function(entryResult) {
                    folio.data.getList(entryResult, lang.hitch(this, this._showResults));
                });
                params.onError = lang.hitch(this, function(error) {});
                searchcontext.search(params);

            }), 400);
        },
        _showResults: function(list) {
            if (this._loading) {
                return;
            }
            this._loading = true;

            list.getPage(0, 10, lang.hitch(this, function(children) {
                attr.set(this.searchResults, "innerHTML", "");
                this._searchListPrincipals = [];
                array.forEach(children, function(child) {
                    var entryId = child.getId();
                    if (this._canBeAdded(child)) {
                        this._searchListPrincipals.push(child);
                        this._renderAddPrincipal(folio.data.isUser(child), folio.data.getLabel(child), this.searchResults, this.searchFor);
                    }
                }, this);
                this._loading = false;
            }));
        },
        _canBeAdded: function(entry) {
            var entryId = entry.getId();
            return !array.some(this._contextEntryACLList, function(ac) {
                return ac.admin && ac.entryId === entryId;
            }) && !array.some(this._entryACLList, function(ac) {
                return ac.entryId === entryId;
            });
        },
        _principalAdd: function(ev) {
            var node = ev.target;
            var ancestor = this.searchResults;
            var idx = -1;
            while(node != ancestor){
                if (node.parentNode === ancestor) {
                    idx = array.indexOf(node.parentNode.childNodes, node);
                }
                node = node.parentNode;
            }
            if (idx >= 0) {
                var entry = this._searchListPrincipals[idx];
                this._entryIdx[entry.getResourceUri()] = entry;
                this._entryACLList.push({entryId: entry.getId(), uri: entry.getResourceUri()});
                this._addPrincipalSearchChange();
                this._render();
            }
        }
    });
});