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

dojo.provide("hnetfolio.simple.NavigationBar");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.Menu");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.CheckBox");
dojo.require("hnetfolio.editor.UserEditor");
dojo.require("hnetfolio.simple.CompetenceSearch");
// remove this line
dojo.require("dijit.form.FilteringSelect");
dojo.require("folio.navigation.NavigationBar");
dojo.require("dijit.ProgressBar");
dojo.requireLocalization("dijit.form", "validate");


dojo.declare("hnetfolio.simple.NavigationBar", [folio.navigation.NavigationBar], {
	searchUserLabel: "",
	searchUserChecked: false,
	templatePath: dojo.moduleUrl("hnetfolio", "simple/NavigationBarTemplate.html"),	
	postCreate: function() {
		this.inherited("postCreate", arguments);
	},
	_competenceSearchClicked: function() {
		if(!this.competenceSearchD){
		    this.competenceSearchD = new hnetfolio.simple.CompetenceSearch();
			this.competenceSearchD.startup();
		}
		this.competenceSearchD.showCompSearchDialog(this.application);
	},
	userFieldClicked: function() {
		this.application.dispatch({action: "showView", viewId: "resourceDialog", entry: this.getUserURI(), widgetClass: hnetfolio.editor.UserEditor, dialogTitle: this.changeUserDialogTitle});
	},
	doSearch: function(term) {
		if(this.searchUserCheck && this.searchUserCheck.attr("checked")){
			if (term.length < 3) {
			   this.application.message(this.resourceBundle.searchTermFiveCharsMessage);
			   return;
		    }
			var lt = ["local"];
			var bt = ["user"];
			var context = this.application.getStore().getContext(this.application.repository+"_search");
		    this.searchButton.attr("disabled", true);
			this._showProgress();
			context.search({term: term, context: undefined, locationType: lt, builtinType: bt, onSuccess: dojo.hitch(this, function(entryResult) {
			   this.application.dispatch({action: "showEntry", entry: entryResult, source: this});
			   this.searchButton.attr("disabled", false);
			   this._hideProgress();			
		     }),
			onError: dojo.hitch(this, function(error) {
			   this.searchButton.attr("disabled", false);
//			   this.application.message("Failed to search: "+error);
			   this.application.message(this.resourceBundle.searchFailedMessage);
			   this._hideProgress();
		    })});
		} else {
			this.inherited("doSearch", arguments);
		}
	}
});
