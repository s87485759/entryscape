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

dojo.provide("folio.apps.oe.Agroasis");
dojo.require("folio.WidgetApplication");
dojo.require("folio.TreeModel");
dojo.require("folio.simple.List");
dojo.require("folio.simple.Tree");
dojo.require("folio.simple.Overview");
dojo.require("folio.simple.Details");
dojo.require("folio.simple.Content");
dojo.require("folio.simple.Message");
dojo.require("folio.simple.NavigationBar");
dojo.require("dijit.layout.BorderContainer");
dojo.require("folio.create.CreateWizard");
dojo.require("folio.editor.ResourceEditor");
dojo.require("folio.editor.AnnotationProfileEditor");
dojo.require("folio.editor.EntryAdminEditor");
dojo.require("folio.main.Aggregate");

dojo.declare("folio.apps.oe.Agroasis", folio.WidgetApplicationAbstract, {
	templatePath: dojo.moduleUrl("folio.apps.oe", "AgroasisTemplate.html"),
    widgetsInTemplate: true,
	constructor: function(args) {
	},
	startup: function() {
		this.inherited("startup", arguments);
		this.bc.resize();
	}
});