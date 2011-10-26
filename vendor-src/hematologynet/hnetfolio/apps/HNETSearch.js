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

dojo.provide("hnetfolio.apps.HNETSearch");
dojo.require("dijit._Widget");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit._Templated");
dojo.require("dijit.form.TextBox");
dojo.require("folio.list.SimpleSearchList");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dijit.Tree");

/**
 */
dojo.declare("hnetfolio.apps.HNETSearch", [dijit._Widget, dijit._Templated], {
	//===================================================
	// Inherited Attributes
	//===================================================
	templatePath: dojo.moduleUrl("hnetfolio.apps", "HNETSearchTemplate.html"),
    widgetsInTemplate: true,

	//===================================================
	// I18n attributes
	//===================================================
	
	//===================================================
	// Inherited methods
	//===================================================
	postCreate: function() {
		this.application = __confolio.application;
		this.inherited("postCreate", arguments);
		dojo.subscribe("/confolio/localeChange", dojo.hitch(this, this._localize));
		dojo.subscribe("/confolio/userChange", dojo.hitch(this, this._userChange));
		this._addTree();
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
	},

	//===================================================
	// Private methods
	//===================================================
	_userChange: function() {
		this.user = this.application.getUser();
	},
	_localize: function() {
		dojo.requireLocalization("folio", "search");
		this.resourceBundle = dojo.i18n.getLocalization("folio", "search"); 
		this.set(this.resourceBundle);
	},
	_addTree: function() {
		//Creating tree to add to the dropdown-button
		this.treeStore = this._getTreeStore();
		this.tree = new dijit.Tree({store: this.treeStore, disabled: true,
								childrenAttr: ["children"],
								onClick: dojo.hitch(this, this._itemClicked), 
								query: {top: true}}, this.treeNode);
	},
	_itemClicked: function(item) {
		if (this.treeStore.getValue(item, "selectable") !== false) {
			this.searchButtonDijit.set("disabled", false);
			this._currentItem = item;
		} else {
			this.searchButtonDijit.set("disabled", true);
		}
/*								if (treeStore.getValue(item, "selectable") !== false) {
									//row.attr("label", treeStore.getValue(item, "l"));
									this.urlArray[currNo] = treeStore.getValue(item, "d");
								}*/
	},
	_doSearch: function() {
		this.simpleSearchList.show({term: "{ "+this.treeStore.getValue(this._currentItem, "d")+" }", queryType: 'subfield', locationType:['linkreference', 'link', 'local']}, 
			dojo.hitch(this, function() {
				this.searchButtonDijit.cancel();
			}));
	},
	_getTreeStore: function() {
		if(this.treeStore){
			return this.treeStore;
		}
		var store = new hnetfolio.simple.SortedTreeStore({
			url: "../vendor-data/hematologynet/json/CVPassportV5SearchTree.json"
			//url: "../vendor-data/hematologynet/json/SubfieldThirdLevelTree.json"
		});
		this.treeStore = store;
		return this.treeStore;
	}
});