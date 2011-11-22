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

dojo.provide("hnetfolio.editor.CurriculumProfileEditor");
dojo.require("dijit._Templated");
dojo.require("dijit._Widget");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.layout.ContentPane");



dojo.declare("hnetfolio.editor.CurriculumProfileEditor", [dijit._Widget, dijit._Templated], {
	//===================================================
	// Inherited Attributes
	//===================================================
	templatePath: dojo.moduleUrl("hnetfolio.editor", "CurriculumProfileEditorTemplate.html"),
	widgetsInTemplate: true,
	
	setUserEntry: function(userEntry){
		this.entry = userEntry;
	},
	constructor: function() {
		this.application = __confolio.application;
	},
	show: function(apToUse) {
		this.inherited("show", arguments);
		
		var competenceEntryURI = this._hasCompetenceEntry(this.entry);
		//Callback-function to use...
		var f = dojo.hitch(this, function(loadedEntry){
			this.compEntry = loadedEntry;
			this.CurriculumContentDijit.setIncludeLevel("recommended");
			this.application.getItemStore(dojo.hitch(this, function(itemStore) {
				var ap = itemStore.getTemplate(this.currentCompAP || "EHACurriculumV2Part1");
				this.CurriculumContentDijit.show(loadedEntry.getLocalMetadata(), this.compEntry, this.compEntry.getResourceUri(), ap);
			}));
			dojo.style(this.createPane.domNode, "display", "none");
			dojo.style(this.curriculumCP.domNode, "display", "block");
			dojo.style(this.CurriculumContentDijit.domNode, "display", "block");		
		});
		if (competenceEntryURI) {
			var competenceEntryObject = {
				"uri": competenceEntryURI
			}
			folio.data._normalizeEntryInfo(competenceEntryObject);
			this.application.getStore().loadEntry(competenceEntryObject, {}, function(entry){
				if (entry.resource == null) {
					entry.setRefreshNeeded();
					entry.refresh(f);
				}
				else {
					f(entry);
				}
			});
		}
	},
	_hasCompetenceEntry: function(entry){
		var relations = entry.getRelation();//Is a graph...
		var resultArray = relations.find(null,folio.data.SCAMBaseUri+"aboutPerson",{"type":"uri","value":this.entry.getResourceUri()})
		if(resultArray.length<1){
			return false;
		}
		return resultArray[0]._s; //There should only be one!
	},
	createCompClicked: function(){
		console.log("Create clicked!");
		//this.rformsCompetenceEditor = new folio.editor.RFormsEditorPlain({});
		dojo.style(this.createPane.domNode, "display", "none");
		var f = dojo.hitch(this, function(loadedEntry){
			this.CurriculumContentDijit.setIncludeLevel("recommended");
			this.compEntry = loadedEntry;
			this.application.getItemStore(dojo.hitch(this, function(itemStore) {
				var ap = itemStore.getTemplate(this.currentCompAP||"EHACurriculumV2Part1");
				this.CurriculumContentDijit.show(loadedEntry.getLocalMetadata().exportRDFJSON(), this.compEntry.getResourceUri(), ap);
				dojo.style(this.CurriculumContentDijit.domNode, "display", "block");
				dojo.style(this.curriculumCP.domNode, "display", "block");
			}));		
		});
		this._createCompetenceEntry(f);
		
	},
	_createCompetenceEntry: function(loadCallback, errCallback){
		
		var homeContext = this.application.getStore().getContext(this.entry.entryInfo.base+this.entry.getResource().homecontext);
		var metadataGraph = new rdfjson.Graph();
		metadataGraph.create(homeContext.getBase() + homeContext.getId()+"/resource/_newId", 
		                     folio.data.SCAMBaseUri+"aboutPerson",
							 {"type":"uri","value":this.entry.getResourceUri()}, true);
		metadataGraph.create(homeContext.getBase() + homeContext.getId()+"/resource/_newId", 
		                     folio.data.DCTermsSchema.TITLE,
							 {
							 	"type": "literal",
							 	"value": "My Competence Profile"
							 }, true);
		
		var co = {"context": homeContext};
				co.metadata = metadataGraph.exportRDFJSON();
				//TODO: Put in the competence-list
				homeContext.createEntry(co, dojo.hitch(this, function(result) {
					loadCallback(result);
					this.makeEntryPrivate(result);
					this.entry.refresh();
				}),
				dojo.hitch(function(result){
					errCallback(result);
				})
			);
	},
	saveClicked: function() {
		var md = this.CurriculumContentDijit.getMetadata();
		this.application.getCommunicator().saveJSON(this.compEntry.getLocalMetadataUri(), md, dojo.hitch(this, function(){
			this.saveButtonDijit.cancel();
			this.compEntry.refresh();
		}));
	},
	makeEntryPrivate: function(entry){
		var infoGraph = entry.getInfo();
		infoGraph.create(entry.getUri(),folio.data.SCAMSchema.WRITE,{"type":"uri", value:this.entry.getResourceUri()});
		infoGraph.create(entry.getLocalMetadataUri(),folio.data.SCAMSchema.WRITE,{"type":"uri", value:this.entry.getResourceUri()});
		infoGraph.create(entry.getLocalMetadataUri(),folio.data.SCAMSchema.READ,{"type":"uri", value:this.entry.getResourceUri()});
		infoGraph.create(entry.getResourceUri(),folio.data.SCAMSchema.WRITE,{"type":"uri", value:this.entry.getResourceUri()});
		infoGraph.create(entry.getResourceUri(),folio.data.SCAMSchema.READ,{"type":"uri", value:this.entry.getResourceUri()});
		this.application.getCommunicator().saveJSON(entry.getUri(),{info:infoGraph.exportRDFJSON()});
	},
	_viewChange: function(value){
		if (value==="info"){
			dojo.style(this.infoContentPane.domNode,"display","block");
			dojo.style(this.myProfileCP.domNode, "display", "none");
		}else {
			dojo.style(this.infoContentPane.domNode,"display","none");
			this.currentCompAP = 'EHACurriculumV2Part'+value;
			this.show(this.currentCompAP);
			dojo.style(this.myProfileCP.domNode, "display", "block");
		}
	}
});