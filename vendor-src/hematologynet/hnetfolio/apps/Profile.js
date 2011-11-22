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
	},	
	showEntry: function(entry){	
		this.inherited("showEntry", arguments);
		var currentUser = this.application.getUser();
		if (currentUser) {
			//Only display CV-passport editor if the user visits her/his profile
			if (currentUser.id === this.entryId) {
				this._removeContactButton();
				this._addCompetenceTab(this.entry);
			} else { 
			    //Remove the CV-passport
				this._removeCompetenceTab(); 
				//Show add button
				if (currentUser.homecontext && 
						this.entry.getBuiltinType() === folio.data.BuiltinType.USER ) {
					this._addContactButton(this.entry);
				} else if (this.entry.getBuiltinType() === folio.data.BuiltinType.GROUP){
					//TODO: Perhaps add a "Join group"-button
				}
			}
		} else if (!currentUser){
			this._removeContactButton();
			this._removeCompetenceTab();
		}
	},
	/*
	 * See superclass for documentations
	 */
	addToContactList: function(){
		console.log("AddToContactsClicked");
		var d = new dojo.Deferred();
		var application = this.application;
		var home = application.getUser().homecontext;
		var contextURI = application.repository+home;
		
		/*
		 * Function that is called after the contacts-list has been loaded.
		 */
		var entryLoaded = function(contacts) {		    
			/*
			 * Function called after a successful creation of a new reference-entry to 
			 * the contacts-list
			 */
			var updateEntry = function(entry) {
				folio.data.getList(contacts, dojo.hitch(this, function(list) {
					list.entry.setRefreshNeeded();
					this._removeContactButton();
				}));
			};
			
			var builtinTypeString = "";
			if(this.entry.getBuiltinType() === folio.data.BuiltinType.USER){
				builtinTypeString = "user";
			} else if (this.entry.getBuiltinType() === folio.data.BuiltinType.GROUP){
				builtinTypeString = "group";
			}
			var linkEntry = {
				context: contacts.getContext(),
				parentList: contacts,
				params: {
					representationType: "informationresource",
					locationType: "reference",
					builtinType: builtinTypeString,//entry.getBuiltinType(),
					"cached-external-metadata": this.entry.getLocationType() === folio.data.LocationType.LOCAL ? this.entry.getLocalMetadataUri(): this.entry.getExternalMetadataUri(),
					resource: this.entry.getResourceUri()}};
			contacts.getContext().createEntry(linkEntry, dojo.hitch(this, updateEntry), dojo.hitch(d, d.errback));
		};
		
		application.getStore().getContext(contextURI).loadEntryFromId("_contacts", {}, dojo.hitch(this, entryLoaded), dojo.hitch(d, d.errback));
	},
	//===================================================
	// Private methods
	//===================================================
	/*
	 * Adds a tab to the left in the profile where the EHA Hematology Curriculum is 
	 * added. Input variable "userEntry" is the entry of the user. The entry that 
	 * will be edited is found by the method. 
	 */
	_addCompetenceTab: function(userEntry){
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
		this.competenceEditor.setUserEntry(userEntry);
		this.competenceEditor.show();
	},
	/*
	 * Removes the tab that is added by the method _addCompetenceTab. This tab is only displayed
	 * when the logged in user visits his/her own profile. And, since we reuse the profile-instance
	 * this needs to be removed when another profile is visited.
	 */
	_removeCompetenceTab: function() {
		if (this.tabContainerDijit.getIndexOfChild(this.rformsCompetenceEditorPane) > 0) {
			this.tabContainerDijit.removeChild(this.rformsCompetenceEditorPane);
		}
	},
	/*
	 * Displays the "Add to contacts"-button if the following conditions are met:
	 * 1) The current (logged in) user has a home-portfolio
	 * 2) The user which profiles is displayed is not already in the list _contacts
	 *  in the current users home portfolio
	 */
	_addContactButton: function(loadedEntry){
		//Check so that loadedEntry is not a group. TODO: Should we skip this check and add a button labeled "Join group" instead?
		if(!loadedEntry || loadedEntry.getBuiltinType()===folio.data.BuiltinType.GROUP){
			this._removeContactButton();
			return;
		}		
		//Find out if the user is already in contacts
		var currentUser = this.application.getUser();
		var homeContext = this.application.getStore().getContext(this.application.repository + currentUser.homecontext);
		
		var searchParams = {
			queryType:"solr",
			folders:[this.application.repository + currentUser.homecontext+"/resource/_contacts"], //The contact-list of the logged in user
			resource:this.application.repository+"_principals/resource/"+this.entryId, //The "resource" of the user which profile is the visited one
			onSuccess: dojo.hitch(this, function(entryResult) {
				if (entryResult && entryResult.resource &&
				entryResult.resource.children &&
				entryResult.resource.children.length < 1) {
					dojo.style(this.addToContactsButtonDijit.domNode, "display", "block");
				} else {
					dojo.style(this.addToContactsButtonDijit.domNode, "display", "none");
				}
			})
		};
		
		var context = this.application.getStore().getContext(this.application.repository+"_search");
		context.search(searchParams);
	},/*
	 * Removes the button "Add to contacts". Called when this button needs to be hidden.
	 */
	_removeContactButton: function(){
		dojo.style(this.addToContactsButtonDijit.domNode, "display", "none");
	}
});
