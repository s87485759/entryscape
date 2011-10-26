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

dojo.provide("folio.apps.Search");
dojo.require("dijit._Widget");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit._Templated");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.ComboButton");
dojo.require("dijit.Menu");
dojo.require("dijit.MenuItem");

/**
 */
dojo.declare("folio.apps.Search", [dijit._Widget, dijit._Templated], {
	//===================================================
	// Inherited Attributes
	//===================================================
	templatePath: dojo.moduleUrl("folio.apps", "SearchTemplate.html"),
    widgetsInTemplate: true,

	//===================================================
	// Public attributes
	//===================================================
	searchAlternatives: {
		"local": {
		 	label: "Local", 
			searchDetailsClass: "folio.search.LocalSearch", 
			searchResultsClass: "folio.list.SearchList"
		}/*,
		"europeana": {
		 	label: "Europeana", 
			searchDetailsClass: "folio.search.EuropeanaSearch", 
			searchResultsClass: "folio.list.SimpleSearchList"
		}*/},
	defaultSearchAlternative: "local",

	//===================================================
	// Private attributes
	//===================================================
	_currentSearchAlternative: null,
	_searchAlternatives: null, 
	
	
	//===================================================
	// Inherited methods
	//===================================================
	constructor: function() {
		this._searchAlternatives = {};
	},
	postCreate: function() {
		this.application = __confolio.application;
		this.inherited("postCreate", arguments);
		dojo.subscribe("/confolio/localeChange", dojo.hitch(this, this._localize));
		dojo.connect(this.searchBoxDijit, "onKeyUp", this, function(event) {
			if (event.keyCode === dojo.keys.ENTER) {
				this._searchFormChanged();
			}
		});
		
		this.searchMenu = new dijit.Menu({style: "display: none;"});
		for (var alt in this.searchAlternatives) {
			if (this.searchAlternatives.hasOwnProperty(alt)) {
				var child = new dijit.MenuItem({label: this.searchAlternatives[alt].label, 
					onClick: dojo.hitch(this, this._switchToSearchAlternative, alt)});
				child.startup();
				this.searchMenu.addChild(child);
			}
		}
		this.searchButtonDijit = new dijit.form.ComboButton({
                    label: "Search",
                    dropDown: this.searchMenu,
					onClick: dojo.hitch(this, this._searchFormChanged)
                }, this.searchButtonNode);
		//this.searchButtonDijit.startup();
		this._localize();
	},

	resize: function() {
		this.inherited("resize", arguments);
		this.bc.resize();
	},

	/**
	 * Required by ViewMap to be able to set a nice breadcrumb.
	 * @param {Object} params
	 */
	getLabel: function(params) {
		return "search";
	},
	show: function(params) {
		this._switchToSearchAlternative(params.alternative, dojo.hitch(this, function() {
			if (params.term) {
				this.searchBoxDijit.set("value", params.term);
				this._searchFormChanged();
			}
			setTimeout(dojo.hitch(this, function() {this.searchBoxDijit.focus();}), 1);			
		}));
	},

	//===================================================
	// Private methods
	//===================================================
	_localize: function() {
		dojo.requireLocalization("folio", "search");
		this.resourceBundle = dojo.i18n.getLocalization("folio", "search"); 
		this.set(this.resourceBundle);
	},
	
	_searchFormChanged: function() {
		var term = this.searchBoxDijit.get("value").toLowerCase();
		//Do the delegated search.
		this._switchToSearchAlternative(null, dojo.hitch(this, function() {
			var searchParams = this._searchAlternatives[this._currentSearchAlternative].searchDetails.getSearchDetails();
			this._searchResultsSearching();
			this._searchAlternatives[this._currentSearchAlternative].searchResults.show(dojo.mixin(searchParams,{term: term}));
		}));
	},
	_searchResultsChanged: function(nrOfHits) {
		dojo.attr(this.resultCountNode, "innerHTML", dojo.replace(this.resourceBundle.searchResults, {nrOfHits:  nrOfHits || 0}));
	},
	_searchResultsSearching: function() {
		dojo.attr(this.resultCountNode, "innerHTML", this.resourceBundle.searchResultsSearching);
	},
	_getSearchDetails: function() {
		debugger;
	},
	_switchToSearchAlternative: function(alternative, callback) {
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
				dojo.style(this._searchAlternatives[this._currentSearchAlternative].searchDetails.domNode, "display", "none");
				dojo.style(this._searchAlternatives[this._currentSearchAlternative].searchResults.domNode, "display", "none");
			}
			if (this._searchAlternatives[alternative] == null) {
				this._searchAlternatives[alternative] = {};
				var alt = this._searchAlternatives[alternative];

				var sDClsStr = this.searchAlternatives[alternative].searchDetailsClass;				
				var sRClsStr = this.searchAlternatives[alternative].searchResultsClass;
				dojo["require"](sDClsStr);
				dojo["require"](sRClsStr);
				setTimeout(dojo.hitch(this, function() {
					dojo.addOnLoad(this, function() {
						var sDCls = eval(sDClsStr);
						var sRCls = eval(sRClsStr);

						alt.searchDetails = new sDCls({}, dojo.create("div", null, this._searchDetailsContainer));
						dojo.connect(alt.searchDetails, "onChange", this, this._searchFormChanged);
						alt.searchResults = new sRCls({}, dojo.create("div", null, this._searchResultsContainer));
						dojo.connect(alt.searchResults, "onResults", this, this._searchResultsChanged);
						this._currentSearchAlternative = alternative;
						callback && callback();
					});
				}), 1);
			} else {
				dojo.style(this._searchAlternatives[alternative].searchDetails.domNode, "display", "");
				dojo.style(this._searchAlternatives[alternative].searchResults.domNode, "display", "");				
				this._currentSearchAlternative = alternative;
				callback && callback();
			}
		} else {
			callback && callback();
		}
	}
});
