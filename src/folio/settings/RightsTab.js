/*global define, __confolio*/
define(["dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/connect",
    "dojo/_base/array",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/form/RadioButton", //For template
    "dojox/form/BusyButton",  //For template
    "dojo/text!./RightsTabTemplate.html"
], function (declare, lang, connect, array, domClass, style, construct, attr, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, RadioButton, BusyButton, template) {

    /**
     * Shows profile information, group membership, access to portfolios and folders, and latest material.
     * The profile information includes username, home portfolio and user profile metadata.
     */
    return declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        //===================================================
        // Inherited Attributes
        //===================================================
        templateString: template,

        //===================================================
        // Inherited methods
        //===================================================
        postCreate: function () {
            this.application = __confolio.application;
            this.inherited("postCreate", arguments);

            var fixBusyButton = function (but) {
                but._makeBusy = but.makeBusy;
                but.makeBusy = function () {
                    if (this.get("disabled") !== true) this._makeBusy();
                };
            };
            fixBusyButton(this._savePrincipalAccessButton);
            fixBusyButton(this._copyRightsButton);

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

            if (folio.data.isGroup(this._principal)) {
                style.set(this._groupMembersBlockNode, "display", "");
            } else {
                style.set(this._groupMembersBlockNode, "display", "none");
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
                style.set(this._homeContextRights, "display", "none");
            }

            if (this._settingsNLS) {
                this._updateStrings();
            }
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
            style.set(this._selectHomeContext, "display", "none");
            if (this._user.id === "_admin") {
                this._isAdmin = true;
                style.set(this._selectHomeContext, "display", "");
            } else {
                this.application.getStore().loadEntry(this._userUri, {}, lang.hitch(this, function(entry) {
                    if (array.some(entry.getGroups(), function(uri) {
                        return uri.lastIndexOf("_admins") + 7 === uri.length;
                    })) {
                        style.set(this._selectHomeContext, "display", "");
                        this._isAdmin = true;
                    }
                }));
            }
            this._localize();
        },
        _localize: function () {
            require(["dojo/i18n!folio/nls/settings"], lang.hitch(this, function(settings){
                this._settingsNLS = settings;
                if (this._principal) {
                    this._updateStrings();
                }
            }));
        },
        _updateStrings: function() {
            if (folio.data.isUser(this._principal)) {
                attr.set(this._principalLabelNode , "innerHTML", this._settingsNLS.userReadRights);
                attr.set(this._principalPrivateChoiceLabelNode , "innerHTML", this._settingsNLS.privateAccess);
                attr.set(this._portfolioPrivateChoiceLabelNode, "innerHTML", this._settingsNLS.privateAccess);
                this._copyRightsButton.set("label", this._settingsNLS.setUserAsOwnerOfPortfolio);
                this._copyRightsButton._label = this._settingsNLS.setUserAsOwnerOfPortfolio;
            } else {
                attr.set(this._principalLabelNode , "innerHTML", this._settingsNLS.groupReadRights);
                attr.set(this._principalPrivateChoiceLabelNode , "innerHTML", this._settingsNLS.membersAccess);

                attr.set(this._groupMembersLabelNode , "innerHTML", this._settingsNLS.membersReadRights);
                attr.set(this._membersGuestChoiceLabelNode, "innerHTML", this._settingsNLS.guestAccess);
                attr.set(this._membersUsersChoiceLabelNode, "innerHTML", this._settingsNLS.usersAccess);
                attr.set(this._membersMembersChoiceLabelNode, "innerHTML", this._settingsNLS.membersAccess);
                attr.set(this._portfolioPrivateChoiceLabelNode, "innerHTML", this._settingsNLS.membersAccess);
                this._copyRightsButton.set("label", this._settingsNLS.setGroupPortfolioRights);
                this._copyRightsButton._label = this._settingsNLS.setGroupPortfolioRights;
            }
            attr.set(this._principalGuestChoiceLabelNode , "innerHTML", this._settingsNLS.guestAccess);
            attr.set(this._principalUsersChoiceLabelNode , "innerHTML", this._settingsNLS.usersAccess);

            attr.set(this._portfolioLabelNode, "innerHTML", this._settingsNLS.portfolioReadRights);
            attr.set(this._portfolioGuestChoiceLabelNode, "innerHTML", this._settingsNLS.guestAccess);
            attr.set(this._portfolioUsersChoiceLabelNode, "innerHTML", this._settingsNLS.usersAccess);
            this._revertHomeContextButton.set("label", this._settingsNLS.revertToPreviousHomeContext);
            this._saveHomeContextButton.set("label", this._settingsNLS.saveNewHomeContext);
            this._saveHomeContextButton._label = this._settingsNLS.saveNewHomeContext;
        },
        _setHomeContext: function(homeContext) {
            style.set(this._homeContextRights, "display", "");
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
            attr.set(this._homeContextLabelNode, "innerHTML", "Trying to load label for "+newid);
            style.set(this._homeContextLabelNode, "color", "orange");
            this._prospectiveHomeContext = null;
            this._saveHomeContextButton.set("disabled", true);
            this.application.getStore().loadEntry(hcURI, {}, lang.hitch(this, function(hcEntry) {
                this._prospectiveHomeContext = hcEntry;
                this._saveHomeContextButton.set("disabled", false);
                attr.set(this._homeContextLabelNode, "innerHTML", folio.data.getLabel(hcEntry));
                style.set(this._homeContextLabelNode, "color", "green");
            }),lang.hitch(this, function() {
                attr.set(this._homeContextLabelNode, "innerHTML", "No context found for id "+newid);
                style.set(this._homeContextLabelNode, "color", "red");
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