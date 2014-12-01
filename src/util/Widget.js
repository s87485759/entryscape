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
    "di18n/NLSMixin",
    "di18n/locale"
], function(declare, lang, connect, array, domAttr, BusyButton, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin,
            NLSMixin, locale) {

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
        nlsBundleBase: "folio/nls/",

        postCreate: function() {
            this.inherited("postCreate", arguments);
            this.application = __confolio.application;
            connect.subscribe("/confolio/localeChange", lang.hitch(this, function(obj) {
                locale.setLocale(obj.locale);
            }));
            connect.subscribe("/confolio/userChange", lang.hitch(this, this._userChange));

            this.initNLS();
        },
        userChange: function() {
        },
        _userChange: function() {
            this.user = this.application.getUser();
            this.userChange();
        }
    });
});