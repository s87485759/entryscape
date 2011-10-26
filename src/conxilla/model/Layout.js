dojo.provide("conxilla.model.Layout");
dojo.require("conxilla.model.Node");

/**
 * A Layout (may correspond to a concept) provides a shape according to a shape type and a role. 
 */
dojo.declare("conxilla.model.Layout", conxilla.model.Node, {
	isRelation: function() {
		if (this._isRelation == null) {
			this._isRelation = this.loadValueIfNeeded("_path", conxilla.terms.path, true) != null;			
		}
		return this._isRelation;
	},
	hasBox: function()  {
		if (this._hasBox == null) {
			this._hasBox = this.loadValueIfNeeded("_box", conxilla.terms.box, true) != null;			
		}
		return this._hasBox;
	},
	
	getConcept: function() {
		//TODO
	},
	getPath: function() {
		return this.loadValueIfNeeded("_path", conxilla.terms.path, true);
	},
	setPath: function(path) {
		this.setValue("_path", conxilla.terms.path, path, true);
	},
	getBox: function() {
		return this.loadValueIfNeeded("_box", conxilla.terms.box, true);		
	},
	setBox: function(box) {
		this.setValue("_box", conxilla.terms.box, box, true);		
	},
	
	getSubject: function() {
		//TODO, lookup via ContextMap.
		//return this.loadValueIfNeeded("_subject", conxilla.terms.subject);
	},
	getObject: function() {
		//TODO, lookup via ContextMap.
		//return this.loadValueIfNeeded("_object", conxilla.terms.object);
	},
	
	/**
	 * a named type from which shape attributes are fetched.
	 */
	getType: function() {
		return this.loadValueIfNeeded("_type", conxilla.terms.type);
	},
	
	/**
	 * an object with stroke, fill, icon and font.
	 */
	getStyle: function() {
		if (this._calculatedStyle == null) {
			var t = this.getType();
			//If a type exists and a style exists for it use it, otherwise use the baseStyle
			this._calculatedStyle = conxilla.style.defaultStyleSetI.getStyle(t);
			//If the layout provides inline style, clone the style object from above and overload it with the inline style
			if (this.loadValueIfNeeded("_style", conxilla.terms.style) != null) {
				this._calculatedStyle = this._calculatedStyle.clone(this._style);
			}
		}
		return this._calculatedStyle;
	},

	/**
	 * The role of a layout in a groupLayout.
	 */
	getRole: function() {
		return this.struct.role;
	}
});
