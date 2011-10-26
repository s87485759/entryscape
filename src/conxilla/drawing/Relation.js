dojo.provide("conxilla.drawing.Relation");
dojo.require("dojox.drawing.tools.Path");
dojo.require("conxilla.drawing.Arrow");

conxilla.drawing.Relation = dojox.drawing.util.oo.declare(
	dojox.drawing.stencil.Path,
	function(/*Object*/options){
        if(true){
			this.begArrow = new conxilla.drawing.Arrow({stencil:this, idx1:0, idx2:1, layout: this.layout});
        }
        if(this.arrowEnd){
                this.endArrow = new conxilla.drawing.Arrow({stencil:this, idx1:1, idx2:0});
        }
			
		this.style.current.width = this.layout.getStyle().lineThickness;
		
        if(this.points.length > 0){
                this.render();
        }

		//onTransformEnd needed for capturing resize events.
		dojo.connect(this, "onTransformEnd", this, f = dojo.hitch(this, function(anchor){
			//We get 4 events due to 4 anchors, only react to one of them.
			if (anchor && anchor.pointIdx === 0) {
				this.dirty = true;
				this.maybeSave();					
			}
		}));
	},{
		/**
		 * Capture stencil drags, i.e. if the entire box is moved then the onTransformEnd is not called.
		 * @param {Object} o
		 */
		onStencilDrag: function (o) {
			this.dirty = true;
		},
		
		/**
		 * Capture stencilUp, i.e. if the entire box is moved then the onTransformEnd is not called.
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
				this.layout.setPath(this.points);
			}
		},
		onStencilOver: function(o) {
			if (this.drawingType!="ui") {
				return;
			}
			this.highlight();
		},
		onStencilOut: function(o) {
			if (this.drawingType!="ui") {
				return;
			}
			this.unhighlight();
		}
	}
);

dojox.drawing.register({
        name:"conxilla.drawing.Relation"
}, "stencil");