dojo.provide("conxilla.drawing.Arrow");
dojo.require("dojox.drawing.stencil.Path");

conxilla.drawing.Arrow = dojox.drawing.util.oo.declare(
	// summary:
	//	An annotation called internally to put an arrowhead
	//	on either end of a Line. Initiated in Arrow (and Vector)
	//	with the optional params: arrowStart and arrowEnd. Both
	//	default true for Axes.
	//
	dojox.drawing.stencil.Path,
	function(/* dojox.__stencilArgs */options){
		// arguments: See stencil._Base
		this.stencil.connectMult([
			[this.stencil, "select", this, "select"],
			[this.stencil, "deselect", this, "deselect"],
			[this.stencil, "render", this, "render"],
			[this.stencil, "onDelete", this, "destroy"]
		]);
		this.style = dojox.drawing.defaults.copy();
		var style = this.layout.getStyle();
		var styleSet = style.getStyleSet();
		this.scaledPoints = style.getScaledArrow();
		if (this.layout.getStyle().lineHeadFilled) {
			this.style.current.fill = styleSet.colors.mapFG;
			this.style.currentHit.fill = styleSet.colors.mapFG;
		} else {
			this.style.current.fill = styleSet.colors.mapBG;
			this.style.currentHit.fill = styleSet.colors.mapBG;
		}
		this.style.current.width = this.layout.getStyle().lineHeadLineThickness;
		
		this.connect("onBeforeRender", this, function(){
			var o = this.stencil.points[this.idx1];
			var c = this.stencil.points[this.idx2];
			if(this.stencil.getRadius() >= this.minimumSize){
				this.points = conxilla.style.rotateAndTranslateArrow(this.scaledPoints, c, o);
			}else{
				this.points = [];
			}
		});
		
	},
	{
		idx1:0,
		idx2:1,
		
		subShape:true,
		minimumSize:30
	}
);

