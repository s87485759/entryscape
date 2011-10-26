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

dojo.provide("hnetfolio.apps.Profile");
dojo.require("folio.apps.Profile");
dojo.require("folio.editor.RFormsEditorPlain");
dojo.require("hnetfolio.editor.CurriculumProfileEditor");
dojo.require("rdfjson.Graph");


dojo.declare("hnetfolio.apps.Profile", [folio.apps.Profile], {
	//===================================================
	// I18n attributes
	//===================================================

	//===================================================
	// Inherited methods
	//===================================================
	show: function() {
		this.inherited("show", arguments);
		
		//Only display CV-passport editor if the user visits her/his profile
		var currentUser = this.application.getUser();
		if(!currentUser || currentUser.id !== this.entryId){
			if (this.tabContainerDijit.getIndexOfChild(this.rformsCompetenceEditorPane) > 0) {
				this.tabContainerDijit.removeChild(this.rformsCompetenceEditorPane);
			}
			return;
		}
		
		if (!this.rformsCompetenceEditorPane) {
			this.rformsCompetenceEditorPane = new dijit.layout.ContentPane({
				title: "EHA Curriculum",
			});
		}
		
		var node = dojo.create("div");
		this.rformsCompetenceEditorPane.set("content", node);
		this.competenceEditor = new hnetfolio.editor.CurriculumProfileEditor({},node);
		
		if (this.tabContainerDijit.getIndexOfChild(this.rformsCompetenceEditorPane) < 0) {
			this.tabContainerDijit.addChild(this.rformsCompetenceEditorPane);
		}
		var loadedEntryFunction = dojo.hitch(this,function(loadedEntry){
			this.competenceEditor.setUserEntry(loadedEntry);
			this.competenceEditor.show();
		});
		
		this.application.getStore().loadEntry({base: this.application.getRepository(), 
		                 contextId: "_principals", 
						 entryId: this.entryId}, 
						 {},
						 function(entry) {
							if (entry.resource == null) {
								entry.setRefreshNeeded();
								entry.refresh(loadedEntryFunction);
							} else {
								loadedEntryFunction(entry);
							}
						 }
			);
	}
});
