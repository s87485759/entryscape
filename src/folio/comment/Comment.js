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

dojo.provide("folio.comment.Comment");
dojo.require("folio.editor.RFormsPresenter");
dojo.require("dijit.Editor");


dojo.declare("folio.comment.Comment", [dijit._Widget, dijit._Templated], {
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("folio.comment", "CommentTemplate.html"),
	entry: null,

	/**
 	* Constructor. 
 	* Does the initial localization and sets the default text for the text area.
 	* It also creates the dialog box that actually shows the content.
 	* @param {Object} args - The entry which comments are to be loaded and 
 	* the application (which is, at least, 
 	* needed for retrieving the home context for the user)
 	*/
	constructor: function(args) {
		this.name = args.name;
		this.date = args.date;
		this.time = args.time;
		this.application = __confolio.application;
		//this.content = args.content;
	},
	postCreate: function() {
		this.inherited("postCreate", arguments);
		this.presenterDijit.show(this.entry, false);
		var cre = this.entry.getCreationDate();
		if (cre != null) {
			dojo.attr(this.timeNode, "innerHTML", cre);
		}
		var creator = this.entry.getCreator();
		if (creator != null) {
			this.application.getStore().loadEntry(creator, {}, dojo.hitch(this, function(ent) {
				dojo.attr(this.creatorNode, "innerHTML", folio.data.getLabel(ent));
			}),dojo.hitch(this, function(mesg) {
				dojo.attr(this.creatorNode, "innerHTML", "Unknown");
			}));
		} else {
			dojo.attr(this.creatorNode, "innerHTML", "Unknown");
		}
		this.contentViewDijit.show(this.entry);
	}
});