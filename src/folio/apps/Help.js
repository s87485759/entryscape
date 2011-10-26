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

dojo.provide("folio.apps.Help");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.Tree");
dojo.require("dijit.tree.ForestStoreModel");
dojo.require("dojo.data.ItemFileReadStore");

dojo.declare("folio.apps.Help", [dijit._Widget, dijit._Templated], {
	//===================================================
	// Public Attributes
	//===================================================
	initialHelpPage: "",

	//===================================================
	// Inherited Attributes
	//===================================================
	templatePath: dojo.moduleUrl("folio.apps", "HelpTemplate.html"),
    widgetsInTemplate: true,

	//===================================================
	// Private Attributes
	//===================================================
	firstShow: true,

	//===================================================
	// Inherited methods
	//===================================================
	postCreate: function() {
		this.inherited("postCreate", arguments);
		
		this.application = __confolio.application;
		this.store = new dojo.data.ItemFileReadStore({
			url: "../info/help/helppages.json"
		});

		var treeModel = new dijit.tree.ForestStoreModel({
			store: this.store,
					query: {
						"name": "*"
                    },
                    rootId: "root",
                    rootLabel: "overview",
                    childrenAttrs: ["children"]
                });
		this.tree = new dijit.Tree({
					showRoot: false,
                    model: treeModel,
					onClick: dojo.hitch(this, function(item) {
						//To provide history and bookmarkability
						this.application.open("help", {"page": this.store.getValue(item, "id")});
						//If no history is needed, change to the following line instead:
						//this._show(item);
					})
                },dojo.create("div", null, this.outlineNode));
	},
	resize: function() {
		this.inherited("resize", arguments);
		if (this.bc) {
			this.bc.resize();
		}
	},
	/**
	 * Required by ViewMap to be able to set a nice breadcrumb.
	 * @param {Object} params
	 */
	getLabel: function(params) {
		return "Help";
	},
	show: function(params) {
		var page = params.page;
		if (this.firstShow && page == null && this.initialHelpPage != "") {
			page = this.initialHelpPage;
		} 
		this.firstShow = false;
		
		if (page) {
			this.store.fetchItemByIdentity({identity: page, onItem: dojo.hitch(this, this._show)});
		}
	},

	//===================================================
	// Private methods
	//===================================================
	_show: function(item) {
		//Select in tree
		var id = this.store.getValue(item, "id");
		var name = this.store.getValue(item, "name");
		dojo.attr(this.helpHeaderNode, "innerHTML", name);
		var node = (this.tree._itemNodeMap || this.tree._itemNodesMap)[id][0];
		if (node) {
			this.tree.set("selectedItems", [item]);
		}
			
		//Open content
		this.contentDijit.set("href", "../info/help/"+id+".html");
	}
});