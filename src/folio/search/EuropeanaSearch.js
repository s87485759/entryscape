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

dojo.provide("folio.search.EuropeanaSearch");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.TextBox");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("folio.search.EuropeanaSearchList");

/**
 */
dojo.declare("folio.search.EuropeanaSearch", [dijit._Widget, dijit._Templated], {
	//===================================================
	// Inherited Attributes
	//===================================================
	templatePath: dojo.moduleUrl("folio.search", "EuropeanaSearchTemplate.html"),
    widgetsInTemplate: true,
	attributeMap: dojo.mixin(dojo.clone(dijit.layout.ContentPane.prototype.attributeMap), {
	        includeTypeLabel: {node: "includeTypeLabelNode", type: "innerHTML"},
    	    sortByLabel: {node: "sortByLabelNode", type: "innerHTML"},

	        includeTypeImageLabel: {node: "includeTImageLabelNode", type: "innerHTML"},
	        includeTypeTextLabel: {node: "includeTTextLabelNode", type: "innerHTML"},
	        includeTypeVideoLabel: {node: "includeTVideoLabelNode", type: "innerHTML"},
	        includeTypeSoundLabel: {node: "includeTSoundLabelNode", type: "innerHTML"},

			sortChangerLabel: {node: "sortChangerLabelNode", type: "innerHTML"},
			ascendingLabel: {node: "ascendingLabelNode", type: "innerHTML"},
			descendingLabel: {node: "descendingLabelNode", type: "innerHTML"}
	}),

	//===================================================
	// I18n attributes
	//===================================================
	includeTypeLabel: "",
	sortByLabel: "",

	includeTypeImageLabel: "",
	includeTypeTextLabel: "",
	includeTypeVideoLabel: "",
	includeTypeSoundLabel: "",

	
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
			types: this._getTypes(),
//			sort: this._getSortOrder(),
			search: dojo.hitch(this, this._search)
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
		//Warn you have to be logged in to search
		if (this.user) {
		} else {
		}
	},
	_localize: function() {
		dojo.requireLocalization("folio", "searchEuropeana");
		this.resourceBundle = dojo.i18n.getLocalization("folio", "searchEuropeana"); 
		this.set(this.resourceBundle);
		
		var context = this.application.getStore().getContext(this.application.repository+"_search");
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
	_getTypes: function() {
		var btArr = [];
		var bts = ["IMAGE", "TEXT", "VIDEO", "SOUND"];
		for (var i=0;i<bts.length;i++) {
			if (this["includeT"+bts[i]+"Dijit"].get("checked")) {
				btArr.push(bts[i]);
			}
		}
		if (btArr.length === 4) {
			return [];
		} else {
			return btArr;
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
	},

	_search: function(parameters) {
		var base = this.application.getRepository();
		var tmpContext = this.application.getStore().getContext(base+"_tmp");
		var entry = tmpContext.createLocal(folio.data.BuiltinTypeSchema.RESULT_LIST);
		entry.list = new folio.search.EuropeanaSearchList(entry, parameters);
		parameters.onSuccess(entry);
	}
});