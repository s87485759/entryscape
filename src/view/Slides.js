define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-attr",
    "folio/util/Widget",
    "folio/content/ContentViewSwitcher",
    "dijit/layout/ContentPane",
    "dojo/text!./SlidesTemplate.html"
], function(declare,lang, domAttr, Widget, ContentViewSwitcher, ContentPane, template) {
    return declare(Widget, {
        templateString: template,
        postCreate: function() {
            this.inherited("postCreate", arguments);
            this.application = __confolio.application;
            this.cp.resize();
        },
        show: function(params) {
            this.application.getStore().loadEntry(
                {entryId: params.entry, contextId: params.context, base: this.application.getRepository()},
                {limit: -1},
                lang.hitch(this, function(entry) {
                    folio.data.getAllChildren(entry, lang.hitch(this, function(children) {
                        this.list = entry;
                        this.children = children;
                        this.index = 0;
                        this._show();
                    }));
            }));
        },

        _prevClicked: function() {
            if (this.index === 0) {
                return;
            }
            this.index--;
            this._show();
        },
        _nextClicked: function() {
            if (this.index >= this.children.length-1) {
                return;
            }
            this.index++;
            this._show();
        },
        _show: function(entry) {
            var entry = this.children[this.index];
            this.content.show(entry);
            domAttr.set(this.info, "innerHTML", folio.data.getLabel(entry));
            this.cp.resize();
        }
    });
});