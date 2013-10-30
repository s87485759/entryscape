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

dojo.provide("folio.editor.RFormsPresenter");
dojo.require("dijit._Widget");
dojo.require("folio.Application");
dojo.require("rforms.view.Presenter");
dojo.require("rforms.model.Engine");

dojo.declare("folio.editor.RFormsPresenter", dijit._Widget, {
	compact: true,
	
	constructor: function() {
		this.application = __confolio.application;
	},
	buildRendering: function() {
		this.domNode = this.srcNodeRef;
	},
	show: function(entry, showExternalMetadata) {
		if (this.presenter != null) {
			this.presenter.destroy();
		}
		if (entry == null) {
			return;
		}
		this.application.getItemStore(dojo.hitch(this, function(itemStore) {
			var graph, mpItems, config = this.application.getConfig();
			if (showExternalMetadata === true) {
				graph = entry.getExternalMetadata();
				mpItems = config.getTemplate(entry, "external");
			} else {
				graph = entry.getLocalMetadata();
				mpItems = config.getTemplate(entry, "local");
			}
			if (graph === undefined){
				graph = new rdfjson.Graph({});
			}
			var template = itemStore.detectTemplate(graph, entry.getResourceUri(), mpItems);
//			var template = itemStore.createTemplateFromChildren([folio.data.DCTermsSchema.TITLE,folio.data.DCTermsSchema.DESCRIPTION]);
			var binding = rforms.model.Engine.match(graph, entry.getResourceUri(), template);
			this.presenter = new rforms.view.Presenter({template: template, binding: binding, compact: this.compact}, dojo.create("div", null, this.domNode));
		}));
	}
});