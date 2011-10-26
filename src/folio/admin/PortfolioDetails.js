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

dojo.provide("folio.admin.PortfolioDetails");
dojo.require("folio.admin.TabContent");
dojo.require("folio.data.Constants");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.require("dijit.form.Button");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Textarea");

dojo.require("dojox.form.BusyButton");

dojo.declare("folio.admin.PortfolioDetails", [dijit._Widget, dijit._Templated, folio.admin.TabContent], {
	templatePath: dojo.moduleUrl("folio.admin", "PortfolioDetailsTemplate.html"),
	widgetsInTemplate: true,
	templateString: "",
	viewId: "folio.admin.PortfolioDetails",
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
		this.changeDetailsBtn.attr("disabled", true);
		// Hide ev error messages
		this.hideChangeDetailsError();
		var name = "";
		var description = "";
		var metadata = this.entry.getMetadata();
		if (metadata) {
			// Check if there is a name
			name  =  metadata.findFirstValue(this.entry.getResourceUri(),folio.data.DCTermsSchema.TITLE) || "";
			// Check if there is an description
			description = metadata.findFirstValue(this.entry.getResourceUri(), folio.data.DCTermsSchema.DESCRIPTION) || "";
		}
		// Display the name
		this.nameField.set("value", name);
		// Display the description
		this.descriptionField.set("value", description);
	},
	displayAlias: function() {
		// Cancel the button
		this.changeAliasBtn.set("disabled", true);
		// Hide ev error messages
		this.hideChangeAliasError();
		// Get the alias

		this.entry.getContext().communicator.loadJSON(
				this.entry.getResourceUri() + "/alias",
				dojo.hitch(this, function(aliasobj) {
					var alias = aliasobj["alias"];
					if (!alias) {
						alias = "Alias not defined";
					}
					this.aliasField.attr("value", alias);
				}),
				dojo.hitch(this, function(msg) {
					console.error("folio.admin.UserDetails.PortfolioDetails, alias load error!");
					this.displayError(msg);
				})
			);
	},
	changeDetailsClicked: function() {
		var metadata = this.entry.getMetadata();
		if (metadata) {
			metadata = metadata.clone();
		} else {
			metadata = new rdfjson.Graph();
		}

		// Set the title
		dojo.forEach(metadata.find(this.entry.getResourceUri(), folio.data.DCTermsSchema.TITLE), metadata.remove, metadata);
		var title = this.nameField.get("value");
		if (title != null) {
			metadata.create(this.entry.getResourceUri(), folio.data.DCTermsSchema.TITLE, {type: "literal", value: title});		
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
						console.error("folio.admin.PortfolioDetails.changeDetailsClicked, could not refresh entry");
						this.displayError(msg);
					}));
					// Hide ev error messages
					this.hideChangeDetailsError();
					// Disable the button
					this.changeDetailsBtn.attr("disabled", true);
					// Reset the button
					this.changeDetailsBtn.cancel();
					
				}),
				dojo.hitch(this, function(msg) {
					console.error("folio.admin.PortfolioDetails.changeDetailsClicked, change UNsuccessful!");
					this.displayChangeDetailsError("Error saving portfolio details", msg);
					// Reset the button, do not disable it!
					this.changeDetailsBtn.cancel();
				})
		);
	},
	cancelChangeDetailsClicked: function() {
		this.displayDetails();
	},
	displayChangeDetailsError: function(/* string */ message, /* ? */ details) {
		while (this.portfolioDetailsErrorMessage.hasChildNodes()) {
			this.portfolioDetailsErrorMessage.removeChild(this.portfolioDetailsErrorMessage.firstChild);
		}
		dojo.place(dojo.doc.createTextNode(message), this.portfolioDetailsErrorMessage);
		dojo.style(this.portfolioDetailsError, "display", "block");
	},
	hideChangeDetailsError: function() {
		dojo.style(this.portfolioDetailsError, "display", "none");
	},
	detailsFieldsChanged: function() {
		// If all fields are correct, set the change button to enabled
		this.changeDetailsBtn.attr("disabled", false);
	},
	changeAliasClicked: function() {
		var aliasobj = {};
		if (this.aliasField.attr("value")) {
			aliasobj["alias"] = this.aliasField.attr("value");
		}
		this.entry.getContext().communicator.saveJSON(
				this.entry.getResourceUri() + "/alias",
				aliasobj,
				dojo.hitch(this, function(data) {
					// Hide ev error messages
					this.hideChangeAliasError();
					// Disable the button
					this.changeAliasBtn.attr("disabled", true);
					// Reset the button
					this.changeAliasBtn.cancel();
					
				}),
				dojo.hitch(this, function(msg) {
					console.error("folio.admin.PortfolioDetails.changeAliasClicked, change UNsuccessful!");
					this.displayChangeAliasError("Error saving portfolio alias", msg);
					// Reset the button, do not disable it!
					this.changeAliasBtn.cancel();
				}));
	},
	cancelChangeAliasClicked: function() {
		this.displayAlias();
	},
	displayChangeAliasError: function(/* string */ message, /* ? */ details) {
		while (this.portfolioAliasErrorMessage.hasChildNodes()) {
			this.portfolioAliasErrorMessage.removeChild(this.portfolioAliasErrorMessage.firstChild);
		}
		dojo.place(dojo.doc.createTextNode(message), this.portfolioAliasErrorMessage);
		dojo.style(this.portfolioAliasError, "display", "block");
	},
	hideChangeAliasError: function() {
		dojo.style(this.portfolioAliasError, "display", "none");
	},
	aliasFieldsChanged: function() {
		// If all fields are correct, set the change button to enabled
		if (this.aliasField.isValid()) {
			this.changeAliasBtn.attr("disabled", false);
		}
		else {
			this.changeAliasBtn.attr("disabled", true);
		}
	}
});