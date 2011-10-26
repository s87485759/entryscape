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

dojo.provide("folio.apps.About");
dojo.require("dijit._Widget");

dojo.declare("folio.apps.About", dijit._Widget, {
	buildRendering: function() {
		this.domNode = this.srcNodeRef;
		dojo.style(this.domNode, "overflow-y", "hidden");
		var aboutUrl = __confolio.config["aboutUrl"];
		if (aboutUrl) {
			dojo.create("iframe", {src: aboutUrl, style: {height: "100%", width: "100%", margin:0, padding: 0, border: 0}}, this.domNode);
		}
	},
	/**
	 * Required by ViewMap to be able to set a nice breadcrumb.
	 * @param {Object} params
	 */
	getLabel: function(params) {
		return "About";
	},
	show: function(params) {
	}
});