/*global dojo, dijit, se*/
dojo.provide("se.uu.ull.site.ViewController");

dojo.declare("se.uu.ull.site.ViewController", null, {
	//===================================================
	// Public attributes
	//===================================================
	viewMap: null,

	//===================================================
	// Public API
	//===================================================
	show: function(viewName, params) {
		var viewMapDef = this.viewMap.getViewMapDef();
		var hierarchy = this._getHierarchy(viewMapDef, viewName, params);
		this.showHierarchy(viewName, params, hierarchy);		
	},
	showHierarchy: function(viewName, params, hierarchy) {		
	},
	
	//===================================================
	// Inherited methods
	//===================================================
	constructor: function(params) {
		this.viewMap = params.viewMap;
		this._hierarchy = [];
		dojo.connect(this.viewMap, "beforeViewChange", this, this.show);
	},
	
	//===================================================
	// Private methods
	//===================================================
	_getHierarchy: function(viewMapDef, viewName, params) {
		var branch, i, hierarchyName = params && params.hierarchy;
		if (hierarchyName) {
			for (i=0;i<viewMapDef.hierarchies.length;i++) {
				if (viewMapDef.hierarchies[i].scope === hierarchyName) {
					branch = this._getHierarchyBranch([viewMapDef.hierarchies[i]], viewName);
					if (branch) {
						return branch;
					}
				}
			}
		}
		for (i=0;i<viewMapDef.hierarchies.length;i++) {
			branch = this._getHierarchyBranch([viewMapDef.hierarchies[i]], viewName);
			if (branch) {
				return branch;
			}
		}
	},
	_getHierarchyBranch: function(arrNode, viewName) {
		for (var i=0;i<arrNode.length;i++) {
			var node = arrNode[i];
			if (dojo.isString(node)) {
				if (node === viewName) {
					return [viewName];
				}
			} else {
				if (node.view === viewName) {
					return [viewName];
				} else {
					var subBranch = this._getHierarchyBranch(node.subViews, viewName);
					if (subBranch != null) {
						subBranch.splice(0, 0, node.view);
						return subBranch;
					}
				}
			}
		}
	}
});