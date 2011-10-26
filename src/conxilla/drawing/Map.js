dojo.provide("conxilla.drawing.Map");
dojo.require("dojox.drawing");
dojo.require("dojox.drawing.Drawing");
dojo.require("conxilla.drawing.Box");
dojo.require("conxilla.drawing.Relation");


/**
 * @param {Object} drawing
 */
dojo.declare("conxilla.drawing.Map", [dojox.drawing.Drawing], {
	_map: null,
	
	//===================================================
	// Public API
	//===================================================	
	render: function(drawing) {		
		dojo.forEach(this._map.getLayers(), function(layer) {
			this._renderLayer(layer);
		}, this);
//		var textBlock = myDrawing.addStencil("textBlock", {data:{x:20, y:30, width:200, text:"DojoX Drawing Rocks"}});
//		textBlock.attr({fill:{r:256,g:0,b:0,a:0.5}, width:10, color:"#0000FF", size:"24px", weight:"bold"});
//		var pts = [{t: "M", x:210, y:210},{t:"C", x:300, y:400},{x:340,y:400}, {x:400,y:210} ];
//		myDrawing.addStencil("path", {points:pts, closePath:false});
	},
	
	
	onStencilDrag: function (o) {
		this._redirectEvent("onStencilDrag", o);
	},
	onStencilUp: function(o) {
		this._redirectEvent("onStencilUp", o);
	},
	onDown: function(o) {
		this._redirectEvent("onDown", o);
	},						
	onUp: function(o) {
		this._redirectEvent("onUp", o);
	},						
	onDoubleClick: function(o) {
		this._redirectEvent("onDoubleClick", o);
	},
	edit: function(o) {
		this._redirectEvent("edit", o);
	},
	onUiDown: function(o) {
		this._redirectEvent("onUiDown", o);
	},
	onStencilOver: function(o) {
		this._redirectEvent("onStencilOver", o);
	},
	onStencilOut: function(o) {
		this._redirectEvent("onStencilOut", o);
	},
	onOver: function(o) {
		this._redirectEvent("onOver", o);
	},
	onOut: function(o) {
		this._redirectEvent("onOut", o);
	},
	onMove: function(o) {
		this._redirectEvent("onMove", o);		
	},
	mapChange: function(change, obj) {
		switch(change) {
			case "layoutAdded": 
				this._renderLayout(obj);
				break;
		}
	},

	//===================================================
	// Inherited methods
	//===================================================	
	constructor: function(params, node) {
		this._mouseHandle = this.mouse.register(this);
		this.defaults.text.minWidth = 10;
		this._map = params.map;
	},
	
	onSurfaceReady: function() {
		this.inherited("onSurfaceReady", arguments);
		this.render();
	},
	//===================================================
	// Private methods
	//===================================================
	_redirectEvent: function(method, o) {
		var stencil;
		if (this.mode == "ui") {
			stencil = this.uiStencils.stencils[o.id];
		} else {
			stencil = this.stencils.stencils[o.id];
		}
		if (stencil && stencil[method]) {
			stencil[method](o);
		}
	},
	
	_renderLayer: function(layer) {
		dojo.forEach(layer.getLayouts(), function(layout) {
			this._renderLayout(layout);
		}, this);
	},
	_renderLayout: function(layout) {
		if (layout.isRelation()) {
			this._renderLayoutSwitch("relation", {points: layout.getPath(), closePath: false, layout: layout});
		}
		if (layout.hasBox()) {
			this._renderLayoutSwitch("box", {data:layout.getBox(), layout: layout});
		}
	},
	_renderLayoutSwitch: function() {
		if (this.mode == "ui") {
			this.addUI.apply(this, arguments);
		} else {
			this.addStencil.apply(this, arguments);			
		}
	}
});