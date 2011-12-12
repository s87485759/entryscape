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

dojo.provide("folio.editor.EntryChooser");
dojo.require("rforms.view.Chooser");
dojo.require("dijit.form.TextBox");
dojo.require("folio.list.SearchList");

dojo.declare("folio.editor.EntryChooser", rforms.view.Chooser, {
	//===================================================
	// Inherited methods
	//===================================================
	postCreate: function() {
		this.inherited("postCreate", arguments);
		var search = new dijit.form.TextBox({trim: true, lowercase: true}, dojo.create("div", null, this.selectionNode));
		dojo.addClass(search.domNode, "searchField");
		dijit.focus(search.focusNode);
		var results = new folio.list.SearchList({}, dojo.create("div", null, this.selectionNode));
		dojo.connect(results._list, "focusedEntry", this, function(entry) {
			this._selectChoice({value: entry.getUri(), label: {en: folio.data.getLabel(entry)}, description: {en: folio.data.getDescription(entry)}});
		});
		var t;
		var doSearch = function() {
			var v = search.get("value");
			if (v != null && v.length > 2) {
				var constraints = this.binding.getItem().getConstraints();
				if (constraints != null && constraints[folio.data.RDFSchema.TYPE] != null) {
					v += "+AND+rdftype:"+(encodeURIComponent(constraints[folio.data.RDFSchema.TYPE].replace(/:/g,"\\:")));
				} else {
					results.show({term: v});					
				}
			}
		};
		dojo.connect(search, "onKeyUp", this, function() {
			if (t != null) {
				clearTimeout(t);
			}
			t = setTimeout(doSearch, 300);
		});
		
		this.bc.startup();
	}
});

rforms.getSystemChoice = function(item, value) {
	var obj = {"value": value};
	var store = __confolio.application.getStore();
	var context = store.getContextFor(value);
	var entry = context.getEntryFromEntryURI(value);
	if (entry != null) {
		obj.label = {en: folio.data.getLabel(entry)};
		obj.description = {en: folio.data.getDescription(entry)};
	} else {
		obj.label = {"en": "Loading...", "sv": "Laddar..."};
		obj.load =	function(onSuccess, onFailure) {
						store.loadEntry(value, {}, function(e) {
							delete obj.load;
							obj.label = {en: folio.data.getLabel(e)};
							obj.description = {en: folio.data.getDescription(e)};
							onSuccess(obj);
						}, onFailure);
			};
	}
	return obj;
};

rforms.openSystemChoiceSelector = function(binding, callback) {
	var ec = new folio.editor.EntryChooser({binding: binding, done: callback});
	ec.show();
};