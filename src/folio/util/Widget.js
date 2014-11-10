/*global define,__confolio*/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/connect",
    "dojo/_base/array",
    "dojo/dom-attr",
    "dojox/form/BusyButton",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "folio/util/NLSMixin"
], function(declare, lang, connect, array, domAttr, BusyButton, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, NLSMixin) {

    //Patch problem in BusyButton with label missing after a click when label not provided in declaration.
    var old = BusyButton.prototype._setLabelAttr;
    BusyButton.prototype._setLabelAttr = function(content) {
        this._label = content;
        old.call(this, content);
    };

    BusyButton.prototype._makeBusy = BusyButton.prototype.makeBusy;
    BusyButton.prototype.makeBusy = function () {
        if (this.get("disabled") !== true) {
            this._makeBusy();
        }
    };

    return  declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin, NLSMixin], {
        templateString: "<div></div>",

        postCreate: function() {
            this.inherited("postCreate", arguments);
            this.initNLS();
        }
    });
});
