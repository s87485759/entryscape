/*global define, __confolio*/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/connect",
    "folio/list/ListView",
    "folio/tree/Tree",
    "folio/entry/DetailsView",
    "folio/util/Message",
    "dijit/layout/BorderContainer",
    "folio/editor/RFormsEditor",
    "folio/editor/EntryAdminEditor",
    "folio/navigation/Breadcrumbs",
    "folio/util/Widget",
    "dojo/text!./TFolioTemplate.html"
], function(declare, lang, connect, ListView, Tree, DetailsView, Message, BorderContainer, RFormsEditorDialog, EntryAdminEditor,
            Bredcrumbs, Widget, template) {

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