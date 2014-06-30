/*global define, __confolio*/
define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/dom-style",
    "folio/util/Widget",
    "dojo/data/ItemFileReadStore",
    "dijit/form/RadioButton", //in template
    "dijit/form/CheckBox", //in template
    "dijit/form/FilteringSelect", //in template
    "dojo/text!./LocalSearchTemplate.html"
], function (declare, array, lang, domStyle, Widget, ItemFileReadStore, RadioButton, CheckBox, FilteringSelect, template) {

    return declare([Widget], {
        //===================================================
        // Inherited Attributes
        //===================================================
        templateString: template,
        nls: ["search"],

        //===================================================
        // Public Hooks
        //===================================================
        onChange: function () {
        },

        //===================================================
        // Public API
        //===================================================
        getSearchDetails: function () {
            return {
                graphType: this._getBuiltinTypes(),
                entryType: this._getLocationTypes(),
                context: this._getContext(),
                sort: this._getSortOrder(),
                queryType: "solr",
                useLiteralField: true
            };
        },

        //===================================================
        // Private methods
        //===================================================
        userChange: function () {
            if (this.user && this.user.homecontext) {
                domStyle.set(this.myPortfolioRowNode, "display", "");
            } else {
                domStyle.set(this.myPortfolioRowNode, "display", "none");
            }
        },
        localeChange: function () {
            var context = this.application.getStore().getContext(this.application.repository + "_search");
            context.search({entryType: ["Local"], graphType: ["Context"], sort: "modified+desc", queryType: "solr", onSuccess: lang.hitch(this, function (entryResult) {
                folio.data.getAllChildren(entryResult, lang.hitch(this, function (children) {
                    var contextsArray = array.map(children, function (child) {
                        return {"label": folio.data.getLabelRaw(child) || child.alias || child.getId(), id: child.getId()};
                    });
                    var store = ItemFileReadStore({
                        data: {
                            identifier: "id",
                            label: "label",
                            items: contextsArray
                        }
                    });
                    this.specficPortfolioChangerDijit.set("store", store);
                }));
            })});
            var sortOrderStore = ItemFileReadStore({
                data: {
                    identifier: "id",
                    label: "label",
                    items: [
                        {label: this.NLS["search"].sortBestMatch, id: "score"},
                        {label: this.NLS["search"].sortTitle, id: "title"},
                        {label: this.NLS["search"].sortModified, id: "modified"}
                    ]
                }
            });

            this.sortChangerDijit.set("store", sortOrderStore);
            this.sortChangerDijit.set("value", "score");
        },
        _searchFormChangedRadio: function (value) {
            if (value) {
                this.onChange();
                this.specficPortfolioChangerDijit.set("disabled", !this.specificPortfolioDijit.get("value"));
            }
        },
        _getLocationTypes: function () {
            var ltArr = [];
            var lts = ["Local", "Link", "LinkReference", "Reference"];
            for (var i = 0; i < lts.length; i++) {
                if (this["includeLT" + lts[i] + "Dijit"].get("checked")) {
                    ltArr.push(lts[i]);
                }
            }
            if (ltArr.length === 4) {
                return [];
            } else {
                return ltArr;
            }
        },
        _getBuiltinTypes: function () {
            var btArr = [];
            var bts = ["List", "User", "Group", "None", "String", "Context"];
            for (var i = 0; i < bts.length; i++) {
                if (this["includeBT" + bts[i] + "Dijit"].get("checked")) {
                    btArr.push(bts[i]);
                }
            }
            if (btArr.length === 6) {
                return [];
            } else {
                return btArr;
            }
        },
        _getContext: function () {
            if (this.allPortfoliosDijit.get("value")) {
                return;
            } else if (this.myPortfolioDijit.get("value")) {
                return this.user.homecontext;
            } else {
                var value = this.specficPortfolioChangerDijit.get("value");
                return value === "" ? null : value;
            }
        },
        _getSortOrder: function () {
            var sort = this.sortChangerDijit.get("value");
            var ascending = this.ascendingDijit.get("value");
            if (sort !== "title") {
                return sort + "+" + (ascending ? "asc" : "desc");
            } else { //Hack since asc and desc does not work with title.
                return sort;
            }
        }
    });
});