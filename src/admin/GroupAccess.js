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

dojo.provide("folio.admin.GroupAccess");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare("folio.admin.GroupAccess", [dijit._Widget, dijit._Templated, folio.admin.TabContent], {
	templatePath: dojo.moduleUrl("folio.admin", "GroupAccessTemplate.html"),
	widgetsInTemplate: true,
	templateString: "",
	viewId: "folio.admin.GroupAccess"
});