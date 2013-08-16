/*global define, __confolio*/
define(["dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/connect",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "folio/util/Widget",
    "dojox/form/BusyButton",
    "folio/editor/RFormsEditorPlain",
    "folio/editor/RFormsPresenter",
    "rdfjson/Graph",
    "dojo/text!./ProfileTabTemplate.html"
], function (declare, lang, connect, domClass, style, construct, attr, Widget, BusyButton, RFormsEditorPlain, RFormsPresenter, Graph, template) {

    /**
     * Shows profile information, group membership, access to portfolios and folders, and latest material.
     * The profile information includes username, home portfolio and user profile metadata.
     */
    return declare([Widget], {
        //===================================================
        // Inherited Attributes
        //===================================================
        templateString: template,
        nls: ["annotationProfile", "common"],

        //===================================================
        // Inherited methods
        //===================================================

        showEntry: function (entry) {
            this.entry = entry;
            //Update editor
            attr.set(this.profileEditorNode, "innerHTML", "");
            var node = construct.create("div", null, this.profileEditorNode);
            this.apPlain = new RFormsEditorPlain({}, node);
            this.apPlain.setIncludeLevel("optional");
            this.graph = new Graph(this.entry.getLocalMetadata().exportRDFJSON());
            this.apPlain.show(this.graph, this.entry, this.entry.getResourceUri());
        },

        localize: function()  {
            this.saveProfileButton.set("busyLabel", this.NLS.common.saveInProgress);
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
                this.application.getMessages().message(this.NLS.annotationProfile.metadataSaved + this.entry.getUri());
                this.saveProfileButton.cancel();
            }), lang.hitch(this, function (message) {
                if (message.status === 412) {
                    this.application.getMessages().message(this.NLS.annotationProfile.modifiedPreviouslyOnServer);
                } else {
                    this.application.getMessages().message(this.NLS.annotationProfile.failedSavingUnsufficientMDRights);
                }
                this.saveProfileButton.cancel();
            }));
        }
    });
});