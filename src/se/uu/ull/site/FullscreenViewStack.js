/*global dojo, dijit, se*/
dojo.provide("se.uu.ull.site.FullscreenViewStack");
dojo.require("se.uu.ull.site.ViewMap");
dojo.require("dijit.layout._LayoutWidget");
dojo.require("dijit._Templated");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dojo.hash");

/**
 * A FullscreenViewStack is a ViewMap that shows the views fullscreen, i.e. taking up the entire browser window.
 * It accomplishes this by using dijit.layout classes that listens in for browser resize events to always keep
 * the width and height correct. The views are lazy loaded and if more than one have been initialized they are stacked, 
 * i.e. all non active views are kept invisible via css display=none.
 */
dojo.declare("se.uu.ull.site.FullscreenViewStack", [dijit.layout._LayoutWidget, dijit._Templated, se.uu.ull.site.ViewMap], {
	//=================================================== 
	// Public Attributes 
	//===================================================
	widescreen: true,

	//=================================================== 
	// Private Attributes 
	//===================================================
	_view: null,

	//=================================================== 
	// Inherited Attributes 
	//===================================================
//	templateString: "<div class='viewMap widescreen'><div dojoType='dijit.layout.BorderContainer' style='height: 100%' dojoAttachPoint='bc' gutters='false'><div class='viewController' dojoType='dijit.layout.ContentPane' region='top'><div class='inline' dojoAttachPoint='controlNode'></div></div><div dojoType='dijit.layout.ContentPane' region='center'><div dojoAttachPoint='viewNode' style='height: 100%'></div></div></div></div>",
	templatePath: dojo.moduleUrl("se.uu.ull.site", "FullscreenViewStackTemplate.html"),
	widgetsInTemplate: true,

	//===================================================
	// Inherited methods
	//===================================================
	unifiedConstructor: function(viewMapDef, node) {
		var fsvs = new se.uu.ull.site.FullscreenViewStack({viewMapDef: viewMapDef}, node);
		setTimeout(function() {
			fsvs.startup();
		}, 1);
		return fsvs;
	},
	close: function(view) {
		dojo.style(view.domNode, "display", "none");
	},
	open: function(viewDef, view, params, callback) {
		if (this.widescreen || viewDef.widescreen) {
			dojo.addClass(this.domNode, "widescreen");
		} else {
			dojo.removeClass(this.domNode, "widescreen");
		}
		if (!view) {
			viewDef.constructorParams = viewDef.constructorParams || {};
			dojo.mixin(viewDef.constructorParams, {"_siteManager": this});
			//Assuming someone made sure all classes is already loaded.
			dojo["require"](viewDef["class"]);
			setTimeout(dojo.hitch(this, function() {
				dojo.addOnLoad(this, function() {
					var cls = eval(viewDef["class"]);
					
					if (viewDef.initInDOM) {
						view = new cls(viewDef.constructorParams, dojo.create("div", null, this.viewNode));
						dojo.style(view.domNode, "height", "100%");
						view.startup();
						view.show(params);
					} else {
						view = new cls(viewDef.constructorParams, dojo.create("div"));
						dojo.style(view.domNode, "height", "100%");
						view.startup();
						view.show(params);
						dojo.place(view.domNode, this.viewNode);
					}
					this._view = view;
					this.resize();
					callback(view);
				});				
			}), 1);
		} else {
			view.show(params);
			dojo.style(view.domNode, "display", "");
			this._view = view;
			this.resize();
			callback(view);
		}
	},
	createViewController: function() {
		var viewMapDef = this.getViewMapDef();
		if (viewMapDef.controller) {
			var cls = eval(viewMapDef.controller);
			var params = dojo.mixin({viewMap: this}, viewMapDef.controllerConstructorParams);
			this.controller = new cls(params, this.controlNode);
		}
	},
	startup: function() {
		this.inherited("startup", arguments);
		this.createViewController();
		this.initialize();
	},
	resize: function() {
		this.inherited("resize", arguments);
//		this.bc.resize();
		if (this._view && this._view.resize) {
			this._view.resize();
		}
	}
});