/*
 * Copyright (c) 2007-2010
 *
 * This file is part of Confolio.
 *
 * Confolio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Confolio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Confolio. If not, see <http://www.gnu.org/licenses/>.
 */

dojo.provide("folio.editor.AnnotationProfileEditor");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.Button");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.TabContainer");
dojo.require("shame.FormModel");
dojo.require("shame.engine.VBS2FM");
dojo.require("shame.engine.JDIL2VBS");
dojo.require("shame.engine.FM2JDIL");
dojo.require("folio.Application");
dojo.require("dojox.form.BusyButton");

dojo.declare("folio.editor.AnnotationProfilePresenter", [dijit.layout.ContentPane, dijit._Templated], {
	widgetsInTemplate: true,
	templateString: "<div><div dojoAttachPoint=\"containerNode\"></div></div>",

	startup: function(args) {
		this.inherited("startup", arguments);
		this.loader = new shame.Loader({container: this.containerNode, present: true});
	},
	
	setApplication: function(application) {
		this.application = application;
	},

	updateSHAME: function(entry, showExternal) {
		var graph;
		var ap;
		if (showExternal && entry.isMetadataAccessible()) {
			ap = this.application.getConfig().getMPForExternalMD(entry);
			graph = entry.getExternalMetadata();
/*			if(entry.getBuiltinType() == folio.data.BuiltinType.USER){
				ap = "http://tomcat.knowware.nada.kth.se/formulator/formlet/oefoaf";
				//ap = "http://tomcat.knowware.nada.kth.se/formulator/formlet/hnetfoaf";
			} else if(entry.getBuiltinType() == folio.data.BuiltinType.LIST){
				ap = "http://tomcat.knowware.nada.kth.se/formulator/formlet/FolderAP";
			} else if(entry.getBuiltinType() == folio.data.BuiltinType.GROUP){
				ap = "http://tomcat.knowware.nada.kth.se/formulator/formlet/SCAMFOAFGroup";
			} else if (this.application.repository && entry.getExternalMetadataUri().indexOf(this.application.repository,0)>-1){
				ap = "http://tomcat.knowware.nada.kth.se/formulator/formlet/OELOM";
				//ap = "http://tomcat.knowware.nada.kth.se/formulator/formlet/HNETLOM";
			} else {
			   ap = "http://tomcat.knowware.nada.kth.se/formulator/formlet/SDC";
			   //ap = this.application.dataDir +"jdil/SDC.js";
			}*/
		} else if (entry.isMetadataAccessible()){
			ap = this.application.getConfig().getMPForLocalMD(entry);
			graph = entry.getLocalMetadata();
/*			if(entry.getBuiltinType() == folio.data.BuiltinType.USER){
				ap = "http://tomcat.knowware.nada.kth.se/formulator/formlet/oefoaf";
				//ap = "http://tomcat.knowware.nada.kth.se/formulator/formlet/hnetfoaf";
			} else if(entry.getBuiltinType() == folio.data.BuiltinType.LIST){
				ap = "http://tomcat.knowware.nada.kth.se/formulator/formlet/FolderAP";
			} else if(entry.getBuiltinType() == folio.data.BuiltinType.GROUP){
				ap = "http://tomcat.knowware.nada.kth.se/formulator/formlet/SCAMFOAFGroup";
			} else {
			   //ap = "http://tomcat.knowware.nada.kth.se/formulator/formlet/HNETLOM";
			   ap = "http://tomcat.knowware.nada.kth.se/formulator/formlet/OELOM";
			   //ap = "http://localhost:8080/formulator/formlet/OELOM2";
			   //ap = this.application.dataDir +"jdil/ap4_mod.js";
			}*/
		}
		if (!graph) {
			graph = new jdil.EditableGraph({"@id": entry.getResourceUri()}, entry.getContext().namespaces);
		}
		this.loader.clear();
		this.loader.setFT(ap, dojo.hitch(this, function() { //Get the first arg from this.AnnotationProfile instead.
	      
		  var template = this.loader.getFormTemplate();
		  var arr = template.struct.ontologies;
		  var ontologies;
		  if(arr){
              ontologies = [arr.length];
		      for (var i=0;i<arr.length;i++) {
                var g = new jdil.Graph(arr[i]);
		        ontologies[i] = g;
		      }
          }
	      var vbs = new shame.engine.JDIL2VBS(template, ontologies).convert(graph);
	      var fm = shame.engine.VBS2FM.convert(vbs,template);
	      var formModel = this.loader.setFMStruct(fm);
	   }));
	}
});

