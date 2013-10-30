/*global define, __confolio*/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/connect",
    "dojo/_base/array",
    "dijit/Dialog",
    "folio/ApplicationView"
], function (declare, lang, connect, array, Dialog, ApplicationView) {

    return declare([Dialog, ApplicationView], {
    startup: function() {
        this.inherited("startup", arguments);
		this.titleNode.innerHTML = "Message";
		this.localize();
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
        require(["dojo/i18n!folio/nls/message"], lang.hitch(this, function(bundle) {
            this.resourceBundle = bundle;
            this.set(this.resourceBundle);
        }));
	}
});
});