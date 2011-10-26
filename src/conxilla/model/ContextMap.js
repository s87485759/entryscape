/*global dojo*/
dojo.provide("conxilla.model.ContextMap");
dojo.require("conxilla.model.Node");
dojo.require("conxilla.model.Layer");

/**
 * A Map (may correspond to a concept) consists of one or more layers.
 */
dojo.declare("conxilla.model.ContextMap", conxilla.model.Node, {
	//===================================================
	// Public API
	//===================================================
	getStyle: function() {
		
	},
	setStyle: function() {
		
	},
	getType: function() {
		
	},
	setType: function() {
	},
	
	/**
	 * @return {rdfjson.Graph}
	 */
	getMetadata: function() {
	},

	getLayers: function() {
		if (this._layers == null) {
			var arr = this._graph.find(null, conxilla.terms.layerIn, this._uri);
			this._layers = dojo.map(arr, function(statement) {
					return new conxilla.model.Layer(statement.getSubject(), this._graph);
				}, this);
		} 
		return this._layers;
	},
	getContributedLayers: function() {
		//TODO use inverse relation cache
	},
	getNodeById: function() {
		//TODO
	}
});