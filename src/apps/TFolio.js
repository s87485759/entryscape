/*global define, __confolio*/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/connect",
    "folio/list/ListView", //in template
    "folio/tree/Tree", //in template
    "folio/entry/DetailsView", //in template
    "folio/util/Message", //in template
    "dijit/layout/BorderContainer", //in template
    "folio/editor/RFormsEditor", //in template
    "folio/navigation/Breadcrumbs", //in template
    "folio/util/Widget",
    "dojo/text!./TFolioTemplate.html"
], function(declare, lang, connect, ListView, Tree, DetailsView, Message, BorderContainer, RFormsEditor,
            Breadcrumbs, Widget, template) {

    return declare(Widget, {
        templateString: template,
        startup: function() {
            this.inherited("startup", arguments);
            this.bc.startup();
            this.watch("selected", lang.hitch(this, function() {
                if (this.get("selected")) {
                    this.listView._list.listenForKeyEvents();
                } else {
                    this.listView._list.stopListenForKeyEvents();
                }
            }));
        },
        resize: function() {
            this.inherited("resize", arguments);
            this.bc.resize();
        },
        /**
         * Required by ViewMap to be able to set a nice breadcrumb.
         * @param {Object} params
         */
        getLabel: function(params) {
            return "Default";
        },
        show: function(params) {
            if (params.entry == null && params.context == null) {
                params.context = this.startContext;
                params.entry = "_top";
            }
            connect.publish("/confolio/showEntry", [{entry: params.entry, context: params.context, list: params.list}]);
        }
    });
});