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

dojo.provide("folio.admin.TabContent");
dojo.require("folio.Application");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare("folio.admin.TabContent", [folio.ApplicationView], {
	entry: null,
	//application: null,
	// override in child classes, dont forget to call the superclass method
	setEntry: function(/* Entry */ entry) {
		this.entry = entry;
	},
	displayError: function(/* String */ error) {
		console.error(error);
	}
});

dojo.declare("folio.admin.PaginatedTable", [dijit._Widget, dijit._Templated], {
	widgetsInTemplate: false,
	templateString: 
		"<div>" +
			"<div dojoAttachPoint='upperPagination' class='gm_pagination'></div>" +
			"<table>" +
				"<thead dojoAttachPoint='tableHead'></thead>" +
				"<tbody dojoAttachPoint='descriptionField'></tbody>" +
				"<tfoot dojoAttachPoint='tableFoot'></tfoot>" +
			"</table>" +
			"<div dojoAttachPoint='lowerPagination' class='gm_pagination'></div>" +
		"</div>",
	// Default number of rows is 10
	rows: 10,
	// The current page
	currentPage: 1,
	// Number of pages
	numPages: 1,
	
	// The entry that is currently displayed
	entry: null,
	// The array that is currently displayed
	array: null,
	
	drawUpperPagination: false,
	drawLowerPagination: true,
	// How many pages that should be displayed to the left of the current page in the pagination, only when numPages > 10
	pagesLeft: 2,
	// How many pages that should be displayed to the right of the current page in the pagination, only when numPages > 10
	pagesRight: 2,
	
	postCreate: function() {
		this.inherited("postCreate", arguments);
		
		var tHead = this.getTableHead();
		if (tHead) {
			dojo.place(tHead, this.tableHead);
		}
		var tFoot = this.getTableFoot();
		if (tFoot) {
			dojo.place(tFoot, this.tableFoot);
		}
	},
	/**
	 * Override in child classes
	 */
	getTableHead: function() {
		var tr = dojo.doc.createElement('tr');
		var th = dojo.doc.createElement('th');
		dojo.place(dojo.doc.createTextNode("override function \'getTableHead\'"), th);
		dojo.place(th, tr);
		return tr;
	},
	/**
	 * Override in child classes
	 */
	 getTableFoot: function() {
		return null;
	},
	displayEntry: function(/* Entry */ entry) {
//		console.log("folio.admin.PaginatedTable.displayEntry, entry = ");
//		console.log(entry);
		if (!this.entry || !entry || this.entry.getResourceUri() != entry.getResourceUri()) {
			this.currentPage = 1;
		}
		this.entry = entry;
		if (entry) {
			this.extractArrayFromEntry(this.entry, dojo.hitch(this, function(array) {
				this.array = array;
				this.numPages = Math.ceil(this.array.length / this.rows);
				if (this.numPages == 0) {
					this.numPages = 1;
				}
				this.currentPage = Math.min(this.currentPage, this.numPages);
				this.drawPage();
				this.drawPagination();
			}));
		}
		else {
			this.array = null;
			this.numPages = 1;
			this.currentPage = 1;
			this.removeMembers();
		}
	},
	/**
	 * Override in child classes
	 */
	extractArrayFromEntry: function(/* Entry */ entry, /* function */ onArray) {
		console.error("wrong extractArrayFromEntry!");
		onArray(new Array());
	},
	handlePageSelect: function(pageNumber) {
		this.currentPage = pageNumber;
		this.drawPage();
		this.drawPagination();
	},
	drawPage: function() {
		this.removeMembers();
		var start = (this.currentPage -1) * this.rows;
		var end = start + this.rows;
		for (var i = start; i < end; i++) {
			var tableRow = null;
			if (i < this.array.length) {
				tableRow = this.getTableRow(this.array[i]);
			}
			else {
				tableRow = dojo.doc.createElement('tr');
				var div = dojo.doc.createElement('div');
				dojo.style(div, "visibility", "hidden");
				dojo.place(dojo.doc.createTextNode(" &nbsp; "), div);
				dojo.place(div, tableRow);
			}
			dojo.place(tableRow, this.descriptionField);
		}
	},
	/**
	 * Override in child classes
	 */
	getTableRow: function(/* Entry */ entry) {
		var tr = dojo.doc.createElement('tr');
		var div = dojo.doc.createElement('div');
		dojo.place(dojo.doc.createTextNode("Override in child classes"), div);
		dojo.place(div, tr);
		return tr;
	},
	drawPagination: function() {
		// Remove the old
		this.removePageNumbers();
		if (this.numPages == 1) {
			// Do not draw anything
		}
		else if (this.numPages <= 10) {
			for (var i = 1; i <= this.numPages; i++) {
				this.displayPageNumber(i, i);
			}
		}
		else {
			// Draw the first number
			this.displayPageNumber(1, 1);
			// draw the left '...', if necessary
			if (this.currentPage > 2 + this.pagesLeft) {
				this.displayPageNumber(".<<", Math.max(this.currentPage - 10, 2));
			}
			// Draw the center
			for (var j = Math.max(this.currentPage - this.pagesLeft, 2);
			j <= Math.min(this.currentPage + this.pagesRight, this.numPages - 1); 
			j++) {
				this.displayPageNumber(j, j);
			}
			// Draw the right '...', if necessary
			if (this.currentPage < this.numPages - this.pagesRight - 1) {
				this.displayPageNumber(">>.", Math.min(this.currentPage + 10, this.numPages - 1));
			}
			// Draw the higes page
			this.displayPageNumber(this.numPages, this.numPages);
		}
	},
	displayPageNumber: function(numberDisplay, numberRef) {
		if (this.drawUpperPagination) {
			this.upperPagination.appendChild(this.createPageNode(numberDisplay, numberRef));
		}
		if (this.drawLowerPagination) {
			this.lowerPagination.appendChild(this.createPageNode(numberDisplay, numberRef));
		}
	},
	createPageNode: function(numberDisplay, numberRef) {
		var node = dojo.doc.createElement('span');
		dojo.place(dojo.doc.createTextNode(numberDisplay), node);
		dojo.toggleClass(node, "paginator");
		if (numberRef == this.currentPage) {
			// The number should be non clickable
			dojo.toggleClass(node, "selected");
		}
		else {
			// Add a callback function and change the style of the number
			dojo.toggleClass(node, "selectable");
			dojo.connect(node, "onclick", dojo.hitch(this, this.handlePageSelect, numberRef));
		}
		return node;
	},
	removeMembers: function() {
		while (this.descriptionField.hasChildNodes()) {
			this.descriptionField.removeChild(this.descriptionField.firstChild);
		}
	},
	removePageNumbers: function() {
		while (this.upperPagination.hasChildNodes()) {
			this.upperPagination.removeChild(this.upperPagination.firstChild);
		}
		while (this.lowerPagination.hasChildNodes()) {
			this.lowerPagination.removeChild(this.lowerPagination.firstChild);
		}
	}
});