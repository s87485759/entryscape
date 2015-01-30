/*global define, __confolio*/
define(["dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/json",
    "dojo/on",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dijit/form/TextBox", //in template
    "folio/util/Widget",
    "folio/util/dialog",
    "dojo/text!./ConvertDialogTemplate.html"
], function (declare, lang, array, json, on, domConstruct, domAttr,
             TextBox, Widget, dialog, template) {

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
        nlsBundles: ["common", "execute"],

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
                var params = {entryType: ["Local"], graphType: ["Pipeline"], queryType: "solr"};
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
                domAttr.set(this.pipelineBlock, "innerHTML", "");
                this._searchListPrincipals = [];
                array.forEach(children, function(child) {
                    var row = domConstruct.create("div", {"class": "pipeline distinctBackground"}, this.pipelineBlock);
                    var execute = domConstruct.create("div", {"class": "icon redo pipelineExecute"}, row);
                    domConstruct.create("div", {"class": "pipelineLabel", innerHTML: folio.data.getLabel(child)}, row);
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