/*global define, __confolio*/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/event",
    "dojo/_base/array",
    "dojo/dom-class",
    "dojo/dom-construct",
    "folio/list/operations",
    "folio/list/Remove",
    "folio/entry/Details",
    "di18n/NLSMixin",
    "dijit/Menu",
    "dijit/MenuItem",
    "dijit/focus",
    "folio/editor/RFormsLabelEditor",
    "folio/security/RightsDialog",
    "folio/execute/ConvertDialog",
    "folio/comment/CommentDialog"
], function(declare, lang, event, array, domClass, domConstruct, operations, Remove, Details, NLSMixin, Menu, MenuItem, focusUtil, RFormsLabelEditor, RightsDialog, ConvertDialog, CommentDialog) {

    return declare([NLSMixin], {
        //===================================================
        // Public Attributes
        //===================================================
        list: null,
        ui: null,
        nlsBundles: ["list"],
        nlsBundleBase: "nls/",

        constructor: function(list, ui) {
            this.list = list;
            this.ui = ui;
            this.initNLS();
        },

        //===================================================
        // Public API
        //===================================================
        accepts: ["details", "comment", "openfolder", "edit", "admin", "rights", "remove", "copy", "cut", "paste", "add", "menu", "rename", "convert"],
        action: function (action, index, ev) {
            var entry;
            if (index == -1) {
                entry = this.list.listEntry;
            } else {
                entry = this.list.listChildren[index];
            }
            this[action](entry, index, ev);
        },
        openfolder: function (entry, index, ev) {
            var refs = entry.getReferrents();
            if (refs.length > 0) {
                this.ui.application.openEntry(entry.getUri(), "default", refs[0]);
            }
        },
        openchild: function (entry, ev) {
            if (entry == null) {
                return;
            }
            this.ui.application.getHrefLinkLike(entry, function (hrefObj) {
                if (hrefObj.blankTarget) {
                    window.open(hrefObj.href);
                } else {
                    window.location = hrefObj.href;
                }
            });
            if (ev) {
                event.stop(ev);
            }
        },
        details: function (entry, index, ev) {
            console.log("DetailsClicked");
            Details.show(ev.target, entry);
        },
        comment: function (entry, index, ev) {
            if (entry instanceof folio.data.SystemEntry) {
                return;
            }
            console.log("CommentClicked");
            var comment = new CommentDialog({
                entry: entry,
                application: this.ui.application
            });
            comment.show();
        },
        edit: function (entry, index, ev) {
            if (!entry.isMetadataModifiable()) {
                return;
            }
            console.log("EditClicked");
            entry.setRefreshNeeded();
            this.ui.application.publish("showMDEditor", {entry: entry});
        },
        admin: function (entry, index, ev) {
            if (!entry.possibleToAdmin()) {
                return;
            }
            console.log("AdminClicked");
            entry.setRefreshNeeded();
            this.ui.application.publish("entryAdmin", {entry: entry});
        },
        rights: function (entry, index, ev) {
            if (!entry.possibleToAdmin()) {
                return;
            }

            var d = new RightsDialog({
                entry: entry,
                onHide: lang.hitch(this, this.ui.events.listenForKeyEvents)
            });
            d.startup();
            this.ui.events.stopListenForKeyEvents();
            d.show();
        },
        convert: function (entry, index, ev) {
            entry.getContext().getOwnEntry(lang.hitch(this, function (contextEntry) {
                if (contextEntry.possibleToAdmin()) {
                    var d = new ConvertDialog({
                        entry: entry,
                        list: this.list.listEntry,
                        onHide: lang.hitch(this, this.ui.events.listenForKeyEvents)
                    });
                    d.startup();
                    this.ui.events.stopListenForKeyEvents();
                    d.show();
                }
            }));
        },
        remove: function (entry, index, ev) {
            if ((index === -1 && (!entry.possibleToAdmin() || folio.data.getChildCount(entry) == 0)) //Need childcount for _trash?
                || (index > -1 && !((this.list.listEntry.isMetadataModifiable() && this.list.listEntry.isResourceModifiable() || this.list.listEntry.getContext().getId() == "_search") && entry.possibleToAdmin()))) {
                return;
            }
            var remove = new Remove({});
            entry.getContext().loadEntryFromId("_trash", {limit: 0},
                lang.hitch(this, function (trashEntry) {
                    var trashAccess = false;
                    if (trashEntry) {
                        trashAccess = (trashEntry.isResourceModifiable() && trashEntry.isMetadataModifiable()) || trashEntry.possibleToAdmin();
                    }
                    remove.show({
                        entry: entry,
                        parent: this.list.getListEntry(),
                        index: index + this.currentPage * this.ui.application.getCommunicator().getDefaultLimit(),
                        application: this.ui.application,
                        accessToThrash: trashAccess
                    });
                }),
                lang.hitch(this, function () {
                    remove.show({
                        entry: entry,
                        parent: this.list.getListEntry(),
                        index: index + this.currentPage * this.ui.application.getCommunicator().getDefaultLimit(),
                        application: this.ui.application,
                        accessToThrash: false
                    });
                })
            );
        },
        copy: function (entry, index, ev) {
            if (!(entry.isMetadataAccessible() && entry.isResourceAccessible())) {
                return;
            }
            console.log("CopyClicked");
            this.ui.application.setClipboard({
                entry: entry,
                operation: "copy"
            });
        },
        cut: function (entry, index, ev) {
            if (!entry.possibleToAdmin() ||
                entry instanceof folio.data.SystemEntry) {  //Should not be possible to move system-entries
                return;
            }
            console.log("CutClicked");
            if (this.list.listEntry instanceof folio.data.SystemEntry) {
                var typeOfSystemEntry = this.list.listEntry.entryInfo.entryId;
                switch (typeOfSystemEntry) {
                    case "_latest":
                        break;
                    case "_systemEntries":
                        break;
                }
            } else if (this.list.listEntry.getContext() instanceof folio.data.SearchContext) {
                var listsWithEntry = entry.getLists();
                if (listsWithEntry.length === 1) {
                    var entryObj = folio.data.normalizeEntryInfo(listsWithEntry[0]);
                    entryObj.refreshMe = true;
                    entry.getContext().getStore().loadEntry(entryObj, {limit: this.ui.application.getCommunicator().getDefaultLimit()},
                        lang.hitch(this, function (result) {
                            this.ui.application.setClipboard({
                                entry: entry,
                                operation: "cut",
                                from: result,
                                index: index + this.list.currentPage * this.ui.application.getCommunicator().getDefaultLimit()
                            });
                        }),
                        lang.hitch(this, function () {
                            this.ui.application.message("Could not find the folder the item was located in");
                        })); //TODO: In case of a failure of loading
                } else if (listsWithEntry.length > 1) {
                    this.ui.application.message("Could not cut this item as it appears in two or more folders");
                } else {
                    this.ui.application.message("Could not cut this item as it appears to not appear in any folder");
                }
                return;
            }
            this.ui.application.setClipboard({
                entry: entry,
                operation: "cut",
                from: this.list.listEntry,
                index: index + this.currentPage * this.ui.application.getCommunicator().getDefaultLimit()
            });
        },
        paste: function (entry, index, ev) {
            if (index == -1) {
                console.log("HeaderPasteClicked");
                if (!this.list.isPasteDisabled) {
                    operations.pasteInto(this.list.listEntry);
                }
            } else {
                console.log("ItemPasteClicked");
                if (!this.list.isPasteIntoDisabled && entry.isResourceModifiable()) {
                    operations.pasteInto(entry);
                }
            }
        },
        add: function (entry, index, ev) {
            console.log("AddClicked");
            //var d = new dojo.Deferred();
            var application = this.ui.application;
            var home = application.getUser().homecontext;
            var contextURI = application.repository + home;

            /*
             * Function that is called after the contacts-list has been loaded.
             */
            var entryLoaded = function (contacts) {
                if (contacts.resource && contacts.resource.children) {
                    for (var ii = 0; ii < contacts.resource.children.length; ii++) {
                        var child = contacts.resource.children[ii];
                        var childId = child.info["sc:resource"]["@id"];
                        if (childId === entry.getResourceUri()) {
                            return;
                        }
                    }
                }

                /*
                 * Function called after a successful creation of a new reference-entry to
                 * the contacts-list
                 */
                var updateEntry = function (entry) {
                    folio.data.getList(contacts, lang.hitch(this, function (list) {
                        list.entry.setRefreshNeeded();
                        var clickedNode = ev.originalTarget;
                        if (clickedNode && !domClass.contains(clickedNode, "disabledEntryButton")) {
                            domClass.add(clickedNode, "disabledEntryButton");
                        }
                        this.ui.application.message(this.NLSBundles.list.addedToContactsMessage);
                    }));
                };

                var builtinTypeString = "";
                if (entry.getBuiltinType() === folio.data.BuiltinType.USER) {
                    builtinTypeString = "user";
                } else if (entry.getBuiltinType() === folio.data.BuiltinType.GROUP) {
                    builtinTypeString = "group";
                }
                var linkEntry = {
                    context: contacts.getContext(),
                    parentList: contacts,
                    params: {
                        representationType: "informationresource",
                        entrytype: "reference",
                        graphtype: builtinTypeString,//entry.getBuiltinType(),
                        'cached-external-metadata': entry.getLocationType() === folio.data.LocationType.LOCAL ? entry.getLocalMetadataUri() : entry.getExternalMetadataUri(),
                        resource: entry.getResourceUri()}};
                contacts.getContext().createEntry(linkEntry, lang.hitch(this, updateEntry));//lang.hitch(d, d.errback));
            };

            application.getStore().getContext(contextURI).loadEntryFromId("_contacts", {}, lang.hitch(this, entryLoaded));//, lang.hitch(d, d.errback));
        },
        rename: function (entry, index, ev, select) {
            if (index === -1) {
                return;
            }
            if (entry.isMetadataModifiable()) {
                domClass.remove(this.ui.domNode, "no_user_select");
                var node = this.ui.listNodes[index];
                this._renameEditor = new RFormsLabelEditor({entry: entry, select: select},
                    domConstruct.create("div", null, node));
                this._renameEditor.focus();
            }
        },
        do_rename: function () {
            if (this._renameEditor) {
                this._renameEditor.save();
            }
            return this.abort_rename();
        },
        abort_rename: function () {
            if (this._renameEditor) {
                domClass.add(this.ui.domNode, "no_user_select");
                this._renameEditor.destroy();
                delete this._renameEditor;
                focusUtil.focus(this.ui.domNode);
                return true;
            }
        },
        in_rename_mode: function () {
            return this._renameEditor != null;
        },
        menu: function (entry, index, ev) {
            console.log("launch menu");
            var self = this, menu = new Menu({});
            this._getMenuActions(entry, function (eas) {
                array.forEach(eas, function (ea) {
                    menu.addChild(new MenuItem({
                        label: ea.label,
                        disabled: !ea.enabled,
                        onClick: function () {
                            self[ea.action](entry, index, ev);
                        }
                    }));
                });
                menu.startup();
                event.stop(ev);

                //WARNING, using private method in Menu, since there is no public method available.
                menu._scheduleOpen(ev.target, null, {x: ev.pageX, y: ev.pageY});
                if (self.list.selectedIndex != index) {
                    self.list.setSelectedByIndex(index);
                }
            });
        },
        _getMenuActions: function (child, callback) {
            var o = [];
            var parentList = this.list.getListEntry();
            var isTrashFolder = child.getId() === "_trash";
            if (!this.ui.user) {
                callback(o);
            }

            if (this.ui.includeDetails) {
                o.push({action: "details", enabled: true, label: this.NLSBundles.list.details});
            }

            o.push({action: "edit", enabled: child.isMetadataModifiable(), label: this.NLSBundles.list.edit});
            o.push({action: "rename", enabled: child.isMetadataModifiable(), label: this.NLSBundles.list.rename});
            if (__confolio.config["possibleToCommentEntry"] === "true") {
                o.push({action: "comment", enabled: (this.ui.user && this.ui.user.homecontext), label: this.NLSBundles.list.comment}); //is not a system entry
            }
            //o.push({action: "admin", enabled: child.possibleToAdmin(), label: this.NLSBundles.list.admin});
            o.push({action: "rights", enabled: child.possibleToAdmin(), label: this.NLSBundles.list.rights});
            o.push({action: "remove", enabled: (child.possibleToAdmin() && parentList.isResourceModifiable()), label: (isTrashFolder ? this.NLSBundles.list.empty : this.NLSBundles.list.remove)});
            o.push({action: "copy", enabled: (child.isMetadataAccessible() && child.isResourceAccessible() && !isTrashFolder), label: this.NLSBundles.list.copy}); //ChildMD and Resource is accessible
            o.push({action: "cut", enabled: child.possibleToAdmin() && !(child instanceof folio.data.SystemEntry), label: this.NLSBundles.list.cut}); //entry admin rights + not system entry

            if (child.getBuiltinType() == folio.data.BuiltinType.LIST && !this.ui.isPasteIntoDisabled) {
                var cb = this.ui.application.getClipboard();
                o.push({action: "paste", enabled: cb != null && cb.entry != null && child.isResourceModifiable(), label: this.NLSBundles.list.pasteInto});
            }

            o.push({action: "convert", enabled: (this.ui.user && this.ui.user.homecontext), label: this.NLSBundles.list.convert});

            //add to contacts is possible, remains to check if user is already in contacts (requires asynchrous call).
            if (child.getBuiltinType() == folio.data.BuiltinType.USER && this.ui.user && this.ui.user.homecontext) {
                var homeContext = this.ui.application.getStore().getContext(this.ui.application.repository + this.ui.user.homecontext);
                homeContext.loadEntryFromId("_contacts", {}, lang.hitch(this, function (result) {
                    //TODO, this check needs to be rewritten, depends on specific jdil format.
                    if (result && result.resource && result.resource.children) {
                        var childList = result.resource.children;
                        for (var iter = 0; iter < childList.length; iter++) {
                            var mdStub = childList[iter].info["sc:resource"];
                            if (mdStub && mdStub["@id"] === childResUri) {
                                var isInContacts = true;
                                break;
                            }
                        }
                        o.push({action: "add", enabled: !isInContacts, label: this.NLSBundles.list.add});
                    } else {
                        o.push({action: "add", enabled: true, label: this.NLSBundles.list.add});
                    }
                    callback(o);
                }));
            } else {
                callback(o);
            }
        }
    });
});