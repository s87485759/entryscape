/*global define*/
define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/aspect",
	"dojo/dom-construct",
	"dojo/dom-class",
	"dojo/dom-attr",
	"./ViewController",
	"dijit/_Widget"
],
function(declare, lang, array, aspect, construct, domClass, attr, ViewController, _Widget) {

return declare([_Widget, ViewController], {	
	//===================================================
	// Inherited methods
	//===================================================
	buildRendering: function() {
        this.domNode = this.srcNodeRef || construct.create("div", null);
		domClass.add(this.domNode, "breadCrumbs");
	},
	
	showHierarchy: function(viewName, params, hierarchy) {		
		var viewMapDef = this.viewMap.getViewMapDef();
		attr.set(this.domNode, "innerHTML", "");
		var nameFound = false;
		array.forEach(hierarchy, function(hierViewName) {
			if (nameFound) {
				return;
			}
			var viewDef = this._getView(viewMapDef, hierViewName);
			var link = construct.create("a", {"href": this.viewMap.getHashUrl(viewDef.name, params),"class": "view"}, this.domNode);
			if (viewDef.name === viewName) {
				nameFound = true;
			} else {
				construct.create("span", {"class": "separator", "innerHTML": ">"}, this.domNode);				
			}

			require([viewDef["class"]], function(viewCls) {
				if (viewDef.name === viewName) {
					dojo.addClass(link, "current");
				}
				var obj = dojo.mixin({}, viewCls.prototype);
				var label = obj.getLabel(params);
				dojo.attr(link, "innerHTML", label);				
			});
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
});