/*global define*/
define(["dojo/_base/declare", 
	"dojo/_base/lang",
    "dojo/aspect",
    "dojo/dom-style",
    "dojo/dom-attr",
    "dijit/Dialog",
    "folio/util/Widget",
    "folio/search/Search",
	"rforms/model/system",
    "rforms/utils",
    "dojo/text!./ChoiceSearchTemplate.html"
], function(declare, lang, aspect, style, attr, Dialog, Widget, Search, system, rutils, template) {

    var Inner = declare(Widget, {
        templateString: template,
        nls: ["common"],
        postCreate: function() {
            this.inherited("postCreate", arguments);
            this.search.show();
            aspect.before(this.search, "entrySelected", lang.hitch(this, this._entrySelected));
            this.originalChoice = this.binding.getChoice(); //Ok since this must be a ChoiceBinding.
            if (this.originalChoice == null) {
                attr.set(this.originalChoiceNode, "innerHTML", "-");
            } else {
                attr.set(this.originalChoiceNode, "innerHTML", rutils.getLocalizedValue(this.originalChoice.label).value || this.originalChoice.value)

            }

            this.dialog = new Dialog({
                title: "Search for resources"
            });
            this.dialog.set("content", this.domNode);
            style.set(this.domNode, {"width": "800px", "height": "550px"});
            this.dialog.startup();
            this.dialog.show();
        },

        _entrySelected: function(entry) {
            this.choice = {value: entry.getResourceUri(), inlineSeeAlso: true};
            if (entry.getContext().isSearch) {
                this.choice.label = rutils.getLocalizedMap(entry.getLocalMetadata(), entry.getResourceUri(), folio.data.DCTermsSchema.TITLE);
                if (!this.choice.label) {
                    this.choice.label = {"": entry.getResourceUri()};
                }
                this.choice.inlineLabel = true;
                var sa = folio.data.getSeeAlso(entry);
                if (entry.getRepresentationType() !== folio.data.RepresentationType.INFORMATION_RESOURCE && sa != null) {  //TODO always use seeAlso, even for information resources?
                    this.choice.seeAlso = sa;
                }
            } else {
                this.choice.label = {en: folio.data.getLabel(entry)};
                this.choice.description = {en: folio.data.getDescription(entry)};
                this.choice.seeAlso = entry.getUri();
            }
            attr.set(this.newChoiceNode, "innerHTML", rutils.getLocalizedValue(this.choice.label).value || this.choice.value);
            this.chooseButton.set("disabled", this.originalChoice != null && this.originalChoice.value === this.choice.value);
        },
        _cancel: function() {
            this.callback(this.originalChoice);
            this.destroy();
        },

        _choose: function() {
            this.callback(this.choice);
            this.destroy();
        },
        destroy: function() {
            this.inherited("destroy", arguments);
            this.dialog.destroy();
        }
    });

    var onClick = function(entry, event) {
        folio.entry.Details.show(event.target, entry);
    };


    system.getChoice = function(item, value, seeAlso) {
        var obj = {"value": value};
        var base = __confolio.application.getRepository();
        var eUri;
        if (seeAlso != null && seeAlso.indexOf(base) === 0) {
            eUri = seeAlso;
        } else if (value != null && value.indexOf(base) === 0) {
            eUri = value;
        }
        if (eUri == null) {
            return {label: {en: value}, href: seeAlso || value, target: "_blank"};
        } else {
            var store = __confolio.application.getStore();
            var context = store.getContextFor(eUri);
            var entry = context.getEntryFromEntryURI(eUri);
            if (entry != null) {
                obj.label = {en: folio.data.getLabel(entry)};
                obj.description = {en: folio.data.getDescription(entry)};
            } else {
                obj.label = {"en": "Loading...", "sv": "Laddar..."};
                obj.load =	function(onSuccess, onFailure) {
                                store.loadEntry(eUri, {}, function(e) {
                                    delete obj.load;
                                    obj.label = {en: folio.data.getLabel(e)};
                                    obj.description = {en: folio.data.getDescription(e)};
                                    onSuccess(obj);
                                }, onFailure);
                    };
            }
            obj.onClick = lang.hitch(this, onClick, entry);
            return obj;
        }
    };

    system.openChoiceSelector = function(binding, callback) {
        new Inner({binding: binding, callback: callback});
    };
})