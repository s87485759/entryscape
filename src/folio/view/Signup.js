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

dojo.provide("folio.apps.Signup");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("folio.admin.NewUser");

dojo.declare("folio.apps.Signup", [dijit._Widget, dijit._Templated], {
	//===================================================
	// Public Attributes
	//===================================================

	//===================================================
	// Inherited Attributes
	//===================================================
	templatePath: dojo.moduleUrl("folio.apps", "AccountTemplate.html"),
    widgetsInTemplate: true,

	//===================================================
	// Private Attributes
	//===================================================
	firstShow: true,

	//===================================================
	// Inherited methods
	//===================================================
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
		return "Signup";
	},
	show: function(params) {
	}

	//===================================================
	// Private methods
	//===================================================
});