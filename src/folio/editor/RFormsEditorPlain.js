/*global define, __confolio*/
define(["dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-construct",
    "rdforms/view/Editor",
    "dijit/_Widget"
], function (declare, lang, domConstruct, Editor, _Widget) {

    return declare([_Widget], {
        includeLevel: "mandatory",
        buildRendering: function () {
            this.inherited("buildRendering", arguments);
            this.domNode = this.srcNodeRef || domConstruct.create("div");
            this.rformsEditorPlainNode = domConstruct.create("div", null, this.domNode);
        },
        /**
         * @param graph {rdfjson.Graph} the rdf to edit.
         * @param entry {folio.data.Entry} the entry to edit, may be left out if the template is provided.
         * @param uri {String} the resource to edit as a URI
         * @param template {rforms.template.Template} the RForms-template to use for editing, if left out the entry must be provided.
         */
        show: function (graph, entry, uri, template) {
            var application = __confolio.application;
            if (this.editor != null) {
                this.editor.destroy();
            }
            this.graph = graph;
            application.getItemStore(lang.hitch(this, function (itemStore) {
                var config = application.getConfig();
                if (template == null) {
                    var mpItems = config.getTemplate(entry, "local");
                    template = itemStore.detectTemplate(this.graph, uri, mpItems);
                }
                this.editor = new Editor({
                    template: template,
                    languages: config.getMPLanguages(),
                    graph: this.graph,
                    resource: entry.getResourceUri(),
                    includeLevel: this.includeLevel,
                    compact: true}, domConstruct.create("div", null, this.domNode));
            }));
        },
        isWithinCardinalityConstraints: function () {
            return this.editor.binding.report().errors.length === 0;
        },
        showErrors: function () {
            this.editor.report();
        },
        getMetadata: function () {
            return this.graph.exportRDFJSON();
        },
        /**
         * Allowed includelevels are recommended, mandatory or optional.
         * If nothing is provided the default is mandatory.
         */
        setIncludeLevel: function (/*String*/ level) {
            this.includeLevel = level || "mandatory";
        }
    });
});