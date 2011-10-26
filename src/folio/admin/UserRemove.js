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

dojo.provide("folio.admin.UserRemove");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.CheckBox");

dojo.require("dojox.form.BusyButton");

dojo.require("folio.admin.TabContent");


dojo.declare("folio.admin.UserRemove", [dijit._Widget, dijit._Templated, folio.admin.TabContent], {
	templatePath: dojo.moduleUrl("folio.admin", "UserRemoveTemplate.html"),
	widgetsInTemplate: true,
	
	/*
	 * Inhereted method called to initialize all tabs
	 * @param {Object} entry
	 */
	setEntry: function(/* Entry */ entry) {
		this.inherited("setEntry", arguments);
		this.entry = entry;
	},
	/*_exportPortfolio: function(){
		var uriString = this.entry.getResourceUri()+"/export"
		var includeOnlyMD = this.onlyMDCheckboxDijit.get("value");
		if(includeOnlyMD){
			uriString+="?metadataOnly";
		}
		var newWindow = window.open(uriString,"_blank");
	},*/
	_removeUser: function(){
		var contextet = this.entry.getContext();
		var storet = contextet.getStore();
		this.application.getCommunicator().removeEntry({
			entry: this.entry,
			onSuccess:dojo.hitch(this, function(argv){
				console.log("User deleted!");
				this.removeButton.cancel();
			}),
			onError:dojo.hitch(this, function(argv){
				console.log("Failed to delete user!");
				this.removeButton.cancel();
			})
		});
	}
});
