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

dojo.provide("folio.admin.PortfolioQuota");

dojo.require("folio.admin.TabContent");
dojo.require("folio.data.Constants");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.form.NumberTextBox");

dojo.require("dojox.form.BusyButton");

dojo.declare("folio.admin.PortfolioQuota", [dijit._Widget, dijit._Templated, folio.admin.TabContent], {
	templatePath: dojo.moduleUrl("folio.admin", "PortfolioQuotaTemplate.html"),
	widgetsInTemplate: true,
	
	/*
	 * Inhereted method called to initialize all tabs
	 * @param {Object} entry
	 */
	setEntry: function(/* Entry */ entry) {
		this.inherited("setEntry", arguments);
		this.displayQuota();
	},
	
	/*
	 * Method called when the text-area for the quota is changed
	 */
	quotaFieldChanged: function(arg) {
		if(this.quotaFieldDijit.get("value") && this.quotaFieldDijit.isValid()
			&& this.quotaUnitSelectDijit.get("value")){
			this.changeQuotaBtn.set("disabled", false);
		} else {
			this.changeQuotaBtn.set("disabled", true);
		}
	},
	quotaUnitChanged: function(arg) {
		if(this.quotaFieldDijit.get("value") && this.quotaFieldDijit.isValid()
			&& this.quotaUnitSelectDijit.get("value")){
			this.changeQuotaBtn.set("disabled", false);
		} else {
			this.changeQuotaBtn.set("disabled", true);
		}
	},
	changeQuotaClicked: function() {
		var calculatedQuota = folio.data.humanReadableToBytes(this.quotaFieldDijit.get("value"), this.quotaUnitSelectDijit.get("value"));
		var quotaObj = {};
	    quotaObj.quota = calculatedQuota;
		this.entry.getContext().communicator.PUT(
				this.entry.getResourceUri()+"/quota",
				quotaObj).then(
				dojo.hitch(this, function(data) {
					// Hide previous error messages
					dojo.style(this.portfolioQuotaErrorNode,"display","block");
					dojo.attr(this.portfolioQuotaErrorMessageNode,"innerHTML","Successfully saved new quota");
					// Disable the button
					this.reload();
					this.changeQuotaBtn.set("disabled", true);
					// Reset the button
					this.changeQuotaBtn.cancel();
					
				}),
				dojo.hitch(this, function(msg) {
					console.error("Quota change Unsuccessful!");
					dojo.style(this.portfolioQuotaErrorNode, "display","block");
					dojo.attr(this.portfolioQuotaErrorMessageNode,"innerHTML","Not possible to save new quota!");
					// Reset the button, do not disable it!
					this.changeQuotaBtn.cancel();
				}));
	},
	changeToDefaultQuotaClicked: function(){
		var xhrArgs = {
			url: this.entry.getResourceUri()+"/quota",
			preventCache: true,
			handleAs: "json-comment-optional",
			load: dojo.hitch(this, function(){
				dojo.style(this.portfolioQuotaErrorNode,"display","block");
				dojo.attr(this.portfolioQuotaErrorMessageNode,"innerHTML","Successfully saved new quota");
				// Disable the button
				this.reload();
				this.changeToDefaultQuotaBtn.set("disabled", true);
				// Reset the button
				this.changeToDefaultQuotaBtn.cancel();
			}),
			error: dojo.hitch(this, function(){
				dojo.style(this.portfolioQuotaErrorNode,"display","block");
				dojo.attr(this.portfolioQuotaErrorMessageNode,"innerHTML","Could not set to default quota");
				this.reload();
				// Reset the button
				this.changeToDefaultQuotaBtn.cancel();
			})
		};
		var delArgs = this.application.getCommunicator().insertAuthArgs(xhrArgs);
		var tmp = dojo.xhrDelete(delArgs);
			
	},
	displayQuota:function (){
		if(this.entry.quota){//If not the quota support is not activated on the server
			//Deal with the value
			var hrValue = folio.data.bytesAsHumanReadable(this.entry.quota.quota, true);
			var hrValueSplit = hrValue.split(" ");
			
			//Set the value in the dijits
			this.quotaFieldDijit.set("value", hrValueSplit[0]);
			this.quotaUnitSelectDijit.set("value", hrValueSplit[1]);
			dojo.attr(this.quotaDefaultTDNode, "innerHTML", this.entry.quota.hasDefaultQuota);
			
			//Enable the dijits
			this.quotaFieldDijit.set("disabled", false);
			this.quotaUnitSelectDijit.set("disabled", false);
			
			//Activate default quota button if needed
			this.changeToDefaultQuotaBtn.set("disabled", this.entry.quota.hasDefaultQuota);
		} else {
			this.changeQuotaBtn.set("disabled", true);
			this.changeToDefaultQuotaBtn.set("disabled", true);
		}
	},
	reload: function(onSucess, onError) {
		this.entry.setRefreshNeeded();
		this.entry.refresh(dojo.hitch(this, function(){
			this.displayQuota();
		}));
	}
});