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

dojo.provide("folio.apps.Search1Column");
dojo.require("folio.apps.Search");
dojo.require("dijit.form.Button");

/**
 */
dojo.declare("folio.apps.Search1Column", [folio.apps.Search], {
	//===================================================
	// Inherited Attributes
	//===================================================
	templatePath: dojo.moduleUrl("folio.apps", "Search1ColumnTemplate.html"),
	
	//===================================================
	// Inherited methods
	//===================================================
	postCreate: function() {
		this.inherited("postCreate", arguments);
		var self = this;
		this.advancedButtonDijit = new dijit.form.ToggleButton({
                    label: "Advanced",
                    checked: false,
					onChange: function(val) {
						if (val) {
							this.set("label", "Hide advanced");
							dojo.style(self._searchDetailsContainer, "display", "");
							this._advancedMode = true;
						} else {
							this.set("label", "Advanced");							
							dojo.style(self._searchDetailsContainer, "display", "none");
							this._advancedMode = false;
							this._searchFormChanged();
						}
					}
                }, this.advancedButtonNode);
	},
	_searchFormChanged: function() {
		if (this._advancedMode) {
			return;
		}
		this.inherited("_searchFormChanged", arguments);
    }
});
