/*global define, __confolio*/
define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/dom-construct",
    "./authorize",
    "folio/util/Widget",
    "dojo/text!./AccountTemplate.html"
], function (declare, array, domConstruct, authorize, Widget, template) {

    /**
     * Shows profile information, group membership, access to portfolios and folders, and latest material.
     * The profile information includes username, home portfolio and user profile metadata.
     */
    return declare(Widget, {
        //===================================================
        // Inherited Attributes
        //===================================================
        templateString: template,
        nlsBundles: ["login"],
        nlsBundleBase: "nls/",

        //===================================================
        // Inherited methods
        //===================================================
        postCreate: function () {
            this.inherited("postCreate", arguments);
            var config = __confolio.application.getConfig();
            array.forEach(authorize.providers, function(provider) {
                var src = __confolio.application.getRepository()+"auth/openid/"+provider.id+"/signup?redirectOnSuccess="+encodeURIComponent(window.location.href);
                var node = domConstruct.create("a", {"class": "provider", href: src}, this.signupProviders);
                domConstruct.create("img", {src: config.getIcon("openid-"+provider.id, "64x64")}, domConstruct.create("div", {"class": "img-wrap"}, node));
                //on(node, "click", lang.hitch(this, this.showOpenIdDialog, provider));
            }, this);
        },

        /**
         * Required by ViewMap to be able to set a nice breadcrumb.
         * @param {Object} params
         */
        getLabel: function (params) {
            return "signup";
        },
        show: function (params) {
            this.user = this.application.getUser();
            this._userChange();
        },

        _userChange: function() {
            if (this.user) {
                this.application.open("profile", {"context": "_principals", "entry": this.user.id});
            }
        }

        //===================================================
        // Private methods
        //===================================================
    });
});