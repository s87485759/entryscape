dojo.provide("conxilla.style.StyleSet");
dojo.require("conxilla.style.defaults");
dojo.require("conxilla.style.Style");
dojo.require("conxilla.style.util");

dojo.declare("conxilla.style.StyleSet", null, {
	_type2style: null,
	
	//===================================================
	// Public API
	//===================================================
	getStyle: function(type) {
		if (type == null) {
			type = "";
		}
		if (!this._type2style[type]) {
			var style = new conxilla.style.Style(this._styleSet || conxilla.style.defaultStyleSet);
			this._type2style[type] = style;
			if (this._styleSet) {
				if (this._styleSet.baseStyle) {
					dojo.mixin(style, this._styleSet.baseStyle);					
				}
				if (this._styleSet.type2style && this._styleSet.type2style[type]) {
					dojo.mixin(style, this._styleSet.type2style[type]);
				}
			} else if (conxilla.style.defaultStyleSet.type2style[type]){
				dojo.mixin(style, conxilla.style.defaultStyleSet.type2style[type]);		
			}
		}
		return this._type2style[type];
	},
	//===================================================
	// Inherited methods
	//===================================================
	constructor: function(styleSet) {
		this._type2style = {};
		if (styleSet) {
			this._styleSet = styleSet;
			this._completeStyleSet();			
		}
	},
	//===================================================
	// Private methods
	//===================================================
	_completeStyleSet: function() {
		for (var key in conxilla.style.defaultStyleSet) {
			if (!this._styleSet[key]) {
				this._styleSet[key] = conxilla.style.defaultStyleSet[key];
			} else {
				for (var key2 in conxilla.style.defaultStyleSet[key]) {
					if (!this._styleSet[key][key2]) {
						this._styleSet[key][key2] = conxilla.style.defaultStyleSet[key][key2];
					}
				}
			}
		}
	}
});

conxilla.style.defaultStyleSetI = new conxilla.style.StyleSet();