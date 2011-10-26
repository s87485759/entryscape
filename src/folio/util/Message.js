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

dojo.provide("folio.util.Message");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("folio.Application");

dojo.declare("folio.util.MessageDialog", [dijit.Dialog, folio.ApplicationView], {
	constructor: function() {
		this.localize();
	},
	startup: function() {
		this.titleNode.innerHTML = "Message";
	},
	getSupportedActions: function() {
		return ["message", "localeChange"];
	},
	handle: function(event) {
		switch (event.action) {
		case "message":
			var mesg = event.message.replace(/(\r\n|\r|\n)/g, "<br/>");
			if (event.entry) {
				event.entry.getContext().getAlias(dojo.hitch(this, function(alias) {
					this.setContent(dojo.string.substitute(this.resourceBundle.message, [event.operation, event.entry.getId(), event.alias, event.status, mesg]));
					this.show();
				}));
			} else {
				this.setContent(mesg);
				this.show();
			}
			break;
		case "localeChange":
			this.localize();
			break;
		}		
	},
	localize: function() {
		dojo.requireLocalization("folio", "message");
		this.resourceBundle = dojo.i18n.getLocalization("folio", "message"); 
		this.set(this.resourceBundle);
	}
});