dojo.provide("conxilla.model.Node");

dojo.declare("conxilla.model.Node", null, {
	//===================================================
	// Private attributes
	//===================================================	
	_struct: null,
	
	//===================================================
	// Public API
	//===================================================	
	getConcept: function() {
		return this._struct.concept;
	},
	getType: function() {
		return this._struct.type;
	},
	getText: function() {
		return "No text";
	},
	getStyle: function() {
		if (this.style == undefined) {
			//Start from the base style
			this.style = dojo.clone(conxilla.style.shapeStyleBase);
			
			//Apply the style from the specified shape type
			var type = this.getType();
			if (type != undefined && conxilla.style.shapes[type] != undefined) {
				dojo.mixin(this.style, conxilla.style.shapes[type]);
			}
			//Apply explicit style given as attributes.
			var attributes = this.getAttributes();
			if (attributes != undefined) {
				dojo.mixin(this.style, attributes);
			}
		}
		return this.style;
	},

	getId: function() {
		return this._uri;
	},
	
	/**
	 * @return {Boolean} true if the ContextMap has been edited since it was loaded.
	 */
	isModified: function() {
		return this._isModified;
	},

	setValue: function(key, predicate, value, toJson) {
		this[key] = value;
		var stmts = this._graph.find(this._uri, predicate, null);
		if (stmts.length > 0) {
			stmts[0].setValue(toJson ? dojo.toJson(value) : value);
		}		
	},

	loadValueIfNeeded: function(key, predicate, isJson) {
		if (this[key] == null) {
			var stmts = this._graph.find(this._uri, predicate, null);
			if (stmts.length > 0) {
				this[key] = isJson ? dojo.fromJson(stmts[0].getValue()) : stmts[0].getValue();
			}
		}
		return this[key];
	},

	//===================================================
	// Inherited methods
	//===================================================	
	constructor: function(uri, graph) {
		this._uri = uri;
		this._graph = graph;
	}
});
