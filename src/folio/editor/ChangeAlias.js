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

dojo.provide("folio.editor.ChangeAlias");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Button");
dojo.require("folio.editor.ResourceEditor");

dojo.declare("folio.editor.ChangeAlias", [dijit._Widget, dijit._Templated, folio.editor.ResourceEditor], {
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("folio", "editor/ChangeAliasTemplate.html"),	
	constructor: function(args) {
	},
	setApplication: function(application) {
		this.application = application;
	},
	postCreate: function() {
		this.inherited("postCreate", arguments);
	},
	handle: function(event) {
		this.context = event.entry.getContext().store.getContext(event.entry.getResourceUri());
		this.context.getAlias(dojo.hitch(this, function(alias) {
			this.currentAlias = alias;
			this.aliasField.setValue(this.currentAlias);
			this.setMessage("Current alias is "+this.currentAlias);			
		}));
	},
	doneClicked: function() {
		if (this.onFinish) {
			this.onFinish();
		}
	},
	setMessage: function(message) {
		this.aliasMessage.innerHTML=message;
	},
	tryChangeClicked: function() {
		this.context.setAlias(this.aliasField.getValue(), 
				dojo.hitch(this, function(alias) {
					this.currentAlias = alias;
					this.setMessage("Alias successfully changed. <br>Current alias is "+this.currentAlias);
				}),
				dojo.hitch(this, function(mesg) {
					this.setMessage("Context not changed due to: "+mesg + "<br>Current alias is "+this.currentAlias);
				})
		);
	}
});