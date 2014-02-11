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

dojo.provide("folio.admin.NewUser");
dojo.require("folio.admin.TabContent");
dojo.require("folio.data.Constants");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.Button");
dojo.require("dojox.form.BusyButton");
dojo.require("folio.admin.UserDetails");
dojo.require("folio.admin.FilteredSelection");

dojo.declare("folio.admin.NewUser", [dijit._Widget, dijit._Templated, folio.admin.TabContent], {
	templatePath: dojo.moduleUrl("folio.admin", "NewUserTemplate.html"),
	widgetsInTemplate: true,
	templateString: "",
	createdListeners: null,
	cancelListeners: null,
	viewId: "folio.admin.NewUser",
	
	constructor: function() {
		this.createdListeners = [];
		this.cancelListeners = [];
	},
	postCreate: function() {
		this.inherited("postCreate", arguments);
		this.folderSelect.display_all(false);
		this.confirmField.set("validator", dojo.hitch(this, function() {
			return this.confirmField.get("value") === this.passwordField.get("value");
		}));
	},
	setApplication: function(application) {
		this.inherited("setApplication", arguments);
		this.application.register(this.folderSelect.viewId, this.folderSelect);
	},
	getSupportedActions: function() {
		return [];
	},
	// Sets the list that the portfolio should be created in
	setEntry: function(/* Entry of built in type list*/ entry) {
		this.inherited("setEntry", arguments);
		this.clearDetails();
		this.application.getStore().loadEntry(
				this.application.getRepository()+"_contexts/entry/_systemEntries",
				{},
				dojo.hitch(this, function(context) {
					this.folderSelect.setTopFolder(context);
				})
			);
	},
	clearDetails: function() {
		this.firstnameField.set("value", "");
		this.surnameField.set("value", "");
		this.nameField.set("value", "");
		this.emailField.set("value", "");
		this.userNameField.set("value", "");
		this.passwordField.set("value", "");
		this.confirmField.set("value", "");
		this.portfolioNameField.set("value","");
		this.portfolioDescriptionField.set("value","");
		this.portfolioAliasField.set("value","");
		this.createUserBtn.set("disabled", true);
		this.hideCreateUserError();
	},
	createUserClicked: function() {
		var metadata = new rdfjson.Graph();
		var userContext = this.entry.getContext();
		var portfolioContext =  this.folderSelect.getSelectedFolder().getContext();
		var userResourceUri = userContext.getBaseURI() + userContext.getId()+"/resource/_newId";
		var portolioResourceUri = portfolioContext.base + "_newId";
		if (this.firstnameField.get("value")) {
			metadata.create(userResourceUri, folio.data.FOAFSchema.FIRSTNAME, {type: "literal", value: this.firstnameField.get("value")});
		}
		if (this.surnameField.get("value")) {
			metadata.create(userResourceUri, folio.data.FOAFSchema.SURNAME, {type: "literal", value: this.surnameField.get("value")});
		}
		if (this.nameField.get("value")) {
			metadata.create(userResourceUri, folio.data.FOAFSchema.NAME, {type: "literal", value: this.nameField.get("value")});
		}
		if (this.emailField.get("value")) {
			metadata.create(userResourceUri, folio.data.FOAFSchema.MBOX, {type: "literal", value: this.emailField.get("value")});
		}
		
		var userArgs = {
			context: userContext,
			parentList: this.entry,
			metadata: metadata.exportRDFJSON(),
			resource: {"name": this.userNameField.get("value"),"password": this.passwordField.get("value")}, 
			params: {entrytype: "local", graphtype: "User", representationType: "informationresource"}
		};
		if (this.createHomePortfolioCheckBox.get("checked")) {
			
			var portfolioMetadata = new rdfjson.Graph();
			if (this.portfolioNameField.get("value")) {
				portfolioMetadata.create(portolioResourceUri, folio.data.DCTermsSchema.TITLE, {type: "literal", value: this.portfolioNameField.get("value")});
			}
			if (this.portfolioDescriptionField.get("value")) {
				portfolioMetadata.create(portolioResourceUri, folio.data.DCTermsSchema.DESCRIPTION, {type: "literal", value: this.portfolioDescriptionField.get("value")});
			}
			var portfolioResourceObj = {};
			if (this.portfolioAliasField.get("value")) {
				portfolioResourceObj["alias"] = this.portfolioAliasField.get("value");
			}
			var portfolioArgs = {
					context: portfolioContext,
					parentList: this.folderSelect.getSelectedFolder(),
					metadata: portfolioMetadata.exportRDFJSON(), 
					resource: portfolioResourceObj, 
					params: {entrytype: "local", graphtype: "Context", representationType: "informationresource"}
				};
//			console.log("creating home portfolio in ");
//			console.log(this.folderSelect.getSelectedFolder().getContext());
			// Create the home portfolio
			this.application.getCommunicator().createEntry(portfolioArgs).then(
					dojo.hitch(this, function(contextId) {
//						console.log("portfolio created!! contextId: "+contextId);
						userArgs.resource["homecontext"] = contextId;
//						console.log("creating user");
						this.application.getCommunicator().createEntry(userArgs).then(
								dojo.hitch(this, function(userId) {
//									console.log("user created!! userId: "+userId);
									var base = this.entry.getContext().getBaseURI();
									var cEUri = base+"_contexts/entry/"+contextId;
									var cRUri = base+contextId;
									var cMUri = base+"_contexts/metadata/"+contextId;					
									var uUri = base+"_principals/resource/"+userId;
									var usersUri = base+"_principals/resource/_users";
										
									var entryInfo = new rdfjson.Graph();
									entryInfo.create(cEUri, folio.data.SCAMSchema.WRITE, {type: "uri", value: uUri});
									entryInfo.create(cEUri, folio.data.SCAMSchema.RESOURCE, {type: "uri", value: cRUri});
									entryInfo.create(cEUri, folio.data.SCAMSchema.LOCAL_METADATA, {type: "uri", value: cMUri});
									entryInfo.create(cMUri, folio.data.SCAMSchema.READ, {type: "uri", value: usersUri});
									entryInfo.create(cRUri, folio.data.SCAMSchema.READ, {type: "uri", value: usersUri});
									entryInfo.create(cRUri, folio.data.RDFSchema.TYPE, {type: "uri", value: folio.data.BuiltinTypeSchema.CONTEXT});
									
									this.application.getCommunicator().PUT(
											cEUri,
											{info: entryInfo.exportRDFJSON()}).then(
											dojo.hitch(this,function() {
												// Refresh the list that holds the newly created context
												var contextList = this.folderSelect.getSelectedFolder();
												contextList.setRefreshNeeded(true);
												contextList.refresh(
														dojo.hitch(
															this,
															function (refCL) {
																this.application.dispatch({action: "childrenChanged", entry: refCL, source: this});
															}
														),
														dojo.hitch(
															this,
															function (msg) {
																console.error("folio.admin.NewUser.createUserClicked, could not refresh portfolio list.");
																console.error(msg);
															}
														)
													);
												// Refresh the list that holds the newly created user
												this.entry.setRefreshNeeded(true);
												this.entry.refresh(
														dojo.hitch(
															this,
															function (refEntry) {
																this._update_all(refEntry);
																this.application.dispatch({action: "childrenChanged", entry: refEntry, source: this});
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
													this.createdListeners[i](this.entry.getContext().getBaseURI() + "_principals/entry/" +userId);
												}
												this.createUserBtn.cancel();
												this.clearDetails();
											}), 
											dojo.hitch(this,function(msg) {
												// delete the created user
												var xhrArgs = {
														url: this.entry.getContext().getUri() + "/entry/" + userId,
														handleAs: "json-comment-optional",
														headers: {"accept": "application/json", "Content-type": "application/json"}
													};
//												console.log("removing user");
//												console.log(xhrArgs);
												var req = dojo.xhrDelete(xhrArgs);
//												req.addCallback(function() {console.log("removed user");});
//												req.addErrback(function() {console.error("failed removing user");});
												// delete the created portfolio
												xhrArgs = {
														url: this.folderSelect.getSelectedFolder().getContext().getUri() + "/entry/" + contextId,
														handleAs: "json-comment-optional",
														headers: {"accept": "application/json", "Content-type": "application/json"}
													};
//												console.log("removing portfolio");
//												console.log(xhrArgs);
												req = dojo.xhrDelete(xhrArgs);
//												req.addCallback(function() {console.log("removed portfolio");});
//												req.addErrback(function() {console.error("failed removing portfolio");});
												console.error("folio.admin.NewUser.createUserClicked, change permissions UNsuccessful");
												this.displayCreateUserError("Could not set access rules.", msg);
												this.createUserBtn.cancel();
											}));
								}),
								dojo.hitch(this, function(msg) {
									// delete the created portfolio
									var xhrArgs = {
											url: this.folderSelect.getSelectedFolder().getContext().getUri() + "/entry/" + contextId,
											handleAs: "json-comment-optional",
											headers: {"accept": "application/json", "Content-type": "application/json"}
										};
//									console.log("removing portfolio");
//									console.log(xhrArgs);
									var req = dojo.xhrDelete(xhrArgs);
//									req.addCallback(function() {console.log("removed portfolio");});
//									req.addErrback(function() {console.error("failed removing portfolio");});
									console.error("folio.admin.NewUser.createUserClicked, create user UNsuccessful");
									this.displayCreateUserError("Could not create user.", msg);
									this.createUserBtn.cancel();
								}));
					}),
					dojo.hitch(this, function(msg) {
						console.error("folio.admin.NewUser.createUserClicked, create portfolio UNsuccessful");
						this.displayCreateUserError("Could not create home portfolio.", msg);
						this.createUserBtn.cancel();
					}));
		}
		else {
			this.application.getCommunicator().createEntry(userArgs).then(
				dojo.hitch(this, function(entry) {
					// Refresh the list that holds the newly created user
					this.entry.setRefreshNeeded(true);
					this.entry.refresh(
						dojo.hitch(
							this,
							function (refEntry) {
								this._update_all(refEntry);
								console.log(refEntry.getContext().getUri());
								this.application.dispatch({action: "childrenChanged", entry: refEntry, source: this});
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
					this.createUserBtn.cancel();
				}),
				dojo.hitch(this, function(msg) {
					console.error("folio.admin.NewUser.createUserClicked, create user UNsuccessful");
					this.displayCreateUserError("Could not create user.", msg);
					this.createUserBtn.cancel();
				}));
		}
	},
	/**
	 * Updates the _all search list and sends an event
	 */
	_update_all: function(refEntry) {
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
						),
						{limit: -1}
					);
				}
			)
		);
	},
	displayCreateUserError: function(/* string */ message, /* ? */ details) {
		while (this.createUserErrorMessage.hasChildNodes()) {
			this.createUserErrorMessage.removeChild(this.createUserErrorMessage.firstChild);
		}
		dojo.place(dojo.doc.createTextNode(message), this.createUserErrorMessage);
		
		dojo.style(this.createUserError, "display", "block");
	},
	hideCreateUserError: function() {
		dojo.style(this.createUserError, "display", "none");
	},
	checkValidFields: function(event) {
		if (this.emailField.isValid() &&
				this.userNameField.isValid() &&
				this.passwordField.isValid() &&
				this.confirmField.isValid() &&
				(this.passwordField.get("value") == this.confirmField.get("value"))) {
			if (!this.createHomePortfolioCheckBox.get("checked") || this.portfolioAliasField.isValid()) {
				this.createUserBtn.set("disabled", false);
			}
			else {
				this.createUserBtn.set("disabled", true);
			}
		}
		else {
			this.createUserBtn.set("disabled", true);
		}
		if (this.createHomePortfolioCheckBox.get("checked")) {
			dojo.style(this.portfolioLocationRow, "display", "table-row");
			dojo.style(this.portfolioNameRow, "display", "table-row");
			dojo.style(this.portfolioDescriptionRow, "display", "table-row");
			dojo.style(this.portfolioAliasRow, "display", "table-row");
		}
		else {
			dojo.style(this.portfolioLocationRow, "display", "none");
			dojo.style(this.portfolioNameRow, "display", "none");
			dojo.style(this.portfolioDescriptionRow, "display", "none");
			dojo.style(this.portfolioAliasRow, "display", "none");
		}
	},
	cancelCreateUserClicked: function() {
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