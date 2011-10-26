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

dojo.provide("imlfolio.TreeModel");
dojo.require("folio.TreeModel");

dojo.declare("imlfolio.TreeModel", [folio.TreeModel], {
	added: [],
	getChildren: function(/*dojo.data.Item*/ parentItem, /*function(items)*/ onComplete){
		if (parentItem) {
			if (!parentItem.noAccessToResource) {
				this.added = new Array();
				if (parentItem === this.context) {
					this._getChildrenOfContext(onComplete, dojo.hitch(this, this.showError, parentItem));
				} else {
					var onErr = dojo.hitch(this, this.showError, parentItem);
					var self = this;
					folio.data.getList(parentItem, dojo.hitch(this, function(list) {
						list.getChildren(dojo.hitch(this, function(childrenEntries) {
							if (self.onlyLists) {
								onComplete(dojo.filter(childrenEntries, dojo.hitch(this, function(entry) {
									// Hack to hide system folders from the user
									if (parentItem.getId() == "_systemEntries") {
										// So that _latest wont be displayed twice
										if (this.added[entry.getId()]) {
											return false;
										}
										// Display _top, _trash and _latest
										// Change this if you want to display more or less system folders
										var display = ((entry.getId() == "_top") || 
												(entry.getId() == "_trash") ||
												(entry.getId() == "_latest"));
										if (display) {
											this.added[entry.getId()] = entry.getId();
										}
										return display;
									}
									return folio.data.isListLike(entry);
								})));
							} else {
								onComplete(childrenEntries);
							}
						}), onErr);
					}), onErr);
				}
			} else {
				this.application.showMessage(entry, "listing children", "failed", message);
			}
	
		}
	}
});