/*global define, __confolio*/
define(["dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/_base/array",
    "dojo/json",
    "dojo/keys",
    "dijit/layout/_LayoutWidget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/layout/ContentPane", //in template
    "dijit/layout/BorderContainer", //in template
    "dijit/form/TextBox", //in template
    "dojo/text!./CommandLineTemplate.html"
], function (declare, lang, on, array, json, keys,
             _LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin,
             ContentPane, BorderContainer, TextBox, template) {

    /**
     * TODO Works poorly, wait until new data API is in place.
     * Provides a simple CLI UI, a input field on the top and a result area below.
     * The result area are cleaned and updated after every command, no history is preserved.
     * Currently supports cd, pwd, cat, and ls.
     * @see folio.navigation.FDO
     */
    return declare([_LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        //===================================================
        // Inherited Attributes
        //===================================================
        templateString: template,

        //===================================================
        // Inherited methods
        //===================================================
        resize: function (size) {
            this.inherited("resize", arguments);
            this.CLILayoutDijit.resize();
        },

        postCreate: function () {
            this.containerNode = this.domNode;
            this.inherited("postCreate", arguments);
            on(this.promptDijit.domNode, "onkeyup", lang.hitch(this, function (evt) {
                if (evt.keyCode == keys.ENTER) {
                    this._doCommand();
                }
            }));
            this.promptDijit.focus();
        },

        //===================================================
        // Private methods
        //===================================================
        _doCommand: function () {
            var command = this.promptDijit.attr("value");
            var commandArr = command.split(' ');
            switch (commandArr[0]) {
                case "ls":
                    this.fdo.ls(lang.hitch(this, function (children) {
                        var arr = array.map(children, function (child) {
                            return "<tr><td>" + child.getId() + "</td><td>" + folio.data.getLabel(child) + "</td></tr>";
                        });
                        this.resultDijit.attr("content", "<table>" + arr.join("") + "</table>");
                    }));
                    break;
                case "cd":
                    this.fdo.cd(commandArr[1], lang.hitch(this, function (result) {
                        switch (result) {
                            case folio.navigation.FDO.code.SUCCESS:
                                this.resultDijit.attr("content", "Changing directory.");
                                break;
                            case folio.navigation.FDO.code.FAILURE:
                                this.resultDijit.attr("content", "Failed changing directory, did not understand parameter " + commandArr[1]);
                                break;
                        }
                        ;
                    }));
                case "pwd":
                    var current = this.fdo.wd();
                    this.resultDijit.attr("content", "" + current.getId() + "&nbsp;&nbsp;" + folio.data.getLabel(current));
                    break;
                case "cat":
                    this.fdo.get(commandArr[1], lang.hitch(this, function (entry) {
                        if (entry) {
                            var str = "<b>Entry uri&nbsp;:</b>&nbsp;&nbsp;" + entry.getUri() + "\n<hr>"
                                + "<h1>Metadata</h1><pre>" + json.toJson(entry.getMetadata().getRoot(), true) + "</pre>"
                                + "<h1>External Metadata</h1>" + (entry.getExternalMetadata() ? "<pre>" + json.toJson(entry.getMetadata().getRoot(), true) + "</pre>" : "No External metadata")
                                + "<h1>Entry Information</h1><pre>" + json.toJson(entry.getInfo().getRoot(), true) + "</pre>";
                            this.resultDijit.attr("content", str);
                        } else {
                            this.resultDijit.attr("content", "No entry found for '" + commandArr[1] + "'.");
                        }
                    }));
                    break;
                default:
                    this.resultDijit.attr("content", "Did not understand the command '" + command + "'.");
                    break;
            }
        }
    });
});