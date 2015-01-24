/*global define, __confolio*/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/dom-class",
    "dojo/dom-style",
    "folio/util/Widget",
    "folio/navigation/PrincipalInfo", //In template
    "folio/settings/AccountTab",      //In template
    "folio/settings/ProfileTab",      //In template
    "folio/settings/MembersTab",      //In template
    "folio/settings/RightsTab",      //In template
    "dojo/text!./SettingsTemplate.html"
], function (declare, lang, array, domClass, domStyle, Widget, PrincipalInfo,
             AccountTab, ProfileTab, MembersTab, RightsTab, template) {

    /**
     * Shows profile information, group membership, access to portfolios and folders, and latest material.
     * The profile information includes username, home portfolio and user profile metadata.
     */
    return declare(Widget, {
        //===================================================
        // Inherited Attributes
        //===================================================
        templateString: template,
        nlsBundles: ["settings"],
        nlsBundleBase: "nls/",

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

            //Handle click on tabs.
            array.forEach(this._tabNames, function(tabname) {
                this.connect(this["_"+tabname+"ButtonNode"], "onclick", lang.hitch(this, this._switchToTab, tabname));
            }, this);
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
                    domStyle.set(this._membersButtonNode, "display", "");
                } else {
                    domStyle.set(this._membersButtonNode, "display", "none");
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
            }
            if (this._currentTabName !== tabName) {
                domClass.remove(this["_" + this._currentTabName + "ButtonNode"], "selected");
                domStyle.set(this["_" + this._currentTabName + "TabDijit"].domNode, "display", "none");
                this._currentTabName = tabName;
                domClass.add(this["_" + this._currentTabName + "ButtonNode"], "selected");
                domStyle.set(this["_" + this._currentTabName + "TabDijit"].domNode, "display", "");
            }
            this["_" + this._currentTabName + "TabDijit"].showEntry(this.entry);
        }
    });
});