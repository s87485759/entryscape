/*global dojo, dijit, folio*/
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

dojo.provide("hnetfolio.apps.CompetenceStatistics");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

/**
 */
dojo.declare("hnetfolio.apps.CompetenceStatistics", [dijit._Widget, dijit._Templated], {
	//===================================================
	// Inherited Attributes
	//===================================================
	templatePath: dojo.moduleUrl("hnetfolio.apps", "CompetenceStatisticsTemplate.html"),
	widgetsInTemplate: true,
	compLayout: null,
	compData: null,
	EHACurriculumLevel1URI: "http://www.ehaweb.org/rdf/2011-passport#CompetenceLevel1",
	EHACurriculumLevel2URI: "http://www.ehaweb.org/rdf/2011-passport#CompetenceLevel2",
	EHACurriculumLevel3URI: "http://www.ehaweb.org/rdf/2011-passport#CompetenceLevel3",
	
	show: function(params){
		console.log("Exekverar show!");
		this._loadJSONLayoutSchema(dojo.hitch(this, function(data){
			this.compLayout = data;
			this._loadCompetenceStatistics(dojo.hitch(this, function(compDataAsJson){
				this.compData = compDataAsJson;
				this._presentStatistics();
			}));
		}));
	},
	startup: function() {
		this.inherited("startup", arguments);
		this.application = __confolio.application;
		this.baseURI = this.application.getRepository();
	},
	_loadJSONLayoutSchema: function(callback, errback){
		var xhrArgs={
			url: "../vendor-data/hematologynet/json/EHACurriculumForStatisticPurpose.json",
			preventCache: true,
			handleAs: "json-comment-optional",
			load: function(response){
				if(callback){
					callback(response);
				} else {
					console.log("Stat! No callback");
				}
			},
			error: function(response){
				if(errback){
					console.log("Schema! error");
				} else {
					console.log("Schema! error, no errback");
				}
			}
		};
		dojo.xhrGet(xhrArgs);
	},
	_loadCompetenceStatistics: function (callback, errback) {
		var xhrArgs={
			url: this.baseURI+"_principals/statistics/competence",
			preventCache: true,
			handleAs: "json-comment-optional",
			load: function(response){
				if(callback){
					callback(response);
				} else {
					console.log("Stat! No callback");
				}
			},
			error: function(response){
				if(errback){
					console.log("Stat! error");
				} else {
					console.log("Schema! error, no errback");
				}
			}
		};
		var xhrGetAuthArg = this.application.getCommunicator().insertAuthArgs(xhrArgs);
		dojo.xhrGet(xhrArgs);
	},
	_presentStatistics: function(){
		if (this.compLayout !== null && this.compData !== null) {
			var top = dojo.create("div", {innerHTML: "Hematology Curriculum Statistics"}, this.divToUseNode);
			if (this.compData.nrOfPersons){
				dojo.create("div", {innerHTML: "Nr of persons: "+ this.compData.nrOfPersons}, top);
			}
			for(var x in this.compLayout.children){
				var section = this.compLayout.children[x];
				var divForSection = dojo.create("div", {innerHTML: section.label}, top);
				for (var y in section.children){
					var subSection = section.children[y];
					var divForSubSection = dojo.create("div", {innerHTML: subSection.label}, divForSection);
					dojo.style(divForSubSection, "margin", "3px 0px 15px 10px");
					for (var xy in subSection.children){
						var item = subSection.children[xy];
						var id = item.id;
						var itemData = this.compData[id];
						if (itemData) {
							var level1Data = itemData[this.EHACurriculumLevel1URI];
							var level2Data = itemData[this.EHACurriculumLevel2URI];
							var level3Data = itemData[this.EHACurriculumLevel3URI];
						} else { //Reset the values
							level1Data = 0;
							level2Data = 0;
							level3Data = 0;
						}
						level1Data = (level1Data ? level1Data : 0);
						level2Data = (level2Data ? level2Data : 0);
						level3Data = (level3Data ? level3Data : 0);
						var level0Data = this.compData.nrOfPersons - level1Data - level2Data - level3Data;
						
						var level0Percentage = (Math.round(level0Data*10000/this.compData.nrOfPersons)/100);
						var level1Percentage = (Math.round(level1Data*10000/this.compData.nrOfPersons)/100);
						var level2Percentage = (Math.round(level2Data*10000/this.compData.nrOfPersons)/100);
						var level3Percentage = (Math.round(level3Data*10000/this.compData.nrOfPersons)/100);
						
						var toPrint = item.label;
						toPrint += "<table style=\"border:1px solid black;padding:2px;margin:0px 0px 0px 10px;\"><tbody>";
						toPrint += "<tr><td>Level 0 (No value given) &nbsp;</td><td style=\"text-align:right\">&nbsp;"+ level0Percentage+"% </td><td style=\"text-align:right\">&nbsp;("+level0Data+") </td></tr>";
						toPrint += "<tr><td>Level 1 </td><td style=\"text-align:right\">&nbsp;"+ level1Percentage+"% </td><td style=\"text-align:right\">&nbsp;("+level1Data+") </td></tr>";
						toPrint += "<tr><td>Level 2 </td><td style=\"text-align:right\">&nbsp;"+ level2Percentage+"% </td><td style=\"text-align:right\">&nbsp;("+level2Data+") </td></tr>";
						toPrint += "<tr><td>Level 3 </td><td style=\"text-align:right\">&nbsp;"+ level3Percentage+"% </td><td style=\"text-align:right\">&nbsp;("+level3Data+") </td></tr>";
						toPrint += "</table></tbody>";
						var itemDiv = dojo.create("div", {
							innerHTML: toPrint
						}, divForSubSection);
						dojo.style(itemDiv, "margin", "1px 0px 6px 10px");
					}
				}
			}
		}
		else {
			console.log("compLayout or compData is null!");
		}
	}
});