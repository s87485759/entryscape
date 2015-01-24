/*global define, __confolio*/
define(["dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/kernel",
    "dojo/on",
    "dojo/aspect",
    "dojo/query",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dojo/keys",
    "dojo/_base/event",
    "dojo/store/Memory",
    "folio/util/Widget",
    "folio/security/LoginDialog",
    "folio/ApplicationView",
    "di18n/locale",
    "dojo/text!./NavigationBarTemplate.html"
], function (declare, lang, kernel, on, aspect, query, domStyle, domConstruct, domAttr, keys, event, Memory,
             Widget, LoginDialog, ApplicationView, locale, template) {

    return declare([Widget, ApplicationView], {
        //===================================================
        // Public attributes
        //===================================================
        showHelp: true,
        showAbout: true,
        nlsBundles: ["navigation"],
        nlsBundleBase: "nls/",
        templateString: template,

        //===================================================
        // Inherited methods
        //===================================================
        constructor: function (args) {
            this.list = args.list;
        },
        getSupportedActions: function () {
            return ["showContext", "showEntry", "entryChange", "userChange"];
        },
        handle: function (event) {
            this._hideControlMenu();
            if (event.action === "userChange") {
                delete this.userEntry;
            }
            switch (event.action) {
                case "showEntry":
                    if (folio.data.isListLike(event.entry)) {
                        this.setActiveFolder(event.entry.getResourceUri());
                    }
                    if (this.context) {
                        return;
                    }
                    break;
                case "showContext":
                    this.context = event.entry.getContext().getId();
                    this.setActiveFolder(event.entry.getContext().getUri() + '/resource/_top');
                    break;
                case "change":
                    if (event.entry.getResourceUri() == event.entry.getResourceUri()) {
                        var res = event.entry.getResource();
                        this.user = res.name;
                        domAttr.set(this.userField, "innerHTML", this.user);
                        this.application.setUser(res);
                    }
                    break;
/*                case "localeChange":
                    var loc = kernel.locale;
                    if (!this.supportedLanguageMap.hasOwnProperty(loc) &&
                        this.supportedLanguageMap.hasOwnProperty(loc.slice(0, 2))) {
                        loc = loc.slice(0, 2);
                    }
                    this.localeChanger.ignoreChange = true;
                    this.localeChanger.set("value", loc);
                    this.localeChanger.ignoreChange = false;
                    this.localize();
                    break;*/
                case "userChange":
                    delete this.userEntry;
                    this._loginAdjustments();
                    break;
            }
        },
        setActiveFolder: function (folder) {
            this.folder = folder;
        },
        postCreate: function () {
            this.inherited("postCreate", arguments);
            if (this.showHelp) {
                domStyle.set(this.helpLinkSpan, "display", "");
                domAttr.set(this.helpLinkNode, "href", this.site.getHashUrl("help", {}));
            }
            if (this.showAbout) {
                domStyle.set(this.aboutLinkSpan, "display", "");
                domAttr.set(this.aboutLinkNode, "href", this.site.getHashUrl("about", {}));
            }
            var config = this.application.getConfig();
            on(this.searchField, "keyUp", lang.hitch(this, function (evt) {
                if (evt.keyCode == keys.ENTER) {
                    event.stop(evt);
                    this._doSearch(this.searchField.get("value"));
                }
            }));
            var data = [];
            if (config.supportedLanguageMap) {
                this.supportedLanguageMap = config.supportedLanguageMap;
            }
            if (config.debug === "true" || config.debug === true) {
                this.supportedLanguageMap["nls"] = "localization keys";
            }

            for (l in this.supportedLanguageMap) {
                data.push({id: l, label: this.supportedLanguageMap[l]});
            }
            this.localeChanger.set("store", new Memory({data: data}));
            if (this.supportedLanguageMap[kernel.locale] != undefined) {
                this.localeChanger.set("value", kernel.locale);
            } else if (this.supportedLanguageMap[kernel.locale.substring(0, 2)] != undefined) {
                this.localeChanger.set("value", kernel.locale.substring(0, 2));
            }
            setTimeout(lang.hitch(this, function () {
                this._loginAdjustments(); //delayed due to siteManager not set in application yet..
                aspect.before(this.localeChanger, "onChange", lang.hitch(this, this._onLocaleChangerChange));
            }), 100);
            //this.localize();

            domConstruct.place(this.controlMenuNode, query(".navigationBar")[0]);
            this._blurLayer = domConstruct.create("div", {style: {
                top: "0px",
                width: "100%",
                height: "100%",
                display: "none",
                position: "absolute",
                "z-index": 5}}, document.body);
            on(this._blurLayer, "click", lang.hitch(this, this._hideControlMenu));
        },
        localeChange: function () {
            if (kernel.locale !== this.localeChanger.get("value")) {
                this.localeChanger.set("value", kernel.locale);
            }
            domAttr.set(this.searchButtonNode, "title", this.NLSBundles.navigation.searchLabel);
            this.searchField.set("placeHolder", this.NLSBundles.navigation.searchFieldMessage);

            if (!this.user) {
                this.set("userField", this.NLSBundles.navigation.guestUser);
                domAttr.set(this.loginStatusNodeLabel, "innerHTML", this.NLSBundles.navigation.logIn);
            } else {
                domAttr.set(this.loginStatusNodeLabel, "innerHTML", this.NLSBundles.navigation.logOut);
            }
        },
        //===================================================
        // Private methods
        //===================================================
        _loginAdjustments: function () {
            this.user = this.application.getUser();
            if (this.user) {
                this.userId = this.user.id;
                domStyle.set(this.guestFieldNode, "display", "none");
                domStyle.set(this.userFieldNode, "display", "");
                domAttr.set(this.userFieldNode, "innerHTML", this.user.user);
                domAttr.set(this.userFieldNode, "href", this.application.getHref(this.application.getRepository() + "_principals/entry/" + this.userId, "profile")); //this.user.user
                if (this.profileIconNode) {
                    domAttr.set(this.profileIconNode, "href", this.application.getHref(this.application.getRepository() + "_principals/entry/" + this.userId, "profile")); //this.user.user
                    domStyle.set(this.profileIconNode, "display", "");
                    domStyle.set(this.signInIconNode, "display", "none");
                }
                domAttr.set(this.loginStatusNodeLabel, "innerHTML", this.NLSBundles.navigation.logOut);
            } else {
                delete this.userId;
                domStyle.set(this.guestFieldNode, "display", "");
                domStyle.set(this.userFieldNode, "display", "none");

                domAttr.set(this.loginStatusNodeLabel, "innerHTML", this.NLSBundles.navigation.logIn);
                if (this.profileIconNode) {
                    domStyle.set(this.profileIconNode, "display", "none");
                    domStyle.set(this.signInIconNode, "display", "");
                }
                if (this.folderIconNode) {
                    domStyle.set(this.folderIconNode, "display", "none");
                }
                this.home = undefined;
            }
            if (this.user) {
                domStyle.set(this.profileLinkNodeWrapper, "display", "");
                domAttr.set(this.profileLinkNode, "href", this.application.getHref(this.application.getRepository() + "_principals/resource/" + this.user.id, "profile"));
            } else {
                domStyle.set(this.profileLinkNodeWrapper, "display", "none");
            }

            if (this.user && this.user.homecontext) {
                this.home = this.user.homecontext;
                domStyle.set(this.homeLinkNodeWrapper, "display", "");
                domStyle.set(this.settingsLinkNodeWrapper, "display", "");
                domAttr.set(this.settingsNode, "href", this.application.getHref(this.application.getRepository() + "_principals/resource/" + this.user.id, "settings"));
                domAttr.set(this.homeLinkNode, "href", this.application.getHref(this.application.getRepository() + this.user.homecontext + "/resource/_top", "default"));
                if (this.folderIconNode) {
                    domAttr.set(this.folderIconNode, "href", this.application.getHref(this.application.getRepository() + this.user.homecontext + "/resource/_top", "default"));
                    domStyle.set(this.folderIconNode, "display", "");
                }
            } else {
                domStyle.set(this.homeLinkNodeWrapper, "display", "none");
                domStyle.set(this.settingsLinkNodeWrapper, "display", "none");
                if (this.folderIconNode) {
                    domStyle.set(this.folderIconNode, "display", "none");
                }
            }
        },
        _doSearch: function (term) {
            this.application.open("search", {term: term});
        },

        //===================================================
        // Template connected methods
        //===================================================
        _searchClicked: function () {
            this._doSearch(this.searchField.get("value"));
        },
        _homeClicked: function () {
            if (this.home) {
                this.application.openEntry(this.application.repository + this.home + "/entry/_top");
            } else {
                this.application.message(this.NLSBundles.navigation.notLoggedInNoHomeMessage);
            }
        },
        _loginLinkClicked: function () {
            new LoginDialog({
                isLogoutNeeded: !(!this.user), // Whether or not this is actually a logout
                application: this.application
            }).show();
        },
        _onLocaleChangerChange: function () {
            /***
             *** This method belongs to the FilteringSelect in NavigationBarTemplate, remove when done.
             ***/
            if (this.application) {
                //window.alert("NavigationBar.changeLocaleClicked: " + dijit.byId("localeChanger").getValue());
                if (!this.localeChanger.ignoreChange && this.localeChanger.get("value") != "no_select") {
                    var nl = this.localeChanger.get("value");
                    if (nl !== kernel.locale) {
                        locale.set(nl);
                    }
                }
            }
        },

        _controlClicked: function () {
            if (this._controlMenuOpen) {
                this._hideControlMenu();
            } else {
                this._showControlMenu();
            }
        },
        _hideControlMenu: function () {
            domStyle.set(this.controlMenuNode, "display", "none");
            domStyle.set(this._blurLayer, "display", "none");
            this._controlMenuOpen = false;
        },
        _showControlMenu: function () {
            this._showProfilePicture();
            domStyle.set(this.controlMenuNode, "display", "");
            domStyle.set(this._blurLayer, "display", "");
            this._controlMenuOpen = true;
            dijit.focus(this.controlMenuNode);
        },
        _showProfilePicture: function () {
            var f = lang.hitch(this, function (entry) {
                this.userEntry = entry;
                domAttr.set(this.profilePictureNode, "innerHTML", "");
                var imageUrl = folio.data.getFromMD(entry, folio.data.FOAFSchema.IMAGE);
                var config = this.application.getConfig();
                var backup = folio.data.isUser(entry) ? "" + config.getIcon("user_picture_frame") : "" + config.getIcon("group_picture_frame");
                domConstruct.create("img", {src: imageUrl || backup, style: {width: "100px"}}, this.profilePictureNode);
            });
            if (this.userEntry) {
                f(this.userEntry);
            } else {
                var user = this.application.getUser();
                var entryId;
                if (user) {
                    entryId = user.id;
                } else {
                    entryId = "_guest";
                }
                this.application.getStore().loadEntry({
                        base: this.application.getRepository(),
                        contextId: "_principals",
                        entryId: entryId},
                    {},
                    function (entry) {
                        if (entry.resource == null) {
                            entry.setRefreshNeeded();
                            entry.refresh(f);
                        } else {
                            f(entry);
                        }
                    });
            }
        }
    });
});