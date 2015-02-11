/*global define, __confolio*/
define(["dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-construct",
    "rdforms/view/Presenter",
    "rdfjson/Graph",
    "dijit/_Widget"
], function (declare, lang, domConstruct, Presenter, Graph, _Widget) {

    return declare([_Widget], {
        compact: true,

        buildRendering: function () {
            this.domNode = this.srcNodeRef;
        },
        show: function (entry, showExternalMetadata) {
            if (this.presenter != null) {
                this.presenter.destroy();
            }
            if (entry == null) {
                return;
            }
            __confolio.application.getItemStore(lang.hitch(this, function (itemStore) {
                var graph, mpItems, config = __confolio.application.getConfig();
                if (showExternalMetadata === true) {
                    graph = entry.getExternalMetadata();
                    mpItems = config.getTemplate(entry, "external");
                } else {
                    graph = entry.getLocalMetadata();
                    mpItems = config.getTemplate(entry, "local");
                }
                if (graph === undefined) {
                    graph = new Graph({});
                }
                var template = itemStore.detectTemplate(graph, entry.getResourceUri(), mpItems);
                this.presenter = new Presenter({
                    template: template,
                    resource: entry.getResourceUri(),
                    graph: graph,
                    compact: this.compact}, domConstruct.create("div", null, this.domNode));
            }));
        }
    });
});