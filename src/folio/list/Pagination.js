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

dojo.provide("folio.list.Pagination");
dojo.require("dijit._Widget");

dojo.declare("folio.list.Pagination", [dijit._Widget, dijit._Widget, dijit._Templated], {
	templateString: "<div class='pagination' style='display: none'><span dojoAttachEvent='onclick: pagStart' class='pagStart'>&lt;&lt;</span>&nbsp;&nbsp;&nbsp;"
					+"<span dojoAttachEvent='onclick: pagPrev' class='pagPrev'>&lt;</span>&nbsp;"
					+"<span dojoAttachEvent='onclick: pagPages' dojoAttachPoint='pagPagesNode' class='pagPages'></span>&nbsp;&hellip;&nbsp;"
					+"<span dojoAttachEvent='onclick: pagNext' class='pagNext'>&gt;</span>&nbsp&nbsp;&nbsp;"
					+"<span dojoAttachEvent='onclick: pagEnd' class='pagEnd'>&gt;&gt;</span></div>",
	bigSep: "&nbsp;&nbsp;&nbsp;",
	smallSep: "&nbsp;",
	previous: "<",
	next: ">",
	start: "<<",
	end: ">>",
	maybeMore: "&hellip;",
	constructor: function(attr) {
		this.listGUI = attr.list;
	},
	update: function(list, atPage) {
		this.atPage = atPage;
		if (this.list !== list) {
			this.list = list;
			if (list.isPaginated()) {
				dojo.style(this.domNode, "display", "");
				this.generatePageNumbers();
				this.updateLook();
			} else {
				dojo.style(this.domNode, "display", "none");		
			}
		} else {
			this.updateLook();
		}
	},
	generatePageNumbers: function() {
		var startC = this.atPage-3 < 1 ? 1 : this.atPage-3;
		var endC = startC+8 < this.list.getNumberOfPages() ? startC+8 : this.list.getNumberOfPages();
		var numbers = startC == 1 ? "" : "&hellip;&nbsp;"; 
		numbers +="<span>"+startC+"</span>";
		for(var i=startC+1;i<=endC;i++) {
			numbers += "&nbsp;<span>"+i+"</span>";
		}
		this.pagPagesNode.innerHTML = numbers;
	},
	updateLook : function() {
		dojo.toggleClass(this.domNode, "atStart", this.atPage == 0);
		dojo.toggleClass(this.domNode, "unknownSize", this.list.getSize() == undefined);
		dojo.toggleClass(this.domNode, "atEnd", this.list.getSize() != undefined && this.atPage == this.list.getNumberOfPages()-1);
		dojo.query("span", this.pagPagesNode).forEach(dojo.hitch(this, function(node, i) {
			dojo.toggleClass(node, "selectedPage", parseInt(node.innerHTML)-1 == this.atPage);
		}));
	},
	pagStart: function(e) {
		e.stopPropagation();
		if (this.atPage == 0) {
			return;
		}
		this.list = null;
		this.listGUI.showPage(0);
	},
	pagPrev: function(e) {
		e.stopPropagation();
		if (this.atPage == 0) {
			return;
		}
		this.list = null;
		this.listGUI.showPage(this.atPage-1);
	},
	pagPages: function(e) {
		e.stopPropagation();
		if (dojo.hasClass(e.target.parentNode, "pagPages") && e.target.tagName == "SPAN") {
			this.list = null;
			this.listGUI.showPage(parseInt(e.target.innerHTML)-1);
		}
	},
	pagNext: function(e) {
		e.stopPropagation();
		if (this.list == null || (this.list.getSize() != undefined && this.atPage == this.list.getNumberOfPages()-1)) {
			return;
		}
		this.list = null;
		this.listGUI.showPage(this.atPage+1);
	},
	pagEnd: function(e) {
		e.stopPropagation();
		if (this.list == null || (this.list.getSize() == undefined || this.atPage+1 == this.list.getNumberOfPages())) {
			return;
		}
		var i = this.list.getNumberOfPages()-1;
		this.list = null;
		this.listGUI.showPage(i);
	}
});