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

dojo.provide("folio.navigation.NavigationBarSlim");
dojo.require("folio.navigation.NavigationBar");
dojo.require("dojo.fx");
dojo.require("dojo.fx.easing");

/**
 * Same as NavigationBar, but with a smaller design.
 */
dojo.declare("folio.navigation.NavigationBarSlim", folio.navigation.NavigationBar, {
	minimal: false,
	templatePath: dojo.moduleUrl("folio", "navigation/NavigationBarSlimTemplate.html"),
	
	postCreate: function() {
		this.inherited("postCreate", arguments);
		dojo.place(this.controlMenuNode, document.body);
	},
	_controlClicked: function() {
		if (this._controlMenuOpen) {
			dojo.style(this.controlMenuNode, "display", "none");
			this._controlMenuOpen = false;
		} else {
			this._showProfilePicture();
			dojo.style(this.controlMenuNode, "display", "");
			this._controlMenuOpen = true;
		}
	},
	_showProfilePicture: function() {
		var f = dojo.hitch(this, function(entry){
			this.userEntry = entry;
			dojo.attr(this.profilePictureNode, "innerHTML", "");
			var imageUrl = folio.data.getFromMD(entry, folio.data.FOAFSchema.IMAGE);
			var config = this.application.getConfig();
			var backup = folio.data.isUser(entry) ? ""+config.getIcon("user_picture_frame") : ""+config.getIcon("group_picture_frame")
			dojo.create("img", {src: imageUrl || backup, style: {width: "100px"}}, this.profilePictureNode);
		});
		if (this.userEntry) {
			f(this.userEntry);
		} else {
			this.application.getStore().loadEntry({base: this.application.getRepository(), 
		                 contextId: "_principals", 
						 entryId: this.application.getUser().id}, 
						 {},
						 function(entry) {
							if (entry.resource == null) {
								entry.setRefreshNeeded();
								entry.refresh(f);
							} else {
								f(entry);
							}
						 }
			);
		}
	}
});