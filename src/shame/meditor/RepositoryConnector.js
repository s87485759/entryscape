dojo._hasResource["shame.meditor.RepositoryConnector"] = true;
dojo.provide("shame.meditor.RepositoryConnector");

dojo.declare("shame.meditor.RepositoryConnector", null, {
	setResourceList: function(resourceList) {
		// Used by the resourceList constructor, if the ListConnector is constructed 
		// before the ResourceList and the ListConnector was given in the ResourceList constructor.
		this.resourceList = resourceList;
	},
	loadList: function()  {
		// Load the list and updates the ResourceList of the results.
		// Subclasses must implement this.
	},
	getNewURI: function(onSuccess, onFailure) {
		// Request a new URI for a new resource.
		// Subclasses must implement this
	},
	canRequestNewURI: function() {
		return false;
	}
});

dojo.declare("shame.meditor.FixedListConnector", shame.meditor.RepositoryConnector, {
	constructor: function(resourceListURL) {
		this.resourceListURL = resourceListURL;
	},
	loadList: function()  {
		var self = this;	
		dojo.xhrGet( {
        	url: this.resourceListURL,
        	handleAs: "json",
        	load: function(responseObject, ioArgs) {
          		self.resourceList.build(responseObject);
          		return responseObject;
 			},
 			error: function(response) {
 				return response;
 			}});
	}
});