dojo.declare("folio.editor.AnnotationProfileEditorPlain", [dijit._Widget, dijit._Templated], {
	widgetsInTemplate: true,
	present: false,
	editState: shame.editState.OPTIONAL,
	templateString: "<div><div dojoAttachPoint='shameForm'></div></div>",
	recommended: false,
	
	postCreate: function() {
		this.inherited("postCreate", arguments);
		if(!this.loaderLoc){
 		   this.loaderLoc = new shame.Loader({container: this.shameForm, present: this.present, editState: this.editState, nrOfTextAreaRows: 5});
		}
	},
	setGraph: function(graph, ap) {
		this.graph = graph;
		this.ap = ap;
		this.loaderLoc.clear();
		this.loaderLoc.setFT(this.ap, dojo.hitch(this, function() { //Get the first arg from this.AnnotationProfile instead.
		      var template = this.loaderLoc.getFormTemplate();
			  var arr = template.struct.ontologies;
			  var ontologies;
			  if(arr){
                  ontologies = [arr.length];
			      for (var i=0;i<arr.length;i++) {
                    var g = new jdil.Graph(arr[i]);
			        ontologies[i] = g;
			      }
              }
		      var vbs = new shame.engine.JDIL2VBS(template, ontologies).convert(this.graph);
		      var fm1 = shame.engine.VBS2FM.convert(vbs,template);
		      this.loaderLoc.setFMStruct(fm1);
		   }));
	},
	isMandatoryMissing: function() {
		return this.loaderLoc.getFormModel().markAndReportIfMissingMandatory();
	},
	getGraph: function() {
		this.loaderLoc.getFormModel().removeEmptyValues();
		var fm2jdil = new shame.engine.FM2JDIL(this.loaderLoc.template, this.graph.namespaces);
		return fm2jdil.convert(this.loaderLoc.getFormModel());
	},
	
	recommendedChange: function() {
		this.recommended = !this.recommended;
		if(this.loaderLoc.getFormModel()){
		   if (this.recommended) {
			   this.loaderLoc.getFormModel().setEditState(shame.editState.RECOMMENDED);
		   } else {
			   this.loaderLoc.getFormModel().setEditState(shame.editState.MANDATORY);			
		   }
		}
		this.editState= shame.editState.RECOMMENDED;
	}	
});


