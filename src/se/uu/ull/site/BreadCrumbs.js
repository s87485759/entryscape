/*global dojo, dijit, se*/
dojo.provide("se.uu.ull.site.BreadCrumbs");
dojo.require("se.uu.ull.site.ViewController");
dojo.require("dijit._Widget");

dojo.declare("se.uu.ull.site.BreadCrumbs",  [dijit._Widget, se.uu.ull.site.ViewController], {	
	//===================================================
	// Inherited methods
	//===================================================
	buildRendering: function() {
        this.domNode = this.srcNodeRef || dojo.create("div", null);
		dojo.addClass(this.domNode, "breadCrumbs");
	},
	
	showHierarchy: function(viewName, params, hierarchy) {		
		var viewMapDef = this.viewMap.getViewMapDef();
		dojo.attr(this.domNode, "innerHTML", "");
		var nameFound = false;
		dojo.forEach(hierarchy, function(hierViewName) {
			if (nameFound) {
				return;
			}
			var viewDef = this._getView(viewMapDef, hierViewName);
			var link = dojo.create("a", {"href": this.viewMap.getHashUrl(viewDef.name, params),"class": "view"}, this.domNode);
			if (viewDef.name === viewName) {
				nameFound = true;
			} else {
				dojo.create("span", {"class": "separator", "innerHTML": ">"}, this.domNode);				
			}

			dojo["require"](viewDef["class"]);
			setTimeout(function() {
				dojo.addOnLoad(dojo.hitch(this, function(link, viewDef) {
					if (viewDef.name === viewName) {
						dojo.addClass(link, "current");
					}
					var viewCls = eval(viewDef["class"]);
					var obj = dojo.mixin({}, viewCls.prototype);
					var label = obj.getLabel(params);
					dojo.attr(link, "innerHTML", label);
				}, link, viewDef));
			}, 1);
		}, this);
	},
	
	//===================================================
	// Private methods
	//===================================================
	_getView: function(viewMapDef, name) {
		for (var i=0;i<viewMapDef.views.length;i++) {
			if (viewMapDef.views[i].name === name) {
				return viewMapDef.views[i];
			}
		}
	}
});