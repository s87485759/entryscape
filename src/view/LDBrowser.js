define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-attr",
    "folio/util/Widget",
    "folio/editor/RFormsPresenter",
    "folio/content/ContentViewSwitcher",
    "dijit/layout/ContentPane",
    "dojo/text!./LDBrowserTemplate.html"
], function(declare,lang, attr, Widget, RFormsPresenter, ContentViewSwitcher, ContentPane, template) {
    return declare(Widget, {
        templateString: template,
        postCreate: function() {
            this.inherited("postCreate", arguments);
            this.application = __confolio.application;
        },
        show: function(params) {
            if (params.url != null) {

            } else {
                this.application.getStore().loadEntry(
                    {entryId: params.entry, contextId: params.context, base: this.application.getRepository()},
                    {},
                    lang.hitch(this, function(entry) {
                        this.rformsPresenter.show(entry);
                        this.content.show(entry);
                    }));
            }
        }
    });
});