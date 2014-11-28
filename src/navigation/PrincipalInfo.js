/*global define, __confolio*/
define(["dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/connect",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "folio/util/utils",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dojo/text!./PrincipalInfoTemplate.html"
], function (declare, lang, connect, style, construct, attr, utils, _Widget, _TemplatedMixin, template) {

    /**
     * Shows principal information in the form of a picture, a name and a description.
     * There is also some buttons to swith between folder, profile and settings views.
     */
    return declare([_Widget, _TemplatedMixin], {
        //===================================================
        // Public Attributes
        //===================================================
        view: "",

        //===================================================
        // Inherited Attributes
        //===================================================
        templateString: template,

        //===================================================
        // Inherited methods
        //===================================================
        postCreate: function () {
            this.inherited("postCreate", arguments);
            this.application = __confolio.application;
            connect.subscribe("/confolio/userChange", lang.hitch(this, this._userChange));

            connect.subscribe("/confolio/changed", lang.hitch(this, function (args) {
                if (this.entry && args.entry === this.entry.getId() && args.context === this.entry.getContext().getId()) {
                    if (this.entry.needRefresh()) {
                        this.entry.refresh(lang.hitch(this, this.show, this.entry));
                    } else {
                        this.show(this.entry);
                    }
                }
            }));
        },

        show: function (entry) {
            this.entry = entry;
            delete this.homeContext;
            var hc = this.entry.getHomeContext();
            if (hc != null) {
                this.application.getStore().loadEntry(hc,
                    {},
                    lang.hitch(this, function (homeContext) {
                        this.homeContext = homeContext;
                        this._showPrincipalPicture();
                        this._showPrincipalInfo();
                        this._showButtons();
                    }));
            } else {
                this._showPrincipalPicture();
                this._showPrincipalInfo();
                this._showButtons();
            }
        },

        //===================================================
        // Private methods
        //===================================================
        _userChange: function() {
            if (this.entry) {
                this.show(this.entry);
            }
        },
        _showPrincipalPicture: function () {
            attr.set(this.principalPictureNode, "innerHTML", "");
            var imageUrl = folio.data.getFromMD(this.entry, folio.data.FOAFSchema.IMAGE);
            if (imageUrl != null) {
                if (imageUrl.indexOf(this.application.getRepository()) === 0) {
                    imageUrl = imageUrl + "?request.preventCache=" + (new Date()).getTime();
                }
            }
            var config = this.application.getConfig();
            var backup = folio.data.isUser(this.entry) ? "" + config.getIcon("user_picture_frame") : "" + config.getIcon("group_picture_frame");
            if (window.location.href.indexOf("cookieMonster=true") !== -1) {
                construct.create("img", {src: "http://www.northern-pine.com/songs/images/cookie.gif"}, this.principalPictureNode);
            } else {
                construct.create("img", {src: backup}, this.principalPictureNode);
                if (imageUrl) {
                    utils.lazyLoadImage(this.principalPictureNode, imageUrl);
                }
            }
        },

        _showButtons: function () {
            attr.set(this.principalIconsNode, "innerHTML", "");
            if (this.homeContext || this.entry.isResourceModifiable()) {
                if (this.view === "profile") {
                    construct.create("span", {"class": "icon24 home disabled"}, this.principalIconsNode);
                } else {
                    construct.create("a", {"class": "icon24 home", href: this.application.getHref(this.entry, "profile")}, this.principalIconsNode);
                }
                if (this.homeContext) {
                    if (this.view === "default") {
                        construct.create("span", {"class": "icon24 folder disabled"}, this.principalIconsNode);
                    } else {
                        var name = folio.data.getLabelRaw(this.homeContext) || this.homeContext.alias || this.homeContext.getId();
                        construct.create("a", {"class": "icon24 folder", title: name, href: this.application.getHref(this.application.getRepository() + this.homeContext.getId() + "/entry/_top", "default")}, this.principalIconsNode);
                    }
                }
                if (this.entry.isResourceModifiable()) {
                    if (this.view === "settings") {
                        construct.create("span", {"class": "icon24 settings disabled"}, this.principalIconsNode);
                    } else {
                        construct.create("a", {"class": "icon24 settings", href: this.application.getHref(this.entry, "settings")}, this.principalIconsNode);
                    }
                }
            }
        },

        _showPrincipalInfo: function () {
            //User name
            var name = folio.data.getLabelRaw(this.entry) || this.entry.resource.name;
            attr.set(this.principalNameNode, "innerHTML", name);

            //User plan/description
            var desc = this.entry.get(folio.data.FOAFSchema.PLAN) ||
                folio.data.getDescription(this.entry) ||
                (this.homeContext ? folio.data.getDescription(this.homeContext) : "");
            attr.set(this.principalDescriptionNode, "innerHTML", desc);

            var email = this.entry.get(folio.data.FOAFSchema.MBOX);
            if (email != null && this.application.getUser() != null) {
                attr.set(this.emailNode, "href", email);
                attr.set(this.emailNode, "title", email);
                style.set(this.emailNode, "display", "");
            } else {
                style.set(this.emailNode, "display", "none");
            }

            var homepage = this.entry.get(folio.data.FOAFSchema.HOMEPAGE);
            if (homepage != null) {
                attr.set(this.homepageNode, "href", homepage);
                attr.set(this.homepageNode, "title", homepage);
                style.set(this.homepageNode, "display", "");
            } else {
                style.set(this.homepageNode, "display", "none");
            }

            //In case the quota is given, displays both the actual size + percentage used
            if (this.homeContext && this.homeContext.quota && this.homeContext.quota.quotaFillLevel !== undefined) {
                var quota = " (" + folio.data.bytesAsHumanReadable(this.homeContext.quota.quotaFillLevel);
                if (this.homeContext.quota.quota !== -1) {
                    quota += "/" + folio.data.bytesAsHumanReadable(this.homeContext.quota.quota) +
                        ", " +
                        folio.data.percentageCalculator(this.homeContext.quota.quotaFillLevel, this.homeContext.quota.quota) +
                        ")";
                } else {
                    quota += ")";
                }
                attr.set(this.homeContextQuotaNode, "innerHTML", quota);
            } else {
                attr.set(this.homeContextQuotaNode, "innerHTML", "");
            }
        }
    });
});