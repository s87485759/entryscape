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

dojo.provide("folio.apps.SlideView");
dojo.require("folio.WidgetApplication");
dojo.require("folio.entry.Details");

/**
 * Provides a view where only the folio.entry.Details view is used, 
 * i.e. only metadata (local and external if it exists) and content 
 * if it is embeddable.  
 */
dojo.declare("folio.apps.SlideView", folio.WidgetApplicationAbstract, {
	//===================================================
	// Inherited Attributes
	//===================================================
	templatePath: dojo.moduleUrl("folio.apps", "SlideViewTemplate.html"),
    widgetsInTemplate: true,

	//===================================================
	// Inherited methods
	//===================================================
	postCreate: function() {
		this.inherited("postCreate", arguments);
	},
	startup: function() {
		this.inherited("startup", arguments);
	}
});