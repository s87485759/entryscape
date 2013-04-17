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

dojo.provide("folio.admin.NewGroup");
dojo.require("folio.data.Constants");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Textarea");
dojo.require("dijit.form.Button");
dojo.require("dojox.form.BusyButton");
dojo.require("rdfjson.Graph");

dojo.declare("folio.admin.NewGroup", [dijit._Widget, dijit._Templated, folio.admin.TabContent], {
	templatePath: dojo.moduleUrl("folio.admin", "NewGroupTemplate.html"),
	widgetsInTemplate: true,
	templateString: "",
	createdListeners: null,
	cancelListeners: null,
	viewId: "folio.admin.NewGroup",
	
	constructor: function() {
		this.createdListeners = new Array();
		this.cancelListeners = new Array();
	},
	getSupportedActions: function() {
		return [];
	},
	// Sets the list that the portfolio should be created in
	setEntry: function(/* Entry of built in type list*/ entry) {
		this.inherited("setEntry", arguments);
		this.clearDetails();
	},
	clearDetails: function() {
		this.titleField.attr("value", "");
		this.descriptionField.attr("value", "");
		this.hideCreateGroupError();
	},
	createGroupClicked: function() {
		var helperObj = folio.data.createNewEntryHelperObj(this.entry.getContext());

		if (this.titleField.attr("value")) {
			helperObj.metadata.create(helperObj.resURI, folio.data.FOAFSchema.NAME, {type: "literal", value: this.titleField.attr("value")});
		}
		if (this.descriptionField.attr("value")) {
			helperObj.metadata.create(helperObj.resURI, folio.data.DCTermsSchema.DESCRIPTION, {type: "literal", value: this.descriptionField.attr("value")});
		}
		//Explicitly setting the rights for user to read the metadata
		var usersObj = this.entry.getContext().getBaseURI() + "_principals/resource/_users";
		helperObj.info.create(helperObj.metURI, folio.data.SCAMSchema.READ, {type: "uri", value: usersObj});
		
		var args = {
			info:helperObj.info.exportRDFJSON(),
			context: this.entry.getContext(),
			parentList: this.entry,
			metadata: helperObj.metadata.exportRDFJSON(), 
			resource: {"children":[]}, 
			params: {locationType: "local", builtinType: "Group", representationType: "informationresource"}
		};
		this.application.getCommunicator().createEntry(args).then(
			dojo.hitch(this, function(entry) {
				// Refresh the list that holds the newly created group
				this.entry.setRefreshNeeded(true);
				this.entry.refresh(
						dojo.hitch(
							this,
							function (refEntry) {
								this.application.dispatch({action: "childrenChanged", entry: refEntry, source: this});
								this.application.getStore().loadEntry(
									refEntry.getContext().getUri()+"/entry/_all",
									{},
									dojo.hitch(
										this,
										function(_all) {
											_all.setRefreshNeeded(true);
											_all.refresh(
												dojo.hitch(
													this,
													function (refAll) {
														this.application.dispatch({action: "childrenChanged", entry: refAll, source: this});
													}
												),
												dojo.hitch(
													this,
													function (msg) {
														console.error("folio.admin.NewUser.createUserClicked, could not refresh _all.");
														console.error(msg);
													}
												)
											);
										}
									)
								);
							}
						),
						dojo.hitch(
							this,
							function (msg) {
								console.error("folio.admin.NewUser.createUserClicked, could not refresh user list.");
								console.error(msg);
							}
						)
					);
				for (var i in this.createdListeners) {
					this.createdListeners[i](this.entry.getContext().getBaseURI() + "_principals/entry/" +entry);
				}
				this.createGroupBtn.cancel();
				this.clearDetails();
			}),
			dojo.hitch(this, function(msg) {
				console.error("folio.admin.NewGroup.createPortfolioClicked, create UNsuccessful");
				this.displayCreateUserError("Could not create group.", msg);
				this.createGroupBtn.cancel();
			}));
	},
	displayCreateGroupError: function(/* string */ message, /* ? */ details) {
		while (this.createGroupErrorMessage.hasChildNodes()) {
			this.createGroupErrorMessage.removeChild(this.createGroupErrorMessage.firstChild);
		}
		dojo.place(dojo.doc.createTextNode(message), this.createGroupErrorMessage);
		
		dojo.style(this.createGroupError, "display", "block");
	},
	hideCreateGroupError: function() {
		dojo.style(this.createGroupError, "display", "none");
	},
	cancelCreateGroupClicked: function() {
		this.clearDetails();
		for (var i in this.cancelListeners) {
			this.cancelListeners[i]();
		}
	},
	addCreatedListener: function(listener) {
		this.createdListeners.push(listener);
	},
	addCancelListener: function(listener) {
		this.cancelListeners.push(listener);
	}
});