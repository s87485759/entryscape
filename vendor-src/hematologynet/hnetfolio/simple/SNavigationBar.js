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

dojo.provide("hnetfolio.simple.SNavigationBar");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.Menu");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.CheckBox");
dojo.require("hnetfolio.editor.UserEditor");
dojo.require("hnetfolio.simple.SubfieldSearch");
//dojo.require("hnetfolio.security.LoginDialog");
// remove this line
dojo.require("dijit.form.FilteringSelect");
dojo.require("folio.navigation.NavigationBar");
dojo.require("hnetfolio.simple.NavigationBar");
dojo.require("dijit.ProgressBar");
dojo.require("folio.editor.ResourceEditor");
dojo.requireLocalization("dijit.form", "validate");


dojo.declare("hnetfolio.simple.SNavigationBar", [hnetfolio.simple.NavigationBar], {
	searchUserLabel: "",
	searchUserChecked: false,
	templatePath: dojo.moduleUrl("hnetfolio", "simple/SNavigationBarTemplate.html"),	
	postCreate: function() {
		this.inherited("postCreate", arguments);
		dojo.attr(this.subfieldSearchNode, "href", __confolio.viewMap.getHashUrl("HNETSearch", {}));
		dojo.attr(this.landingPageNode, "href", __confolio.viewMap.getHashUrl("start", {}));
		dojo.attr(this.disclaimerPageNode, "href", __confolio.viewMap.getHashUrl("UserTerms", {}));
		dojo.attr(this.contactPageNode, "href", __confolio.viewMap.getHashUrl("contact", {}));
	},
	/*_loginLinkClicked: function() {
		new hnetfolio.security.LoginDialog({
			isLogoutNeeded: !(!this.user), // Whether or not this is actually a logout
			application: this.application
		}).show();
	}*/
});
