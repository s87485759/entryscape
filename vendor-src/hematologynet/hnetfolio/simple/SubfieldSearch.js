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

dojo.provide("hnetfolio.simple.SubfieldSearch");
dojo.require("dijit.form.Button");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare("hnetfolio.simple.SubfieldSearch", [dijit.layout.ContentPane, dijit._Templated, folio.ApplicationView], {
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("hnetfolio", "simple/SubfieldSearchTemplate.html"),
	postCreate: function() {
		this.inherited("postCreate", arguments);
		this.nrOfRows = 0;
		this.urlArray = [];
		this.levelUrlArray = [];
		var tmpNode = dojo.byId("subfieldTableBody");
        var newRow = tmpNode.insertRow(0);
		var newCell = newRow.insertCell(0);
		var newCell1 = newRow.insertCell(1);
		newCell.align = 'center';
		newCell1.align = 'center';
		
		var newCellContent = document.createElement("b");
		newCellContent.appendChild(document.createTextNode('EHA Passport Subfield'));
		newCell.appendChild(newCellContent);
		
		/*var newCell1Content = document.createElement("b");
		newCell1Content.appendChild(document.createTextNode('Level (Optional)'));
		newCell1.appendChild(newCell1Content);*/
		
		this.setNiceTitle("EHA Passport subfield search");
	},
	startup: function(args){
		this.inherited("startup", arguments);
	},
	showSubfieldSearchDialog: function(app){
		this.application = app;
		this.addRow();
		this.subfieldSearchDialog.show();
	},
	onFinish: function() {
		this.subfieldSearchDialog.hide();
		this.dialogSearch.cancel();
		this.clean();
	},
	_getTreeStore: function() {
		if(this.treeStore){
			return this.treeStore;
		}
		var store = new hnetfolio.simple.SortedTreeStore({
			url: "../vendor-data/hematologynet/json/SubfieldThirdLevelTree.json"
		});
		this.treeStore = store;
		return this.treeStore;
	},
	addRow: function () {
		//Creating the dropdown-button
		var el = document.createElement("div");
		el.innerHTML = "<div dojoType=\"dijit.form.DropDownButton\" width=\"100%\">"+
									"<div>Browse</div>"+
									"<div dojoType=\"dijit.TooltipDialog\">"+
									"</div>"+
							   "</div>";
        var parsning = dojo.parser.parse(el);
		var row = parsning[0];
		
		//Locating and inserting into the table
        var tmpNode = dojo.byId("subfieldTableBody");
        var newRow = tmpNode.insertRow(1);
		var newCell = newRow.insertCell(0);
		newCell.appendChild(row.domNode);
		
		//Creating tree to add to the dropdown-button
		var treeStore = this._getTreeStore();
		var tree = new dijit.Tree({store: treeStore, 
								childrenAttr: ["children"], 
								query: {top: true}});
		
		parsning[1].attr("content", tree.domNode);
		
		var currNo = this.nrOfRows;
		tree.onClick = dojo.hitch(this, function(item) {
								if (treeStore.getValue(item, "selectable") !== false) {
									row.attr("label", treeStore.getValue(item, "l"));
									this.urlArray[currNo] = treeStore.getValue(item, "d");
								}
							});
		var rbCell = newRow.insertCell(1);
		
		//Adding the remove button for a row
		var removeButton = new dijit.form.Button({
			label: "Remove",
			onClick: dojo.hitch(this, function () {
				delete this.levelUrlArray[currNo];
				delete this.urlArray[currNo];
				var compTable = dojo.byId("subfieldTable");
				//console.log("Indexet är: "+newRow.rowIndex);
				if(newRow.rowIndex > 0){
				   var last = compTable.deleteRow(newRow.rowIndex);
				   if(compTable.rows.length < 2){
					this.addRow();
				   }
				}
			})
		});
		
		var removeButtonCell = newRow.insertCell(2);
		removeButtonCell.appendChild(removeButton.domNode);
		
	    this.nrOfRows++;
	},
	clean: function() {
		var tBodyNode = dojo.byId("subfieldTableBody");
		var subfieldTable = dojo.byId("subfieldTable");
		var i = 0;
		var maximum = subfieldTable.rows.length-2;
		for (i=0; i <= maximum; i++) {
           subfieldTable.deleteRow(1);
		}
		this.nrOfRows = 0;
		this.urlArray = [];
		this.levelUrlArray = [];
	},
	performSearch: function() {
		var str= "";
		if(this.urlArray <= 0){
			this.dialogSearch.cancel();
			return;
		}
		this.dialogAddRow.attr('disabled', true);
		for (i=0; i <= this.urlArray.length-1; i++) {
			if(this.urlArray[i]){
				str += "{ "+this.urlArray[i];
				if(this.levelUrlArray[i]){
					str += " ; "+this.levelUrlArray[i];
				}
				str +=" }";
			}
		}
		
		var context = this.application.getStore().getContext(this.application.repository+"_search");
		this.dialogCancel.attr("disabled", true);
		context.search({term: str, queryType: 'subfield', locationType:['linkreference', 'link', 'local'], onSuccess: dojo.hitch(this, function(entryResult) {
			this.application.dispatch({action: "showEntry", entry: entryResult, entryInstance: entryResult, source: this});
			this.dialogCancel.attr("disabled", false);
			this.dialogAddRow.attr('disabled', false);	
			this.onFinish();	
		}),
		onError: dojo.hitch(this, function(error) {
			this.searchButton.attr("disabled", false);
			this.dialogAddRow.attr('disabled', false);
			this.onFinish(); 
//			this.application.message("Failed to search: "+error);
			this.application.message(this.resourceBundle.searchFailedMessage);
		})});
	},
	setNiceTitle: function(mesg) {
		this.subfieldSearchDialog.titleNode.innerHTML = mesg;
	}
});
dojo.declare("hnetfolio.simple.SortedTreeStore", [dojo.data.ItemFileReadStore], {
	getValues: function(item, attribute){
		var valueArray = this.inherited("getValues", arguments);
		if(valueArray){
			valueArray.sort(function(a,b){
				if(a.l>b.l){
					return 1;
				} else if (a.l<b.l){
					return -1
				} else {
					return 0;
				}
			});
			return valueArray;
		}
		return []; 
	}
});