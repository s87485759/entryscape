/*global define,__confolio*/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/connect",
    "dojo/_base/array",
    "dojo/dom-attr",
    "dijit/_Widget"
], function(declare, lang, connect, array, domAttr, _Widget) {

    var getPrototypeOf = (function() {
        if ( typeof Object.getPrototypeOf !== "function" ) {
            if ( typeof "test".__proto__ === "object" ) {
                return function(object){
                    return object.__proto__;
                };
            } else {
                return function(object){
                    // May break if the constructor has been tampered with
                    return object.constructor.prototype;
                };
            }
        } else {
            return Object.getPrototypeOf;
        }
    })();

    var findĹocaleOfKey = function(bundle, key) {
        for (var k in bundle) if (key === k && bundle.hasOwnProperty(k)) {
            return bundle.__locale || "";
        }
        var prot = getPrototypeOf(bundle);
        if (prot != null) {
            return findLocaleOfKey(prot, key);
        }
    };

    //http://unicode.org/repos/cldr/trunk/common/supplemental/plurals.xml
//    //According to https://developer.mozilla.org/en/docs/Localization_and_Plurals#Plural_rule_.230_.281_form.29
    var rules = [
        {
            langs: "af asa ast az bem bez bg brx cgg chr ckb dv ee el eo es eu fo fur fy gsw ha haw hu jgo jmc ka kaj kcg kk kkj kl ks ksb ku ky lb lg mas mgo ml mn nah nb nd ne nn nnh no nr ny nyn om or os pap ps rm rof rwk saq seh sn so sq ss ssy st syr ta te teo tig tk tn tr ts uz ve vo vun wae xh xog",
            rule: function(n) { return n === 1 ? 0 : 1}
        }, {
            langs: "bm bo dz id ig ii in ja jbo jv jw kde kea km ko lkt lo ms my nqo root sah ses sg th to vi wo yo zh",
            rule: function(n) { return 0;}
        }, {
            langs: "ak bh guw ln mg nso pa ti wa",
            rule: function(n) { return n === 0 || n === 1 ? 0 : 1}
        }, { //Same as above, but treated separately for some reason, investigate.
            langs: "ff fr hy kab",
            rule: function(n) { return n === 0 || n === 1 ? 0 : 1}
        }, { //Same as above, but treated separately for some reason, investigate.
            langs: "am bn fa gu hi kn mr zu",
            rule: function(n) { return n === 0 || n === 1 ? 0 : 1}
        }, {
            langs: "iu kw naq se sma smi smj smn sms",
            rule: function(n) { return n === 1 ? 0 :  n === 2 ? 1 : 2}
        }, {
            langs: "ca de en et fi gl it ji nl sv sw ur yi",
            rule: function(n) { return n === 1 ? 0 : 1}
        }
    ];

    var getPluralsRule = function(locale) {

    };

    return declare(null, {
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

        getPlurals: function(bundle, key, nr) {
            var l =  findĹocaleOfKey(bundle, key);
            var val = bundle[key];
            return getPluralsRule(l)(val);
        },

        /**
         * Call this method from postCreate.
         */
        initNLS: function() {
            this.application = __confolio.application;
            if (!this._nls) {
                this._nls = array.map(this.nls, function(bundle) {
                    return "folio/util/i18n!folio/nls/"+bundle;
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
                    keys = domAttr.get(node, "innerHTML");
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
                        domAttr.set(node, "innerHTML", showKey ? key : bundle[key]);
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