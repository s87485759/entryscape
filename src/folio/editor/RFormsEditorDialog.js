/*global define, __confolio*/
define(["dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/dom-construct",
    "dojo/dom-style",
    "folio/util/NLSMixin",
    "folio/editor/RFormsEditor",
    "folio/editor/RFormsPresenter",
    "folio/ApplicationView",
    "dijit/_Widget"
], function (declare, lang, aspect, domConstruct, domStyle, NLSMixin,
             RFormsEditor, RFormsPresenter, ApplicationView, _Widget) {

    return declare([_Widget, NLSMixin, ApplicationView], {

        nls: ["editor"],
        localeChange: function () {
            this.setTitle();
        },

        buildRendering: function () {
            this.dialog = new dijit.Dialog();
            this.innerNode = domConstruct.create("div");
            this.dialog.set("content", this.innerNode);
            this.extPresenter = new RFormsPresenter({style: "float:left;height: 100%;border-right-style: solid", "class": "thinBorder"}, domConstruct.create("div", null, this.innerNode));
            this.editor = new RFormsEditor({style: "height:100%"}, domConstruct.create("div", null, this.innerNode));
            this.editor.startup();
            aspect.after(this.editor, "doneEditing", lang.hitch(this.dialog, "hide"));
            this.initNLS();
        },

        setTitle: function() {
            if (this.isReference) {
                this.dialog.set("title", this.NLS["editor"].externalAndLocalMDEditorTitle);
            } else {
                this.dialog.set("title", this.NLS["editor"].LocalMDEditorTitle);
            }
        },
        getSupportedActions: function () {
            return ["showMDEditor"];
        },
        handle: function (event) {
            switch (event.action) {
                case "showMDEditor":
                    this.show(event.entry);
                    break;
            }
        },
        show: function (entry) {
            this.isReference = folio.data.isReference(entry);
            console.log("showing dialog");
            var viewport = dijit.getViewport();
            var w = Math.floor(viewport.w * 0.70);
            var leftw = Math.floor(w * 0.4 - 7);
            var rightw = Math.floor(w * 0.6 - 5);
            var h = Math.floor(viewport.h * 0.70);
            domStyle.set(this.innerNode, {
                width: w + "px",
                height: h + "px",
                overflow: "auto",
                position: "relative"    // workaround IE bug moving scrollbar or dragging dialog
            });
            this.editor.show(entry);
            if (this.isReference) {
                domStyle.set(this.extPresenter.domNode, "display", "block");
                domStyle.set(this.extPresenter.domNode, {"width": leftw + "px", "paddingRight": "5px"});
                domStyle.set(this.editor.domNode, {"width": rightw + "px", "paddingLeft": "5px"});
                this.extPresenter.show(entry, true);
            } else {
                domStyle.set(this.extPresenter.domNode, "display", "none");
                domStyle.set(this.editor.domNode, {"width": w + "px", "paddingLeft": "0px"});
            }
            this.setTitle();

            dijit.focus(this.innerNode);
            this.dialog.show();
            setTimeout(lang.hitch(this, function () {
                this.editor.resize();
            }), 1);
        }
    });
});