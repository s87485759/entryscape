dojo.provide("conxilla.model.Layer");
dojo.require("conxilla.model.Node");
dojo.require("conxilla.model.Layout");

/**
 * A Layer (may correspond to a concept) consists of a list of Layouts or GroupLayouts.
 */
dojo.declare("conxilla.model.Layer", conxilla.model.Node, {	
	getPriority: function() {
		if (!this._priority) {
			var stmts = this._graph.find(this._uri, conxilla.terms.priority, null);
			if (stmts.length > 0) {
				this._priority = parseFloat(stmts[0].getValue());
			}
		}
		return this._priority;
	},
	setPriority: function(priority) {
		var stmts = this._graph.find(this._uri, conxilla.terms.priority, null);		
		if (stmts.length > 0) {
			stmts[0].setValue(priority);
		} else {
			this._graph.create(this._uri, conxilla.terms.priority, {value: priority, type: "literal", datatype: conxilla.terms.XSDFloat});
			this._priority = priority;
		}
	},
	getLayouts: function() {
		if (this._layers == null) {
			var arr = this._graph.find(null, conxilla.terms.layoutIn, this._uri);
			this._layouts = dojo.map(arr, function(statement) {
					return new conxilla.model.Layout(statement.getSubject(), this._graph);
			}, this);
		}
		return this._layouts;
	},
	addBoxLayout: function(box) {
		var layouts = this.getLayouts();
		var stmt = this._graph.create(null, conxilla.terms.layoutIn, {type: "bnode", value: this._uri});
		var layout = new conxilla.model.Layout(stmt.getSubject(), this._graph);
		this._layouts.push(layout);
		layout.setBox(box);
		return layout;
	},
	getConcepts: function() {
		return dojo.map(this.getLayouts(), function(layout) {
			return layout.getConcept();
		});
	}
});
