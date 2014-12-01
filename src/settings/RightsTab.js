/*global define, __confolio*/
define(["dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/dom-style",
    "dojo/dom-attr",
    "folio/util/Widget",
    "dijit/form/RadioButton", //in template
    "dojox/form/BusyButton",  //in template
    "dojo/text!./RightsTabTemplate.html"
], function (declare, lang, array, domStyle, domAttr, Widget, RadioButton, BusyButton, template) {

    /**
     * Shows profile information, group membership, access to portfolios and folders, and latest material.
     * The profile information includes username, home portfolio and user profile metadata.
     */
    return declare(Widget, {
        //===================================================
        // Inherited Attributes
        //===================================================
        templateString: template,
        nlsBundles: ["settings", "common"],

        //===================================================
        // Inherited methods
        //===================================================
        postCreate: function () {
            this.application = __confolio.application;
            this.inherited("postCreate", arguments);

            this.connect(this._principalGuestChoiceDijit, "onClick", lang.hitch(this, this._principalACLChange, "_guest", "mread"));
            this.connect(this._principalUsersChoiceDijit, "onClick", lang.hitch(this, this._principalACLChange, "_users", "mread"));
            this.connect(this._principalPrivateChoiceDijit, "onClick", lang.hitch(this, function() {
                this._principalACLChange(this._principal.getId(), "mread");
            }));
            this.connect(this._membersGuestChoiceDijit, "onClick", lang.hitch(this, this._principalACLChange, "_guest", "rread"));
            this.connect(this._membersUsersChoiceDijit, "onClick", lang.hitch(this, this._principalACLChange, "_users", "rread"));
            this.connect(this._membersMembersChoiceDijit, "onClick", lang.hitch(this, function() {
                this._principalACLChange(this._principal.getId(), "rread");
            }));
            this.connect(this._portfolioGuestChoiceDijit, "onClick", lang.hitch(this, this._portfolioACLChange, "_guest", "rread"));
            this.connect(this._portfolioUsersChoiceDijit, "onClick", lang.hitch(this, this._portfolioACLChange, "_users", "rread"));
            this.connect(this._portfolioPrivateChoiceDijit, "onClick", lang.hitch(this, function() {
                this._portfolioACLChange(this._principal.getId(), "rread");
            }));
        },

        showEntry: function (entry) {
            this._principal = entry;
            this._principalACL = folio.data.getACLList(entry);

            if (folio.data.isUser(this._principal)) {
                this.setI18nState(1);
                domStyle.set(this._groupMembersBlockNode, "display", "none");
            } else {
                this.setI18nState(2);
                domStyle.set(this._groupMembersBlockNode, "display", "");
            }
            //Update editor
            var id = this._principal.getId();
            var rights = {mread: {}, rread: {}};
            array.forEach(this._principalACL, function(ac) {
                if (ac.mread) {
                    rights.mread[ac.entryId] = true;
                }
                if (ac.rread) {
                    rights.rread[ac.entryId] = true;
                }
            });
            if (rights.mread["_guest"]) {
                this._principalGuestChoiceDijit.set("checked", true);
            } else if (rights.mread["_users"]) {
                this._principalUsersChoiceDijit.set("checked", true);
            } else if (rights.mread[id]) {
                this._principalPrivateChoiceDijit.set("checked", true);
            } else {
                //Set none selected
                this._principalPrivateChoiceDijit.set("checked", true);
                this._principalPrivateChoiceDijit.set("checked", false);
            }
            if (rights.rread["_guest"]) {
                this._membersGuestChoiceDijit.set("checked", true);
            } else if (rights.rread["_users"]) {
                this._membersUsersChoiceDijit.set("checked", true);
            } else if (rights.rread[id]) {
                this._membersMembersChoiceDijit.set("checked", true);
            } else {
                //Set none selected
                this._membersMembersChoiceDijit.set("checked", true);
                this._membersMembersChoiceDijit.set("checked", false);
            }

            var homeContextUri = this._principal.getHomeContext();
            if (homeContextUri != null) {
                this.application.getStore().loadEntry(homeContextUri, {},
                    lang.hitch(this, this._setHomeContext));
            } else {
                domStyle.set(this._homeContextRights, "display", "none");
            }
        },
        localize: function() {
            this._savePrincipalAccessButton.set("busyLabel", this.NLSBundles.common.saveInProgress);
            this._savePortfolioAccessButton.set("busyLabel", this.NLSBundles.common.saveInProgress);
        },

        //===================================================
        // Private methods
        //===================================================
        _userChange: function () {
            this._user = this.application.getUser();
            if (this._user == null) {
                return;
            }
            this._userUri = this.application.getRepository()+"_principals/entry/"+this._user.id;
            domStyle.set(this._selectHomeContext, "display", "none");
            if (this._user.id === "_admin") {
                this._isAdmin = true;
                domStyle.set(this._selectHomeContext, "display", "");
            } else {
                this.application.getStore().loadEntry(this._userUri, {}, lang.hitch(this, function(entry) {
                    if (array.some(entry.getGroups(), function(uri) {
                        return uri.lastIndexOf("_admins") + 7 === uri.length;
                    })) {
                        domStyle.set(this._selectHomeContext, "display", "");
                        this._isAdmin = true;
                    }
                }));
            }
        },

        _setHomeContext: function(homeContext) {
            domStyle.set(this._homeContextRights, "display", "");
            this._homeContext = homeContext;
            this._homeContextIdDijit.set("value", this._homeContext.getId());
            this._homeContextACL = folio.data.getACLList(this._homeContext);
            var rights = {rread: {}};
            array.forEach(this._homeContextACL, function(ac) {
                if (ac.rread) {
                    rights.rread[ac.entryId] = true;
                }
            });
            if (rights.rread["_guest"]) {
                this._portfolioGuestChoiceDijit.set("checked", true);
            } else if (rights.rread["_users"]) {
                this._portfolioUsersChoiceDijit.set("checked", true);
            } else if (rights.rread[this._principal.getId()]) {
                this._portfolioPrivateChoiceDijit.set("checked", true);
            } else {
                //Set none selected
                this._portfolioPrivateChoiceDijit.set("checked", true);
                this._portfolioPrivateChoiceDijit.set("checked", false);
            }
        },

        _principalACLChange: function(principalId, acp) {
            this._principalACL = this._ACLChange(this._principalACL, principalId, acp);
            this._savePrincipalAccessButton.set("disabled", false);
        },

        _portfolioACLChange: function(principalId, acp) {
            this._homeContextACL = this._ACLChange(this._homeContextACL, principalId, acp);
            this._savePortfolioAccessButton.set("disabled", false);
        },

        _ACLChange: function(acl, principalId, acp) {
            var addToRow;
            //Clear all old ap rights for property acp.
            acl = array.filter(acl, function(ac) {
                if (ac[acp]) {
                    delete ac[acp];
                }
                if (ac.entryId === principalId) {
                    addToRow = ac;
                    return true;
                }
                return ac.admin || ac.mread || ac.mwrite || ac.rread || ac.rwrite;
            });
            if (!addToRow) {
                addToRow = {entryId: principalId};
                acl.push(addToRow);
            }
            addToRow[acp] = true;
            this._savePrincipalAccessButton.set("disabled", false);
            return acl;
        },

        _savePrincipalAccess: function() {
            folio.data.setACLList(this._principal, this._principalACL);
            this._principal.saveInfo(lang.hitch(this, function() {
                this._savePrincipalAccessButton.cancel();
                this._savePrincipalAccessButton.set("disabled", true);
            }), lang.hitch(this, function() {
                this._savePrincipalAccessButton.cancel();
                //TODO error message.
            }));
        },
        _savePortfolioAccess: function() {
            folio.data.setACLList(this._homeContext, this._homeContextACL);
            this._homeContext.saveInfo(lang.hitch(this, function() {
                this._savePortfolioAccessButton.cancel();
                this._savePortfolioAccessButton.set("disabled", true);
            }), lang.hitch(this, function() {
                this._savePortfolioAccessButton.cancel();
                //TODO error message.
            }));
        },
        _homeContextIdChanged: function() {
            var newid = this._homeContextIdDijit.get("value");
            var hcURI = this.application.getRepository()+"_contexts/entry/" + newid;
            domAttr.set(this._homeContextLabelNode, "innerHTML", "Trying to load label for "+newid);
            domStyle.set(this._homeContextLabelNode, "color", "orange");
            this._prospectiveHomeContext = null;
            this._saveHomeContextButton.set("disabled", true);
            this.application.getStore().loadEntry(hcURI, {}, lang.hitch(this, function(hcEntry) {
                this._prospectiveHomeContext = hcEntry;
                this._saveHomeContextButton.set("disabled", false);
                domAttr.set(this._homeContextLabelNode, "innerHTML", folio.data.getLabel(hcEntry));
                domStyle.set(this._homeContextLabelNode, "color", "green");
            }),lang.hitch(this, function() {
                domAttr.set(this._homeContextLabelNode, "innerHTML", "No context found for id "+newid);
                domStyle.set(this._homeContextLabelNode, "color", "red");
            }));
        },
        _copyRights: function() {
            if (folio.data.isGroup(this._principal)) {
                var owners = [];
                array.forEach(this._principalACL, function(ac) {
                    if (ac.admin) {
                        owners.push(ac.entryId);
                    }
                });
                this._homeContextACL = array.filter(this._homeContextACL, function(ac) {
                    if (ac.admin) {
                        delete ac.admin;
                    }
                    return ac.mread || ac.mwrite || ac.rread || ac.rwrite;
                });
                var toBeAdded = [];
                for (var o=0;o<owners.length;o++) {
                    var owner = owners[o];
                    if (!array.some(this.homeContextACL, function(ac) {
                        if (ac.entryId === owner) {
                            ac.admin = true;
                            return true;
                        }
                        return false;
                    })) {
                        toBeAdded.push({admin: true, entryId: owner});
                    }
                }
                this._homeContextACL = this._homeContextACL.concat(toBeAdded);
            } else {
                var eid = this._principal.getId();
                if (!array.some(this._homeContextACL, function(ac) {
                    if (ac.entryId === eid) {
                        ac.admin = true;
                        return true;
                    }
                })) {
                    this._homeContextACL.push({entryId: eid, admin: true});
                }
            }
            folio.data.setACLList(this._homeContext, this._homeContextACL);
            this._homeContext.saveInfo(lang.hitch(this, function() {
                this._copyRightsButton.cancel();
                this._savePortfolioAccessButton.cancel();
                this._savePortfolioAccessButton.set("disabled", true);
            }), lang.hitch(this, function() {
                this._copyRightsButton.cancel();
                this._savePortfolioAccessButton.cancel();
                //TODO error message.
            }));
        },
        _revertHomeContext: function() {
            this._homeContextIdDijit.set("value", this._homeContext.getId());
            this._homeContextIdChanged();
        },
        _saveHomeContext: function() {
            if (this._prospectiveHomeContext != null) {
                this._principal.setHomeContext(this._prospectiveHomeContext.getResourceUri());
                this._principal.saveInfo(lang.hitch(this, function() {
                    this._setHomeContext(this._prospectiveHomeContext);
                    this._saveHomeContextButton.set("disabled", true);
                    this._saveHomeContextButton.cancel();
                }),lang.hitch(this, function() {
                    this._saveHomeContextButton.cancel();
                }));
            }
        }
    });
});