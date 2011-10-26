/*global dojo, dijit, se*/
dojo.provide("se.uu.ull.site.tests.Pane");
dojo.require("dijit.layout.ContentPane");


se.uu.ull.site.tests.contentNr = 0;
dojo.declare("se.uu.ull.site.tests.Pane", dijit.layout.ContentPane, {
	constructor: function() {
		this.content = "Content "+se.uu.ull.site.tests.contentNr;
		se.uu.ull.site.tests.contentNr++;
	},
	
	show: function(params) {
	},
	getLabel: function(params) {
		return "content";
	}
});