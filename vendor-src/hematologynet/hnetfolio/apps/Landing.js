/*global dojo, dijit, folio*/
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

dojo.provide("hnetfolio.apps.Landing");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.CheckBox")

/**
 */
dojo.declare("hnetfolio.apps.Landing", [dijit._Widget, dijit._Templated, folio.ApplicationView], {
	//===================================================
	// Inherited Attributes
	//===================================================
	templatePath: dojo.moduleUrl("hnetfolio.apps", "LandingTemplate.html"),
	widgetsInTemplate: true,
	show: function(params){
		this.user = this.application.getUser();
		if (this.user) {
			dojo.style(this.landingPageLoginNode, "display", "none");
			dojo.style(this.landingPagePreviewNode, "display", "none");
		}
		else {
			dojo.style(this.landingPageLoginNode, "display", "block");
			dojo.style(this.landingPagePreviewNode, "display", "block");
		}
		dojo.style(this.logInErrorNode, "display", "none");
	},
	postCreate: function() {
		//this.application = __confolio.application;
	},
	_loginClick: function(){
		var usr = this.userNameFieldNode.get("value");
		var pw  = this.passwordFieldNode.get("value");
		var uTermsAgree = this.userTermsFieldNode.get("value");
		
		dojo.style(this.checkBoxLabelNode, "background", "none");
		dojo.style(this.logInErrorNode, "display", "none");
		
		if(!uTermsAgree){
			dojo.style(this.checkBoxLabelNode, "background", "#F87217");
			return;
		} 
		
		// Configure the communicator to authenticate every request
		this.setAuthentication(usr, pw);

		// Make the login request
		this.application.getCommunicator().loadJSON(this.application.repository + "login?auth_challenge=false",
			dojo.hitch(this, "setUser"), dojo.hitch(this, "setUser"));
	},
	setAuthentication: function(userName, password) {
		this.setHttpBasicAuth(userName, password);
		this.setSimpleCookieAuth(userName, password);		
	},

	setSimpleCookieAuth: function(userName, password) {
		var path = "/scam/"; // Assume that SCAM is always at /scam/ (possibly a bug!)
		if (userName !== "_guest") {
			dojo.cookie("scamSimpleLogin", userName + ":" + password,
				{ /* session cookie (dojo bug: leave this out rather than setting to 0 or cookie
				     will expire immediately contrary to documentation): expires: 0,*/
				  path: path
				});
		} else {
			dojo.cookie("scamSimpleLogin", null,
				{ /* delete the cookie: */ expires: -1,
				  path: path
				});
		}
	},

	setHttpBasicAuth: function(userName, password) {
		this.application.getCommunicator().insertAuthArgs = function(userName, password) {
			var authHeader = function(userName, password) {
				var tok = userName + ":" + password;
				var tokArr = [];
				for (var i = 0; i < tok.length; i++) {
					tokArr.push(tok.charCodeAt(i));
				}
				var hash = dojox.encoding.base64.encode(tokArr);
				return "Basic " + hash;
			}(userName, password);
			return function(xhrArgs) {
				// Set the user and password arguments for XMLHttpRequest
				xhrArgs.user = userName;
				xhrArgs.password = password;

				// In case that doesn't work, also set the authorization header manually
				xhrArgs.headers = xhrArgs.headers || {};
				xhrArgs.headers.Authorization = authHeader;

				// In case it is still not enough, include user name and password
				//  within the URL, i.e., "http://user:password@host/..."
				//  (this causes trouble in IE, and Opera will display alerts
				//  about it, so only do this where necessary, i.e., in Safari)
				if (dojo.isSafari) {
					var url = xhrArgs.url;
					var i = url.indexOf("://");
					if (i > 0) {
						i += 3; // Move to index after "://"
						xhrArgs.url = url.slice(0, i).concat(
							userName + ":" + password + "@", url.slice(i));;
					}
				}
				return xhrArgs;
			};
		}(userName, password);

		this.application.getCommunicator().insertAuthParams = function(userName, password) {
			var authParams;
			if (userName !== "" && userName !== "_guest") {
				authParams = "auth_user=" + encodeURIComponent(userName) +
				"&auth_password=" +
				encodeURIComponent(password);
			}			
			return function(url) {
				// Since there is no way of doing HTTP basic authentication explicitly
				//  e.g. through a form submit, submit the login details through query
				//  parameters instead
				if (authParams) {
					return url.concat(url.indexOf("?") < 0 ? "?" : "&", authParams);
				} else {
					return url;
				}
			};
		}(userName, password);
	},

	setUser: function(data) {
		this.application.getStore().clearCache();
		if (typeof data.message !== "undefined") {
			this.setHttpBasicAuth("_guest", "");
			this.status = "invalidLogin";
			dojo.style(this.logInErrorNode, "display", "block");
		} else {
			this.application.setUser(typeof data.id !== "undefined" && data.user !== "_guest" ? data : null);
			this.application.open("start");
			dojo.style(this.logInErrorNode, "display", "none");
			this.userNameFieldNode.set("value", "");
			this.passwordFieldNode.set("value", "");
			this.userTermsFieldNode.set("checked", false);
		}
	},
	handle: function(event){
		this.user = this.application.getUser();
		switch (event.action) {
			case "userChange":
				if (this.user) {
					dojo.style(this.landingPageLoginNode,"display","none");
					dojo.style(this.landingPagePreviewNode, "display", "none");
				} else {
					dojo.style(this.landingPageLoginNode,"display","block");
					dojo.style(this.landingPagePreviewNode, "display", "block");
				}
				break;
		}
	}
});