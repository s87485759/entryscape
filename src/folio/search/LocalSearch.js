/*global dojo, dijit, folio*/
/*
 * Copyright (c) 2007-2010
 *
 * This file is part of Confolio.
 *
 * Confolio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Confolio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Confolio. If not, see <http://www.gnu.org/licenses/>.
 */

dojo.provide("folio.search.LocalSearch");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.TextBox");
dojo.require("dojo.data.ItemFileReadStore");

/**
 */
dojo.declare("folio.search.LocalSearch", [dijit._Widget, dijit._Templated], {
	//===================================================
	// Inherited Attributes
	//===================================================
	templatePath: dojo.moduleUrl("folio.search", "LocalSearchTemplate.html"),
    widgetsInTemplate: true,
	attributeMap: dojo.mixin(dojo.clone(dijit.layout.ContentPane.prototype.attributeMap), {
			allPortfoliosLabel: {node: "allPortfoliosLabelNode", type: "innerHTML"},
			myPortfolioLabel: {node: "myPortfolioLabelNode", type: "innerHTML"},
			specificPortfolioLabel: {node: "specificPortfolioLabelNode", type: "innerHTML"},
	        searchAgainstLabel: {node: "searchAgainstLabelNode", type: "innerHTML"},
 	        searchInLabel: {node: "searchInLabelNode", type: "innerHTML"},
	        includeLTLabel: {node: "includeLTLabelNode", type: "innerHTML"},
	        includeBTLabel: {node: "includeBTLabelNode", type: "innerHTML"},
    	    sortByLabel: {node: "sortByLabelNode", type: "innerHTML"},
			includeLTLocalLabel: {node: "includeLTLocalLabelNode", type: "innerHTML"},
	        includeLTLinkLabel: {node: "includeLTLinkLabelNode", type: "innerHTML"},
	        includeLTLinkReferenceLabel: {node: "includeLTLinkReferenceLabelNode", type: "innerHTML"},
	        includeLTReferenceLabel: {node: "includeLTReferenceLabelNode", type: "innerHTML"},
	        includeBTContextLabel: {node: "includeBTContextLabelNode", type: "innerHTML"},
	        includeBTNoneLabel: {node: "includeBTNoneLabelNode", type: "innerHTML"},
	        includeBTListLabel: {node: "includeBTListLabelNode", type: "innerHTML"},
	        includeBTUserLabel: {node: "includeBTUserLabelNode", type: "innerHTML"},
	        includeBTGroupLabel: {node: "includeBTGroupLabelNode", type: "innerHTML"},
	        includeBTStringLabel: {node: "includeBTStringLabelNode", type: "innerHTML"},
			sortChangerLabel: {node: "sortChangerLabelNode", type: "innerHTML"},
			ascendingLabel: {node: "ascendingLabelNode", type: "innerHTML"},
			descendingLabel: {node: "descendingLabelNode", type: "innerHTML"}
	}),

	//===================================================
	// I18n attributes
	//===================================================
	allPortfoliosLabel: "",
	myPortfolioLabel: "",
	specificPortfolioLabel: "",

	searchAgainstLabel: "",
	searchInLabel: "",
	includeLTLabel: "",
	includeBTLabel: "",
	sortByLabel: "",
	includeLTLocalLabel: "",
	includeLTLinkLabel: "",
	includeLTLinkReferenceLabel: "",
	includeLTReferenceLabel: "",

	includeBTContextLabel: "",
	includeBTNoneLabel: "",
	includeBTListLabel: "",
	includeBTUserLabel: "",
	includeBTGroupLabel: "",
	includeBTStringLabel: "",
	
	sortChangerLabel: "",
	ascendingLabel: "",
	descendingLabel: "",

	//===================================================
	// Public Hooks
	//===================================================
	onChange: function() {
	},

	//===================================================
	// Public API
	//===================================================
	getSearchDetails: function() {
		return {
			builtinType: this._getBuiltinTypes(),
			locationType: this._getLocationTypes(),
			context: this._getContext(),
			sort: this._getSortOrder(),
			queryType: "solr",
			useLiteralField: true
		};
	},
	
	//===================================================
	// Inherited methods
	//===================================================
	postCreate: function() {
		this.application = __confolio.application;
		this.inherited("postCreate", arguments);
		dojo.subscribe("/confolio/localeChange", dojo.hitch(this, this._localize));
		dojo.subscribe("/confolio/userChange", dojo.hitch(this, this._userChange));
		this._localize();
	},

	//===================================================
	// Private methods
	//===================================================
	_userChange: function() {
		this.user = this.application.getUser();
		if (this.user && this.user.homecontext) {
			dojo.style(this.myPortfolioRowNode, "display", "");
		} else {
			dojo.style(this.myPortfolioRowNode, "display", "none");
		}
	},
	_localize: function() {
		dojo.requireLocalization("folio", "search");
		this.resourceBundle = dojo.i18n.getLocalization("folio", "search"); 
		this.set(this.resourceBundle);
		
		var context = this.application.getStore().getContext(this.application.repository+"_search");
		context.search({locationType: ["Local"], builtinType: ["Context"], sort: "modified+desc", queryType: "solr", onSuccess: dojo.hitch(this, function(entryResult) {
			folio.data.getAllChildren(entryResult, dojo.hitch(this, function(children) {
				var contextsArray = dojo.map(children, function(child) {
					return {"label": folio.data.getLabelRaw(child) || child.alias || child.getId(), id: child.getId()};
				});
				var store = dojo.data.ItemFileReadStore({
					data: {
						identifier: "id",
						label: "label",
						items: contextsArray
					}
				});
				this.specficPortfolioChangerDijit.set("store", store);
			}));
		})});
		var sortOrderStore = dojo.data.ItemFileReadStore({
			data: {
				identifier: "id",
				label: "label",
				items: [{label: this.resourceBundle.sortBestMatch, id: "score"}, 
						{label: this.resourceBundle.sortTitle, id: "title"},
						{label: this.resourceBundle.sortModified, id: "modified"}]
			}
		});
		if (this.sortChangerDijitConnector) {
			dojo.disconnect(this.sortChangerDijitConnector);
		}
		this.sortChangerDijit.set("store", sortOrderStore);
		this.sortChangerDijit.set("value", "score");
		
		setTimeout(function() {
			this.sortChangerDijitConnector = dojo.connect(this.sortChangerDijit, "onChange", this, this._searchFormChanged);
		}, 100);
	},
	_searchFormChangedRadio: function(value) {
		if (value) {
			this.onChange();
			this.specficPortfolioChangerDijit.set("disabled", !this.specificPortfolioDijit.get("value"));
		}
	},
	_getLocationTypes: function() {
		var ltArr = [];
		var lts = ["Local", "Link", "LinkReference", "Reference"];
		for (var i=0;i<lts.length;i++) {
			if (this["includeLT"+lts[i]+"Dijit"].get("checked")) {
				ltArr.push(lts[i]);
			}
		}
		if (ltArr.length === 4) {
			return [];
		} else {
			return ltArr;
		}		
	},
	_getBuiltinTypes: function() {
		var btArr = [];
		var bts = ["List", "User", "Group", "None", "String", "Context"];
		for (var i=0;i<bts.length;i++) {
			if (this["includeBT"+bts[i]+"Dijit"].get("checked")) {
				btArr.push(bts[i]);
			}
		}
		if (btArr.length === 6) {
			return [];
		} else {
			return btArr;
		}		
	},
	_getContext: function() {
		if (this.allPortfoliosDijit.get("value")) {
			return;
		} else if (this.myPortfolioDijit.get("value")){
			return this.user.homecontext;
		} else {
			var value = this.specficPortfolioChangerDijit.get("value");
			return value === "" ? null : value;
		}
	},
	_getSortOrder: function() {
		var sort = this.sortChangerDijit.get("value");
		var ascending = this.ascendingDijit.get("value");
		if (sort !== "title") {
			return sort+"+"+(ascending ? "asc" : "desc");
		} else { //Hack since asc and desc does not work with title.
			return sort;
		}
	}
});