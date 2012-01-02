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

dojo.provide("folio.list.ListView");
dojo.require("dijit._Widget");
dojo.require("folio.list.List");
dojo.require("folio.ApplicationView");


dojo.declare("folio.list.ListView", [dijit._Widget, folio.ApplicationView], {
	//=================================================== 
	// Public Attributes 
	//===================================================
	iconMode: false,
	includeDetailsButton: false,
	detailsLink: false,
	
	//=================================================== 
	// Public Attributes 
	//===================================================
	_list: null,
	
	//=================================================== 
	// Public API 
	//===================================================
	setIconMode: function(iconMode) {
		if (this._list) {
			this._list.setIconMode(iconMode);
		}
	},
	getList: function() {
		return this._list;
	},

	//=================================================== 
	// Inherited methods 
	//===================================================
	constructor: function() {
	},
	buildRendering: function() {
		this._list = new folio.list.List(
								{application: this.application, iconMode: this.iconMode, includeDetailsButton: this.includeDetailsButton, detailsLink: this.detailsLink}, 
								this.srcNodeRef);
	},
	
	getSupportedActions: function() {
		return ["changed", "childrenChanged", "clear", "showEntry", 
		        "preferredLanguagesChange", "userChange","localeChange", "orderChange", "viewState"];
	},
	
	handle: function(event) {
		this._list.user = this.application.getUser();
		if (event.list != null && event.list === this._list.list) {
			this._list.focus(event.list, event.entry);
			return;
		}
		if (event.action !== "childrenChanged" && event.list == null && event.entry != null && this._list.list != null && this._list.list.getUri() === event.entry.getUri()) {
			return;
		}

		var newList = event.list || event.entry;
		switch (event.action) {
		case "viewState":
			if (event.listViewMode === "list") {
				this._list.setIconMode(false);
			} else if (event.listViewMode === "icon"){
				this._list.setIconMode(true);	
			}
			break;
		case "changed":
		case "userChange":		
			//Make more precise.
			if (this._list.list) {
				this.application.getStore().loadEntry(this._list.list.getUri(), {limit: 0, sort: null},
					dojo.hitch(this._list, this._list.showList));
			}
			break;
		case "localeChange":
			this._list.localize();
		case "orderChange":
			if (this._list.list) {
				this._list.showList(this._list.list);
			}
			break;
		case "showEntry":
			if (event.list) {
				this._list.focus(event.list, event.entry);				
			} else {
				if (folio.data.isListLike(newList)) {
					this._list.showList(newList);
				} else if (folio.data.isContext(newList)) {
					this.application.getStore().loadEntry(newList.getContext().getBaseURI()+newList.getId() +"/entry/_systemEntries", {limit: 0, sort: null}, 
						dojo.hitch(this._list, this._list.showList));
				}
			}
			break;
		case "childrenChanged":
			if (this._list.list.getUri() === newList.getUri()) {
				this._list.showList(newList);
			}
			break;
		}
	}
});