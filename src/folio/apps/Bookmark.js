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

dojo.provide("folio.apps.Bookmark");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("folio.create.LinkTo");
dojo.require("folio.tree.Tree");
dojo.require("dojox.form.BusyButton");
dojo.require("dijit.form.Button");
dojo.require("folio.create.TypeDefaults");


dojo.declare("folio.apps.Bookmark", [dijit._Widget, dijit._Templated], {
	templatePath: dojo.moduleUrl("folio.apps", "BookmarkTemplate.html"),
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
		return "Bookmark";
	},
	show: function(params) {
		if (params.url != null) {
			this.linkToDijit.URL.set("value", decodeURIComponent(params.url));
			this.linkToDijit.URL.set("disabled", true);
		}
	},
	_saveClicked: function() {
		
	}
});