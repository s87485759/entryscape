define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/connect",
    "dojo/mouse",
    "dojo/_base/window",
    "dojo/dom-geometry",
    "dojo/topic",
    "dojo/query",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dojo/_base/fx",
    "dojo/NodeList-fx",
    "folio/util/Widget",
    "rdfjson/Graph",
    "folio/create/CreateDialog",
    "dojo/text!./CreateMenuTemplate.html"
], function(declare, lang, connect, mouse, win, domgeom, topic, query, domClass, style, construct, domAttr, fx, nlfx,
            Widget, Graph, CreateDialog, template) {

    return declare([Widget], {
        templateString: template,
        nlsBundles: ["create"],
        list: null,
        listUI: null,
        postCreate: function() {
            this.inherited("postCreate", arguments);
            construct.place(this.moveMeToTop, win.body());
            construct.place(this.moveMeToTopB, win.body());
            this.connect(this.moveMeToTopB , "onclick", this.hide);
            this.connect(this.moveMeToTop, mouse.leave, this.hide);
            var application = __confolio.application;
            query(".text", this.moveMeToTop).on("click", lang.hitch(this, function() {
                this.hide(lang.hitch(this, function(){
                    this._createText(this.list.listEntry, lang.hitch(this.listUI, this.listUI.selectAndRename));
                }));
            }));
            query(".folder", this.moveMeToTop).on("click", lang.hitch(this, function() {
                this.hide(lang.hitch(this, function() {
                    this._createFolder(this.list.listEntry, lang.hitch(this.listUI, this.listUI.selectAndRename));
                }));
            }));
            var launch = function(mode)  {
                this.hide();
                this.listUI.events.stopListenForKeyEvents();
                var d = new CreateDialog({
                    context: this.list.listEntry.getContext(),
                    list: this.list.listEntry,
                    mode: mode,
                    onHide: lang.hitch(this.listUI.events, this.listUI.events.listenForKeyEvents)
                });
                d.startup();
                d.show();
            }
            query(".link", this.moveMeToTop).on("click", lang.hitch(this, launch, "link"));
            query(".upload", this.moveMeToTop).on("click", lang.hitch(this, launch, "upload"));
            query(".artifact", this.moveMeToTop).on("click", lang.hitch(this, launch, "artifact"));
// Old ways of launching create dialog
// application.publish("showCreateWizard", {type: "upload", entry: this.list.list, onFinish: onDone, onCancel: onDone});
        },
        localeChange: function() {
            domAttr.set(this.createText, "title", this.NLSBundles.create.createText);
            domAttr.set(this.createFolder, "title", this.NLSBundles.create.createFolder);
            domAttr.set(this.uploadFile, "title", this.NLSBundles.create.uploadFile);
            domAttr.set(this.createLink, "title", this.NLSBundles.create.createLink);
            domAttr.set(this.createArtifact, "title", this.NLSBundles.create.createArtifact);
        },
        initState: function() {
            style.set(this.moveMeToTop, {
                display: "none"
            });
        },
        show: function() {
            var pos = domgeom.position(this.domNode);
            var woff = 14;
            var hoff = 0;
            style.set(this.moveMeToTop, {
                display: ""
            });
            query(".distinctThickBorder", this.moveMeToTop).style("display", "none").fadeOut({duration: 0}).play(); //Make sure faded out.
            style.set(this.moveMeToTopB, "display", "");

            query(".new", this.moveMeToTop).style({
                    top: pos.y-12+"px",
                    left: Math.floor(pos.x-12-woff)+"px"
            });
            fx.animateProperty({
                node: this.moveMeToTop,
                duration: 120,
                properties: {
                    display: "",
                    width: {start: 34, end: 110},
                    height: { start: 34, end: 110 },
                    left: {start: pos.x - woff-17, end: pos.x - woff - 55},
                    "border-radius": {start: 17, end: 55},
                    top: {start: pos.y-hoff-18, end: pos.y - hoff - 56}
                },
                onEnd: lang.hitch(this, function() {
                    query(".distinctThickBorder", this.moveMeToTop).style("display", "").fadeIn({duration: 100}).play();
                })
            }).play();
        },
        hide: function(callback) {
            var pos = domgeom.position(this.domNode);
            var woff = 14;
            var hoff = 0;
            var dtb = query(".distinctThickBorder", this.moveMeToTop);
            dtb.fadeOut({duration: 100,
            onEnd: lang.hitch(this, function() {
                dtb.style("display", "none");

                fx.animateProperty({
                    node: this.moveMeToTop,
                    duration: 120,
                    properties: {
                        display: "",
                        width: {end: 34, start: 110}, //Difference is 76, radius difference 38.
                        height: {end: 34, start: 110 },
                        left: {end: pos.x - woff -17, start: pos.x - woff - 55},
                        "border-radius": {end: 17, start: 55},
                        top: {end: pos.y-hoff-18, start: pos.y - hoff - 56}
                    },
                    onEnd: lang.hitch(this, function() {
                        style.set(this.moveMeToTop, "display", "none");
                        style.set(this.moveMeToTopB, "display", "none");
                        if (lang.isFunction(callback)) {
                            callback();
                        }
                    })
                }).play();
            })}).play();
        },

        getEntryOrReferencedEntry: function(entry, onComplete) {
            if (folio.data.isReference(entry)) {
                folio.data.getLinkedLocalEntry(entry, onComplete);
            } else {
                onComplete(entry);
            }
        },

        /**
         * @param {folio.data.Entry} inFolder where the new entry will be added.
         * @param {function(folio.data.Entry)} callback will be called with the newly created text entry.
         */
        _createText: function(inFolder, callback) {
            var self = this;
            this.getEntryOrReferencedEntry(inFolder, function () {
                var mdGraph = new Graph();
                var contextToUse = inFolder.getContext();
                mdGraph.create(contextToUse.getBase() + contextToUse.getId() + "/resource/_newId",
                    folio.data.DCTermsSchema.TITLE,
                    {"type": "literal", "value": "New Text"}, true);
                var md = mdGraph.exportRDFJSON();

                var helpObj = folio.data.createNewEntryHelperObj(inFolder.getContext());
                folio.data.addMimeType(helpObj.info, helpObj.resURI, "text/html+snippet");
                var args = {
                    context: contextToUse,
                    parentList: inFolder,
                    metadata: md,
                    info: helpObj.info.exportRDFJSON(),
                    params: {
                        entrytype: "local",
                        graphtype: "none"
                    }
                };
                contextToUse.createEntry(args, function (newEntry) {
                    inFolder.setRefreshNeeded();
                    __confolio.application.publish("childrenChanged", {entry: inFolder, source: self}); //Operations as source, not optimal.
                    callback(newEntry);
                }, function (mesg) {
                    __confolio.application.publish("message", {
                        message: self.NLSBundles.create.unableToCreateTextErrorMessage,
                        source: self
                    });
                });
            });
        },

        /**
         * @param {folio.data.Entry} inFolder where the new entry will be added.
         * @param {function(folio.data.Entry)} callback will be called with the newly created text entry.
         */
        _createFolder: function(inFolder, callback) {
            var self = this;
            this.getEntryOrReferencedEntry(inFolder, function () {
                var mdGraph = new rdfjson.Graph();
                var contextToUse = inFolder.getContext();
                mdGraph.create(contextToUse.getBase() + contextToUse.getId() + "/resource/_newId",
                    folio.data.DCTermsSchema.TITLE,
                    {"type": "literal", "value": "New folder"}, true);
                var md = mdGraph.exportRDFJSON();
                var args = {
                    context: contextToUse,
                    parentList: inFolder,
                    metadata: md,
                    params: {
                        entrytype: "local",
                        graphtype: "list"
                    }
                };
                contextToUse.createEntry(args, function (newEntry) {
                    inFolder.setRefreshNeeded();
                    __confolio.application.publish("childrenChanged", {entry: inFolder, source: self});
                    callback(newEntry);
                }, function (mesg) {
                    __confolio.application.publish("message", {
                        message: self.NLSBundles.create.unableToCreateFolderErrorMessage,
                        source: self
                    });
                });
            });
        }
    });
});
