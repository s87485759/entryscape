/*global define, __confolio*/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dijit/layout/_LayoutWidget",
    "dijit/Editor",
    "dojo/request/xhr",
// Commom plugins
    "dijit/_editor/plugins/FullScreen",
    "dijit/_editor/plugins/LinkDialog",
    "dijit/_editor/plugins/Print",
    "dijit/_editor/plugins/ViewSource",
    "dijit/_editor/plugins/FontChoice",
    "dijit/_editor/plugins/TextColor",
    "dijit/_editor/plugins/NewPage",
    "dijit/_editor/plugins/ToggleDir",
//Extension (Less common) plugins
    "dojox/editor/plugins/ShowBlockNodes",
    "dojox/editor/plugins/ToolbarLineBreak",
    "dojox/editor/plugins/Save",
    "dojox/editor/plugins/InsertEntity",
    "dojox/editor/plugins/Preview",
    "dojox/editor/plugins/PageBreak",
    "dojox/editor/plugins/PrettyPrint",
// Experimental Plugins
    "dojox/editor/plugins/NormalizeIndentOutdent",
    "dojox/editor/plugins/FindReplace"
], function (declare, lang, domClass, domConstruct, domAttr, _LayoutWidget, Editor, xhr) {

    lang.extend(dojox.editor.plugins.Save, {save: function(content) {
        // Set the default header to post as a body of text/html.
        if (this.url) {
            var putArgs = {
                data: content,
                headers: {"Content-Type": "text/html+snippet"},
                handleAs: "text"
            };
            this.button.set("disabled", true);
            xhr.put(this.url, __confolio.application.getCommunicator().insertAuthArgs(putArgs))
                .then(lang.hitch(this, this.onSuccess),lang.hitch(this, this.onError));
        } else {
            console.log("No URL provided, no post-back of content: " + content);
        }
    }});

    return declare(_LayoutWidget, {
        entry: null,
        editMode: false,

        isEditable: function() {
            return this.entry.getLocationType() === folio.data.LocationType.LOCAL && this.entry.isResourceModifiable();
        },
        toggleEditMode: function() {
            this.editMode = ! this.editMode;
            if (this.editMode) {
                this._setEditor();
            } else {
                this._setPresenter();
            }
        },
        inEditMode: function() {
            return this.editMode;
        },

        buildRendering: function() {
            this.domNode = this.srcNodeRef || domConstruct.create("div", null);
            this._setPresenter();
        },
        _setPresenter: function() {
            domAttr.set(this.domNode, "innerHTML", "");
            domClass.add(this.domNode, "contentPresentationMode");
            xhr.get(this.entry.getResourceUri(), __confolio.application.getCommunicator().insertAuthArgs({
                handleAs: "text",
                preventCache: true
            })).then(
                    lang.hitch(this, function(data) {
                        this.editor = new dijit.layout.ContentPane({content: data, height: "100%"}, domConstruct.create("div", null, this.domNode));
                    }),
                    lang.hitch(this, function() {
                        this.editor = new dijit.layout.ContentPane({content: "No text yet", height: "100%"}, domConstruct.create("div", null, this.domNode));
                    }));
        },
        _setEditor: function() {
            domAttr.set(this.domNode, "innerHTML", "");
            domClass.remove(this.domNode, "contentPresentationMode");
            var plugins = [
                {name: 'viewSource', stripScripts: true, stripComments: true},
                'showBlockNodes', 'newPage', {name: 'save', url: this.entry.getResourceUri()}, '|',
                {name: 'fullscreen', zIndex: 900}, 'preview', 'print', '|',
                'selectAll', 'cut', 'copy','paste', 'delete', 'undo', 'redo', '|',
                'bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', '|',
                'pageBreak', 'insertHorizontalRule', 'insertOrderedList', 'insertUnorderedList', 'indent', 'outdent', '|',
                'justifyLeft', 'justifyRight', 'justifyCenter', 'justifyFull', 'toggleDir', '|',
                'insertEntity', 'createLink', 'unlink', 'insertImage', 'findreplace', '||',
                'fontName', 'fontSize', 'formatBlock', 'removeFormat', 'foreColor', 'hiliteColor',
                {name: 'prettyprint', indentBy: 3, lineLength: 80, entityMap: dojox.html.entities.html.concat(dojox.html.entities.latin)},
                {name: 'dijit._editor.plugins.EnterKeyHandling', blockNodeForEnter: "P"},
                'normalizeindentoutdent'
            ];
            xhr.get(this.entry.getResourceUri(), __confolio.application.getCommunicator().insertAuthArgs({
                handleAs: "text",
                preventCache: true
            })).then(
                    lang.hitch(this, function(data) {
                        this.editor = new Editor({value: data, plugins: plugins, height: "100%"}, domConstruct.create("div", null, domConstruct.create("div", {}, this.domNode)));
                    }),
                    lang.hitch(this, function() {
                        this.editor = new Editor({value: "", plugins: plugins, height: "100%"}, domConstruct.create("div", null, domConstruct.create("div", {}, this.domNode)));
                    }));
        },
        resize: function() {
            this.inherited("resize", arguments);
            if (this.editor) {
                this.editor.resize();
            }
        }
    });
});