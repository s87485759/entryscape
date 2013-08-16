/*global define,__confolio*/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/connect",
    "dojo/_base/array",
    "dojo/aspect",
    "dojo/dom-attr",
    "dojox/form/BusyButton",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin"
], function(declare, lang, connect, array, aspect, attr, BusyButton, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin) {

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

    return declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        /**
         * Array of attachpoints those specified in template will end up in this array.
         * Initial values of these attachpoints will be treated as keys to be looked up in the localization bundles.
         */
        i18n: [],
        /**
         * If multiple keys are given as values in the template for the i18n attachpoints the key used will depend on the current i18nState.
         * If only one key is provided that will be used independently of the state.
         */
        _i18nState: 0,

        /**
         * Array of localization bundles to load.
         */
        nls: [],
        /**
         * Loaded localization bundles.
         */
        NLS: {},

        _i18nKeys: [],

        constructor: function() {
            this.i18n = [];
        },

        setI18nState: function(state) {
            this._i18nState = state;
            this._localeChange();
        },
        localeChange: function() {
        },
        userChange: function() {
        },
        ready: function() {
        },

        postCreate: function() {
            this.inherited("postCreate", arguments);
            this.application = __confolio.application;
            if (!this._nls) {
                this._nls = array.map(this.nls, function(bundle) {
                    return "dojo/i18n!folio/nls/"+bundle;
                });
            }

            //Connect to application events
            connect.subscribe("/confolio/localeChange", lang.hitch(this, this._localeChange));
            connect.subscribe("/confolio/userChange", lang.hitch(this, this._userChange));

            this._i18nKeys = [{}, {}, {}, {}, {}]; //Maximum four states.
            array.forEach(this.i18n, function(node) {
                var key, keys;
                if (node instanceof _Widget) {
                    keys = node.get("label");
                } else {
                    keys = attr.get(node, "innerHTML");
                }
                keys = keys.split(/\s*,\s*/);
                if (keys.length === 1) {
                    this._addToOrCreateArr(this._i18nKeys[0], lang.trim(keys[0]), node);
                } else {
                    for (var state=0;state<keys.length;state++) {
                        this._addToOrCreateArr(this._i18nKeys[state+1], lang.trim(keys[state]), node);
                    }
                }
            }, this);
            this._localeChange();
        },

        _addToOrCreateArr: function(obj, key, node) {
            if (obj[key]) {
                obj[key].push(node);
            } else {
                obj[key] = [node];
            }
        },
        _localizeKeys: function(bundle, keys2nodes) {
            var showKey = this.application.getLocale() === "nls";
            for (var key in keys2nodes) if (bundle[key] && keys2nodes.hasOwnProperty(key)) {
                array.forEach(keys2nodes[key], function(node) {
                    if (node instanceof _Widget) {
                        node.set("label", showKey ? key : bundle[key]);
                    } else {
                        attr.set(node, "innerHTML", showKey ? key : bundle[key]);
                    }
                });
            }
        },
        _localeChange: function() {
            require(this._nls, lang.hitch(this, function() {
                this.NLS = {};

                for (var i=0;i<this.nls.length;i++) {
                    var bundle = arguments[i];
                    this.NLS[this.nls[i]] = bundle;
                    this._localizeKeys(bundle, this._i18nKeys[0]);
                    if (this._i18nState !== 0) {
                        this._localizeKeys(bundle, this._i18nKeys[this._i18nState]);
                    }
                }
                this.localeChange.call(this, arguments);
            }));
        },
        _userChange: function() {
            this.user = this.application.getUser();
            this.userChange();
        }
    });
});
