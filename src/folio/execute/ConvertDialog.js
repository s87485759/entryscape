/*global define, __confolio*/
define(["dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/connect",
    "dojo/_base/array",
    "dojo/json",
    "dojo/on",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dojo/_base/fx",
    "dojo/fx",
    "dojo/fx/easing",
    "dijit/form/Select",
    "dijit/form/Button",
    "dijit/form/TextBox",
    "folio/util/Widget",
    "folio/util/dialog",
    "dojox/form/FileInput",
    "rdfjson/Graph",
    "rforms/model/Engine",
    "dojo/text!./ConvertDialogTemplate.html"
], function (declare, lang, connect, array, json, on, domClass, style, construct, attr, fx, corefx, easing, Select,
             Button, TextBox, Widget, dialog, FileInput, Graph, Engine, template) {

    /**
     * Show a dialog for creating all kinds of things.
     */
    return declare(Widget, {
        //===================================================
        // Public Attributes
        //===================================================
        entry: null,
        list: null,

        //===================================================
        // Inherited Attributes
        //===================================================
        templateString: template,
        nls: ["common", "execute"],

        //===================================================
        // Public API
        //===================================================
        show: function() {
            var d = new dialog.StandardDialog();
            d.startup();
            d.addDoneButton(this.onHide);
            d.show(this, "Convert");
        },

        onHide: function() {
        },

        //===================================================
        // Inherited methods
        //===================================================


        postCreate: function() {
            this.inherited("postCreate", arguments);
        },

        localeChange: function() {
        },

        //===================================================
        // Private methods
        //===================================================

        _pipelineSearchChange: function() {
            if (this._pipelineSearchTimer) {
                clearTimeout(this._pipelineSearchTimer);
            }
            this._pipelineSearchTimer = setTimeout(lang.hitch(this, function() {
                delete this._pipelineSearchTimer;
                this.searchFor = this.pipelineSearch.get("value");

                var searchcontext = this.application.getStore().getContext(this.application.repository+"_search");
                var params = {entryType: ["Local"], resourceType: ["Pipeline"], queryType: "solr"};
                params.term = "title:"+this.searchFor;
                params.onSuccess = lang.hitch(this, function(entryResult) {
                    folio.data.getList(entryResult, lang.hitch(this, this._showResults));
                });
                params.onError = lang.hitch(this, function(error) {});
                searchcontext.search(params);

            }), 400);
        },
        _showResults: function(list) {
            if (this._loading) {
                return;
            }
            this._loading = true;

            list.getPage(0, 10, lang.hitch(this, function(children) {
                attr.set(this.pipelineBlock, "innerHTML", "");
                this._searchListPrincipals = [];
                array.forEach(children, function(child) {
                    var row = construct.create("div", {"class": "pipeline distinctBackground"}, this.pipelineBlock);
                    var execute = construct.create("div", {"class": "icon redo pipelineExecute"}, row);
                    construct.create("div", {"class": "pipelineLabel", innerHTML: folio.data.getLabel(child)}, row);
                    on(execute, "click", lang.hitch(this, function() {
                        var ans = confirm("Convert entry \""+folio.data.getLabel(this.entry)+"\" to RDF in this portfolio with help of pipeline \""+folio.data.getLabel(child)+"\"?");
                        if (ans) {
                            var base = this.application.getRepository();
                            this.application.getCommunicator().POST(this.entry.getContext().getUri()+"/execute", json.stringify({
                                "pipeline": child.getUri(),
                                "source": this.entry.getUri()
                            })).then(lang.hitch(this, function(data) {
                                        if (this.list != null) {
                                            this.list.setRefreshNeeded();
                                            this.application.publish("childrenChanged", {entry: this.list, source: this});
                                        }
                                        if (data.result.length > 1) {
                                            alert("Conversion succeeded, "+ data.result.length+" entries created");
                                        } else {
                                            alert("Conversion succeeded!");
                                        }
                                    }
                            ));
                        }
                    }));
                }, this);
                this._loading = false;
            }));
        }
    });
});