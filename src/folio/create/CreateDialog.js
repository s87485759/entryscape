/*global define, __confolio*/
define(["dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/connect",
    "dojo/_base/array",
    "dojo/on",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dojo/_base/fx",
    "dojo/fx",
    "dojo/fx/easing",
    "dijit/form/ValidationTextBox",
    "folio/util/Widget",
    "folio/util/dialog",
    "dojox/form/FileInput",
    "rdfjson/Graph",
    "rdforms/model/Engine",
    "dojo/text!./CreateDialogTemplate.html"
], function (declare, lang, connect, array, on, domClass, style, construct, attr, fx, corefx, easing,
             ValidationTextBox, Widget, dialog, FileInput, Graph, Engine, template) {


    var FI = declare(FileInput, {
         _matchValue: function() {   //Override so that cancel button does not show up.
             this.inputNode.value = this.fileInput.value;
         }
    });

    /**
     * Show a dialog for creating all kinds of things.
     */
    return declare([Widget], {
        //===================================================
        // Inherited Attributes
        //===================================================
        templateString: template,
        nls: ["common", "create"],
        mode: "artifact",
        context: null,
        list: null,

        //===================================================
        // Public API
        //===================================================
        show: function() {
            this.dialog = dialog.showStandardDialog(this, "Create", lang.hitch(this, this._finish), lang.hitch(this, this.onHide));
            this.dialog.setFinishButtonDisabled(true);
        },

        onHide: function() {
        },

        //===================================================
        // Inherited methods
        //===================================================


        postCreate: function() {
            this.inherited("postCreate", arguments);
            this.url.set("pattern", folio.data.uriRegexpStr);
            on(this.artifact, "click", lang.hitch(this, this._switchTo_upload));
            on(this.upload, "click", lang.hitch(this, this._switchTo_link));
            on(this.link, "click", lang.hitch(this, this._switchTo_artifact));
            this.fileinput = new FI({}, this.fileinput);
            this.fileinput.startup();
            on(this.fileinput.fileInput,"change", lang.hitch(this, this._checkFileInput));
            this["_switchTo_"+this.mode]();
        },

        localeChange: function() {
           this.url.set("invalidMessage", this.NLS.create.addressIsInvalid);
           this.url.set("placeHolder", this.NLS.create.missingAddress);
           this.label.set("placeHolder", this.NLS.create.missingLabel);
        },

        //===================================================
        // Private methods
        //===================================================
        _finish: function(callback) {
            this.application.getItemStore(dojo.hitch(this, function(itemStore){
                var at = this._currentATList[this._selectedATIdx].uri;
                var rt = this._currentATList[this._selectedATIdx].graphType;
                var ir = this._currentATList[this._selectedATIdx].informationresource;
                var label = this.label.get("value");
                var obj = {
                    parentList: this.list
                };
                var newId;

                switch (this.mode) {
                    case "artifact":
                        newId = this.context.getBase() + this.context.getId()+"/resource/_newId";
                        obj.params = {informationresource: false,
                            entrytype: "local",
                            graphtype: "none"};
                        break;
                    case "upload":
                        newId = this.context.getBase() + this.context.getId()+"/resource/_newId";
                        obj.params = {informationresource: true,
                            entrytype: "local",
                            graphtype: "none"};
                        obj.fileInput = this.fileinput.fileInput;
                        break;
                    case "link":
                        newId = this.url.get("value");
                        obj.params = {informationresource: true,
                            entrytype: "link",
                            graphtype: "none",
                            resource: encodeURIComponent(newId)
                        };
                        break
                }

                var mpLabel = this.application.getConfig().getLabelTemplateForApplicationType(at || "");
                var template = itemStore.createTemplateFromChildren([mpLabel]);
                var graph = new rdfjson.Graph();
                var rootBinding = Engine.match(graph, newId, template);
                var binding = Engine.findFirstValueBinding(rootBinding, true);
                binding.setValue(label);

                if (rt != null && rt != "") {
                    obj.params.graphtype = rt;
                    if (ir === true || ir === false) {
                        obj.params.informationresource = ir;
                    }
                }
                if (at != null && at != "") {
                    graph.create(newId, folio.data.RDFSchema.TYPE, at);
                }
                obj.metadata = graph.exportRDFJSON();

                this.context.createEntry(obj, lang.hitch(this, function(nentry) {
                    if (this.list) {
                        this.list.setRefreshNeeded();
                        this.application.publish("childrenChanged", {entry: this.list, source: this});
                    }
                    if (this.mode === "upload") {

                    }
                    callback(true);
                    this.onHide();
                }));

                //callback(true);
            }));
        },

        _switchTo_artifact: function() {
            this.mode = "artifact";
            this.setI18nState(1);
            domClass.add(this.domNode, "artifactState");
            domClass.remove(this.domNode, "linkState");
            domClass.remove(this.domNode, "uploadState");
            var config = this.application.getConfig();
            var ats = config.getApplicationTypes();
            ats = array.filter(ats, function(at) {return at.artifact});
            this._updateTypes(config, ats);
            this._checkReady();
        },
        _switchTo_link: function() {
            this.mode = "link";
            this.setI18nState(2);
            domClass.add(this.domNode, "linkState");
            domClass.remove(this.domNode, "uploadState");
            domClass.remove(this.domNode, "artifactState");
            var config = this.application.getConfig();
            var ats = config.getApplicationTypes();
            ats = array.filter(ats, function(at) {return at.link});
            this._updateTypes(config, ats);
            this._checkReady();
        },
        _switchTo_upload: function() {
            this.mode = "upload";
            this.setI18nState(2);
            domClass.add(this.domNode, "uploadState");
            domClass.remove(this.domNode, "artifactState");
            domClass.remove(this.domNode, "linkState");
            var config = this.application.getConfig();
            var ats = config.getApplicationTypes();
            ats = array.filter(ats, function(at) {return at.file});
            this._updateTypes(config, ats);
            this._checkReady();
        },

        _resetTypeSelection: function() {
            if (this._selectedATIdx >= 0) {
                domClass.remove(this._currentATListNodes[this._selectedATIdx], "entryScape_selected");
            }
            delete this._selectedATIdx;
            delete this._manualATSelection;
            domClass.remove(this.typeSelectBlock, "selectTypeWaiting noAutodetectTypePossible clearManuallySelectedType clearAutoSelectedType");
            domClass.add(this.typeSelectBlock, "selectTypeWaiting");
            this._checkReady();
        },

        _updateTypes: function(config, ats) {
            this._resetTypeSelection();
            ats.sort(function(o1, o2) {
                if (o1.advanced ===o2.advanced) {return 0;}
                return o1.advanced ? 1 : -1;
            });
            this._currentATList = ats;
            this._currentATListNodes = [];
            this.types.innerHTML = "";
            for (var i=0;i<ats.length;i++) {
                var src = config.getIconInResolution(ats[i].icon, "64x64");
                var node = construct.create("div", {"class": "card"}, this.types);
                this._currentATListNodes[i] = node;
                on(node, "click", lang.hitch(this, function(idx) {
                    if (this._selectedATIdx >= 0) {
                        domClass.remove(this._currentATListNodes[this._selectedATIdx], "entryScape_selected");
                    }
                    this._manualATSelection = true;
                    this._selectedATIdx = idx;
                    domClass.add(this._currentATListNodes[idx], "entryScape_selected");
                    domClass.remove(this.typeSelectBlock, "selectTypeWaiting noAutodetectTypePossible clearManuallySelectedType clearAutoSelectedType");
                    domClass.add(this.typeSelectBlock, "clearManuallySelectedType");
                    this._checkReady();
                }, i));
                var imgwrap = construct.create("div", {"class": "principalPicture"}, node);
                construct.create("img", {src: src}, imgwrap);
                construct.create("span", {innerHTML: ats[i].label.en}, node);
            }
        },

        _checkFileInput: function() {
            var path = this.fileinput.fileInput.value
            var idx = path.lastIndexOf(".");
            if (idx > 0 && this._manualATSelection !== true) {
                var ext = path.substr(idx+1);
                var atIdx;
                for (var i=0;i<this._currentATList.length;i++) if (this._currentATList[i].extentionHint != null) {
                    if (this._currentATList[i].extentionHint.indexOf(ext) != -1) {
                        atIdx = i;
                        break;
                    }
                }
                this._autoSelectType(atIdx)
            }
            this._checkReady();
        },

        _autoSelectType: function(atIdx) {
            if (atIdx != null) {
                if(atIdx === this._selectedATIdx) {
                    return true;
                }
                if (this._selectedATIdx >= 0) {
                    domClass.remove(this._currentATListNodes[this._selectedATIdx], "entryScape_selected");
                }
                this._selectedATIdx = atIdx;
                domClass.remove(this.typeSelectBlock, "selectTypeWaiting noAutodetectTypePossible clearManuallySelectedType clearAutoSelectedType");
                domClass.add(this.typeSelectBlock, "clearAutoSelectedType");
                var node = this._currentATListNodes[atIdx];

                domClass.add(node, "entryScape_selected");
                var b = style.get(node, "background-color");
                fx.animateProperty({
                    node: node,
                    duration: 350,
                    repeat: 5,
                    easing: function(n) {
                        var v = 1-(Math.sin(Math.PI*2*(n-(1/4)))+1)/2;
                        console.log(v);
                        return v;
                    },
                    properties: {
                        "background-color": {start: "#FFFFFF", end: b}
                    },
                    onEnd: lang.hitch(this, function() {
                        console.log("onEnd");
                        style.set(node, "background-color", "");
                    })
                }).play();
                return true;
            }
            return false;
        },

        _getATIdxFromAddress: function(address) {
            var fallback;
            for (var i=0;i<this._currentATList.length;i++) {
                if (this._currentATList[i].linkFallback) {
                    fallback = i;
                }
                if (this._currentATList[i].serviceIndicators != null) {
                    var services = this._currentATList[i].serviceIndicators;
                    for (var j=0;j<services.length;j++) {
                        if (address.indexOf(services[j]) != -1) {
                            return i;
                        }
                    }
                }
            }
            return fallback;
        },

        _addressCheck: function() {
            if (this._addressTimeout) {
                clearTimeout(this._addressTimeout);
                delete this._addressTimeout;
            }
            this._addressTimeout = setTimeout(lang.hitch(this, function() {
                delete this._addressTimeout;
                if (this._manualATSelection !== true) {
                    var addr = this.url.get("value");
                    var success = this._autoSelectType(this._getATIdxFromAddress(addr));
                    if (!success && this._selectedATIdx >= 0) {
                        this._resetTypeSelection();
                    }
                    this._checkReady();
                }
            }), 300);
        },
        _isAddressOk: function(address) {
            return folio.data.isURI(address);
        },
        _checkReady: function() {
            var disabled = false;
            if (this.mode === "artifact" && this._selectedATIdx == null) {
                disabled = true;
            }

            var l = this.label.get("value");
            if (l == null || l === "") {
                disabled = true;
            }

            if (this.mode === "upload") {
                var path = this.fileinput.fileInput.value;
                if (path == null || path == "") {
                    disabled = true;
                }
            }

            if (this.mode === "link") {
                var link = this.url.get("value");
                if (link == null || link == "" || !this._isAddressOk(link)) {
                    disabled = true;
                }
            }
            this.dialog && this.dialog.setFinishButtonDisabled(disabled);
        }

    });
});