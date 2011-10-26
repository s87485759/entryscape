dojo.provide("conxilla.drawing.Box");
dojo.require("dojox.drawing.stencil.Rect");
dojo.require("conxilla.drawing.TextBox");

conxilla.drawing.Box = dojox.drawing.util.oo.declare(
        dojox.drawing.stencil.Rect,
        function(options){
			
			var data = dojo.mixin({}, this.layout.getBox(), {text: this.layout.getText()});
			this.textBox = new conxilla.drawing.TextBox({data: data, stencil: this, labelPosition: this.labelPosition, keys: this.drawing.keys});
						
			//onTransformEnd needed for capturing resize events.
			dojo.connect(this, "onTransformEnd", this, f = dojo.hitch(this, function(anchor){
				//We get 4 events due to 4 anchors, only react to one of them.
				if (anchor && anchor.pointIdx === 3) {
					this.dirty = true;
					this.maybeSave();					
				}
			}));
        },
        {
            type:"conxilla.drawing.Box",
            _create: function(/*String*/shp, /*StencilData*/d, /*Object*/sty){
                this.remove(this[shp]);
				//Use the boxShape from the layout.
				var style = this.layout.getStyle();
				if (style.boxStyle !== "none") {
	                this[shp] = style.getBoxShape(this.container, d);
    	            this[shp].setStroke(sty).setFill(sty.fill);
        	        this._setNodeAtts(this[shp]);					
				}
            },
			
			getTextBox: function() {
				return this.layout.getStyle().getTextBox(dojox.drawing.stencil.Rect.prototype.pointsToData.apply(this, arguments));
			},
			
			/**
			 * Capture stencil drags, i.e. if the entire box is moved then the onUp is not called.
			 * @param {Object} o
			 */
			onStencilDrag: function (o) {
				this.dirty = true;
			},
			
			/**
			 * Capture stencilUp, i.e. if the entire box is moved then the onUp is not called.
			 * @param {Object} o
			 */			
			onStencilUp: function(o) {
				this.maybeSave();
			},
			/**
			 * Save is the stencil is dirty, i.e. has been resized or removed.
			 */
			maybeSave: function() {
				if (this.dirty) {
					this.dirty = false;					
					this.layout.setBox(this.pointsToData());
				}
			},
						
			//Edit on a box means edit the text.
			edit: function(o) {
				this.textBox.edit(o);
			},
						
			onOver: function(o) {
				if (this.drawingType!="ui") {
					return;
				}
				this.highlight();
			},
			onOut: function(o) {
				if (this.drawingType!="ui") {
					return;
				}
				this.unhighlight();
			}			
        }
);

dojox.drawing.register({
        name:"conxilla.drawing.Box"
}, "stencil");