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

dojo.provide("folio.admin.UserDetails");
dojo.require("folio.admin.TabContent");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.Button");
dojo.require("dojox.form.BusyButton");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.Dialog");
dojo.require("dojox.validate.regexp");

dojo.require("folio.Application");
dojo.require("folio.data.Constants");
dojo.require("folio.data.EntryUtil");

dojo.declare("folio.admin.UserDetails", [dijit._Widget, dijit._Templated, folio.admin.TabContent], {
	templatePath: dojo.moduleUrl("folio.admin", "UserDetailsTemplate.html"),
	templateString: "",	
	widgetsInTemplate: true,
	viewId: "folio.admin.UserDetails",

	postCreate: function() {
		this.portfolioList.addConfirmListener(dojo.hitch(this,function(c) {
			var newUserData = {homecontext: c.getId()};
			this.entry.getContext().communicator.saveJSON(this.entry.getResourceUri(), newUserData,
					dojo.hitch(this, function(data) {
						//update to the new homecontext without a real refresh.
						this.entry.getResource().homecontext = c.getId();
						
						this.displayHomeContext();
						this.application.dispatch({action: "changed", entry: this.entry, source: this});
						this.portfolioDialog.hide();
						
						//Update the contexts ACL so that the user is also an owner.
						var entryInfo = c.getInfo();
						entryInfo.create(c.getUri(), folio.data.SCAMSchema.WRITE, {type: "uri", value: this.entry.getResourceUri()});

						this.application.getCommunicator().saveJSON(
							c.getUri(),
							{info: entryInfo.exportRDFJSON()},
							dojo.hitch(this, function(accessRights) {
								console.log("success :)");
								console.log(accessRights);
							}),
							dojo.hitch(this, function(msg) {
								console.log("failure :(");
								console.log(msg);
							})
						);
					}),
					dojo.hitch(this, function(msg) {
						this.displayHomeContext();
						console.error("folio.admin.UserDetails, change UNsuccessful!");
						this.displayError(msg);
						this.portfolioDialog.hide();
					})
			);
		}));
		this.portfolioList.addCancelListener(dojo.hitch(this,function(c) {
			this.portfolioDialog.hide();
		}));
		this.portfolioList.folderView.displayChildrenTypes([folio.data.BuiltinType.CONTEXT]);
		this.confirmField.set("validator", dojo.hitch(this, function() {
			return this.confirmField.get("value") === this.passwordField.get("value");
		}));
	},
	setApplication: function(application) {
		this.inherited("setApplication", arguments);
		this.application.register(this.portfolioList.folderSelect.viewId, this.portfolioList.folderSelect);
	},
	setEntry: function(/* Entry */ entry) {
		this.inherited("setEntry", arguments);
		this.displayEntry();
	},
	displayEntry: function() {
		this.displayDetails();
		this.displayAccountInformation();
		this.displayHomeContext();
	},
	displayDetails: function() {
		// Cancel the button
		this.changeDetailsBtn.set("disabled", true);
		// Hide ev error messages
		this.hideChangeDetailsError();
		// Get the metadata
		var metadata = this.entry.getMetadata();
		var email = "";
		var name = "";
		var firstname = "";
		var surname = "";
		if (metadata) {
			// Check if there is a name
			name = metadata.findFirstValue(this.entry.getResourceUri(), folio.data.FOAFSchema.NAME);
			firstname = metadata.findFirstValue(this.entry.getResourceUri(), folio.data.FOAFSchema.FIRSTNAME);
			surname = metadata.findFirstValue(this.entry.getResourceUri(), folio.data.FOAFSchema.SURNAME);
			// Check if there is an email-adress
			email = metadata.findFirstValue(this.entry.getResourceUri(), folio.data.FOAFSchema.MBOX);
			if (email) {
				email = email.replace(/%40/g, "@");
			}
		}
		// Display the name
		this.firstnameField.set("value",firstname);
		this.surnameField.set("value",surname);
		this.nameField.set("value", name);
		// Display the email
		this.emailField.set("value", email);
	},
	displayAccountInformation: function() {
		// Cancel the button
		this.changeAccountInformationBtn.set("disabled", true);
		// Hide ev error messages
		this.hideChangeAccountError();
		// Display the username
		this.userNameField.set("value", this.entry.getResource().name);
		// Clear the password fields
		this.passwordField.set("value", "");
		this.confirmField.set("value", "");
	},
	displayHomeContext: function() {
		if (this.entry.getResource().homecontext) {
			this.application.getStore().loadEntry(
				this.application.getRepository() + "_contexts/entry/" + this.entry.getResource().homecontext,
				{},
				dojo.hitch(this, function(homeContext) {
					this.homeContextField.set("value", folio.data.getLabel(homeContext) || homeContext.alias || homeContext.getId());
				}),
				dojo.hitch(this, function(msg) {
					console.error("folio.admin.UserDetails.displayHomeContext, homecontext load error!");
					this.displayError(msg);
				})
			);
		}
		else {
			this.homeContextField.set("value", "No home portfolio");
		}
	},
	changeDetailsClicked: function() {
		var metadata = this.entry.getMetadata();
		if (metadata) {
			metadata = metadata.clone();
		} else {
			metadata = new rdfjson.Graph();
		}
		
		// Set the firstname
		dojo.forEach(metadata.find(this.entry.getResourceUri(), folio.data.FOAFSchema.FIRSTNAME), metadata.remove, metadata);
		var firstname = this.firstnameField.get("value");
		if (firstname != null) {
			metadata.create(this.entry.getResourceUri(), folio.data.FOAFSchema.FIRSTNAME, {type: "literal", value: firstname});			
		}

		// Set the surname
		dojo.forEach(metadata.find(this.entry.getResourceUri(), folio.data.FOAFSchema.SURNAME), metadata.remove, metadata);
		var surname = this.surnameField.get("value");
		if (surname != null) {
			metadata.create(this.entry.getResourceUri(), folio.data.FOAFSchema.SURNAME, {type: "literal", value: surname});			
		}

		// Set the full name
		dojo.forEach(metadata.find(this.entry.getResourceUri(), folio.data.FOAFSchema.NAME), metadata.remove, metadata);
		var name = this.nameField.get("value");
		if (name != null) {
			metadata.create(this.entry.getResourceUri(), folio.data.FOAFSchema.NAME, {type: "literal", value: name});			
		}

		// Set the email
		dojo.forEach(metadata.find(this.entry.getResourceUri(), folio.data.FOAFSchema.MBOX), metadata.remove, metadata);
		var email = this.emailField.get("value");
		if (email != null) {
			metadata.create(this.entry.getResourceUri(), folio.data.FOAFSchema.MBOX, {type: "literal", value: email});			
		}
		
		this.entry.getContext().communicator.saveJSON(this.entry.getLocalMetadataUri(), metadata.exportRDFJSON(),
				dojo.hitch(this, function(data) {
					this.entry.setRefreshNeeded();
					this.entry.refresh(dojo.hitch(this, function(refreshed) {
						this.setEntry(refreshed);
						this.application.dispatch({action: "changed", entry: refreshed, source: this});
					}), dojo.hitch(this, function(msg) {
						console.error("folio.admin.UserDetails.changeDetailsClicked, could not refresh entry");
						this.displayError(msg);
					}));
					this.hideChangeDetailsError();
					this.changeDetailsBtn.set("disabled", true);
					this.changeDetailsBtn.cancel();
				}),
				dojo.hitch(this, function(msg) {
					console.error("folio.admin.UserDetails.changeDetailsClicked, change UNsuccessful!");
					this.displayChangeDetailsError("Error saving user details", msg);
					this.changeDetailsBtn.cancel();
				})
		);
	},
	cancelChangeDetailsClicked: function() {
		this.displayDetails();
	},
	displayChangeDetailsError: function(/* string */ message, /* ? */ details) {
		while (this.userDetailsErrorMessage.hasChildNodes()) {
			this.userDetailsErrorMessage.removeChild(this.userDetailsErrorMessage.firstChild);
		}
		dojo.place(dojo.doc.createTextNode(message), this.userDetailsErrorMessage);
		
		dojo.style(this.userDetailsError, "display", "block");
	},
	hideChangeDetailsError: function() {
		dojo.style(this.userDetailsError, "display", "none");
	},
	detailsFieldsChanged: function() {
		if (this.emailField.isValid()) {
			this.changeDetailsBtn.set("disabled", false);
		}
		else {
			this.changeDetailsBtn.set("disabled", true);
		}
	},
	changeAccountInformationClicked: function() {
		var newUserData = {name: this.userNameField.get("value")};
		var newPassword = this.passwordField.get("value"); 
		if (newPassword) {
			newUserData.password = newPassword;
		}
		this.entry.getContext().communicator.saveJSON(this.entry.getResourceUri(), newUserData,
				dojo.hitch(this, function(data) {
					this.entry.getResource().name = newUserData.name;
					this.displayAccountInformation();
					this.application.dispatch({action: "changed", entry: this.entry, source: this});
					this.hideChangeAccountError();
					this.changeAccountInformationBtn.set("disabled", true);
					this.changeAccountInformationBtn.cancel();
				}),
				dojo.hitch(this, function(msg) {
					console.error("folio.admin.UserDetails.changeAccountInformationClicked, change UNsuccessful!");
					console.error(msg);
					this.displayChangeAccountError("Error saving account information", msg);
					this.changeAccountInformationBtn.cancel();
				})
		);
	},
	cancelChangeAccountInformationClicked: function() {
		this.displayAccountInformation();
	},
	displayChangeAccountError: function(/* string */ message, /* ? */ details) {
		while (this.userAccountErrorMessage.hasChildNodes()) {
			this.userAccountErrorMessage.removeChild(this.userAccountErrorMessage.firstChild);
		}
		dojo.place(dojo.doc.createTextNode(message), this.userAccountErrorMessage);
		
		dojo.style(this.userAccountError, "display", "block");
	},
	hideChangeAccountError: function() {
		dojo.style(this.userAccountError, "display", "none");
	},
	accountFieldsChanged: function() {
		if (this.userNameField.isValid() && this.passwordField.get("value") == this.confirmField.get("value")) {
			this.changeAccountInformationBtn.set("disabled", false);
		}
		else {
			this.changeAccountInformationBtn.set("disabled", true);
		}
	},
	displayChangeHomeContextClicked: function() {
		this.application.getStore().loadEntry(
			this.application.getRepository()+"_contexts/entry/_systemEntries",
			-1,
			dojo.hitch(this, function(context) {
				this.portfolioList.folderSelect.setTopFolder(context);
			})
		);
		this.portfolioDialog.show();
	}
});

