/*global define, __confolio*/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/connect",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "folio/util/Widget",
    "dijit/form/TextBox",
    "dijit/form/Textarea",
    "dojox/form/BusyButton",
    "dojox/form/Uploader",
    "dijit/form/FilteringSelect",
    "dijit/form/RadioButton",
    "dojo/store/Memory",
    "folio/create/TypeDefaults",
    "folio/list/SearchList",
    "folio/security/LoginDialog",
    "rdfjson/Graph",
    "dojo/text!./AccountTabTemplate.html"
], function (declare, lang, connect, domClass, style, construct, attr, Widget,
             TextBox, Textarea, BusyButton, Uploader, FilteringSelect, RadioButton, Memory, TypeDefaults, SearchList, LoginDialog, Graph, template) {

    /**
     * Shows profile information, group membership, access to portfolios and folders, and latest material.
     * The profile information includes username, home portfolio and user profile metadata.
     */
    return declare(Widget, {
        //===================================================
        // Inherited Attributes
        //===================================================
        templateString: template,
        nls: ["annotationProfile", "settings"],

        //===================================================
        // Inherited methods
        //===================================================
        postCreate: function () {
            this.inherited("postCreate", arguments);
            this.application = __confolio.application;

            //Account info
            this.connect(this.firstNameDijit, "onKeyUp", this._infoChanged);
            this.connect(this.lastNameDijit, "onKeyUp", this._infoChanged);
            this.connect(this.fullNameDijit, "onKeyUp", this._infoChanged);
            this.connect(this.infoDijit, "onKeyUp", this._infoChanged);
            this.connect(this.emailDijit, "onKeyUp", this._infoChanged);
            this.connect(this.infoSaveButton, "onClick", this._saveAccountInfo);

            //Preferred language
            var slm = this.application.getConfig().supportedLanguageMap || {};
            var langs = [];
            for (var l in slm) {
                langs.push({id: l, label: slm[l]});
            }
            this.langStore = new Memory({'data': langs});
            this.languageSelectDijit.set("searchAttr", 'label');
            this.languageSelectDijit.set("store", this.langStore);
            this.connect(this.languageSelectDijit, "onChange", this._UIPrefsChanged);
            this.connect(this.uiprefsSaveButton, "onClick", this._saveUIPrefsInfo);

            //Profile picture
            this.connect(this.noPictureChoiceButton, "onClick", this._showNoPictureChoice);
            this.connect(this.urlPictureChoiceButton, "onClick", this._showURLPictureChoice);
            this.connect(this.localPictureChoiceButton, "onClick", this._showLocalPictureChoice);
            this.connect(this.urlProfilePictureTestButton, "onClick", lang.hitch(this, function () {
                this._updateProfilePicturePreview(this.urlProfilePictureDijit.get("value") || "");
            }));
            this.connect(this.urlProfilePictureDijit, "onKeyUp", lang.hitch(this, this._updateSaveProfilePictureButton));
            this.connect(this.profilePictureSaveButton, "onClick", this._saveProfilePicture);
            this.connect(this.localProfilePictureUploadButton, "onChange", this._uploadProfilePicture);

            //Password
            this.connect(this.passwordSaveButton, "onClick", this._savePassword);
            this.connect(this.newPasswordDijit, "onKeyUp", lang.hitch(this, this._updatePasswordSaveButton));
            this.connect(this.verifyNewPasswordDijit, "onKeyUp", lang.hitch(this, this._updatePasswordSaveButton));
        },

        showEntry: function (entry) {
            this.entry = entry;
            this._showAccount();
        },

        //===================================================
        // Private methods
        //===================================================
        userChange: function () {
            this.user = this.application.getUser();
            if (this.entryUri) {
                this.application.getStore().loadEntry(this.entryUri, {}, lang.hitch(this, this.showEntry));
            }
        },

        localize: function() {
            this.infoSaveButton.set("busyLabel", this.NLS.annotationProfile.dialogDoneBusyLabel);
            this.uiprefsSaveButton.set("busyLabel", this.NLS.annotationProfile.dialogDoneBusyLabel);
            this.profilePictureSaveButton.set("busyLabel", this.NLS.annotationProfile.dialogDoneBusyLabel);
            this.passwordSaveButton.set("busyLabel", this.NLS.annotationProfile.dialogDoneBusyLabel);
        },

        // ============AccountTab==================
        _showAccount: function () {
            //Account tab switch
            this._accountUpdate = true;

            var homeContextMissing = this.entry.getHomeContext() === null;
            this.urlProfilePictureDijit.set("disabled", homeContextMissing);
            this.urlProfilePictureTestButton.set("disabled", homeContextMissing);
            this.noPictureChoiceButton.set("disabled", homeContextMissing);
            this.urlPictureChoiceButton.set("disabled", homeContextMissing);
            this.localProfilePictureUploadButton.set("disabled", homeContextMissing);
            this.urlProfilePictureTestButton.set("disabled", homeContextMissing);
            this.localPictureChoiceButton.set("disabled", homeContextMissing);

            //User resource and metadata.
            var res = this.entry.getResource();
            var md = this.entry.getLocalMetadata();

            //Switch between group and user mode
            domClass.toggle(this.domNode, "principalIsGroup", folio.data.isGroup(this.entry));

            //Update account info
            this.firstNameDijit.set("value", md.findFirstValue(this.entry.getResourceUri(), "http://xmlns.com/foaf/0.1/firstName") || "");
            this.lastNameDijit.set("value", md.findFirstValue(this.entry.getResourceUri(), "http://xmlns.com/foaf/0.1/lastName") || "");
            var fn = md.findFirstValue(this.entry.getResourceUri(), "http://xmlns.com/foaf/0.1/name") || "";
            this.fullNameDijit.set("value", fn);
            this._setFullName(fn);
            this.infoDijit.set("value", md.findFirstValue(this.entry.getResourceUri(), "http://xmlns.com/foaf/0.1/plan") || "");
            var email = md.findFirstValue(this.entry.getResourceUri(), "http://xmlns.com/foaf/0.1/mbox") || "";
            if (email.indexOf("mailto:") === 0) {
                email = email.substr(7);
            }
            this.emailDijit.set("value", email);

            if (folio.data.isUser(this.entry)) {
                //Update uiprefs
                this.languageSelectDijit.set("value", res.language ? res.language : "");
            }

            //Update profile picture
            var pictUrl = md.findFirstValue(this.entry.getResourceUri(), "http://xmlns.com/foaf/0.1/img");
            if (pictUrl == null) {
                this.noPictureChoiceButton.set("checked", true);
                this._showNoPictureChoice();
            } else if (pictUrl.indexOf(this.entry.getHomeContext() + "/resource/_profilePicture") === 0) {
                this.localPictureChoiceButton.set("checked", true);
                this._showLocalPictureChoice();
            } else {
                this.urlPictureChoiceButton.set("checked", true);
                this.urlProfilePictureDijit.set("value", pictUrl);
                this._showURLPictureChoice();
            }

            setTimeout(lang.hitch(this, function () { //Delay since some updates of dijits are not sent until after event loop.
                this._accountUpdate = false;
            }), 1);
        },

        // Info = firstname + lastname + name + email
        _infoChanged: function () {
            if (this._accountUpdate) return;

            this.infoSaveButton.set("disabled", false);
            this._setFullName(this.firstNameDijit.get("value"), this.lastNameDijit.get("value"));
        },
        _saveAccountInfo: function () {
            var md = this.entry.getLocalMetadata();
            var subj = this.entry.getResourceUri();
            var foaf = "http://xmlns.com/foaf/0.1/";
            md.findAndRemove(subj, foaf + "firstName");
            md.findAndRemove(subj, foaf + "lastName");
            md.findAndRemove(subj, foaf + "name");
            md.findAndRemove(subj, foaf + "plan");
            md.findAndRemove(subj, foaf + "mbox");
            if (folio.data.isUser(this.entry)) {
                var fn = this.firstNameDijit.get("value");
                if (fn !== "") {
                    md.create(subj, foaf + "firstName", {type: "literal", value: fn});
                }
                var ln = this.lastNameDijit.get("value");
                if (ln !== "") {
                    md.create(subj, foaf + "lastName", {type: "literal", value: ln});
                }
                if (fn !== "" || ln !== "") {
                    md.create(subj, foaf + "name", {type: "literal", value: fn + " " + ln});
                }
            } else {
                md.create(subj, foaf + "name", {type: "literal", value: this.fullNameDijit.get("value")});
            }
            var info = this.infoDijit.get("value");
            if (info !== "") {
                md.create(subj, foaf + "plan", {type: "literal", value: info});
            }
            var mbox = this.emailDijit.get("value");
            if (mbox !== "") {
                md.create(subj, foaf + "mbox", {type: "uri", value: "mailto:" + mbox});
            }

            this.entry.saveLocalMetadata().then(lang.hitch(this, function () {
                this.entry.refresh(lang.hitch(this, function (entry) {
                    this.application.publish("changed", {entry: entry, source: this});
                    this.application.getStore().updateReferencesTo(entry);
                }));
                this.application.getMessages().message(this.NLS.annotationProfile.metadataSaved + this.entry.getUri());
                this.infoSaveButton.cancel();
                this.infoSaveButton.set("disabled", true);
            }), lang.hitch(this, function (message) {
                if (message.status === 412) {
                    this.application.getMessages().message(this.NLS.annotationProfile.modifiedPreviouslyOnServer);
                } else {
                    this.application.getMessages().message(this.NLS.annotationProfile.failedSavingUnsufficientMDRights);
                }
                this.infoSaveButton.cancel();
            }));
        },
        _setFullName: function (firstname, lastname) {
            attr.set(this.fullNameNode, "innerHTML", this.NLS.settings.displayedName + "&nbsp;&nbsp;<span>" + (firstname || "") + " " + (lastname || "") + "</span>");
        },

        // uiprefs = preferred language
        _UIPrefsChanged: function () {
            if (this._accountUpdate) return;
            this.uiprefsSaveButton.set("disabled", false);
        },
        _saveUIPrefsInfo: function () {
            var newUserData = {};
            var userLang = this.languageSelectDijit.get("value");
            if (userLang && userLang != '') {
                newUserData.language = userLang;
                this.application.setLocale(userLang);
            } else { //User has chosen to not have a preferred language, choose lang of the browser
                newUserData.language = "";
                var defaultedLanguage = "en";
                if (navigator) {  //TODO, where does navigator object come from?
                    if (navigator.language) {
                        defaultedLanguage = navigator.language;
                    }
                    else if (navigator.browserLanguage) {
                        defaultedLanguage = navigator.browserLanguage;
                    }
                    else if (navigator.systemLanguage) {
                        defaultedLanguage = navigator.systemLanguage;
                    }
                    else if (navigator.userLanguage) {
                        defaultedLanguage = navigator.userLanguage;
                    }
                }
                this.application.setLocale(defaultedLanguage);
            }

            this.application.getCommunicator().PUT(this.entry.getResourceUri(), newUserData).then(
                dojo.hitch(this, function (data) {
                    this.entry.getResource().language = newUserData.language;
                    this.uiprefsSaveButton.cancel();
                    this.uiprefsSaveButton.set("disabled", true);
                }),
                dojo.hitch(this, function (mesg) {
                    this.uiprefsSaveButton.cancel();
                })
            );
        },

        // profile picture
        _updateProfilePicturePreview: function (pictUrl) {
            if (pictUrl !== "") {
                attr.set(this.profilePictureNode, "src", pictUrl);
            } else {
                var config = this.application.getConfig();
                var backup = folio.data.isUser(this.entry) ? "" + config.getIcon("user_picture_frame") : "" + config.getIcon("group_picture_frame");
                attr.set(this.profilePictureNode, "src", backup);
            }

        },
        _showNoPictureChoice: function () {
            this._updateSaveProfilePictureButton();
            this.urlProfilePictureDijit.set("disabled", true);
            this.urlProfilePictureTestButton.set("disabled", true);
            this.localProfilePictureUploadButton.set("disabled", true);
            this._updateProfilePicturePreview("");
        },

        _showURLPictureChoice: function () {
            this._updateSaveProfilePictureButton();
            this.urlProfilePictureDijit.set("disabled", false);
            this.urlProfilePictureTestButton.set("disabled", false);
            this.localProfilePictureUploadButton.set("disabled", true);
            this._updateProfilePicturePreview(this.urlProfilePictureDijit.get("value") || "");
        },

        _showLocalPictureChoice: function () {
            this.urlProfilePictureDijit.set("disabled", true);
            this.urlProfilePictureTestButton.set("disabled", true);
            this.localProfilePictureUploadButton.set("disabled", false);
            this._checkForLocalProfilePicture(lang.hitch(this, function () {
                this._updateSaveProfilePictureButton();
                if (this._ppEntry) {
                    this._updateProfilePicturePreview(this._ppEntry.getResourceUri() + "?request.preventCache=" + (new Date()).getTime());
                } else {
                    this._updateProfilePicturePreview("");
                }
            }));
        },
        _checkForLocalProfilePicture: function (callback) {
            if (this._ppEntry === false) {
                callback();
                return;
            }
            var contexturl = this.entry.getHomeContext();
            var hc = this.application.getStore().getContextById(contexturl.substr(contexturl.lastIndexOf("/") + 1));
            hc.loadEntryFromId("_profilePicture", null, lang.hitch(this, function (e) {
                this._ppEntry = e;
                callback();
            }), lang.hitch(this, function () {
                this._ppEntry = false;
                callback();
            }));
        },

        _uploadProfilePicture: function () {
            var files = this.localProfilePictureUploadButton.getFileList();
            var inp = this.localProfilePictureUploadButton._inputs[0];
            var contexturl = this.entry.getHomeContext();
            var hc = this.application.getStore().getContextById(contexturl.substr(contexturl.lastIndexOf("/") + 1));
            var fail = lang.hitch(this, function (err) {
                console.log(err);
                this.localProfilePictureUploadButton.reset();
            });
            var pp = lang.hitch(this, function (ppEntry) {
                this._ppEntry = ppEntry;
                this.application.getCommunicator().putFile(ppEntry.getResourceUri(), inp, null, lang.hitch(this, function () {
                    this._updateProfilePicturePreview(ppEntry.getResourceUri() + "?request.preventCache=" + (new Date()).getTime());
                    this.localProfilePictureUploadButton.reset();
                    this._updateSaveProfilePictureButton();
                    this.application.publish("changed", {entry: this.entry, source: this});
                }), fail);
            });
            this._checkForLocalProfilePicture(lang.hitch(this, function () {
                if (this._ppEntry) {
                    pp(this._ppEntry);
                } else {
                    var md = new Graph();
                    var res = this.entry.getHomeContext() + "/resource/_profilePicture";
                    md.create(res, "http://purl.org/dc/terms/title", {type: "literal", value: files[0].name});
                    hc.createEntry({
                        metadata: md.exportRDFJSON(),
                        params: {representationType: "informationresource",
                            locationType: "local",
                            builtinType: "none",
                            id: "_profilePicture"}
                    }, pp, fail);
                }
            }));
        },

        _updateSaveProfilePictureButton: function () {
            if (this._ppb_timer) {
                clearTimeout(this._ppb_timer);
            }
            this._ppb_timer = setTimeout(lang.hitch(this, function () {
                this._updateSaveProfilePictureButtonSync();
                delete this._ppb_timer;
            }), 200);
        },
        _updateSaveProfilePictureButtonSync: function () {
            var md = this.entry.getLocalMetadata();
            var subj = this.entry.getResourceUri();
            var savedProfilePict = md.findFirstValue(this.entry.getResourceUri(), "http://xmlns.com/foaf/0.1/img") || "";
            var newProfilePict = this._getNewProfilePictureUrl();
            this.profilePictureSaveButton.set("disabled", newProfilePict === null ? true : savedProfilePict === newProfilePict);
        },
        _getNewProfilePictureUrl: function () {
            if (this.localPictureChoiceButton.get("checked")) {
                if (this._ppEntry) {
                    return this.entry.getHomeContext() + "/resource/_profilePicture";
                } else {
                    return null;
                }
            } else if (this.urlPictureChoiceButton.get("checked")) {
                return this.urlProfilePictureDijit.get("value") || "";
            }
            return "";
        },
        _saveProfilePicture: function () {
            var md = this.entry.getLocalMetadata();
            var subj = this.entry.getResourceUri();
            var foaf = "http://xmlns.com/foaf/0.1/";

            md.findAndRemove(subj, foaf + "img");
            var profpict = this._getNewProfilePictureUrl();
            if (profpict !== "" && profpict !== null) {
                md.create(subj, foaf + "img", {type: "uri", value: profpict});
            }
            this.entry.saveLocalMetadata().then(lang.hitch(this, function () {
                this.entry.refresh(lang.hitch(this, function (entry) {
                    this.application.publish("changed", {entry: entry, source: this});
                    this.profilePictureSaveButton.cancel();
                    this.profilePictureSaveButton.set("disabled", true);
                }));
            }), lang.hitch(this, function (message) {
                if (message.status === 412) {
                    this.application.getMessages().message(this.NLS.annotationProfile.modifiedPreviouslyOnServer);
                } else {
                    this.application.getMessages().message(this.NLS.annotationProfile.failedSavingUnsufficientMDRights);
                }
                this.profilePictureSaveButton.cancel();
            }));
        },
        // Password
        _savePassword: function () {
            var newUserData = {password: this.newPasswordDijit.get("value")};
            this.application.getCommunicator().PUT(this.entry.getResourceUri(), newUserData).then(
                lang.hitch(this, function (data) {
                    var loginDialog = new LoginDialog({
                        application: this.application
                    });
                    loginDialog.setAuthentication(this.entry.getResource().name, newUserData.password);
                    loginDialog.destroyRecursive();
                    this.newPasswordDijit.set("value", "");
                    this.verifyNewPasswordDijit.set("value", "");
                    this.passwordSaveButton.cancel();
                    this.passwordSaveButton.set("disabled", true);
                }),
                dojo.hitch(this, function (mesg) {
                    this.passwordSaveButton.cancel();
                })
            );
        },
        _updatePasswordSaveButton: function () {
            var np = this.newPasswordDijit.get("value");
            var vnp = this.verifyNewPasswordDijit.get("value");
            if (np.length === 0 && vnp.length === 0) {
                this.passwordSaveButton.set("disabled", true);
                style.set(this.passwordMismatchNode, "display", "none");
            } else if (np !== vnp) {
                this.passwordSaveButton.set("disabled", true);
                style.set(this.passwordMismatchNode, "display", "");
            } else {
                this.passwordSaveButton.set("disabled", false);
                style.set(this.passwordMismatchNode, "display", "none");
            }
        }
    });
});