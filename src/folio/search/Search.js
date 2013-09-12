/*global define, __confolio*/
define(["dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/connect",
    "dojo/on",
    "dojo/aspect",
    "dojo/_base/array",
    "dojo/json",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dojo/store/Memory",
    "folio/util/Widget",
    "dijit/form/TextBox",
    "dijit/form/FilteringSelect",
    "./searchProviders",
    "dojo/text!./SearchTemplate.html"
], function (declare, lang, connect, on, aspect, array, json, domClass, style, construct, attr, Memory, Widget, TextBox, FilteringSelect, providers, template) {

    return declare(Widget, {
        //===================================================
        // Inherited Attributes
        //===================================================
        templateString: template,

        //===================================================
        // Public attributes
        //===================================================
        searchAlternatives: providers,
        defaultSearchAlternative: "local",

        //===================================================
        // Private attributes
        //===================================================
        _currentSearchAlternative: null,
        _searchAlternatives: null,


        //===================================================
        // Inherited methods
        //===================================================
        constructor: function () {
            this._searchAlternatives = {};
        },
        postCreate: function () {
            this.inherited("postCreate", arguments);
            dojo.connect(this.searchBoxDijit, "onKeyUp", this, function (event) {
                if (event.keyCode === dojo.keys.ENTER) {
                    this._searchFormChanged();
                }
            });

            this._alternativeStore = new Memory({data: this.searchAlternatives});
            new FilteringSelect({
                name: "searchview",
                value: this.defaultSearchAlternative,
                store: this._alternativeStore,
                onChange: lang.hitch(this, this._switchToSearchAlternative),
                searchAttr: "name"
            }, construct.create("div", null, this._searchTypeChooser));
        },

        /**
         * Required by ViewMap to be able to set a nice breadcrumb.
         * @param {Object} params
         */
        getLabel: function (params) {
            return "search";
        },
        show: function (params) {
            params = params || {};
            this.lastParams = params; //Storing the last parameters sent into show to be reused when
            //an update of the view is needed (for example when a user logs in or out)
            this._switchToSearchAlternative(params.alternative, lang.hitch(this, function () {
                if (params.term) {
                    this.searchBoxDijit.set("value", params.term);
                    this._searchFormChanged();
                }
                setTimeout(lang.hitch(this, function () {
                    this.searchBoxDijit.focus();
                }), 1);
            }));
        },
        /**
         * Called whenever a resultitem is selected in the resultView currently used.
         * @param entry
         */
        entrySelected: function(entry) {
        },

        //===================================================
        // Private methods
        //===================================================
        userChange: function () {
            if (this.lastParams) {
                this.show(this.lastParams);
            }
        },

        _searchFormChanged: function () {
            var term = this.searchBoxDijit.get("value").toLowerCase();
            //Do the delegated search.
            this._switchToSearchAlternative(null, lang.hitch(this, function () {
                var searchParams = this._searchAlternatives[this._currentSearchAlternative].searchDetails.getSearchDetails();
                this._searchResultsSearching();
                this._searchAlternatives[this._currentSearchAlternative].searchResults.show(lang.mixin(searchParams, {term: term}));
            }));
        },
        _searchResultsChanged: function (nrOfHits) {
  //          attr.set(this.resultCountNode, "innerHTML", lang.replace(this.resourceBundle.searchResults, {nrOfHits: nrOfHits || 0}));
        },
        _searchResultsSearching: function () {
    //        attr.set(this.resultCountNode, "innerHTML", this.resourceBundle ? this.resourceBundle.searchResultsSearching : "");
        },
        _getSearchDetails: function () {
        },
        _switchToSearchAlternative: function (alternative, callback) {
            if (alternative == null) {
                if (this._currentSearchAlternative != null) {
                    callback && callback();
                    return;
                }
                alternative = this.defaultSearchAlternative;
            }
            if (this._currentSearchAlternative !== alternative) {
                //Hide previous search alternative.
                if (this._currentSearchAlternative != null) {
                    style.set(this._searchAlternatives[this._currentSearchAlternative].searchDetails.domNode, "display", "none");
                    style.set(this._searchAlternatives[this._currentSearchAlternative].searchResults.domNode, "display", "none");
                }
                var info = this._alternativeStore.get(alternative);
                if (info.logo) {
                    attr.set(this._searchTypeLogo, "src", require.toUrl("folio/search/")+info.logo);
                    style.set(this._searchTypeLogo, "display", "");
                } else {
                    style.set(this._searchTypeLogo, "display", "none");
                }
                if (info.description) {
                    attr.set(this._searchTypeInfo, "innerHTML", info.description);
                } else {
                    attr.set(this._searchTypeInfo, "innerHTML", "");
                }

                if (this._searchAlternatives[alternative] == null) {
                    this._searchAlternatives[alternative] = {};
                    var alt = this._searchAlternatives[alternative];

                    var sDClsStr = info.detailsClass;
                    var sRClsStr = info.resultsClass;
                    require([sRClsStr, sDClsStr], lang.hitch(this, function (sRCls, sDCls) {
                        alt.searchDetails = new sDCls({}, construct.create("div", null, this._searchDetailsContainer));
                        alt.searchDetails.startup();
                        aspect.before(alt.searchDetails, "onChange", lang.hitch(this, this._searchFormChanged));
                        alt.searchResults = new sRCls({}, construct.create("div", null, this._searchResultsContainer));
                        alt.searchResults.startup();
                        aspect.before(alt.searchResults, "onResults", lang.hitch(this, this._searchResultsChanged));
                        aspect.before(alt.searchResults, "entrySelected", lang.hitch(this, function(entry) { //Neccessary anonymous function since otherwise chainging of aspect.before does not work (multiple steps).
                            this.entrySelected(entry); }));
                        this._currentSearchAlternative = alternative;
                        callback && lang.isFunction(callback) && callback();
                    }));
                } else {
                    style.set(this._searchAlternatives[alternative].searchDetails.domNode, "display", "");
                    style.set(this._searchAlternatives[alternative].searchResults.domNode, "display", "");
                    this._currentSearchAlternative = alternative;
                    callback && lang.isFunction(callback) && callback();
                }
            } else {
                callback && lang.isFunction(callback) && callback();
            }
        }
    });
});
