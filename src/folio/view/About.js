define([
    "dojo/_base/declare",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dijit/_WidgetBase"
], function(declare, construct, style, WidgetBase) {
    return declare(WidgetBase, {
        buildRendering: function() {
            this.domNode = this.srcNodeRef;
            style.set(this.domNode, "overflow-y", "hidden");
            var aboutUrl = __confolio.config["aboutUrl"];
            if (aboutUrl) {
                construct.create("iframe", {src: aboutUrl, style: {height: "100%", width: "100%", margin:0, padding: 0, border: 0}}, this.domNode);
            }
        },
        /**
         * Required by ViewMap to be able to set a nice breadcrumb.
         * @param {Object} params
         */
        getLabel: function(params) {
            return "About";
        },
        show: function(params) {
        }
    })
});
