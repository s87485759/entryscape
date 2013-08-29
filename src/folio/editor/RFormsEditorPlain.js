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

dojo.provide("folio.editor.RFormsEditorPlain");
dojo.require("folio.search.ChoiceSearch");
dojo.require("dijit._Widget");
dojo.require("rforms.model.Engine");
dojo.require("rforms.view.Editor");

dojo.declare("folio.editor.RFormsEditorPlain", [dijit._Widget], {
	includeLevel: "mandatory",
	constructor: function(args) {
		this.application = __confolio.application;
	},
	buildRendering: function() {
		this.inherited("buildRendering", arguments);
		this.domNode = this.srcNodeRef || dojo.create("div");
		this.rformsEditorPlainNode = dojo.create("div", null, this.domNode);
	},
	/**
	 * @param graph {rdfjson.Graph} the rdf to edit.
	 * @param entry {folio.data.Entry} the entry to edit, may be left out if the template is provided.
	 * @param uri {String} the resource to edit as a URI
	 * @param template {rforms.template.Template} the RForms-template to use for editing, if left out the entry must be provided.
	 */
	show: function(graph, entry, uri, template) {
		if (this.editor != null) {
			this.editor.destroy();
		}
		this.graph = graph;
		this.application.getItemStore(dojo.hitch(this, function(itemStore) {
			var config = this.application.getConfig();
			var langs = config.getMPLanguages();
			if (template == null) {
				var mp = config.getMPForLocalMD(entry);
				template = itemStore.detectTemplate(this.graph, uri, (mp != null && mp.items != null ? mp.items : null));				
			}
			var binding = rforms.model.Engine.match(this.graph, uri, template);
			if (!this.includeLevel) {
				this.includeLevel = "mandatory";
			}
			this.editor = new rforms.view.Editor({template: template, languages: langs, binding: binding, includeLevel: this.includeLevel, compact: true}, dojo.create("div", null, this.domNode));			
		}));
	},
	isWithinCardinalityConstraints: function() {
		return this.editor.binding.report().errors.length === 0;
	},
	showErrors: function() {
		this.editor.report();
	},
	getMetadata: function(){
		return this.graph.exportRDFJSON();
	},
	/*value can only be recommended, mandatory or optional*/
	setIncludeLevel: function(/*String*/ level){
		this.includeLevel = level;
	}
});