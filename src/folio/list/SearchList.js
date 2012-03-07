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

dojo.provide("folio.list.SearchList");
dojo.require("dijit._Widget");
dojo.require("folio.list.List");

/**
 * Searches for entries according to the given parameters and displays 
 * 50 of the first hits with a title, a description and a modification date.
 * Currently only material that has a title and has at least one parent folder is displayed,
 * the rest is discarded from the listing. 
 * Every title is a link to the default view with this material selected in one of its parent folders, 
 * if there are several parent folders one is choosen arbitrarily.
 * 
 */
dojo.declare("folio.list.SearchList", dijit._Widget, {
	//===================================================
	// Public api
	//===================================================
	show:function(params, callback) {
		this.searchParams = params;
		this._show(params, 0, callback);
	},
	onResults: function(nrOfHits) {
	},
	
	//===================================================
	// Inherited methods
	//===================================================
	buildRendering: function() {
		this.application = __confolio.application;
		this._list = new folio.list.List(
						{application: this.application,
						 user: this.application.getUser(),
						 headLess: true,
						 controlsLess: true,
						 detailsLink: true,
						 openFolderLink: true,
						 publishFocusEvents: false}, 
						this.srcNodeRef);
		dojo.style(this._list.domNode.parentNode, "height", "100%");
		dojo.subscribe("/confolio/userChange", dojo.hitch(this, this._userChange));
	},
	//===================================================
	// Private methods
	//===================================================
	_userChange: function() {
		this._list.user = this.application.getUser();
	},
	_show: function(params, page, callback) {
		if(params === null){
			params = this.searchParams;
		}
		params = dojo.mixin(params, {
			limit: 20,
			onSuccess: dojo.hitch(this, function(entryResult) {
				callback && callback();
				folio.data.getList(entryResult, dojo.hitch(this, function(list) {
					//update list
					this._list.showList(entryResult);
					this.onResults(list.getSize());
				}));
			}),
			onError: dojo.hitch(this, function(error) {
				this.onResults();
				callback && callback();
			})
		});
		if (params.search != null) {
			params.search(params);
		} else {
			var context = this.application.getStore().getContext(this.application.repository+"_search");
			context.search(params);
		}
	}
});