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

dojo.provide("folio.apps.EFolio");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("folio.list.ListView");
dojo.require("folio.tree.Tree");
dojo.require("folio.util.Message");
dojo.require("dijit.layout.BorderContainer");
dojo.require("folio.create.CreateWizard");
dojo.require("folio.editor.RFormsEditorDialog");
dojo.require("folio.editor.EntryAdminEditor");
dojo.require("folio.navigation.Breadcrumbs");
dojo.require("dojox.widget.Toaster");

dojo.declare("folio.apps.EFolio", [dijit._Widget, dijit._Templated], {
	templatePath: dojo.moduleUrl("folio.apps", "EFolioTemplate.html"),
    widgetsInTemplate: true,
	startup: function() {
		this.inherited("startup", arguments);
		this.bc.startup();
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
		return "Default";
	},
	show: function(params) {
		if (params.entry == null && params.context == null) {
			params.context = this.startContext;
			params.entry = "_top";
		}
		dojo.publish("/confolio/showEntry", [{entry: params.entry, context: params.context, list: params.list}]);		
	}
});