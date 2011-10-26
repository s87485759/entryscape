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

dojo.provide("folio.list.SimpleSearchList");
dojo.require("folio.list.Pagination");

/**
 * Searches for entries according to the given parameters and displays 
 * 50 of the first hits with a title, a description and a modification date.
 * Currently only material that has a title and has at least one parent folder is displayed,
 * the rest is discarded from the listing. 
 * Every title is a link to the default view with this material selected in one of its parent folders, 
 * if there are several parent folders one is choosen arbitrarily.
 * 
 */
dojo.declare("folio.list.SimpleSearchList", dijit._Widget, {
	//===================================================
	// Public attributes
	//===================================================
	topCls: "simpleSearchList",

	//===================================================
	// Public api
	//===================================================
	show:function(params, callback) {
		this.searchParams = params;
		this._show(params, 0, callback);
	},
	postCreate: function() {
		this.application = __confolio.application;
		this.pagination = new folio.list.Pagination({list: this});
		this.inherited("postCreate", arguments);
	},
	onResults: function(nrOfHits) {
	},
	
	//===================================================
	// Inherited methods
	//===================================================
	buildRendering: function() {
		this.domNode = this.srcNodeRef;
		dojo.addClass(this.domNode, this.topCls);
	},
	//===================================================
	// Private methods
	//===================================================
	_show: function(params, page, callback) {
		dojo.attr(this.domNode, "innerHTML", "");
		if(params === null){
			params = this.searchParams;
		}
		var p = page != undefined ? page : 0;
		params = dojo.mixin(params, {
			limit: 20,
			onSuccess: dojo.hitch(this, function(entryResult) {
				callback && callback();
				folio.data.getList(entryResult, dojo.hitch(this, function(list) {
					list.getPage(p, 20, dojo.hitch(this, function(children) {
						var acceptCount = 0;
						dojo.forEach(children, function(child) {
							if (acceptCount < 20 && child.readAccessToMetadata) {
								if (this._addContent(child)) {
									acceptCount++;
								}
							}
						}, this);
						this.domNode.appendChild(this.pagination.domNode);
						this.pagination.update(list, p);
					}));
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
	},
	_addContent: function(entry) {
		var parent = entry.getReferrents();
		//Do not list if the entry is in the garbage-bin!
		//TODO: Check for an endsWith-function
		if(parent.length == 1 && parent[0].lastIndexOf("_trash")>0){ 
			return false;
		}
		parent = parent && parent.length > 0 ? parent[0] : null;
		var row = dojo.create("div", {"class": "contentRow thinBorder"}, this.domNode);
		
		//Icon
		dojo.create("img", {"class": "iconCls", "src": folio.data.getIconPath(entry)}, row);
		if (folio.data.isLinkLike(entry)) {
			dojo.create("img", {"class": "iconCls", style: {"position": "absolute", "left": 0}, "src": ""+dojo.moduleUrl("folio", "icons_oxygen/link.png")}, row);
		}

		//Modification
		var mod = entry.getModificationDate();
		mod = mod ? mod : entry.getCreationDate();
		if (mod) {
			mod = dojo.date.stamp.fromISOString(mod);
			mod = "Modified" + ":&nbsp;"+mod.toDateString() + "&nbsp;" + mod.toLocaleTimeString();
			dojo.create("div", {"class": "modified", innerHTML: mod}, row);
		}
		//Label
		var title = folio.data.getLabelRaw(entry) || entry.name || entry.alias || entry.getId();
		if (folio.data.isContext(entry)) {
			if (folio.data.isLinkLike(entry)) {
				folio.data.getLinkedLocalEntry(entry, dojo.hitch(this, function (refEntry){
					dojo.create("a", {
					innerHTML: title,
					href: this.application.getHref(this.application.getRepository() + refEntry.getId() + "/entry/_top", "default")
				}, row);
				}),
				dojo.hitch(this, function (){
					dojo.create("div", {
					innerHTML: "Not able to find this item",
				}, row);
				}));
				
			}
			else {
				dojo.create("a", {
					innerHTML: title,
					href: this.application.getHref(this.application.getRepository() + entry.getId() + "/entry/_top", "default")
				}, row);
			}		
		} else if (folio.data.isUser(entry) || folio.data.isGroup(entry)) {
			if (folio.data.isLinkLike(entry)) {
				folio.data.getLinkedLocalEntry(entry, dojo.hitch(this, function (refEntry){
					dojo.create("a", {
					innerHTML: title,
					href: this.application.getHref(refEntry, "profile")
				}, row);
				}),
				dojo.hitch(this, function (){
					dojo.create("div", {
					innerHTML: "Not able to find this item",
				}, row);
				})
				);
			}
			else {
				dojo.create("a", {
					innerHTML: title,
					href: this.application.getHref(entry, "profile")
				}, row);
			}				
		} else {
			if (parent) {
				dojo.create("a", {innerHTML: title, href: this.application.getHref(entry.getUri(), "default", parent)}, row);			
			} else if (folio.data.isList(entry)) {
				dojo.create("a", {innerHTML: title, href: this.application.getHref(entry.getUri(), "default")}, row);
			} else {
				dojo.create("span", {innerHTML: title}, row);				
			}
		}
		if (entry._addToFolio) {
			entry._addToFolio(dojo.create("div", {"class": "add"}, row));
		}
		if (entry._constructPreview) {
			entry._constructPreview(dojo.create("div", {"class": "preview", title: "bookmark"}, row));
		}
		
		
		//Description
		dojo.create("div", {"class": "description", innerHTML: folio.data.getDescription(entry)}, row);
		return true;
	},
	showPage: function(page){
		this._show(null, page);
	}
});