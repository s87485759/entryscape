/*global define, __confolio*/
define(["dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-construct",
    "dojo/date/stamp",
    "di18n/NLSMixin",
    "rdforms/view/Editor",
    "dijit/layout/BorderContainer", //in template
    "dijit/layout/ContentPane", //in template
    "dijit/CheckedMenuItem", //in template
    "dijit/form/Button", //in template
    "dijit/form/CheckBox", //in template
    "dojox/form/BusyButton", //in template
    "dijit/layout/_LayoutWidget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./RFormsEditorTemplates.html"
], function (declare, lang, domConstruct, stamp, NLSMixin, Editor, BorderContainer, ContentPane,
             CheckedMenuItem, Button, CheckBox, BusyButton, _LayoutWidget,
             _TemplatedMixin, _WidgetsInTemplateMixin, template) {
    return declare([_LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin, NLSMixin], {

        nlsBundles: ["annotationProfile"],
        nlsBundleBase: "folio/nls/",
        compact: true,
        optional: false,
        recommended: true,

        /*
        dialogTitle: "",
        dialogCancelLabel: "",
        dialogDoneLabel: "",
        dialogDoneBusyLabel: "",
        dataLabel: "",
        */

        templateString: template,

        resize: function (arg) {
            this.inherited("resize", arguments);
            if (this.bc) {
                this.bc.resize(arg);
            }
        },
        postCreate: function () {
            this.inherited("postCreate", arguments);
            this.initNLS();
        },

        show: function (entry, ID) {
            this._show(entry, ID);
        },
        _show: function (entry, rformsIDs, refresh) {
            if (this.editor != null) {
                this.editor.destroy();
            }
            if (refresh !== true) {
                if (entry == null) {
                    return;
                }
                this.entry = entry;
                this.graph = new rdfjson.Graph(entry.getLocalMetadata().exportRDFJSON());
            }
            this.explicitRforms = rformsIDs;
            this.application.getItemStore(lang.hitch(this, function (itemStore) {
                var config = this.application.getConfig();
                var graph = entry.getLocalMetadata();
                var langs = config.getMPLanguages();
                var mpItems = config.getTemplate(entry, "local");
                if (!this.explicitRforms || this.explicitRforms.length < 1) {
                    var template = itemStore.detectTemplate(graph, entry.getResourceUri(), mpItems);
                } else {
                    var explicitPlusMp = this.explicitRforms;
                    if (mpItems) {
                        explicitPlusMp.concat(mpItems);
                    }
                    template = itemStore.detectTemplate(graph, entry.getResourceUri(), explicitPlusMp);
                }
//			var template = itemStore.createTemplateFromChildren([folio.data.DCTermsSchema.TITLE,folio.data.DCTermsSchema.DESCRIPTION]);
                var binding = rdforms.model.Engine.match(this.graph, entry.getResourceUri(), template);
                var includeLevel = this.optional ? "optional" : this.recommended ? "recommended" : "mandatory";
                this.editor = new Editor({template: template, languages: langs, binding: binding, includeLevel: includeLevel, compact: this.compact}, domConstruct.create("div", null, this.rformsEditorNode));
            }));
        },
        editStateColorChange: function () {
        },
        recommendedChange: function () {
            this.recommended = !this.recommended;
            this.show(this.entry);
        },
        optionalChange: function () {
            this.optional = !this.optional;
            this.recommendedCheckBox.set("disabled", this.optional);
            if (this.optional) {
                this.recommendedCheckBox.set("checked", true);
            }
            this._show(this.entry, this.explicitRforms, true);
        },
        donePressed: function () {
            var onSuccess = lang.hitch(this, function () {
                this.entry.refresh(lang.hitch(this, function (entry) {
                    this.application.dispatch({action: "changed", entry: entry, source: this});
                    this.application.getStore().updateReferencesTo(entry);
                }));
                this.application.getMessages().message(this.metadataSaved + this.entry.getUri());
                delete this.entry;
                this.dialogDone.cancel();
                this.doneEditing();
            });
            var onError = lang.hitch(this, function (message) {
                if (message.status === 412) {
                    this.application.getMessages().warn(this.modifiedPreviouslyOnServer);
                } else {
                    this.application.getMessages().warn(this.failedSavingUnsufficientMDRights);
                }
                this.dialogDone.cancel();
            });

            var modDate = stamp.fromISOString(this.entry.getModificationDate());
            this.application.getCommunicator().PUT(
                this.entry.getLocalMetadataUri(),
                this.graph.exportRDFJSON(), modDate.toUTCString())
                .then(onSuccess, onError);
        },
        doneEditing: function () {
        },
        localeChange: function() {
            this.dialogDone.set("busyLabel", this.NLSBundles["annotationProfile"].dialogDoneBusyLabel);
        }
    });
});