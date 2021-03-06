/*global define, __confolio*/
define(["dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "folio/util/Widget",
    "dojox/form/BusyButton", //in template
    "folio/editor/RFormsEditorPlain",
    "rdfjson/Graph",
    "dojo/text!./ProfileTabTemplate.html"
], function (declare, lang, domStyle, domConstruct, domAttr, Widget, BusyButton, RFormsEditorPlain, Graph, template) {

    /**
     * Shows profile information, group membership, access to portfolios and folders, and latest material.
     * The profile information includes username, home portfolio and user profile metadata.
     */
    return declare([Widget], {
        //===================================================
        // Inherited Attributes
        //===================================================
        templateString: template,
        nlsBundles: ["settings"],
        nlsBundleBase: "nls/",

        //===================================================
        // Inherited methods
        //===================================================

        showEntry: function (entry) {
            this.entry = entry;
            //Update editor
            domAttr.set(this.profileEditorNode, "innerHTML", "");
            var node = domConstruct.create("div", null, this.profileEditorNode);
            this.apPlain = new RFormsEditorPlain({}, node);
            this.apPlain.setIncludeLevel("optional");
            this.graph = new Graph(this.entry.getLocalMetadata().exportRDFJSON());
            this.apPlain.show(this.graph, this.entry, this.entry.getResourceUri());
        },

        localize: function()  {
            this.saveProfileButton.set("busyLabel", this.NLSBundles.settings.saveBusyLabel);
        },

        //===================================================
        // Private methods
        //===================================================

        _saveProfile: function () {
            this.entry.saveLocalMetadata(this.graph).then(lang.hitch(this, function () {
                this.entry.refresh(lang.hitch(this, function (entry) {
                    this.application.publish("changed", {entry: entry, source: this});
                    this.application.getStore().updateReferencesTo(entry);
                }));
                this.application.getMessages().message(this.NLSBundles.settings.metadataSaved + this.entry.getUri());
                this.saveProfileButton.cancel();
            }), lang.hitch(this, function (message) {
                if (message.status === 412) {
                    this.application.getMessages().message(this.NLSBundles.settings.modifiedPreviouslyOnServer);
                } else {
                    this.application.getMessages().message(this.NLSBundles.settings.failedSavingUnsufficientMDRights);
                }
                this.saveProfileButton.cancel();
            }));
        }
    });
});