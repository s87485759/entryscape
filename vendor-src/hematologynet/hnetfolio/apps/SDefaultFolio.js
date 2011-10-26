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

dojo.provide("hnetfolio.apps.SDefaultFolio");
dojo.require("folio.WidgetApplication");
dojo.require("folio.TreeModel");
dojo.require("folio.list.List");
dojo.require("folio.tree.Tree");
dojo.require("folio.entry.Details");
dojo.require("folio.content.Content");
dojo.require("folio.util.Message");
dojo.require("hnetfolio.simple.NavigationBar");
dojo.require("hnetfolio.simple.SNavigationBar");
dojo.require("dijit.layout.BorderContainer");
dojo.require("folio.create.CreateWizard");
dojo.require("folio.editor.ResourceEditor");
dojo.require("folio.editor.EntryAdminEditor");

dojo.declare("hnetfolio.apps.SDefaultFolio", folio.WidgetApplicationAbstract, {
	templatePath: dojo.moduleUrl("hnetfolio.apps", "SDefaultFolioTemplate.html"),
    widgetsInTemplate: true,
	constructor: function(args) {
	},
	startup: function() {
		this.inherited("startup", arguments);
		this.bc.resize();
	}
});