dojo.declare("folio.editor.AnnotationProfileEditor", [dijit.layout.ContentPane, dijit._Templated, folio.ApplicationView], {
	widgetsInTemplate: true,
	presentLocal: false,
	changeToLinkReference: "",
	failedSavingUnsufficientMDRights: "",
	templatePath: dojo.moduleUrl("folio", "editor/AnnotationProfileMinimalTemplate.html"),
	startup: function(args) {
		this.containerNode = this.domNode;
		this.inherited("startup", arguments);
		this.loaderExt = new shame.Loader({container: this.shameFormExternal, present: true});
		this.loaderLoc = new shame.Loader({container: this.shameFormLocal, present: this.presentLocal});
	},
	getSupportedActions: function() {
		return ["showView"];
	},
	handle: function(event) {
		switch (event.action) {
		case "showView":
			this.updateSHAME(event.entry);
			break;
		}
	},
	updateSHAME: function(entry) {
		this.clearForms();
		this.entry = entry;
		this.annotationProfile = this.application.getConfig().getMPForLocalMD(entry);

		/*if(!this.annotationProfile){
		   //this.annotationProfile = "http://tomcat.knowware.nada.kth.se/formulator/formlet/HNETLOM";
		  this.annotationProfile = "http://tomcat.knowware.nada.kth.se/formulator/formlet/OELOM";
		   //this.annotationProfile = "http://localhost:8080/formulator/formlet/OELOM2";
		   //this.annotationProfile = this.application.dataDir +"jdil/ap4.js";
		}*/

		this.metadata = this.entry.getLocalMetadata();
		if (!this.metadata) {
			this.metadata = new jdil.EditableGraph({"@id": entry.getResourceUri()}, entry.getContext().namespaces);			
		}
		this.changeToLinkReference = this.entry.getLocationType() == folio.data.LocationType.REFERENCE;
		this.loaderLoc.setFT(this.annotationProfile, dojo.hitch(this, function() { //Get the first arg from this.AnnotationProfile instead.
		      var template = this.loaderLoc.getFormTemplate();
			  var arr = template.struct.ontologies;
			  var ontologies;
			  if(arr){
                  ontologies = [arr.length];
			      for (var i=0;i<arr.length;i++) {
                    var g = new jdil.Graph(arr[i]);
			        ontologies[i] = g;
			      }
              }
		      var vbs = new shame.engine.JDIL2VBS(template, ontologies).convert(this.metadata);
		      var fm1 = shame.engine.VBS2FM.convert(vbs,template);
		      var formModel = this.loaderLoc.setFMStruct(fm1);
		   }));
		if (folio.data.isReference(this.entry)) {
			var apToUse = 	this.application.getConfig().getMPForExternalMD(entry);
/*			var apToUse = 'http://tomcat.knowware.nada.kth.se/formulator/formlet/SDC';
		    if(entry.getBuiltinType() == folio.data.BuiltinType.USER){
				apToUse = 'http://tomcat.knowware.nada.kth.se/formulator/formlet/oefoaf';
				//apToUse = "http://tomcat.knowware.nada.kth.se/formulator/formlet/hnetfoaf";
			} else if(entry.getBuiltinType() == folio.data.BuiltinType.LIST){
				apToUse = "http://tomcat.knowware.nada.kth.se/formulator/formlet/FolderAP";
			} else if(entry.getBuiltinType() == folio.data.BuiltinType.GROUP){
				apToUse = "http://tomcat.knowware.nada.kth.se/formulator/formlet/SCAMFOAFGroup";
			} else if(this.application.repository && entry.getExternalMetadataUri().indexOf(this.application.repository,0)>-1){
				apToUse = "http://tomcat.knowware.nada.kth.se/formulator/formlet/OELOM";
			}*/
			this.loaderExt.setFT(apToUse, dojo.hitch(this, function() { //Get the first arg from this.AnnotationProfile instead.
			      var template = this.loaderExt.getFormTemplate();
			      var ontologies = [];//new jdil.Graph({   //How do we get the ontologies?
				//		"@id": "dcterms:author", 
				//		"*rdfs:subclassOf": "dcterms:contributor"
				//	})];
			      var vbs = new shame.engine.JDIL2VBS(template, ontologies).convert(this.entry.getExternalMetadata());
			      var fm1 = shame.engine.VBS2FM.convert(vbs,template);
			      var formModel = this.loaderExt.setFMStruct(fm1);
			   }));			
		}		
	},
	clearForms: function() {
		this.loaderLoc.clear();
		this.loaderExt.clear();
		if(this.warningArea){
			this.warningArea.set('content', ' ');
		}
	},
	saveEdited: function(onSuc, onErr) {
		var f = dojo.hitch(this, function() {
			var onSuccess = dojo.hitch(this, function(){
				this.clearForms();
				this.entry.refresh(dojo.hitch(this, function(){
					this.application.dispatch({action: "changed", entry: this.entry, source: this});
				}));
				if (onSuc) {
					onSuc();					
				}
			});
			var onError = dojo.hitch(this, function(message){
				this.clearForms();
				if(message.status===412){
					this.application.message(this.modifiedPreviouslyOnServer);
				} else { 
				    this.application.message(this.failedSavingUnsufficientMDRights);
				}
				if (onErr) {
					onErr();					
				}
			}); 
			var theLoader = this.loaderLoc;
			theLoader.getFormModel().removeEmptyValues();
			var fm2jdil = new shame.engine.FM2JDIL(this.loaderLoc.template, this.entry.getContext().namespaces);
			var graph = fm2jdil.convert(theLoader.getFormModel());
			var modDate = dojo.date.stamp.fromISOString(this.entry.getModificationDate());
			
			this.entry.getContext().communicator.saveJSONIfUnmodified(
					this.entry.getLocalMetadataUri(), 
					{metadata: graph.getRoot()}, modDate.toUTCString(),
					onSuccess, onError);
			/*this.entry.getContext().communicator.saveJSONFormModel(
					this.entry.getLocalMetadataUri(), 
					theLoader.getFormModel(), 
					this.annotationprofile,
					onSuccess, onError);*/
		});
		/*if (this.changeToLinkReference) {
			var entryURI = this.entry.info.getRoot()["@id"];
			this.entry.info.remove(entryURI, folio.data.RDFSchema.TYPE, this.entry.info.getFirstObject(folio.data.RDFSchema.TYPE));
			this.entry.info.add(entryURI, folio.data.RDFSchema.TYPE, {"@id": folio.data.LocationTypeSchema.LINK_REFERENCE});
			this.entry.saveInfo(dojo.hitch(this,function(){
				  this.entry.setRefreshNeeded();
				  this.entry.refresh(dojo.hitch(this, function(){f();})); //TODO: Maybe set the modification-date in the client, though it is probably overwritten on the server.
				}), 
				dojo.hitch(this, function() {
				  this.application.message(this.changeToLinkReference);
			}));
		} else {*/
			f();
		//} The change from REFERENCE to LINK_REFERENCE is now done on the server-side when PUT is done on Local MD 
	}
});


