/*global conxilla, dojo*/
dojo.provide("conxilla.style.Style");
dojo.require("conxilla.style.defaults");


dojo.declare("conxilla.style.Style", null, {
	//===================================================
	// Public attributes
	//===================================================
	//the defaults are defined in conxilla.style.defaultStyleSet.baseStyle and mixed into this class
	//see the dojo.extend at the end of this file.
	
	//===================================================
	// Public API
	//===================================================
	/**
	 * Clones the current style and mixes in the provided style object on top.
	 * @param {Object} style
	 */
	clone: function(style) {
		return dojo.mixin(new conxilla.Style(), this, style);
	},
	
	getStyleSet: function() {
		return this._styleSet;
	},
	
	getBoxStyle: function() {
		return this._styleSet.boxStyles[this.boxStyle];
	},
	
	getBoxStroke: function(mark) {
		mark = mark == undefined ? {} : mark;
		return {color: mark.color != undefined ? mark.color : this._styleSet.colors.mapFG,
	            style: mark.style != undefined ? mark.style : this['boxBorderStyle'],
	            width: this['boxBorderThickness'] * (mark.scale == undefined ? 1.0 : mark.scale)};
	},
	
	getTextBox: function(bb) {
		switch (this.boxStyle) {
			case "rectangle":
			case "none":
			case "systemboundary":
				return bb;
			case "roundrectangle":
				return {x: bb.x+3, y: bb.y+3, width: bb.width - 6, height: bb.height - 6};
			case "ellipse":
				var insetf = (2 - Math.sqrt(2)) / 4;
				return {x: bb.x+bb.width*insetf, y: bb.y+bb.height*insetf, width: bb.width * (1-2*insetf), height: bb.height * (1-2*insetf)};
			case "eastarrow":
				var indent = bb.height / 4.0 / Math.sqrt(3.0);
	            return {x: bb.x+ indent, y: bb.y, width: bb.width-2*indent, height: bb.height};
			default:
				if (this._styleSet.boxStyles[this.boxStyle] != undefined) {
					var textbox = conxilla.style.normalizeRect(this._styleSet.boxStyles[this.boxStyle].textBox);
					if (textbox == undefined) {
						return bb;
					}
					return conxilla.style.transformRectangle(textbox,
	                                                bb.x, bb.y, bb.width, bb.height);
				} else {
					console.debug("boxStyle "+this.boxStyle+ " unsupported, doing an ellipse instead");
					var insetf = (2 - Math.sqrt(2)) / 4;
					return {x: bb.x+bb.width*insetf, y: bb.y+bb.height*insetf, width: bb.width * (1-2*insetf), height: bb.height * (1-2*insetf)};
				}
		}	
	},
	//Do not know where to put this, depends on gfx library to much to be in style,
	//but is heavily dependent on style since many special shapes need to be added explicilty here.
	getBoxShape: function(group, bb) {
		var shape;
		switch (this.boxStyle) {
			case "rectangle":
				shape = group.createRect(bb);
				break;
			case "roundrectangle":
				var bb = dojo.mixin({}, bb, {r: 6});
				shape = group.createRect(bb);
				break;
			case "ellipse":
				shape = group.createEllipse({cx: bb.x+bb.width/2, cy: bb.y+bb.height/2, rx: bb.width/2, ry: bb.height/2});
				break;
			case "eastarrow":
				var indent = bb.height / 4.0 / Math.sqrt(3.0);
	            shape = group.createPath();
				shape.moveTo({x: bb.x, y: bb.y});
				shape.hLineTo(bb.x+ bb.width-indent);
				shape.lineTo(bb.x+bb.width, bb.y+bb.height/2);
	            shape.lineTo(bb.x + bb.width - indent, bb.y + bb.height);
	            shape.lineTo(bb.x, bb.y + bb.height);
	            shape.lineTo(bb.x + indent, bb.y + bb.height / 2.0);
	            shape.lineTo(bb.x, bb.y);
				break;
			default:
				var boxStyle = style.getBoxStyle();
				if (boxStyle != undefined) {
					var boxPath = conxilla.style.transformPath(boxStyle.path, 
	                                                bb.x, bb.y, bb.width, bb.height);
					shape = group.createPath(boxPath);
				} else {
					console.debug("boxStyle "+this.boxStyle+ " unsupported, doing an ellipse instead");
					shape = group.createEllipse({cx: bb.x+bb.width/2, cy: bb.y+bb.height/2, rx: bb.width/2, ry: bb.height/2});
				}
		}
		shape.setStroke(this.getBoxStroke());
		var styleSet = this.getStyleSet();
		if (this['boxFilled']) {
			shape.setFill(styleSet.colors.mapFG);
		} else {
			shape.setFill(styleSet.colors.mapBG);
		}
		return shape;
	},
	getScaledArrow: function() {
		var path = dojo.clone(this._styleSet.arrowStyles[this.lineHeadStyle]);
		for (var i=0;i<path.length; i++) {
			path[i].x = path[i].x*this.lineHeadLength;
			path[i].y = path[i].y*this.lineHeadWidth;
		}
		return path;
	},


	//===================================================
	// Inherited methods
	//===================================================
	constructor: function(styleSet) {
		this._styleSet = styleSet;
	}
});

//the defaults are defined in conxilla.style.defaultStyleSet.baseStyle and mixed into this class
dojo.extend(conxilla.style.Style, conxilla.style.defaultStyleSet.baseStyle);