dojo.declare("folio.admin.portfolioList", [dijit._Widget, dijit._Templated], {
	widgetsInTemplate: true,
	okListeners: null,
	cancelListeners: null,
	
	templateString: 
		"<div>" +
			"<div dojoType='folio.admin.FolderSelect' dojoAttachPoint='folderSelect'   viewId='folio.admin.portfolioList.folderSelect'></div>" +
			"<div dojoType='dijit.layout.ContentPane'><div dojoType='folio.admin.FolderView' dojoAttachPoint='folderView'  style='width: 190px; height: 250px;'></div></div>" +
			"<div dojoType='dijit.form.Button' dojoAttachPoint='cancelButton' dojoAttachEvent='onClick:cancelClicked'>Cancel</div>" +
			"<button dojoType='dojox.form.BusyButton' busyLabel='Saving...' dojoAttachEvent='onClick:okClicked' dojoAttachPoint='setPortfolioBtn'>Set portolio</button>" +
		"</div>",

	postCreate: function() {
		this.inherited("postCreate", arguments);
		this.okListeners = new Array();
		this.cancelListeners = new Array();
		this.folderSelect.addChangeListener(
			dojo.hitch(this, function (entryURI) {
				this.folderView.displayChildren(this.folderSelect.getFolder(entryURI));
			}
		));
	},
	okClicked: function() {
		if (this.folderView.getSelectedEntry()) {
			for (var i in this.okListeners) {
				this.okListeners[i](this.folderView.getSelectedEntry());
			}
		}
		this.setPortfolioBtn.cancel();
	},
	cancelClicked: function() {
		for (var i in this.cancelListeners) {
			this.cancelListeners[i]();
		}
	},
	/**
	 * Adds a listener that fires every time a user clicks the "ok" button
	 */
	addConfirmListener: function(/*function(entry)*/ listener) {
		this.okListeners.push(listener);
	},
	addCancelListener: function(listener) {
		this.cancelListeners.push(listener);
	}
});