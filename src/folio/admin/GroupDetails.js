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

dojo.provide("folio.admin.GroupDetails");
dojo.require("folio.admin.TabContent");
dojo.require("folio.data.Constants");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.Button");
dojo.require("dojox.form.BusyButton");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Textarea");
dojo.require("rdfjson.Graph");

//dojo.require("dijit.layout.BorderContainer");
//dojo.require("dijit.layout.ContentPane");
//
//dojo.require("dojox.validate.regexp");
//
//dojo.require("folio.Application");
//dojo.require("folio.data.Constants");

dojo.declare("folio.admin.GroupDetails", [dijit._Widget, dijit._Templated, folio.admin.TabContent], {
	templatePath: dojo.moduleUrl("folio.admin", "GroupDetailsTemplate.html"),
	widgetsInTemplate: true,
	templateString: "",
	viewId: "folio.admin.GroupDetails",
	setEntry: function(/* Entry */ group) {
		this.inherited("setEntry", arguments);
		this.displayEntry();
	},
	displayEntry: function() {
		this.displayDetails();
		this.displayAlias();
	},
	displayDetails: function() {
		// Cancel the button
		this.changeDetailsBtn.set("disabled", true);
		// Hide ev error messages
		this.hideChangeDetailsError();
		var title = "";
		var description = "";
		var metadata = this.entry.getMetadata();
		if (metadata) {
			// Check if there is a title
			title = metadata.findFirstValue(this.entry.getResourceUri(), folio.data.FOAFSchema.NAME) || metadata.findFirstValue(this.entry.getResourceUri(), folio.data.DCTermsSchema.TITLE) || "";
			// Check if there is an description
			description = metadata.findFirstValue(this.entry.getResourceUri(), folio.data.DCTermsSchema.DESCRIPTION) || "";
		}
		// Display the title
		this.titleField.set("value", title);
		// Display the description
		this.descriptionField.set("value", description);
	},
	displayAlias: function() {
		//Hide if there is any error-message left for the alias section
		this.hideChangeAliasError();
		this.changeGroupAliasBtn.set("disabled", true);
		var groupAlias = this.entry.getResource().name;
		if(groupAlias){
		    this.groupAliasField.set("value", groupAlias);	
		} else {
			this.groupAliasField.set("value", "");
		}
	},
	changeDetailsClicked: function() {
		var metadata = this.entry.getMetadata();
		if (metadata) {
			metadata = metadata.clone();
		} else {
			metadata = new rdfjson.Graph();
		}

		// Set the name of the group
		dojo.forEach(metadata.find(this.entry.getResourceUri(), folio.data.FOAFSchema.NAME), metadata.remove, metadata);
		var name = this.titleField.get("value");
		if (name != null) {
			metadata.create(this.entry.getResourceUri(), folio.data.FOAFSchema.NAME, {type: "literal", value: name});			
		}
				
		// Set the description
		dojo.forEach(metadata.find(this.entry.getResourceUri(), folio.data.DCTermsSchema.DESCRIPTION), metadata.remove, metadata);
		var desc = this.descriptionField.get("value");
		if (desc != null) {
			metadata.create(this.entry.getResourceUri(), folio.data.DCTermsSchema.DESCRIPTION, {type: "literal", value: desc});			
		}

		this.entry.getContext().communicator.saveJSON(this.entry.getLocalMetadataUri(), metadata.exportRDFJSON(),
				dojo.hitch(this, function(data) {
					this.entry.setRefreshNeeded();
					this.entry.refresh(dojo.hitch(this, function(refreshed) {
						this.setEntry(refreshed);
						this.application.dispatch({action: "changed", entry: refreshed, source: this});
					}), dojo.hitch(this, function(msg) {
						console.error("folio.admin.GroupDetails.changeDetailsClicked, could not refresh entry");
						this.displayError(msg);
					}));
					// Hide ev error messages
					this.hideChangeDetailsError();
					this.changeDetailsBtn.set("disabled", true);
					this.changeDetailsBtn.cancel();
				}),
				dojo.hitch(this, function(msg) {
					console.error("folio.admin.GroupDetails.changeDetailsClicked, change UNsuccessful!");
					this.displayChangeDetailsError("Error saving group details", msg);
					this.changeDetailsBtn.cancel();
				})
		);
	},
	cancelChangeDetailsClicked: function() {
		// Display details
		this.displayDetails();
	},
	displayChangeDetailsError: function(/* string */ message, /* ? */ details) {
		while (this.groupDetailsErrorMessage.hasChildNodes()) {
			this.groupDetailsErrorMessage.removeChild(this.groupDetailsErrorMessage.firstChild);
		}
		dojo.place(dojo.doc.createTextNode(message), this.groupDetailsErrorMessage);
		
		dojo.style(this.groupDetailsError, "display", "block");
	},
	hideChangeDetailsError: function() {
		dojo.style(this.groupDetailsError, "display", "none");
	},
	detailsFieldsChanged: function() {
		// If all fields are correct, set the change button to enabled
		this.changeDetailsBtn.set("disabled", false);
	},
	cancelGroupAliasClicked: function() {
		this.displayAlias();
	},
	groupAliasFieldChanged: function() {
		if (this.groupAliasField.isValid()) {
			this.changeGroupAliasBtn.set("disabled", false);
		}
		else {
			this.changeGroupAliasBtn.set("disabled", true);
		}
	},
	changeGroupAliasClicked: function() {
		var newGroupData = {name: this.groupAliasField.get("value")};
		this.entry.getContext().communicator.saveJSON(this.entry.getAliasUri(), newGroupData,
				dojo.hitch(this, function(data) {
					this.entry.getResource().name = newGroupData.name;
					this.displayAlias();
					this.application.dispatch({action: "changed", entry: this.entry, source: this});
					//this.hideChangeAccountError();
					this.changeGroupAliasBtn.cancel();
					this.changeGroupAliasBtn.set("disabled", true);
				}),
				dojo.hitch(this, function(msg) {
					console.error("folio.admin.GroupDetailsTemplate.aliasField, change failed!");
					//console.error(msg);
					this.changeGroupAliasBtn.cancel();
					this.displayChangeAliasError("Error saving alias information on group", msg);
				})
		);
	},
	displayChangeAliasError: function(/* string */ message, /* ? */ details) {
		while (this.groupAliasErrorMessage.hasChildNodes()) {
			this.groupAliasErrorMessage.removeChild(this.groupAliasErrorMessage.firstChild);
		}
		dojo.place(dojo.doc.createTextNode(message), this.groupAliasErrorMessage);
		
		dojo.style(this.groupAliasError, "display", "block");
	},
	hideChangeAliasError: function() {
		dojo.style(this.groupAliasError, "display", "none");
	}
});