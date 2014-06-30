/*global define, __confolio*/
define([
    "dojo/_base/declare",
    "folio/ApplicationView",
    "folio/entry/Details",
    "dojo/dom-style",
    "dijit/layout/_LayoutWidget"
], function (declare, ApplicationView, Details, domStyle, _LayoutWidget) {

    return declare([_LayoutWidget, ApplicationView], {

        //===================================================
        // Public Attributes
        //===================================================
        doFade: false,

        //===================================================
        // Inherited Attributes
        //===================================================
        region: "",

        //===================================================
        // Public API
        //===================================================
        update: function (entry) {
            this._details.update(entry);
        },
        clear: function () {
            this._details.clear();
        },

        //===================================================
        // Inherited methods
        //===================================================
        buildRendering: function () {
            this.domNode = this.srcNodeRef;
            this.application = __confolio.application;
            this._details = new Details(
                {application: this.application,
                    region: this.region || "center",
                    splitter: this.splitter,
                    style: this.style,
                    doFade: this.doFade},
                this.srcNodeRef);
        },
        getChildren: function () {
            return [this._details];
        },
        resize: function (size) {
            this.inherited("resize", arguments);
            this._details.resize(size);
        },

        getSupportedActions: function () {
            return ["changed", "deleted", "clear", "showEntry", "userChange", "localeChange"];
        },

        handle: function (event) {
            switch (event.action) {
                case "localeChange":
                    this._details._localize();
                    if (this._details.entry) {
                        this._details.update(this._details.entry);
                    }
                    break;
                case "showEntry":
                    if (folio.data.isListLike(event.entry)) {
                        this._details._parentListUrl = event.entry.getUri();
                    } else if (folio.data.isContext(event.entry)) {
                        this._details._parentListUrl = event.entry.getContext().getBaseURI() + event.entry.getId() + "/entry/_systemEntries";
                    }
                    this._details.editContentButtonDijit.set("label", "Edit");
                case "changed":
                    this._details.update(event.entry || this._details.entry);
                    break;
                case "deleted":
                case "clear":
                    this._details.clear();
                    break;
                case  "userChange":
                    if (this.application.getUser() == null) {
                        domStyle.set(this._details.editContentButtonDijit.domNode, "display", "none");
                    } else {
                        domStyle.set(this._details.editContentButtonDijit.domNode, "display", "");
                    }
                    break;
            }
        }
    });
});