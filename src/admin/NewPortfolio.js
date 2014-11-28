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

dojo.provide("folio.admin.NewPortfolio");
dojo.require("folio.admin.TabContent");
dojo.require("folio.data.Constants");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Textarea");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.Button");
dojo.require("dojox.form.BusyButton");

dojo.declare("folio.admin.NewPortfolio", [dijit._Widget, dijit._Templated, folio.admin.TabContent], {
	templatePath: dojo.moduleUrl("folio.admin", "NewPortfolioTemplate.html"),
	widgetsInTemplate: true,
	templateString: "",
	createdListeners: null,
	cancelListeners: null,
	viewId: "folio.admin.NewPortfolio",
	
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
		this.nameField.set("value", "");
		this.descriptionField.set("value", "");
		this.aliasField.set("value", "");
		this.createPortfolioBtn.set("disabled", true);
		this.hideCreatePortfolioError();
	},
	createPortfolioClicked: function() {
		var metadata = new rdfjson.Graph();
		var contextContext = this.entry.getContext();
		var portolioResourceUri = contextContext.base + "_newId";

		if (this.nameField.get("value")) {
			metadata.create(portolioResourceUri, folio.data.DCTermsSchema.TITLE, {type: "literal", value: this.nameField.get("value")});
		}
		if (this.descriptionField.get("value")) {
			metadata.create(portolioResourceUri, folio.data.DCTermsSchema.DESCRIPTION, {type: "literal", value: this.descriptionField.get("value")});
		}
		var resourceObj = {};
		if (this.aliasField.get("value")) {
			resourceObj["alias"] = this.aliasField.get("value");
		}
		var args = {
			context: this.entry.getContext(),
			parentList: this.entry,
			metadata: metadata.exportRDFJSON(),
			resource: resourceObj, 
			params: {entrytype: "local", graphtype: "Context", representationType: "informationresource"}
		};
		this.application.getCommunicator().createEntry(args).then(
			dojo.hitch(this, function(entry) {
				// Refresh the list that holds the newly created portfolio
				this.entry.setRefreshNeeded(true);
				this.entry.refresh(
						dojo.hitch(
							this,
							function(refEntry) {
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
							function(msg) {
								console.error("folio.admin.NewUser.createUserClicked, could not refresh user list.");
								console.error(msg);
							}
						)
					);
				for (var i in this.createdListeners) {
					this.createdListeners[i](this.entry.getContext().getBaseURI() + "_contexts/entry/" +entry);
				}
				this.createPortfolioBtn.cancel();
				this.clearDetails();
			}),
			dojo.hitch(this, function(msg) {
				console.error("folio.admin.NewPortfolio.createPortfolioClicked, create UNsuccessful");
				this.displayCreatePortfolioError("Could not create portfolio.", msg);
				this.createPortfolioBtn.cancel();
			}));
	},
	displayCreatePortfolioError: function(/* string */ message, /* ? */ details) {
		while (this.createPortfolioErrorMessage.hasChildNodes()) {
			this.createPortfolioErrorMessage.removeChild(this.createPortfolioErrorMessage.firstChild);
		}
		dojo.place(dojo.doc.createTextNode(message), this.createPortfolioErrorMessage);
		dojo.style(this.createPortfolioError, "display", "block");
	},
	hideCreatePortfolioError: function() {
		dojo.style(this.createPortfolioError, "display", "none");
	},
	checkValidFields: function(event) {
		if (this.aliasField.isValid()) {
			this.createPortfolioBtn.set("disabled", false);
		}
		else {
			this.createPortfolioBtn.set("disabled", true);
		}
	},
	cancelCreatePortfolioClicked: function() {
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