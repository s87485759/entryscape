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

dojo.declare("folio.comment.Comment", [dijit._Widget, dijit._Templated], {
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("folio.comment", "CommentTemplate.html"),

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
		//this.content = args.content;
	}
});