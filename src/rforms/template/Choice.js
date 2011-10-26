/*global dojo, rforms*/
dojo.provide("rforms.template.Choice");
dojo.require("rforms.template.Item");

/**
 * A choice item type indicates that the value should be one of a range of predefined choices,
 * these predefined choices can be defined manually in the template or extracted from an external
 * ontlogy (indicated by the ontologyUrl) by means of a query that can be constructed from the constraints.
 * 
 * TODO:
 * The choices can also be organized into a hierarchy using the parent and hierarchy properties.
 */
dojo.declare("rforms.template.Choice", rforms.template.Item, {
	//===================================================
	// Private attributes
	//===================================================	
	_source: null,
	_ontologyStore: null,
	_choices: {},

	//===================================================
	// Public API
	//===================================================	
	/**
	 *  A choice is an object which looks like:
	 * {"d": "http://example.com/choice1",
	 *  "label": {"en": "First choice", "sv": "Första valet"}
	 * }
	 *  
	 * @return {Array} of choices.
	 */
	getChoices: function() {
		return this.getStaticChoices() || this.getDynamicChoices() || [];
	},
	
	/**
	 * @return {Boolean} true if there is an ontology or static choices.
	 */
	hasChoices: function() {
		return this._source.ontologyUrl != null || this._source.choices != null;
	},
	
	/**
	 * @return {Array} of choices defined manually in the Template.
	 */
	getStaticChoices: function() {
		if (this._source.choices && !this._staticIsSorted) {
			rforms.template.sortChoices(this._source.choices);
			this._staticIsSorted = true;
		}
		return this._source.choices;
	},
	/**
	 * Fetches choices from an external ontology.
	 * 
	 * @param {Object} callback will be called asynchronously, if undefined the call is made synchronously.
	 * @return {Array} of choice objects, only provided if method called without callback.
	 */
	getDynamicChoices: function(callback) {
		if (this._dynamicChoices == null) {
			if (callback == null) {
				this._dynamicChoices = this._ontologyStore.getChoices(this);
				rforms.template.sortChoices(this._dynamicChoices);
				return this._dynamicChoices;
			} else {
				this._ontologyStore.getChoices(this, dojo.hitch(this, function(choices) {
					rforms.template.sortChoices(choices);
					if (this._dynamicChoices == null) {
						console.log("Failed lookup of choices for "+this.getLabel());
						console.log("  OntologyUrl is: "+this._source.ontologyUrl);
					}
					callback(this._dynamicChoices);
				}));
				return;
			}
		} else {
			if (callback == null) {
				return this._dynamicChoices;
			} else {
				callback(this._dynamicChoices);
			}
		}		
	},
	getOntologyUrl: function() {
		return this._source.ontologyUrl;
	},
	getParentProperty: function() {
		return this._source.parentProperty;
	},
	getHierarchyProperty: function() {
		return this._source.hierarchyProperty;
	},
	isParentPropertyInverted: function() {
		return this._source.isParentPropertyInverted === undefined ? false : this._source.isParentPropertyInverted;
	},
	isHierarchyPropertyInverted: function() {
		return this._source.isHierarchyPropertyInverted === undefined ? false : this._source.isHierarchyPropertyInverted;
	},
	
	//===================================================
	// Inherited methods
	//===================================================	
	constructor: function(source, ontologyStore) {
		this._ontologyStore = ontologyStore;
	}
});

rforms.template.sortChoices = function(choices) {
	if (choices == null) {
		return;
	}
	choices.sort(function(c1, c2) {
		var lab1 = rforms.template.getLocalizedValue(c1.label).value || c1.value;
		var lab2 = rforms.template.getLocalizedValue(c2.label).value || c2.value;
		if (lab1 > lab2) {
			return 1;
		} else if (lab1 < lab2) {
			return -1;
		} else {
			return 0;
		}
	});
};
