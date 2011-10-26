dojo.provide("conxilla.drawing.TextBox");
dojo.require("dojox.drawing.tools.TextBlock");

conxilla.drawing.TextBox = dojox.drawing.util.oo.declare(
	dojox.drawing.tools.TextBlock,
	function(/*Object*/options){
		this.master = options.stencil;
		this.render = this.renderOpt;
		this.render(options.text || "");
		this.connect(this.master, "destroy", this, "destroy");
		this.connect(this.master, "render", this, "render");
		this.subShape = true;
	},{
		_align:"start",
		
		//Having the textbox as an subShape makes it appear as part of this box, e.g. it has no id of it's own.
		subShape: true,
				
		renderOpt: function(txt) {
			var d = this.master.getTextBox(); //Fetch the size of the surrounding box.  
			this.setData(d); // To set the new size
			var o = this.measureText(this.cleanText(txt || this._text, true), d.width);
			this.onChangeText(o.text);
			
			//Call super method.
			dojox.drawing.tools.TextBlock.prototype.render.apply(this, [o.text]);

			if (this.shape.children) {
				dojo.forEach(dojo.filter(this.shape.children, function(child, index) {
					return child && child.shape.y> d.y+d.height;
				}), function(child) {
					child.removeShape();
				});
			}
		},

		//overrides and discards draggable textbox handles.
		createAnchors: function() {
		}
	}
);