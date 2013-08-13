/*global define, __confolio*/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/_base/connect",
    "dojo/dom-class",
    "dojo/dom-style",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "folio/navigation/PrincipalInfo", //In template
    "folio/settings/AccountTab",      //In template
    "folio/settings/ProfileTab",      //In template
    "folio/settings/MembersTab",      //In template
    "folio/settings/RightsTab",      //In template
    "dojo/text!./SettingsTemplate.html"
], function (declare, lang, array, connect, domClass, style, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin,
             AccountTab, ProfileTab, MembersTab, RightsTab, PrincipalInfo, template) {

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
        // Private attributes
        //===================================================
        _defaultTabName: "account",
        _currentTabName: "account",
        _tabNames: ["account", "profile", "members", "rights"],

        //===================================================
        // Inherited methods
        //===================================================
        postCreate: function () {
            this.inherited("postCreate", arguments);
            this.application = __confolio.application;

            //Connect to application events
            connect.subscribe("/confolio/localeChange", lang.hitch(this, this._localize));
            connect.subscribe("/confolio/userChange", lang.hitch(this, this._userChange));


            //Handle click on tabs.
            array.forEach(this._tabNames, function(tabname) {
                this.connect(this["_"+tabname+"ButtonNode"], "onclick", lang.hitch(this, this._switchToTab, tabname));
            }, this);
        },
        startup: function() {
            this.inherited("startup", arguments);
            this._localize();
        },

        /**
         * Required by ViewMap to be able to set a nice breadcrumb.
         * @param {Object} params
         */
        getLabel: function (params) {
            return "settings";
        },
        show: function (params) {
            this.entryUri = this.application.getRepository() + "_principals/resource/" + params.entry;

            var f = lang.hitch(this, function (entry) {
                var same = this.entry && this.entry.getId() === entry.getId();
                this.entry = entry;
                if (folio.data.isGroup(this.entry)) {
                    style.set(this._membersButtonNode, "display", "");
                } else {
                    style.set(this._membersButtonNode, "display", "none");
                }
                this._switchToTab(same ? this._currentTabName : this._defaultTabName);
                this.principalInfo.show(entry);
            });
            this.application.getStore().loadEntry(this.entryUri, {},
                function (entry) {
                    if (entry.resource == null) {
                        entry.setRefreshNeeded();
                        entry.refresh(f);
                    } else {
                        f(entry);
                    }
                });
        },

        //===================================================
        // Private methods
        //===================================================
        _userChange: function () {
            this.user = this.application.getUser();
            if (this.entryUri) {
                this.application.getStore().loadEntry(this.entryUri, {}, lang.hitch(this, this.showEntry));
            }
            array.forEach(this._tabNames, function(tabname) {
                this["_"+tabname+"TabDijit"]._userChange();
            }, this);
        },
        _localize: function () {
            dojo.requireLocalization("folio", "userEditor");
            this.settingsNLS = dojo.i18n.getLocalization("folio", "userEditor");
            array.forEach(this._tabNames, function(tabname) {
                this["_"+tabname+"TabDijit"]._localize();
            }, this);

            /*		AMD way
             require(["dojo/i18n!folio/nls/annotationProfile"], lang.hitch(this, function(i18n) {
             this.annotationProfileNLS = i18n;
             }));*/
            /*		dojo.requireLocalization("folio", "profile");
             this.resourceBundle = dojo.i18n.getLocalization("folio", "profile");
             this.set(this.resourceBundle);*/
        },

        /**
         * Expects there to be a this._tabnameButtonNode and this._tabnameTabDijit for every tab named tabname.
         * Current tab is kept in variable this._currentTabName.
         *
         * @param tabName name of tab to switch to.
         * @private
         */
        _switchToTab: function (tabName) {
            //First, if settings where not inited when the user signed in.
            if (this.user !== this.application.getUser()) {
                this.user = this.application.getUser();
                array.forEach(this._tabNames, function(tabname) {
                    this["_"+tabname+"TabDijit"]._userChange();
                }, this);
            }
            if (this._currentTabName !== tabName) {
                domClass.remove(this["_" + this._currentTabName + "ButtonNode"], "selected");
                style.set(this["_" + this._currentTabName + "TabDijit"].domNode, "display", "none");
                this._currentTabName = tabName;
                domClass.add(this["_" + this._currentTabName + "ButtonNode"], "selected");
                style.set(this["_" + this._currentTabName + "TabDijit"].domNode, "display", "");
            }
            this["_" + this._currentTabName + "TabDijit"].showEntry(this.entry);
        }
    });
});