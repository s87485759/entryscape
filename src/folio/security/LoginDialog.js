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

dojo.provide("folio.security.LoginDialog");
dojo.require("dijit.Dialog");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.Form");
dojo.require("dijit.Tooltip");
dojo.require("dojox.encoding.base64");
dojo.require("dojo.string");

/**
 * LoginDialog currently has several purposes:
 *  - Interactively accept user name and password from the user.
 *  - Use those login details to log in to the server.
 *  - Configure future requests to use that login.
 *  - If asked to do so, also log out before interactive login is enabled.
 *  - Warn the user about use of an untested browser.
 * (- It also allows change of locale, which is otherwise not possible while
 *     the dialog is open since it is modal.)
 *
 * The argument object given to the constructor must contain:
 *  - "application" property referencing the folio application object.
 * and may contain:
 *  - "isLoggingOut" property set to true in order to request logout before
 *   interactive login.
 *  - "userName" property containing a user name to be initially filled in.
 *  - "password" property containing a password to be initially filled in.
 */
dojo.declare("folio.security.LoginDialog", null, {
	title: "",
	application: null,
	isLogoutNeeded: false,
	isLoggingOut: false,
	status: null,
	userName: null,
	password: null,
	widget: null,

	// Array containing objects representing tested browsers
	// Properties for the objects:
	//  - title: Text string shown to the user in the browser list
	//  - dojoProperty: The property of "dojo" signaling use of that browser
	//   and giving its version number
	//  - minValue: The minimum supported value of that property, or undefined
	//   if no minimum
	//  - maxValue: The maximum supported value of that property, or undefined
	//   if no maximum
	browsers: [
		{
			title: "Mozilla Firefox, 9- ",
			dojoProperty: "isFF",
			minValue: 9,
			maxValue: undefined
		},
		{
			title: "Internet Explorer 8-",
			dojoProperty: "isIE",
			minValue: 8,
			maxValue: undefined
		},
		{
			title: "Google Chrome 15-",
			dojoProperty: "isChrome",
			minValue: 15,
			maxValue: undefined
		}
	],

	constructor: function(params) {
		dojo.mixin(this, params);
	},
	
	destroyRecursive: function() {
		if (this.widget) {
			this.widget.destroyRecursive();
		}
		if (this.dialog) {
			this.dialog.destroyRecursive();			
		}
	},

	show: function(noAutomaticLogin) {
		if (!noAutomaticLogin && this.doLoginViaCookie()) {
			return;
		}
		if (this.dialog == null) {
			var that = this;
			var i, browser, isTested = false, isMatch;
			this.dialog = new dijit.Dialog({autofocus: false, content: "<div></div>"});
			var node = dojo.create("div");
			this.dialog.set("content", node);
			var w = new folio.security.LoginDialogWidget({}, node);
			this.widget = w;
	
			w.dialog = this;
			this.localize();
	
			w.loginForm.onSubmit = function() {
				that.doLogin();
				return false;
			};
			if (this.userName) {
				w.userInput.set("value", this.userName);
			}
			if (this.password) {
				w.passwordInput.set("value", this.password);
			}
	
			for (i = 0; i < this.browsers.length; i++) {
				browser = this.browsers[i];
				if (typeof dojo[browser.dojoProperty] !== "undefined") {
					isMatch = true;
					if (typeof browser.minValue !== "undefined" &&
					  dojo[browser.dojoProperty] < browser.minValue) {
						isMatch = false;
					}
					if (typeof browser.maxValue !== "undefined" &&
					  dojo[browser.dojoProperty] > browser.maxValue) {
						isMatch = false;
					}
					if (isMatch) {
						isTested = true;
					}
				}
			}
			if (!isTested) {
				dojo.style(w.browserWarning.domNode, "display", "block");
				dojo.style(w.browserList.domNode, "display", "block");
			}

//			w.placeAt(this.containerNode);

			// Make sure that the dialog is destroyed after it is hidden
			//  (otherwise it will remain loaded in the background and element
			//  identifiers will conflict between instances)
			var hideHandle = dojo.connect(this.dialog, "hide", this, function() {
				dojo.disconnect(hideHandle);
				//Need destroy with a delay since the hide will require a non destroyed dialog after the delayed fade operation.
				setTimeout(dojo.hitch(this, function() {
						this.dialog.destroy();
					}), 2000);
	  		});
	
			if (this.isLogoutNeeded) {
				this.isLoggingOut = true;
				this.doLogin("", "");
			}
		}
		//Bug fix for Strange behaviour in Firefox when trying to remember focus
		//sometimes accessing current focused node (an input) selectionStart and selectionEnd attributes throws exceptions.
		//Exception occurs in dijit/_base/focus.js in getBookmark function line 62 in dojo1.6.1.
		dijit._curFocus = null;
		//End of bugfix.
		
		this.dialog.show();
		this.widget.userInput.focus(); // Otherwise IE doesn't seem to focus the user name input	
	},

/*	onFocus: function() {
		this.widget.userInput.focus(); // Otherwise IE doesn't seem to focus the user name input
	},*/

	localize: function() {
		dojo.requireLocalization("folio", "loginDialog");
		this.resourceBundle = dojo.i18n.getLocalization("folio", "loginDialog"); 

		var w = this.widget;
		var b = this.resourceBundle;
		var i, browser, item, text;
		this.dialog.set("title", dojo.string.substitute(b.title, {app :__confolio.config['title']}));
		w.userLabel.domNode.innerHTML = b.user;
		w.passwordLabel.domNode.innerHTML = b.password;
		w.loginButton.set("label", b.logIn);
		if (this.status) {
			w.loginStatus.set("content", this.resourceBundle[this.status]);
		}
		w.browserWarning.domNode.innerHTML = "<strong>" + b.warning + "</strong>" + b.warningText;
		w.browserList.domNode.innerHTML = "";
		for (i = 0; i < this.browsers.length; i++) {
			browser = this.browsers[i];
			text = browser.title;
			if (typeof browser.maxValue === "undefined" &&
			  typeof browser.minValue !== "undefined") {
				text = b.andHigher.replace("%s", text);
			}
			item = document.createElement("li");
			item.appendChild(document.createTextNode(text));
			w.browserList.domNode.appendChild(item);
		}
	},

	doLogin: function(userName, password) {
		var w = this.widget;
		userName = userName || w.userInput.get("value");
		password = password || w.passwordInput.get("value");

		if (userName.length == 0) {
			userName = "_guest";
		}

		w.userInput.set("disabled", true);
		w.passwordInput.set("disabled", true);
		w.loginButton.set("disabled", true);
		this.status = this.isLoggingOut ? "loggedOut" : "loggingIn";
		w.loginStatus.set("content", this.resourceBundle[this.status]);

		// Configure the communicator to authenticate every request
		this.setAuthentication(userName, password);

		// Make the login request
		this.application.getCommunicator().GET(this.application.repository + "login?auth_challenge=false").then(
			dojo.hitch(this, "setUser"), dojo.hitch(this, "setUser"));
	},
		
	setAuthentication: function(userName, password) {
		this.setHttpBasicAuth(userName, password);
		this.setSimpleCookieAuth(userName, password);		
	},

	setSimpleCookieAuth: function(userName, password) {
		var path = __confolio.config["scamPath"] || "scam";
		path = "/"+path+"/";
//		var path = "/scam/"; // Assume that SCAM is always at /scam/ (possibly a bug!)
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
	doLoginViaCookie: function() {
		var cookieValue = dojo.cookie("scamSimpleLogin");
		if (cookieValue != null) {
			var arr = cookieValue.split(":");
			var userName = arr[0], password = arr[1];
			// Configure the communicator to authenticate every request
			this.setHttpBasicAuth(userName, password);

			// Make the login request
			this.application.getCommunicator().GET(this.application.repository + "login?auth_challenge=false").then(
				dojo.hitch(this, "setUser"), dojo.hitch(this, "setUser"));
			return true;
		}
	},

	setHttpBasicAuth: function(userName, password) {
		return; // No basic auth currently, rely on cookies.
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
					var _onChangeActiveurl = xhrArgs.url;
					var i = _onChangeActiveurl.indexOf("://");
					if (i > 0) {
						i += 3; // Move to index after "://"
						xhrArgs.url = _onChangeActiveurl.slice(0, i).concat(
							userName + ":" + password + "@", _onChangeActiveurl.slice(i));;
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
		var w = this.widget;
		this.application.getStore().clearCache();
		if (this.isLoggingOut) {
			this.application.setUser(null);
			this.isLoggingOut = false;
			this.status = "loggedOut";

			w.userInput.set("disabled", false);
			w.passwordInput.set("disabled", false);
			w.loginButton.set("disabled", false);
			w.loginStatus.set("content", this.resourceBundle[this.status]);
			w.userInput.focus();
		} else if (typeof data.message !== "undefined") {
			this.setHttpBasicAuth("_guest", "");
			this.status = "invalidLogin";

			w.passwordInput.set("value", "");
			w.userInput.set("disabled", false);
			w.passwordInput.set("disabled", false);
			w.loginButton.set("disabled", false);
			w.loginStatus.set("content", this.resourceBundle[this.status]);
			(w.userInput.set("value") == "" ? w.userInput : w.passwordInput).focus();
		} else {
			this.application.setUser(typeof data.id !== "undefined" && data.user !== "_guest" ? data : null);
			this.doClose();
		}
	},

	doClose: function() {
		if (this.dialog != null) {
			this.dialog.hide();
		}
	}
});

/**
 * A widget which is used by the LoginDialog to load the login dialog template.
 */
dojo.declare("folio.security.LoginDialogWidget", [dijit._Widget, dijit._Templated], {
	templatePath: dojo.moduleUrl("folio.security", "LoginDialogTemplate.html"),
	widgetsInTemplate: true,
	dialog: null,

	doClose: function() {
		this.dialog.doClose();
	},
	
	postCreate: function() {
		this.inherited("postCreate", arguments);
	}

});
