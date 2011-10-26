dojo.provide("shame.Connector");

dojo.declare("shame.Connector", null, {
	loadFormModel: true,
	constructor: function (loader) {
		this.loader = loader;
	},
	setLoader: function(loader) {
		// Used by the loaders constructor if the Connector is constructed before 
		// the Loader and the Connector was given in the Loader constructor.
		this.loader = loader;
	},
	operational: function() {
		// Returns true if the connector has been initialized so that 
		// it should work. No guarante is given that the URLs 
		// returned from the other functions work though.
		return true;
	},
	load: function(callback, errorCallback)  {
		// Forces the Loader to load the FormTemplate and FormModel according to 
		// what this connector specifies.
		this.loader.clear();
		if (callback) {
			var self = this;
			var lcallback = function() {
				if (self.loader.getFormModel() != null) {
					callback();
				}
			}
			this.loader.setFT(this.getFormTemplateURL(), lcallback, errorCallback);
			if (this.loadFormModel) {
				this.loader.setFM(this.getFormModelURL(), lcallback, errorCallback);
			}
		} else {
			this.loader.setFT(this.getFormTemplateURL());
			if (this.loadFormModel) {
				this.loader.setFM(this.getFormModelURL());
			}
		}
	},
	getFormTemplateURL: function() {
		// Return a URL from where the FormTemplate can be fetched.
		// Must be implemented by subclasses
	},
	getFormModelURL: function() {
		// Return a URL from where the FormModel for a resource can be fetched.
		// Must be implemented by subclasses.
	}
});

dojo.declare("shame.CommonConnector", shame.Connector, {
	setAP: function(apId) {
		// The apId identifies the Annotation Profile containing 
		// an FormTemplate and an GraphPattern which can be used to 
		// generate a FormModel given a metadata record to be applied to.
		this.apId = apId;
	},
	setResource: function(resource) {
		// Resource is a URI for the resource to be edited.
		this.resource = resource;
	},
	setRepository: function(repository) {
		// Repository is a URL to a triple-store wherefrom the metadata for 
		// the resource is to be found.
		this.repository = repository;
	},
	
	setUpdateRepositoryURL: function(updateService) {
		this.updateservice = updateService; 
	}
});

dojo.declare("shame.ServiceConnector", shame.CommonConnector, {
	constructor: function(loader, ftRetrievalURLBase, fmRetrievalURLBase) {
		this.fmrb = fmRetrievalURLBase;
		this.ftrb = ftRetrievalURLBase;
	},
	getFormTemplateURL: function() {
		return this.ftrb+"?ap="+escape(this.apId);
	},
	getFormModelURL: function() {
		return this.fmrb+"?resource="+escape(this.resource)+"&sparqlservice="
				+escape(this.repository)+"&ap="+escape(this.apId)+"&updateservice="+escape(this.updateservice);
	}
});

dojo.declare("shame.ManualConnector", shame.Connector, {
	operational: function() {
		return this.fturl != null && !(this.loadFormModel && this.fmurl == undefined);
	},
	getFormTemplateURL: function() {
		return this.fturl;
	},
	getFormModelURL: function() {
		return this.fmurl;
	}
});

dojo.declare("shame.DetectParameterConnector", shame.ManualConnector, {
	//Simply detects parameters from the HTML, 
	constructor: function(loader, container, parameters) {
		this.detectParameters(container);
		if (parameters.formModelURL) {
			this.fmurl = parameters.formModelURL;
		}
		if (parameters.formTemplateURL) {
			this.fturl = parameters.formTemplateURL;
		}
	},
	detectParameters: function(container) {
		this.fmurl = container.getAttribute("fm");
		if (this.fmurl == null) {
			this.fmurl = shame.detectParameterFromURL("fm");
		}
		this.fturl = container.getAttribute("ft");
		if (this.fturl == null) {
			this.fturl = shame.detectParameterFromURL("ft");
		}
	}
});

shame.detectParameterFromURL = function(name){
  		name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  		var regexS = "[\\?&]"+name+"=([^&#]*)";
  		var regex = new RegExp( regexS );
  		var results = regex.exec( window.location.href );
  		if( results == null )
    		return null;
  		else
    		return unescape(results[1]);
};