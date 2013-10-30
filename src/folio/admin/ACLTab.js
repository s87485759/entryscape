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

dojo.provide("folio.admin.ACLTab");
dojo.require("folio.admin.TabContent");
dojo.require("folio.util.dialog");
dojo.require("folio.Application");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare("folio.admin.ACLTab", [folio.util.ButtonsBelow, folio.admin.TabContent], {
	postCreate: function() {
		this.containerNode = this.domNode; //Neccessary for ff3.5 bug.
		this.inherited("postCreate", arguments);
		this.saveButton = new dojox.form.BusyButton({label: "Save", busyLabel: "Saving",
			onClick: dojo.hitch(this, this.save)});
		this.addButton(this.saveButton);
	},
	save: function() {
		if (this.acl.hasACL()) {
			this.acl.exportAclToList(dojo.hitch(this, function(list) {
			folio.data.setACLList(this.entry, list);
			this.entry.saveInfo(dojo.hitch(this, function() {
					this.saveButton.cancel();
				}), dojo.hitch(this, function(message) {
					this.application.message(message);
					saveButton.cancel();
				}));
			}));
		} else {
			folio.data.setACLList(this.entry, []);
			this.entry.saveInfo(dojo.hitch(this, function() {
				this.saveButton.cancel();
			}), dojo.hitch(this, function(message) {
				this.application.message(message);
				this.saveButton.cancel();
			}));
		}		
	},
	setEntry: function(entry) {
		this.inherited("setEntry", arguments);
		this.acl = new folio.create.ACL({open: true, autoHeight: 6});
		this.acl.startup();
		this.show(this.acl);
		this.acl.launchOld(entry);
	},
	resize: function() {
		if (this.acl) {
			this.acl.resize();
		}
		this.inherited("resize", arguments);
	}
});
