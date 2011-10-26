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

dojo.provide("folio.editor.MinimalMetadata");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Textarea");
dojo.require("rdfjson.Graph");

dojo.declare("folio.editor.MinimalMetadata", [dijit._Widget, dijit._Templated], {
	attributeMap: dojo.mixin(dojo.clone(dijit.layout.ContentPane.prototype.attributeMap), {
		labelLabel: {node: "labelLabelText", type: "innerHTML"},
		descriptionLabel: {node: "descriptionLabelText", type: "innerHTML"}
	}),
	labelLabel: "",
	descriptionLabel: "",
	
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("folio", "editor/MinimalMetadataTemplate.html"),	
	constructor: function(args) {
	},
	postCreate: function() {
		this.inherited("postCreate", arguments);
		dojo.connect(this.labelField,"onKeyUp", this, "onChange");
		this.localize();
	},
	localize: function() {
		dojo.requireLocalization("folio", "minimalMetadata");
		this.resourceBundle = dojo.i18n.getLocalization("folio", "minimalMetadata");
		this.set(this.resourceBundle);
	},
	onChange: function() {
	},
	isReady: function() {
		var lab = this.labelField.get("value");
		return lab != undefined && lab != "";
	},
	typeSelected: function(typeConfig) {
		//TODO change labels.
	},
	setMetadata: function(rdfjsonMD, resourceUri) {
		this.lab = rdfjsonMD.findFirstValue(resourceUri, folio.data.DCTermsSchema.TITLE);
		if (this.lab) {
			this.labelField.set("value", this.lab);
		}
		
		this.desc = rdfjson.findDirectOrRDFValue(rdfjsonMD, resourceUri, folio.data.DCTermsSchema.DESCRIPTION);
		if (this.desc) {
			this.descriptionField.setValue(this.desc);
		}
		//TODO
	},
	getMetadata: function(resourceUri) {
		var graph = new rdfjson.Graph();
		this._fillInMetadata(graph, resourceUri);
		return graph;
	},
	_fillInMetadata: function(graph, resourceUri) {		
		var lab = this.labelField.get("value");
		if (lab != undefined && lab != "") {
			graph.create(resourceUri, folio.data.DCTermsSchema.TITLE, {type: "literal", value: lab});
		}
		var desc = this.descriptionField.get("value");
		if (desc != undefined && desc != "") {
			var stmt = graph.create(resourceUri, folio.data.DCTermsSchema.DESCRIPTION);
			graph.create(stmt.getValue(), folio.data.RDFSchema.VALUE, {type: "literal", value: desc});
		}
	}
});