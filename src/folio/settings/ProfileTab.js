/*global define, __confolio*/
define(["dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/connect",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dojox/form/BusyButton",
    "folio/editor/RFormsEditorPlain",
    "folio/editor/RFormsPresenter",
    "rdfjson/Graph",
    "dojo/text!./ProfileTabTemplate.html"
], function (declare, lang, connect, domClass, style, construct, attr, _Widget, _TemplatedMixin, BusyButton, RFormsEditorPlain, RFormsPresenter, Graph, template) {

    /**
     * Shows profile information, group membership, access to portfolios and folders, and latest material.
     * The profile information includes username, home portfolio and user profile metadata.
     */
    return declare([_Widget, _TemplatedMixin], {
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
            this.saveProfileButton = new BusyButton({}, this.saveProfileButtonNode);
            this.connect(this.saveProfileButton, "onClick", this._saveProfile);
            domClass.add(this.saveProfileButton.domNode, "settingsSave");
            fixBusyButton(this.saveProfileButton);
        },

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

        //===================================================
        // Private methods
        //===================================================
        _userChange: function () {
        },

        _localize: function () {
            dojo.requireLocalization("folio", "annotationProfile");
            this.annotationProfileNLS = dojo.i18n.getLocalization("folio", "annotationProfile");
        },

        _saveProfile: function () {
            this.entry.saveLocalMetadata(this.graph).then(lang.hitch(this, function () {
                this.entry.refresh(lang.hitch(this, function (entry) {
                    this.application.publish("changed", {entry: entry, source: this});
                    this.application.getStore().updateReferencesTo(entry);
                }));
                this.application.getMessages().message(this.annotationProfileNLS.metadataSaved + this.entry.getUri());
                this.saveProfileButton.cancel();
            }), lang.hitch(this, function (message) {
                if (message.status === 412) {
                    this.application.getMessages().message(this.annotationProfileNLS.modifiedPreviouslyOnServer);
                } else {
                    this.application.getMessages().message(this.annotationProfileNLS.failedSavingUnsufficientMDRights);
                }
                this.saveProfileButton.cancel();
            }));
        }
    });
});