/*global dojo, dijit, se*/
dojo.provide("se.uu.ull.site.ViewMap");
dojo.require("dojo.hash");

/**
 * Base class for displaying a set of interchangable views.
 * Changing the current view is always reflected via a change of the hash part of the current window url.
 * Individual views are encouraged to provide links to other views by inserting simple html a tags with only 
 * the hash part which will be recognized by the browser as moving to an anchor.
 * This class will listen to clicks that corresponds to a change of fragment and will switch to the new view.
 * Programmatically changing the current view by calling the open and close methods directly is NOT RECOMMENDED.
 *  
 * The viewMap is configured via a viewMapDef object that can look like:
 * {
 *  "manager": "se.uu.ull.site.FullscreenViewStack",
 *	"controller": "se.uu.ull.site.BreadCrumbs",
 *	"startView": "ui2",
 *	"views": [{"name": "ui1", "class": "se.uu.ull.site.tests.Pane"},
 *            {"name": "ui2", "class": "se.uu.ull.site.tests.Pane", startParams: {name: "Foo"}, widescreen: true}],
 *	"hierarchies": [{ "scope": "main",
 *					  "view": "ui1", 
 *					  "subViews": ["ui2"]
 * 				    }
 *				   ]
 * }
 * The views array contains viewDefinitions and the hierarchies provides scoped hierarchies of views
 * (the same view can appear in multiple hierarchies as the scope parameter can be sent along as distinction).
 * The hierarchy is described via nested objects with two parameters. The view parameter refers to the view
 * by name and the subViews points to other views lower down in the hierarchy. 
 * Note 1, leaf subviews can be identified directly as a string, no object is needed as they have no subviews.
 * Note 2, only the toplevel object that corresponds to a hierarchy can have the scope parameter.
 * 
 * The controller provides the viewController class which is typically responsible for displaying a menu, 
 * a breadcrumb trail or something similar.
 * 
 * The startView identifies the view to start with if the current window Url does not indicate another view to show.
 * 
 * This class cannot be used directly, it need to be subclassed where the methods createViewController, 
 * close and open should be implemented.
 */
dojo.declare("se.uu.ull.site.ViewMap", null, {
	viewMapDef: null,
	viewController: null,
	startView: null,
	startParams: null,
	//=================================================== 
	// Private Attributes 
	//===================================================
	_baseUrl: "",
	_viewDefs: null,
	_currentView: "",

	//=================================================== 
	// Public API 
	//===================================================
	getCurrentView: function() {
		return this._currentView;
	},
	setViewMapDef: function(viewMapDef) {
		this.viewMapDef = viewMapDef || {views: []};
		this._viewDefs = [];
		if (viewMapDef.views) {
			dojo.forEach(viewMapDef.views, function(viewDef) {
				this._viewDefs[viewDef.name] = viewDef;				
			}, this);
		}
	},
	getViewMapDef: function() {
		return this.viewMapDef;
	},
	addView: function(viewDef) {
		this._viewDefs[viewDef.name] = viewDef;
		this.viewMapDef.views.push(viewDef);
	},
	getHashUrl: function(uiName, params) {
		return "#"+dojo.objectToQuery(dojo.mixin({}, params, {view: uiName}));
	},
	/**
	 * Opens the view from the given startview, the url of the window or from the given startView in 
	 * the viewMapDef configuration.
	 */
	initialize: function() {
		var urlParts = window.location.href.split("#");
		if (this.startView) {
			dojo.hash(this.getHashUrl(this.startView, this.startParams));			
		} else if (urlParts.length > 1) {
			this._openUrl(urlParts[1]);
		} else { //Assuming there is always a startview.
			dojo.hash(this.getHashUrl(this.viewMapDef.startView, this.viewMapDef.startParams));
		}
	},
	//=================================================== 
	// Methods to override in subclasses 
	//===================================================
	createViewController: function() {
		//Implement
	},
	close: function(view) {
		//Implement
	},
	/**
	 * @param {Object} viewDef the configuration object for a view
	 * @param {Object} view the instance corresponding to the view gui, if undefined then the view is opened for the first time.
	 * @param {Object} params the parmeters for opening up this view.
	 * @param {Function} callback will be called after the view have been initialized, the new view will be provided as an argument.
	 * @return the view instance to be stored for future use, i.e. when switching back to this view.
	 */
	open: function(viewDef, view, params, callback) {
		//Implement
	},
	unifiedConstructor: function(viewMapDef, node) {
		return new se.uu.ull.site.ViewMap({viewMapDef: viewMapDef}); 
	},
	//=================================================== 
	// Public hooks 
	//===================================================
	beforeViewChange: function(uiName, params) {
	},
	afterViewChange: function(uiName, params) {
	},
	
	//===================================================
	// Inherited methods
	//===================================================
	constructor: function(params) {
		this._viewDefs = {};
		if (params.viewMapDef) {
			this.setViewMapDef(params.viewMapDef);
		}
		this.initParams = params.initParameters || {};
		this.initParams.siteManager = this;
		dojo.subscribe("/dojo/hashchange", this, this._openUrl);
	},
		
	//===================================================
	// Private methods
	//===================================================
	_openUrl: function(hash) {
		var obj = dojo.queryToObject(dojo.hash());
		if (obj.view) {
			this._open(obj.view, obj);
		} else {
			this._open(this.viewMapDef.startView, this.viewMapDef.startParams);
		}
	},
	_open: function(name, params) {
		this.beforeViewChange(name, params);
		var viewDef = this._viewDefs[name];
		if (this._currentView !== "" && this._currentView !== name) {
			var viewToHide = this._viewDefs[this._currentView];
			this.close(viewToHide.instance);
		}
		this.open(viewDef,viewDef.instance, params, dojo.hitch(this, function(viewInstance) {
			viewDef.instance = viewInstance;
			this._currentView = name;
			this.afterViewChange(name, params);
		}));
	}
});

/**
 * Use this function to create the manager class (typically a subclass of the ViewMap) specified in the ViewMapDef object.
 * To isolate from different forms of constructor parameters every ViewMap subclass has a special function "unifiedConstructor"
 * which is called from the prototype.
 * Hence every subclass of ViewMap must implement this function.
 * 
 * @param {Object} viewMapDef
 * @param {Object} node
 */
se.uu.ull.site.init = function(viewMapDef, node) {
	var cls = eval(viewMapDef.manager);
	return cls.prototype.unifiedConstructor(viewMapDef, node);
};