dojo.declare("folio.editor.AnnotationProfileEditorDialog", folio.editor.AnnotationProfileEditor, {
	dialogTitle: "",
	dialogCancelLabel: "",
	dialogDoneLabel: "",
	dialogDoneBusyLabel: "",
	dataLabel: "",
	mandatoryLabel: "",
	recommededLabel: "",
	optionalLabel: "",
	colorLabel: "",
	readyForValidationLabel: "",
	optional: false,
	recommended: true,
	attributeMap: dojo.mixin(dojo.clone(dijit.layout.ContentPane.prototype.attributeMap), {
        mandatoryLabel: {node: "mandatoryLabelNode", type: "innerHTML"},
        recommendedLabel: {node: "recommendedLabelNode", type: "innerHTML"},
        optionalLabel: {node: "optionalLabelNode", type: "innerHTML"},
        colorLabel: {node: "colorLabelNode", type: "innerHTML"},
        shameMessageLabel: {node: "shameMessageNode", type: "innerHTML"},
        readyForValidationLabel: {node: "validationReadyLabelNode", type: "innerHTML"}
	}),
	templatePath: dojo.moduleUrl("folio", "editor/AnnotationProfileTemplates.html"),
	widgetsInTemplate: true,
	
	getSupportedActions: function() {
		return ["showMDEditor", "localeChange"];
	},
	startup: function(args) {
		this.inherited("startup", arguments);
		this.readyForValidation = false;
	},
	handle: function(event) {
// I call updateshame below in showView directly instead.
//		this.inherited("handle", arguments);
		switch (event.action) {
		case "showMDEditor":
			this.dataLabel = folio.data.getLabel(event.entry);
			this.setNiceTitle(this.dialogTitle+this.dataLabel);
			switch (event.entry.getLocationType()) {
			case folio.data.LocationType.LOCAL:
				dojo.style(this.externalMD.domNode, "width", "0%");
				break;
			case folio.data.LocationType.LINK:
				dojo.style(this.externalMD.domNode, "width", "0%");
				break;
			case folio.data.LocationType.LINK_REFERENCE:
				dojo.style(this.externalMD.domNode, "width", "40%");
				break;
			case folio.data.LocationType.REFERENCE:
				//Since you opened the editor, you should see the editor 
				//even if there is no metadata there right now.
				dojo.style(this.externalMD.domNode, "width", "40%");                                                   
				break;
			}
			var viewport = dijit.getViewport();
			dojo.style(this.bc.domNode, {
                                        width: Math.floor(viewport.w * 0.70)+"px",
                                        height: Math.floor(viewport.h * 0.70)+"px",
                                        overflow: "auto",
                                        position: "relative"    // workaround IE bug moving scrollbar or dragging dialog
                                });
			this.bc.layout();
			this.bc.resize();
			this.dialog.show();
			
			setTimeout(dojo.hitch(this, function() {
			this.shameMessageNode.style.display="";
			this.annotationProfile = this.application.getConfig().getMPForLocalMD(event.entry);
/*			switch(event.entry.getBuiltinType()){
				case folio.data.BuiltinType.NONE:
				   //this.annotationProfile = "http://tomcat.knowware.nada.kth.se/formulator/formlet/HNETLOM";
			        this.annotationProfile = "http://tomcat.knowware.nada.kth.se/formulator/formlet/OELOM";
			        //this.annotationProfile = "http://localhost:8080/formulator/formlet/OELOM2";
			        //this.annotationProfile = this.application.dataDir +"jdil/ap4_mod.js";
					break;
				case folio.data.BuiltinType.USER: 
					this.annotationProfile = "http://tomcat.knowware.nada.kth.se/formulator/formlet/oefoaf";
					break;
				case folio.data.BuiltinType.GROUP:
				    this.annotationProfile = "http://tomcat.knowware.nada.kth.se/formulator/formlet/SCAMFOAFGroup";
				    break;
				default:
				   this.annotationProfile = "http://tomcat.knowware.nada.kth.se/formulator/formlet/FolderAP";				   	
			}*/
			//Done after, so that dialog should be launched as soon as possible.

			var editState = this.optional ? shame.editState.OPTIONAL 
				: this.recommended ? shame.editState.RECOMMENDED
				:shame.editState.MANDATORY;
			console.log("shameupdate1");
			this.loaderLoc = new shame.Loader({container: this.shameFormDiv, editState: editState, present: this.presentLocal});
			console.log("shameupdate2");
			this.updateSHAME(event.entry);
			console.log("shameupdate3");
			this.shameMessageNode.style.display="none";
			}), 200);
			
			this.readyForValidation = false;		
			if(event.entry && event.entry.info.getObject("http://scam.sf.net/schema#status", event.entry.info.getRoot())){
				if (event.entry.info.getFirstObjectValue("http://scam.sf.net/schema#status", event.entry.info.getRoot()) === "annotated"){
					this.readyForValidation = true;
				}
			}
			this.validationReady.onChange = dojo.hitch(this,function(){
				this.readyForValidation = this.validationReady.checked;
				if(this.readyForValidation){
					var isStatusUpdated = folio.data.updateStatus(event.entry.info, "annotated");
				} else {
					isStatusUpdated = folio.data.updateStatus(event.entry.info);
				}
				if (isStatusUpdated>0) {
					this.reviewFlagChanged = true;
				}
			});
			this.validationReady.setValue(this.readyForValidation);
			break;
		case "localeChange":
			this.localize();
			this.setNiceTitle(this.dialogTitle+this.dataLabel);
			break;
		}		
	},
	recommendedChange: function() {
		this.recommended = !this.recommended;
		if (this.recommended) {
			this.loaderLoc.getFormModel().setEditState(shame.editState.RECOMMENDED);
		} else {
			this.loaderLoc.getFormModel().setEditState(shame.editState.MANDATORY);			
		}
	},
	optionalChange: function() {
		this.optional = !this.optional;
		this.recommendedCheckBox.set("disabled", this.optional);
		if (this.optional) {
			this.recommendedCheckBox.set("checked", true);
			this.loaderLoc.getFormModel().setEditState(shame.editState.OPTIONAL);
		} else {
			this.loaderLoc.getFormModel().setEditState(shame.editState.RECOMMENDED);			
		}
	},
	editStateColorChange: function() {
		dojo.toggleClass(this.bc.domNode, "editStateColor");
	},
	cancelPressed: function() {
		this.dialog.hide();
		this.clearForms();
	},
	donePressed: function() {
		var isReference =  (this.entry.getLocationType() == folio.data.LocationType.REFERENCE || 
		                              this.entry.getLocationType() == folio.data.LocationType.LINK_REFERENCE);
		if(!isReference){							  
		   var mandatoryNotOK = this.loaderLoc.getFormModel().markAndReportIfMissingMandatory();
		      if(mandatoryNotOK){
			     this.dialogDone.cancel();
			     this.warningArea.set('content', this.resourceBundle.mandatoryElementsMissing);
			     return;
			  }
		} else {
			mandatoryNotOK = this.loaderLoc.getFormModel().markAndReportIfMissingMandatory(1);
			if(mandatoryNotOK){
			     this.dialogDone.cancel();
			     this.warningArea.set('content', this.resourceBundle.mandatoryElementsMissing);
			     return;
			  }
		}
		this.saveEdited(dojo.hitch(this, function() {
			if (!this.changeToLinkReference && this.reviewFlagChanged) {
				this.entry.saveInfo();				
			}
			this.dialogDone.cancel();
			this.dialog.hide();
			this.reviewFlagChanged = false;
			this.application.getStore().updateReferencesTo(this.entry);
		}), dojo.hitch(this, function() {
			this.dialogDone.cancel();
			this.dialog.hide();
		}));
	},
	setNiceTitle: function(mesg) {
		this.dialog.titleNode.innerHTML = mesg;
	},
	postCreate: function() {
		this.inherited("postCreate", arguments);
		var self = this;
		dojo.connect(this.dialog, "onCancel", this, this.cancelPressed);
/*		this.dialog.onCancel= function() {
			this.inherited('onCancel', arguments);
			self.cancelPressed();
		};*/		
		this.localize();
	},
	localize: function() {
		dojo.requireLocalization("folio", "annotationProfile");
		this.resourceBundle = dojo.i18n.getLocalization("folio", "annotationProfile");
		if (this.resourceBundle) {
			this.set(this.resourceBundle);
		}
		if (this.loaderLoc) {
			this.loaderLoc.localeChanged();			
		}
		if (this.loaderExt) {
			this.loaderExt.localeChanged();			
		}
	},
	_setDialogCancelLabelAttr: function(value) {
		this.dialogCancel.set("label", value);
		this.dialogCancelLabel = value;
	},
	_setDialogDoneLabelAttr: function(value) {
		this.dialogDone.set("label", value);
		this.dialogDone._label = value; //Seems like a bug in BusyButton
		this.dialogDoneLabel = value;
	},
	_setDialogDoneBusyLabelAttr: function(value) {
		this.dialogDone.set("busyLabel", value);
		this.dialogDoneBusyLabel = value;
	}
});