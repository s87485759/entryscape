/*global define, __confolio*/
define(["dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/connect",
    "dojo/_base/array",
    "dojo/has",
    "dojo/_base/sniff",
    "dojo/on",
    "dojo/aspect",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dojo/string",
    "dijit/form/Form",
    "dijit/form/Button",
    "folio/util/Widget",
    "folio/util/dialog",
    "./authorize",
    "dojo/text!./LoginDialogTemplate.html"
], function (declare, lang, connect, array, has, sniff, on, aspect, domClass, style, construct, attr, string,
             Form, Button, Widget, dialog, authorize, template) {

//    dojo.require("dojo.string");


    // Array containing objects representing tested browsers
    // Properties for the objects:
    //  - title: Text string shown to the user in the browser list
    //  - dojoProperty: The property of "dojo" signaling use of that browser
    //   and giving its version number
    //  - minValue: The minimum supported value of that property, or undefined
    //   if no minimum
    //  - maxValue: The maximum supported value of that property, or undefined
    //   if no maximum
    var browsers = [
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
    ];

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
    return declare([Widget], {
        templateString: template,
        isLogoutNeeded: false,
        isLoggingOut: false,
        status: null,
        userName: null,
        password: null,

        nls: ["loginDialog"],


        postCreate: function() {
            this.inherited("postCreate", arguments);
            var config = __confolio.application.getConfig();
            array.forEach(authorize.providers, function(provider) {
                var src = __confolio.application.getRepository()+"auth/openid/"+provider.id+"?redirectOnSuccess="+encodeURIComponent(window.location.href);
                var node = construct.create("a", {"class": "provider", href: src}, this.providers);
                construct.create("img", {src: config.getIcon("openid-"+provider.id, "64x64")}, construct.create("div", {"class": "img-wrap"}, node));
                //on(node, "click", lang.hitch(this, this.showOpenIdDialog, provider));
            }, this);
            var signuplink = attr.set(this.signuplink, "href", __confolio.viewMap.getHashUrl("account", {}));
            on(signuplink, "click", lang.hitch(this, this.doClose));
        },

        destroyRecursive: function() {
            if (this.dialog) {
                this.dialog.destroyRecursive();
            }
        },
        show: function() {
            if (this.dialog == null) {
                var i, browser, isTested = false, isMatch;
                this.dialog = new dijit.Dialog({autofocus: false, content: "<div></div>"});
                //aspect.after(this.dialog, "hide", lang.hitch(this, this.onHide));
                this.dialog.set("content", this.domNode);
                this.changeLocale();

                this.loginForm.onSubmit = lang.hitch(this, function() {
                    this.doLogin();
                    return false;
                });
                if (this.userName != null && this.userName !== "") {
                    this.userInput.set("value", this.userName);
                }
                if (this.password != null && this.password !== "") {
                    this.passwordInput.set("value", this.password);
                }

                for (i = 0; i < browsers.length; i++) {
                    browser = browsers[i];
                    isMatch = true;
                    if (typeof browser.minValue !== "undefined" &&
                            has(browser.dojoProperty) < browser.minValue) {
                            isMatch = false;
                        }
                    if (typeof browser.maxValue !== "undefined" &&
                        has(browser.dojoProperty) > browser.maxValue) {
                        isMatch = false;
                    }
                    if (isMatch) {
                        isTested = true;
                    }
                }
                if (!isTested) {
                    style.set(this.browserWarning.domNode, "display", "block");
                    style.set(this.browserList.domNode, "display", "block");
                }

                if (this.isLogoutNeeded) {
                    this.status = "loggedOut";
                    attr.set(this.loginStatus, "innerHTML", this.NLS.loginDialog[this.status]);
                    authorize.unAuthorizeUser();
                }
            }
            //Bug fix for Strange behaviour in Firefox when trying to remember focus
            //sometimes accessing current focused node (an input) selectionStart and selectionEnd attributes throws exceptions.
            //Exception occurs in dijit/_base/focus.js in getBookmark function line 62 in dojo1.6.1.
 //           dijit._curFocus = null;
            //End of bugfix.

            this.dialog.show();
            this.userInput.focus(); // Otherwise IE doesn't seem to focus the user name input
        },
        changeLocale: function() {
            if (this.dialog) {
                this.dialog.set("title", string.substitute(this.NLS.loginDialog.title, {app :__confolio.config['title']}));
            }
            if (this.status) {
                attr.set(this.loginStatus, "innerHTML", this.NLS.loginDialog[this.status]);
            }
            this.browserWarning.innerHTML = "<strong>" + this.NLS.loginDialog.warning + "</strong>" + this.NLS.loginDialog.warningText;
            this.browserList.innerHTML = "";
            for (var i = 0; i < browsers.length; i++) {
                browser = browsers[i];
                text = browser.title;
                if (typeof browser.maxValue === "undefined" &&
                    typeof browser.minValue !== "undefined") {
                    text = this.NLS.loginDialog.andHigher.replace("%s", text);
                }
                var item = construct.create("li", {"innerHTML": text}, this.browserList);
            }
        },
        doLogin: function(userName, password) {
            userName = userName || this.userInput.get("value");
            password = password || this.passwordInput.get("value");

            if (userName == null || userName.length == 0) {
                userName = "_guest";
            }

            this.userInput.set("disabled", true);
            this.passwordInput.set("disabled", true);
            this.loginButton.set("disabled", true);
            this.status = "loggingIn";
            attr.set(this.loginStatus, "innerHTML", this.NLS.loginDialog[this.status]);

            // Configure the communicator to authenticate every request
            authorize.cookieAuth(userName, password).then(lang.hitch(this.dialog, this.dialog.hide));
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
});
