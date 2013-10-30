/*global define, __confolio*/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/connect",
    "dojo/_base/array",
    "folio/Application",
    "folio/util/Widget"
], function (declare, lang, connect, array, Application, Widget) {

    return declare([Widget, Application], {
        templateString: "<div><div dojoAttachPoint='containerNode'></div></div>",
        startEntry: "",
        startContext: "",

        startup: function () {
            this.inherited("startup", arguments);
            //Wait for the definitions to be loaded before setting the application on all views => kickstarting a lot of behaviour.
            this.getConfig(dojo.hitch(this, function () {
                var viewIds = ["overView", "feedView", "listView", "contentView", "detailsView", "aggregateView",
                    "createDialog", "editDialog", "navigationBarView", "resourceDialog", "messageDialog", "entryAdminDialog", "breadcrumbView"]; // Layout in SimpleFolioTemplate
                for (var v in viewIds) {
                    var viewId = viewIds[v];
                    var view = dijit.byId(viewId);
                    if (view) {
                        view.viewId = viewId;
                        this.register(viewId, view);
                    }
                }
                if (this.repository) {
                    var event = this.getEvent();
                    if (event) {
                        event.entry.base = this.repository;
                        this.dispatch(event);
                    } else {
                        this.openStartLocation();
                    }
                }
            }));
        },
        openStartLocation: function () {
            if (this.startContext) {
                this.openContext(this.repository + this.startContext + "/entry/_top");		//Start up application --> application.openContext
            } else if (this.startEntry) {
                this.openContext(this.repository + this.startEntry);		//Start up application --> application.openContext
            }
        },
        getEvent: function () {
            var parts = window.location.href.split("#");
            if (parts.length == 2) {
                var args = parts[1].split(".");
                switch (args.length) {
                    case 1:
                        return {action: "showContext", entry: {contextId: args[0], entryId: "_top"}, source: this};
                    case 2:
                        return {action: "showEntry", entry: {contextId: args [0], entryId: args[1]}, source: this};
                }
            }
        }
    });
});