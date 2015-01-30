/*global define, __confolio*/
define(["dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-construct",
    "dojo/dom-class",
    "dijit/_Widget",
    "di18n/NLSMixin",
    "dijit/form/TextBox"
], function (declare, lang, domConstruct, domClass, _Widget, NLSMixin, TextBox) {

    return declare([_Widget, NLSMixin], {
        entry: null,
        nlsBundles: ["editor"],
        nlsBundleBase: "nls/",

        constructor: function (args) {
            this.application = __confolio.application;
            this.entry = args.entry;
            this.select = args.select;
        },

        buildRendering: function () {
            this.inherited("buildRendering", arguments);
            this.initNLS();
            this.domNode = this.srcNodeRef || domConstruct.create("div");
            domClass.add(this.domNode, "labelEditor");
            this.textBox = new TextBox({trim: true}, domConstruct.create("div", null, this.domNode));
            this.application.getItemStore(lang.hitch(this, function (itemStore) {
                var mpLabel = this.application.getConfig().getLabelTemplate(this.entry, "local");
                var template = itemStore.createTemplateFromChildren([mpLabel]);
                this.entry.setRefreshNeeded();
                this.entry.refresh(lang.hitch(this, function () {
                    this._valueBinding = folio.data.getLabelRForms(this.application.getConfig(), itemStore, this.entry, true);
                    this._displayedValue = this._valueBinding.getValue();
                    if (this._displayedValue === "") {
                        this._displayedValue = folio.data.getLabel(this.entry);
                    }
                    this.textBox.set("value", this._displayedValue);
                    if (this.select) {
                        this.textBox.focusNode.select();
                    }
                }));
            }));
        },
        focus: function () {
            this.textBox.focus();
        },
        save: function () {
            var newValue = this.textBox.get("value");
            if (newValue === this._displayedValue) {
                return true;
            }
            this._valueBinding.setValue(this.textBox.get("value"));
            var onSuccess = lang.hitch(this, function () {
                this.entry.refresh(lang.hitch(this, function (entry) {
                    this.application.dispatch({action: "changed", entry: entry, source: this});
                    this.application.getStore().updateReferencesTo(entry);
                }));
                this.application.getMessages().message(this.NLSBundles.editor.metadataSaved + this.entry.getUri());
            });
            var onError = lang.hitch(this, function (message) {
                if (message.status === 412) {
                    this.application.getMessages().warn(this.NLSBundles.editor.modifiedPreviouslyOnServer);
                } else {
                    this.application.getMessages().warn(this.NLSBundles.editor.failedSavingUnsufficientMDRights);
                }
            });

            this.entry.saveLocalMetadata(this._valueBinding.getGraph()).then(onSuccess, onError);
            return false;
        }
    });
});