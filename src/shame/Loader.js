dojo._hasResource["shame.Loader"] = true;
dojo.provide("shame.Loader");
dojo.require("shame.FormTemplate");
dojo.require("shame.FormModel");
dojo.require("shame.Connector");
dojo.require("shame.ControlPanel");

dojo.declare("shame.Loader", null, {
	constructor: function(parameters) {
		//parameters is an javascript object containing all the parameters 
		// to the Loader, this way we adress them using attribute names instead 
		// of order in function call (dojo inspired).
		// 
		// The parameters are:
		//  container: the htmlElement to use for the form, 
		//    either an identifier or a node. 
		//    If left out, a htmlNode with id "shameForm" will be assumed.
		//  present: if true starts the form in presentation mode.
		//  formTemplateURL: an initial formTemplateURL
		//  formModelURL: an initial formModelURL
		//  initalConnector: an connector for detecting initial values for formTemplateURL 
		//          and formModelURL if they are not given explicitly.
		//  
		// 
		if (typeof parameters == "undefined") {
			parameters = {};
		}
		if (dojo.isString(parameters.container)) {
			this.domNode = dojo.byId(parameters.container);
		} else if (parameters.container != null){
				this.domNode = parameters.container;
		} else {
			this.domNode = dojo.byId("shameForm");
			if (this.domNode == null) {
				this.domNode = document.createElement("div");
			}
		}
		this.present = parameters.present;
		this.editState = parameters.editState;
		this.useFormulatorService = parameters.useFormulatorService == undefined ? true : parameters.useFormulatorService;

		this.newResource = false;
		this.fmstruct = null;
		this.ftstruct = null;
		if (!shame.FormTemplateStoreSingleton) {
			shame.FormTemplateStoreSingleton = new shame.FormTemplateStore();
		}
		this.ftstore = shame.FormTemplateStoreSingleton;
		this.editListeners = [];
		if (parameters.initialConnector instanceof shame.Connector) {
			this.connector = parameters.initialConnector;
			this.connector.setLoader(this);
		} else {
			this.connector = new shame.DetectParameterConnector(this, this.domNode, parameters);
		}
		
		if(parameters.nrOfTextAreaRows){
			this.nrOfTextAreaRows = parameters.nrOfTextAreaRows;
		}
		if (this.connector.operational()) {
			this.connector.load();
			this.detected = true;
		}
	},
	localeChanged: function() {
		this.ftstore.localeChanged();
	},
	isEmpty: function() {
		return !this.detected;
	},
	setFMStruct: function(fmstruct) {
		this.fmstruct = fmstruct;
		this.maybeContinue();
	},
	setFM: function(fmurl, callback, errorCallback) {
		this.fmurl = fmurl;
		var self = this;
		this.fmstruct = null;
		this.formModel = null;
		dojo.xhrGet( {
        		url: fmurl,
        		handleAs: "json",
        		load: function(responseObject, ioArgs) {
//					console.debug("FormModel struct found");
					self.fmstruct = responseObject;
					self.newResource = false;
					self.maybeContinue();
					if (callback) {
						callback();
					}
          			return responseObject;
 			       },
				error: function (response){
					if(errorCallback){
						errorCallback('Unable to load this Form (-Model) ' + response);
					}
				}
			}); 
	},
	setFT: function(fturl, callback) {
		/*if (this.fturl == fturl) {
			if (callback) {
               callback(this.template);
           }
		   return;
		}*/
		this.template = null;
		var self = this;
		var f =  function(template) {
//				console.debug("FormTemplate struct found");
				self.fturl = fturl;
				self.template = template;
				self.maybeContinue();
				if (callback) {
					callback(template);
				}
 			};
		if (this.useFormulatorService) {
			this.ftstore.fetchRemote(fturl,f);			
		} else {
			this.ftstore.fetch(fturl,f);
		}
	},
	maybeContinue: function() {
		if (this.fmstruct != null && this.template != null) {
			var parameters = {
					struct: this.fmstruct,
					template: this.template,
					container: this.domNode,
					editState: this.editState,
					nrOfTextAreaRows: this.nrOfTextAreaRows
				};
			if (this.present) {
				this.formModel = new shame.PresentationFormModel(parameters);
			} else {
				this.formModel = new shame.EditingFormModel(parameters);				
			}
			this.formModel.addEditListeners(this);
		}
	},
	getFormModel: function() {
		if (this.formModel) {
			return this.formModel;
		}
		return null;
	},
	getFormTemplate: function() {
		if (this.template) {
			return this.template;
		}
		return null;
	},
	changeMode: function() {
		this.present = !this.present;
		while(this.domNode.hasChildNodes()) {  
			this.domNode.removeChild(this.domNode.firstChild);
		}
		this.maybeContinue();
	},
	clear: function() {
//		console.debug("Clearing html");
		this.formModel = null;
		this.fmstruct = null;
		this.newResource = false;
		while(this.domNode.hasChildNodes()) {  
			this.domNode.removeChild(this.domNode.firstChild);
		}
	},
	createNew: function(resourceURI,fmu) {
		if (this.template) {
			this.clear();
			this.fmurl = fmu;
			this.fmstruct = {r: this.template.getRootNode().getId(), d: {v: resourceURI}, c: []};
			this.newResource = true;
			this.maybeContinue();
		}
	},
	isNew: function() {
		return this.newResource;
	},
	save: function(onSuccess, onFailure) {
//		console.debug("Save clicked");
		var self = this;
		dojo.rawXhrPost({
			url: this.fmurl,
   			handleAs: "json",
   			headers: {"Content-Type": "application/json"},
   			postData: dojo.toJson(self.formModel.struct),
			load: function(type,data) { 
//				console.debug("succeeded"); 
				self.newResource = false;
				self.getFormModel().setEdited(false);
				if (onSuccess) {
					onSuccess();
				}
			},
   			error: function(type, data) {
   				console.debug(data);
   				if (onFailure) {
   					onFailure(type, data);
   				}
   			}
		});
	},
	addEditListeners: function(listener) {
		this.editListeners.push(listener);
	},
	editNotification: function() {
		var index;
		for (index in this.editListeners) {
			this.editListeners[index].editNotification();
		}
	} 
});