/*global define*/
define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-style",
	"dojo/dom-class",
	"dojo/dom-construct",
	"se/uu/ull/site/ViewMap",
	"dijit/layout/_LayoutWidget",
	"dijit/_Templated",
	"dijit/layout/BorderContainer",
	"dijit/layout/ContentPane",
	"dojo/hash",
	"dojo/text!./FullscreenViewStackTemplate.html"
], function(declare, lang, style, domClass, construct, ViewMap, _LayoutWidget, _Templated, BorderContainer, ContentPane, hash, template) {


	/**
	 * A FullscreenViewStack is a ViewMap that shows the views fullscreen, i.e. taking up the entire browser window.
	 * It accomplishes this by using dijit.layout classes that listens in for browser resize events to always keep
	 * the width and height correct. The views are lazy loaded and if more than one have been initialized they are stacked,
	 * i.e. all non active views are kept invisible via css display=none.
	 */
	var FullscreenViewStack = declare([_LayoutWidget, _Templated, ViewMap], {
		//===================================================
		// Public Attributes
		//===================================================
		widescreen : true,

		//===================================================
		// Private Attributes
		//===================================================
		_view : null,

		//===================================================
		// Inherited Attributes
		//===================================================
		//	templateString: "<div class='viewMap widescreen'><div dojoType='dijit.layout.BorderContainer' style='height: 100%' dojoAttachPoint='bc' gutters='false'><div class='viewController' dojoType='dijit.layout.ContentPane' region='top'><div class='inline' dojoAttachPoint='controlNode'></div></div><div dojoType='dijit.layout.ContentPane' region='center'><div dojoAttachPoint='viewNode' style='height: 100%'></div></div></div></div>",
		templateString : template,

		//===================================================
		// Inherited methods
		//===================================================
		close : function(view) {
			style.set(view.domNode, "display", "none");
			view.set("selected", false);
		},
		open : function(viewDef, view, params, callback) {
			if(this.widescreen || viewDef.widescreen) {
				domClass.add(this.domNode, "widescreen");
			} else {
				domClass.remove(this.domNode, "widescreen");
			}
			if(!view) {
				viewDef.constructorParams = viewDef.constructorParams || {};
				lang.mixin(viewDef.constructorParams, {
					"_siteManager" : this
				});
				//Assuming someone made sure all classes is already loaded.
				require([viewDef["class"]], lang.hitch(this, function(cls) {
					if(viewDef.initInDOM) {
						view = new cls(viewDef.constructorParams, construct.create("div", null, this.viewNode));
						style.set(view.domNode, "height", "100%");
						view.startup();
						view.show(params);
					} else {
						view = new cls(viewDef.constructorParams, construct.create("div"));
						dojo.style(view.domNode, "height", "100%");
						view.startup();
						view.show(params);
						construct.place(view.domNode, this.viewNode);
					}
					view.set("selected", true);
					this._view = view;
					this.resize();
					callback(view);
				}));
			} else {
				view.show(params);
				style.set(view.domNode, "display", "");
				view.set("selected", true);
				this._view = view;
				this.resize();
				callback(view);
			}
		},
		createViewController : function() {
			var viewMapDef = this.getViewMapDef();
			if(viewMapDef.controller) {
				require([viewMapDef.controller], lang.hitch(this, function(cls) {
					var params = lang.mixin({
						viewMap : this
					}, viewMapDef.controllerConstructorParams);
					this.controller = new cls(params, this.controlNode);
				}));
			}
		},
		startup : function() {
			this.inherited("startup", arguments);
			this.createViewController();
			this.initialize();
		},
		resize : function() {
			this.inherited("resize", arguments);
			if(this._view && this._view.resize) {
				this._view.resize();
			}
		}
	});


	FullscreenViewStack.create = function(viewMapDef, node) {
		var fsvs = new FullscreenViewStack({viewMapDef: viewMapDef}, node);
		setTimeout(function() {
			fsvs.startup();
		}, 1);
		return fsvs;
	};

	return FullscreenViewStack;
});