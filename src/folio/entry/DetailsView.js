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

dojo.provide("folio.entry.DetailsView");
dojo.require("folio.ApplicationView");
dojo.require("folio.entry.Details");
dojo.require("dijit.layout._LayoutWidget");

dojo.declare("folio.entry.DetailsView", [dijit.layout._LayoutWidget, folio.ApplicationView], {
	
	//===================================================
	// Public Attributes
	//===================================================	
	doFade: false,

	//===================================================
	// Inherited Attributes
	//===================================================
	region: "",

	//===================================================
	// Public API
	//===================================================	
	update: function(entry) {
		this._details.update(entry);
	},
	clear: function() {
		this._details.clear();
	},

	//===================================================
	// Inherited methods
	//===================================================
	buildRendering: function() {
		this.domNode = this.srcNodeRef;
		this.application = __confolio.application;
		this._details = new folio.entry.Details(
						{application: this.application,
						 region: this.region || "center",
						 splitter: this.splitter,
						 style: this.style,
						 doFade: this.doFade}, 
						this.srcNodeRef);
	},
	getChildren: function() {
		return [this._details];
	},
	resize: function(size) {
		this.inherited("resize", arguments);
		this._details.resize(size);
	},
	
	getSupportedActions: function() {
		return ["changed", "deleted", "clear", "showEntry", "userChange", "localeChange"];
	},

	handle: function(event) {
		switch (event.action) {
		case "localeChange":
			this._details._localize();
			if (this._details.entry) {
				this._details.update(this._details.entry);
			}
			break;
		case "showEntry":
			if (folio.data.isListLike(event.entry)) {
				this._details._parentListUrl = event.entry.getUri();
			} else 	if (folio.data.isContext(event.entry)) {
				this._details._parentListUrl = event.entry.getContext().getBaseURI()+event.entry.getId() +"/entry/_systemEntries";
			}
			this._details.editContentButtonDijit.set("label", "Edit");	
		case "changed":
			this._details.update(event.entry || this._details.entry);
			break;
		case "deleted":
		case "clear":
			this._details.clear();
			break;
		case  "userChange":
			if (this.application.getUser() == null) {
				dojo.style(this._details.editContentButtonDijit.domNode, "display", "none");
			} else {
				dojo.style(this._details.editContentButtonDijit.domNode, "display", "");				
			}
			break;
		}
	}
});