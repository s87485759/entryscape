/*global define*/
define(["dojo/_base/declare",
	"dojo/dom-construct",
	"dijit/_Widget"
], function(declare, construct, _Widget) {
	
	var contentNr = 0;

	return declare(_Widget, {
		buildRendering: function() {
			this.domNode = construct.create("div", {innerHTML: "Content "+contentNr});
			contentNr++;
		},
		
		
		show: function(params) {
		},

		getLabel: function(params) {
			return "content";
		}
	});
});