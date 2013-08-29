/*global define, __confolio*/
define(["dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/connect",
    "dojo/on",
    "dojo/_base/array",
    "dojo/json",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dojo/date/stamp",
    "dijit/_WidgetBase",
    "dijit/focus",
    "dojox/image/LightboxNano",
    "folio/list/ListControls",
    "folio/editor/RFormsPresenter"
], function (declare, lang, connect, on, array, json, domClass, style, construct, attr, stamp, _WidgetBase, focusUtil, LightboxNano, ListControls, RFormsPresenter) {

    /**
     * Searches for entries according to the given parameters and displays
     * 50 of the first hits with a title, a description and a modification date.
     * Currently only material that has a title and has at least one parent folder is displayed,
     * the rest is discarded from the listing.
     * Every title is a link to the default view with this material selected in one of its parent folders,
     * if there are several parent folders one is choosen arbitrarily.
     *
     */
    return declare(_WidgetBase, {
        //===================================================
        // Public attributes
        //===================================================
        topCls: "resultView",

        //===================================================
        // Public api
        //===================================================
        show: function (params, callback) {
            this.searchParams = params;
            this._show(params, 0, callback);
        },
        postCreate: function () {
            this.application = __confolio.application;
            this.pagination = new ListControls();
            this.pagination.setListViewer(this);

            this.inherited("postCreate", arguments);
        },
        onResults: function (nrOfHits) {
        },
        entrySelected: function(entry) {
        },

        //===================================================
        // Inherited methods
        //===================================================
        buildRendering: function () {
            this.domNode = this.srcNodeRef;
            domClass.add(this.domNode, this.topCls);

        },
        //===================================================
        // Private methods
        //===================================================
        _show: function (params, page, callback) {
            this.user = __confolio.application.getUser();
            if (this.user && this.user.homecontext) {
                this.homeContext = this.user.homecontext;
            } else {
                delete this.homeContext;
            }
            attr.set(this.domNode, "innerHTML", "");
            if (params === null) {
                params = this.searchParams;
            }
            var p = page != undefined ? page : 0;
            params = dojo.mixin(params, {
                limit: 20,
                onSuccess: lang.hitch(this, function (entryResult) {
                    this.list = entryResult;
                    callback && callback();
                    folio.data.getList(entryResult, lang.hitch(this, function (list) {
                        list.getPage(p, 20, lang.hitch(this, function (children) {
                            var acceptCount = 0;
                            array.forEach(children, function (child) {
                                if (acceptCount < 20 && child.readAccessToMetadata) {
                                    if (this._addContent(child)) {
                                        acceptCount++;
                                    }
                                }
                            }, this);
                            this.domNode.appendChild(this.pagination.domNode);
                            this.pagination.update(list, p);
                        }));
                        this.onResults(list.getSize());
                    }));
                }),
                onError: dojo.hitch(this, function (error) {
                    this.onResults();
                    callback && callback();
                })
            });
            if (params.search != null) {
                params.search(params);
            } else {
                var context = this.application.getStore().getContext(this.application.repository + "_search");
                context.search(params);
            }
        },
        _addContent: function (entry) {
            var parent = entry.getReferrents();
            //Do not list if the entry is in the garbage-bin!
            //TODO: Check for an endsWith-function
            if (parent.length == 1 && parent[0].lastIndexOf("_trash") > 0) {
                return false;
            }
            parent = parent && parent.length > 0 ? parent[0] : null;
            var row = construct.create("div", {"class": "contentRow thinBorder"}, this.domNode);

            on(row, "click", lang.hitch(this, function() {
                if (this._selectedRow === row) {
                    return;
                }
                if (this._selectedRow) {
                    domClass.remove(this._selectedRow, "entryScape_selected");
                }
                this._selectedRow = row;
                domClass.add(this._selectedRow, "entryScape_selected");
                this.entrySelected(entry);
            }));

            //Icon
            var images = folio.data.getImages(entry);
            if (images.length === 0) {
                construct.create("img", {"class": "iconCls", src: this.application.getConfig().getIcon(entry)}, row);
            } else { //images.length === 1) {
                array.forEach(images, function(obj, index) {
                    if (index <3) {
                        new LightboxNano({href: obj.full || obj.thumb},
                            construct.create("img", {"class": "iconCls", "src": obj.thumb || obj.full}, row));
                    }
                })
            } /*else {
                var tp = new ThumbnailPicker({size: 220, thumbHeight: 55, thumbWidth: 70, isClickable: true}, construct.create("div", null, row));
                var store = new ItemFileReadStore({data: {items: images}});
                tp.setDataStore(store, {count:20, start:0}, {imageThumbAttr: "thumb", imageLargeAttr: "full"});
                connect.subscribe(tp.getClickTopicName(), tp, function(packet){
                    var n = new LightboxNano();
                    n.show({href: packet.largeUrl, origin: tp._thumbs[packet.index]});
                });
                tp.startup();
            }                */
            /*if (folio.data.isLinkLike(entry)) {
                construct.create("img", {"class": "iconCls", style: {"position": "absolute", "left": 0}, "src": "" + require.toUrl("folio/icons_oxygen/link.png")}, row);
            }*/

            //Modification
            var mod = entry.getModificationDate();
            mod = mod ? mod : entry.getCreationDate();
            if (mod) {
                mod = stamp.fromISOString(mod);
                mod = "Modified" + ":&nbsp;" + mod.toDateString() + "&nbsp;" + mod.toLocaleTimeString();
                construct.create("div", {"class": "modified", innerHTML: mod}, row);
            }
            //Label
            var title = folio.data.getLabelRaw(entry) || entry.name || entry.alias || entry.getId();
            if (folio.data.isContext(entry)) {
                if (folio.data.isLinkLike(entry)) {
                    folio.data.getLinkedLocalEntry(entry, lang.hitch(this, function (refEntry) {
                        construct.create("a", {
                            innerHTML: title,
                            href: this.application.getHref(this.application.getRepository() + refEntry.getId() + "/entry/_top", "default")
                        }, row);
                    }),
                        lang.hitch(this, function () {
                            construct.create("div", {
                                innerHTML: "Not able to find this item"
                            }, row);
                        }));

                }
                else {
                    construct.create("a", {
                        innerHTML: title,
                        href: this.application.getHref(this.application.getRepository() + entry.getId() + "/entry/_top", "default")
                    }, row);
                }
            } else if (folio.data.isUser(entry) || folio.data.isGroup(entry)) {
                if (folio.data.isLinkLike(entry)) {
                    folio.data.getLinkedLocalEntry(entry, dojo.hitch(this, function (refEntry) {
                        construct.create("a", {
                            innerHTML: title,
                            href: this.application.getHref(refEntry, "profile")
                        }, row);
                    }),
                        lang.hitch(this, function () {
                            construct.create("div", {
                                innerHTML: "Not able to find this item"
                            }, row);
                        })
                    );
                }
                else {
                    construct.create("a", {
                        innerHTML: title,
                        href: this.application.getHref(entry, "profile")
                    }, row);
                }
            } else {
                if (parent) {
                    construct.create("a", {innerHTML: title, href: this.application.getHref(entry.getUri(), "default", parent)}, row);
                } else if (folio.data.isList(entry)) {
                    construct.create("a", {innerHTML: title, href: this.application.getHref(entry.getUri(), "default")}, row);
                } else {
                    construct.create("span", {innerHTML: title}, row);
                }
            }
            if (this.homeContext) {
                var addNode = construct.create("div", {"class": "icon bookmark", title: "add bookmark in home folder"}, row);
                on(addNode, "click", lang.hitch(this, function() {
                    var context = __confolio.application.getStore().getContextById(this.homeContext);

                    var add = function(extMdGraph) {
                        context.createEntry({
                                cachedExternalMetadata: extMdGraph.exportRDFJSON(),
                                metadata: entry.getLocalMetadata().exportRDFJSON(),
                                params: {
                                    listURI: context.getBase()+context.getId()+"/entry/_top",
                                    resource: encodeURIComponent(entry.getResourceUri()),
                                    "cached-external-metadata": encodeURIComponent(entry.getExternalMetadataUri()),
                                    informationResource: false,
                                    locationType: "linkreference",
                                    builtinType: "none"
                                }
                            },
                            function() {
                                this.application.getMessages().message("Item added to your portfolio.");
                            },
                            function(mesg) {
                                this.application.getMessages().error("Something went wrong, sorry in Beta mode here.\nTest with another item.\n"+mesg);
                            });
                    };

                    if (entry._transformExtMd) {
                        __confolio.application.getCommunicator().loadViaSCAMProxy({
                            url: entry.getExternalMetadataUri(),
                            handleAs: entry._handleExtMdAs || "json",
                            onSuccess: function(data) {
                                add(entry._transformExtMd(data));
                                delete entry._transformExtMd;
                            }});
                    } else {
                        add(entry.getExternalMetadata());
                    }
                }));
            }
            if (entry._constructPreview) {
                entry._constructPreview(construct.create("div", {"class": "icon info", title: "more information"}, row));
            } else {
                var prepareDialog = function (newNode, onReady) {
                    var f = function(graph) {
                        entry.externalMetadata = graph;
                        var pres = new RFormsPresenter({}, construct.create("div", null, newNode));
                        pres.show(entry, true);
                        //Make sure that someDijit is finished rendering, or at least has some realistic size before making the next call.
                        focusUtil.focus(pres.domNode);
                        onReady();
                    }

                    if (entry._transformExtMd) {
                        __confolio.application.getCommunicator().loadViaSCAMProxy({
                            url: entry.getExternalMetadataUri(),
                            handleAs: entry._handleExtMdAs || "json",
                            onSuccess: function(data) {
                                debugger;
                                f(entry._transformExtMd(data));
                                delete entry._transformExtMd;
                            }});
                    } else {
                        f(entry.getExternalMetadata());
                    }

                };
                folio.util.connectToolKitDialog(construct.create("div", {"class": "icon info", title: "more information"}, row), prepareDialog);
            }

            //Description
            construct.create("div", {"class": "description", innerHTML: folio.data.getDescription(entry)}, row);
            return true;
        },
        showPage: function (page) {
            this._show(null, page);
        }
    });
});