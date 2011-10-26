dojo._hasResource["shame.meditor.Meditor"] = true;
dojo.provide("shame.meditor.Meditor");
dojo.require("shame.meditor.ResourceList");
dojo.require("dijit.layout.LayoutContainer");
dojo.require("dijit.Toolbar");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.form.Button");
dojo.require("dijit.Dialog");
dojo.require("dijit.ProgressBar");

dojo.declare("shame.meditor.Meditor", [dijit._Widget, dijit._Templated], {
	templatePath: dojo.moduleUrl("shame.meditor", "meditorTemplate.html"),
    widgetsInTemplate: true,
	constructor: function(parameters, srcNodeRef) {
		// srcNodeRef a reference to a dom node where the Meditor are to be inserted.
		// parameters is an object of additional parameters.
		//   connector must be provided as a shame.CommonConnector (where the function setResource is defined).
		//   listConnector is an instance of shame.ResourceListConnector which is responsible for loading the list.
		//   listURL is a url from where a static list can be loaded, may be given instead of the listConnector.
		
		if (parameters.repositoryConnector) {
			this.repositoryConnector = parameters.repositoryConnector;
		} else if (parameters.listURL) {
			this.repositoryConnector = new shame.meditor.FixedListConnector(parameters.listURL);
		}
		
		this.connector = parameters.connector;
		this.selectionRow = -1;
		if(parameters.loader){
			this.loader = parameters.loader;
		}else{
			this.loader = new shame.Loader();
		}
		this.loader.addEditListeners(this);
		this.connector.setLoader(this.loader);
	},
	postCreate: function() {
		this.inherited("postCreate", arguments);
		
		var self = this;
		
		if (this.repositoryConnector.canRequestNewURI()) {
			this.newButton.onClick = function() {
				self.initSaveDialog(function() {
					self.showLoadingDialog('Creating new resource');
					self.repositoryConnector.getNewURI(function(uri) {
						self.connector.setResource(uri);
						var fmurl = self.connector.getFormModelURL();
						if(self.loader.getFormTemplate() == null){
							self.loader.setFT(self.connector.getFormTemplateURL());	
						}
						self.loader.clear();
						self.loader.createNew(uri,fmurl);
						self.updateButtons();
						self.hideLoadingDialog('Finished');
					});
				});
			};
		} else {
			this.newButton.setDisabled(true);
		}

		this.deleteDialogOk.onClick = function() {
			self.deleteDialog.hide();
			self.loader.getFormModel().clear();
			self.loader.save(function() {
				self.repositoryConnector.loadList();
			 	self.loader.clear();
				self.updateButtons();
			},
			function(type,err) {
				self.errorDialogMessage.setContent(type + err);
				self.errorDialog.show();
				self.revertSelection();
				self.updateButtons();
			});
		};

		this.clearButton.onClick = function() {
			self.clearDialog.show();
		};
		
		this.clearDialogYes.onClick = function(){
			self.clearDialog.hide();
			self.loader.getFormModel().clear();
			self.loader.getFormModel().generateHtml();
			self.loader.getFormModel().createMissing();			
			self.updateButtons();
	    };
		
		this.clearDialogNo.onClick = function(){
			self.clearDialog.hide();
		};
		
		this.clearButton.setDisabled(true);

		this.deleteDialogCancel.onClick = function() {
			self.deleteDialog.hide();			
		};

		this.deleteButton.onClick = function() {
			self.deleteDialog.show();
		};
		this.deleteButton.setDisabled(true);

		this.saveButton.onClick = function() {
            self.showLoadingDialog('Saving...');
		    self.loader.save(function() {
		    	self.updateButtons();
				self.hideLoadingDialog();
		    }, 
		    function(type, err) {
				self.hideLoadingDialog();
				self.errorDialogMessage.setContent(type + err);
				self.errorDialog.show();
				self.revertSelection();
		    });
		};
		this.saveButton.setDisabled(true);

		this.reloadButton.onClick = function() {
		    self.initSaveDialog(function() {
				self.showLoadingDialog('Reloading list');
				self.repositoryConnector.loadList(function(){
				    self.hideLoadingDialog('List loaded');
				},
				function(msg){
					if(msg){
					   self.errorLoadingDialog(msg);
					} else {
						self.errorLoadingDialog('Could not load list');
					}
				});
				self.loader.clear();
		    	self.updateButtons();
		    });		    
		};
		this.reloadButton.setDisabled(false);

		this.errorDialogOk.onClick = function() {
			self.errorDialog.hide();
		};
		
		this.aboutButton.onClick = function() {
			self.aboutDialog.show();
		}
		
		this.aboutDialogOK.onClick = function() {
			self.aboutDialog.hide();
		}
		
		this.formCP.setContent(this.loader.domNode);

        this.repositoryConnector.setResourceList(this.resourceList);
		dojo.connect(this.resourceList, "onRowClick", function(e) {
				self.initSaveDialog(function() {
					self.connector.setResource(self.resourceList.getResource(e.rowIndex));
					if (self.connector.operational()) {
                        self.showLoadingDialog('Loading...');
						self.connector.load(function () {
							self.updateButtons();
							self.hideLoadingDialog();
						},
						function(msg) {
							if(msg){
								self.errorLoadingDialog(msg);
							} else{
		                        self.errorLoadingDialog('Unable to load resource');
							}
		               });
					}
				});
			});
		this.repositoryConnector.loadList();
	},
	updateButtons: function() {
		this.deleteButton.setDisabled(this.loader.getFormModel() == null || this.loader.isNew());
		this.reloadButton.setDisabled(this.loader.getFormModel() == null || this.loader.isNew());
		this.newButton.setDisabled(this.loader.isNew());
		this.saveButton.setDisabled(this.loader.getFormModel() == null || !this.loader.getFormModel().isEdited());
		this.clearButton.setDisabled(this.loader.getFormModel() == null);
		if (this.grid) {
			this.selectionRow = this.grid.selection.getFirstSelected();
		} else {
			this.selectionRow;
		}
	},
	editNotification: function() {
		this.updateButtons();
	},
	initSaveDialog: function(action) {
		var self = this;
		if (self.loader.getFormModel() != null && self.loader.getFormModel().isEdited()) {
			self.saveDialogCancel.onClick = function() {
				self.saveDialog.hide();
				self.revertSelection();
			};
			self.saveDialogDiscard.onClick = function() {
				action();
				self.saveDialog.hide();
			};
			self.saveDialogSave.onClick = function() {
				self.loader.save(function() {
					action();
					self.saveDialog.hide();
				}, function(type, err) {
					self.saveDialog.hide();
					errorLoadingDialog('Could not save...');
					self.errorDialogMessage.setContent(type + err);
					self.errorDialog.show();
					self.revertSelection();
				});
			};
			self.saveDialog.show();
		} else {
			action();
		}
	},
	revertSelection: function() {
		if (this.selectionRow != -1 && this.grid != null) {
			this.grid.selection.select(this.selectionRow);
		}
	},
	showLoadingDialog: function(msg){
		var self = this;
		if(msg){
		   self.progressLabel.setContent(msg);
		}
		self.progBar.update({indeterminate: true});
		self.loadingDialog.show();
	},
	hideLoadingDialog: function(msg){
		var self = this;
		// Stop the indeterminate bar
		self.progBar.update({indeterminate: false});
		self.progBar.update({ progress: "100%" });
		if(msg){
			self.progressLabel.setContent(msg);
		}else{
			self.progressLabel.setContent('Finished');
		}
		self.loadingDialog.hide();
	},
	errorLoadingDialog: function(msg){
		var self = this;
		// Stop the indeterminate bar
		self.progBar.update({indeterminate: false});
		self.progBar.update({ progress: "0%" });
		if(msg){
			self.progressLabel.setContent(msg);
		}else{
			self.progressLabel.setContent('Failed...');
		}
		self.loadingDialog.hide();
		if(msg){
			self.errorDialogMessage.setContent(msg);
		}else{
			self.errorDialogMessage.setContent('Unknown error');
		}
		self.errorDialog.show();
		
	}
});