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

dojo.provide("folio.WidgetApplication");
dojo.require("folio.Application");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("folio.data.Communicator");
dojo.require("folio.util.Dialog");

//
//	A Widget Class
//

dojo.declare("folio.WidgetApplicationAbstract", [dijit._Widget, dijit._Templated, folio.Application], {
	widgetsInTemplate: true,
	dataDir: "",
	repository: "",
	startEntry: "",
	startContext: "",
	constructor: function(args){
	},
	getDialog: function() {
		return this.dialog;
	},
	startup:function() {
		this.inherited("startup", arguments);
		this.communicator = new folio.data.Communicator(); //Set up a communicator
		var repositoryNS = new jdil.Namespaces({namespaces: {"rest":this.repository}});
		this.namespaces = new jdil.Namespaces({url: this.dataDir+"namespaces", parent: repositoryNS}); //Set up the namespace
		
		//Wait for the definitions to be loaded before setting the application on all views => kickstarting a lot of behaviour.
		this.getConfig(dojo.hitch(this, function() {
			this.store = new folio.data.Store({communicator: this.communicator, namespaces: this.namespaces}); //
	
			var viewIds = ["overView", "feedView", "listView", "contentView", "detailsView", "aggregateView",
			             "createDialog", "editDialog", "navigationBarView", "resourceDialog", "messageDialog", "entryAdminDialog", "breadcrumbView"]; // Layout in SimpleFolioTemplate
			for (var v in viewIds) {
				var viewId = viewIds[v];
				var view = dijit.byId(viewId);
				if (view) {
					view.viewId = viewId;
					this.register(viewId, view);
				}
			}
			if (this.repository) {
				var event = this.getEvent();
				if (event) {
					event.entry.base = this.repository;
					this.dispatch(event);
				} else {
					this.openStartLocation();
				}
			}
		}));
		var div = document.createElement("div");
		document.body.appendChild(div);
		this.dialog = new folio.util.StandardDialog({}, div);
		this.dialog.startup();
		// Create dispatch, -set locale- needs to be changed
		//this.setLocale("sv");
	},
	openStartLocation: function() {
		if(this.startContext) {
				this.openContext(this.repository + this.startContext+"/entry/_top");		//Start up application --> application.openContext					
		} else if (this.startEntry) {
				this.openContext(this.repository + this.startEntry);		//Start up application --> application.openContext
		}
	},
	getEvent: function() {
		var parts= window.location.href.split("#" );
		if (parts.length==2) {
			var args = parts[1].split(".");
			switch (args.length) {
				case 1:
					return {action: "showContext", entry: {contextId: args[0], entryId: "_top"}, source: this};
				case 2:
					return {action: "showEntry", entry: {contextId: args [0], entryId: args[1]}, source: this};
			}
		}
	}
});

dojo.declare("folio.WidgetApplication", folio.WidgetApplicationAbstract, {
	templateString: "<div><div dojoAttachPoint='containerNode'></div></div>"
});