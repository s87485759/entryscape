/*global define, __confolio*/
define([
    "dojo/_base/lang",
    "dojo/_base/connect",
    "rdfjson/Graph"
], function(lang, connect, Graph) {
    var exports = {};
    var resourceBundle;

    connect.subscribe("/di18n/localeChange", function() {
        require(["di18n/i18n!nls/list"], function(bundle) {
            resourceBundle = bundle;
        });
    });

    exports.isPasteForbidden = function(folder, callback) {
        var cb = __confolio.application.getClipboard();
        if (cb == undefined || cb.entry == undefined) {
            callback(true);
            return;
        }

        if (cb.entry.getContext() != folder.getContext()) {
            if (cb.operation == "cut") {
                if((folio.data.isList(cb.entry) && !folio.data.isLinkLike(cb.entry))
                    || (cb.entry.getReferrents().length > 1)
                    || (cb.entry instanceof folio.data.SystemEntry)) {
                    callback(true);
                    return;
                }
                if (!folio.data.isLinkLike(cb.entry)
                    && (folio.data.isUser(cb.entry)
                    || folio.data.isGroup(cb.entry)
                    || folio.data.isContext(cb.entry))) {
                    callback(true);
                    return;
                }
            }
        } else {
            folio.data.getList(this.folder, dojo.hitch(this, function(list) {
                list.loadChildrenIds(dojo.hitch(this, function(childrenIds) {
                    callback(dojo.some(childrenIds, function(childId) {
                        return childId == cb.entry.getId();
                    }));
                }));
            }));
            return;
        }
        callback(false);
    };

    exports.copyClicked = function(entry) {
        __confolio.application.setClipboard({
            entry: entry,
            operation: "copy"
        });
    };

    exports.pasteInto = function(folder) {
        var cb = __confolio.application.getClipboard();
        if (cb) {
            //-------------OutOfContext
            if (cb.entry.getContext() != folder.getContext()) {
                if (cb.operation == "copy") {
                    exports.copyOutOfContext(folder);
                } else { //cut == move
                    exports.moveOutOfContext(folder);
                }
                //--------------InContext
            } else {
                if (cb.operation == "copy") {
                    exports.copyInContext(folder);
                } else { //cut == move
                    exports.moveInContext(folder);
                }
            }
        }
    };

    exports.copyOutOfContext = function(folder) {
        this.createReference(folder);
    };

    exports.createReference = function(folder) {
        var cb = __confolio.application.getClipboard();
        var linkEntry = {
            context: folder.getContext(),
            parentList: folder
        };
        if(cb.entry.getLocationType() == folio.data.LocationType.REFERENCE){
            linkEntry.params = {
                representationType: "informationresource",
                entrytype: "reference",
                "cached-external-metadata": cb.entry.getExternalMetadataUri(),
                resource: cb.entry.getResourceUri()
            };
        } else if (cb.entry.getLocationType() == folio.data.LocationType.LINK_REFERENCE){
            linkEntry.metadata = cb.entry.getLocalMetadata().exportRDFJSON();
            linkEntry.params = {
                representationType: "informationresource",
                entrytype: "linkreference",
                "cached-external-metadata": cb.entry.getExternalMetadataUri(),
                resource: cb.entry.getResourceUri()
            };
        } else {
            linkEntry.params = {
                representationType: "informationresource",
                entrytype: "reference",
                "cached-external-metadata": cb.entry.getLocalMetadataUri(),
                resource: cb.entry.getResourceUri()
            };
        }
        if (folio.data.isGroup(cb.entry)) {
            linkEntry.params.graphtype = "group";
        } else if (folio.data.isUser(cb.entry)) {
            linkEntry.params.graphtype = "user";
        } else if (folio.data.isListLike(cb.entry)) {
            linkEntry.params.graphtype = "list";
        }  else if (folio.data.isContext(cb.entry)) {
            linkEntry.params.graphtype = "context";
        }
        var updateEntry = function() {
            folio.data.getList(folder, function(list) {
                list.loadMissing(function() {
                    /*TODO: Remove everything below if the two lines of code below does the trick
                     list.addEntry(entry); //TODO: Should not be done, reference is created with the parent given
                     list.save(dojo.hitch(this, function() { //Not be done
                     folder.setRefreshNeeded(); //Not be done.
                     this.__confolio.application.publish("childrenChanged", {entry: folder, source: this});
                     }));*/
                    folder.setRefreshNeeded();
                    __confolio.application.publish("childrenChanged", {entry: folder, source: null}); //No source, to simplify code.
                });
            });
        };
        folder.getContext().createEntry(linkEntry, updateEntry);
    };

    exports.moveOutOfContext = function(folder) {
        var cb = __confolio.application.getClipboard();
        /*if (folio.data.isList(cb.entry) && !folio.data.isLinkLike(cb.entry)) {
            __confolio.application.message(resourceBundle.unableToMoveFolders); //This one says: "Folders cannot currently be cut and pasted into other portfolio."
            return;
        } */
        /*if (cb.entry.getReferrents().length > 1) {
            __confolio.application.message(resourceBundle.resourceInManyFoldersUnableToCut); //This one says: "Cut resource appears in more than one folder and cannot be cut and pasted into another portfolio."
            return;
        }*/
        if (cb.entry instanceof folio.data.SystemEntry) {
            __confolio.application.message(resourceBundle.resourceIsSystemFolderUnableToCut);//This one says: "Cut resource is a special system resource and cannot be cut and pasted into another portfolio."
            return;
        }
        exports.moveInContext(folder);
    };

    exports.copyInContext = function(folder) {
        var cb = __confolio.application.getClipboard();
        if (folio.data.isList(cb.entry)) { //& !folio.data.isLinkLike(cb.entry)) {
            //All lists should be created as reference regardless of the entryType of the original entry as the external MD is referred to in a correct way
            exports.createReference(folder);
            return;
        }
        folder.setRefreshNeeded();
        folio.data.getList(folder, function(list) {
            list.loadMissing(function(childrenE) {
                if (dojo.some(childrenE, function(child) {
                    return child.getId() == cb.entry.getId();
                })) {
                    __confolio.application.message(resourceBundle.resourceOnlyOnceInAFolder);//This one says: "Paste failed since an entry is only allowed once in every folder\n and the entry in the clipboard is already a member of this folder!"
                    return;
                }
                list.addEntry(cb.entry);
                list.save(function() {
                    cb.entry.setRefreshNeeded();
                    folder.setRefreshNeeded();
                    __confolio.application.publish("childrenChanged", {entry: folder, source: this});
                }, function(response) {
                    //In case of status-code 412, ie that the list has been modified after the time
                    //specified in the request (IfUnmodifiedSince), we try one more time to do the changes
                    if (response.status === 412) {
                        folder.setRefreshNeeded();
                        folio.data.getList(folder, function(list){
                            list.addEntry(cb.entry);
                            list.save(function(){
                                cb.entry.setRefreshNeeded();
                                folder.setRefreshNeeded();
                                __confolio.application.publish("childrenChanged", {entry: folder, source: null});  //TODO, check if null causes problems, no source to simplify code..
                            }, function(){
                                list.removeEntry(list.getSize() - 1);
                                __confolio.application.message(resourceBundle.pasteFailed); //This one says:"Paste failed when making the copy"
                            });
                        }, function(){
                            list.removeEntry(list.getSize() - 1);
                            __confolio.application.message(resourceBundle.pasteFailed); //This one says:"Paste failed when making the copy"
                        });
                    } else {
                        // Since the paste failed, remove the entry from the cached list object
                        //  so that is in the same state as before the attempted paste
                        list.removeEntry(list.getSize() - 1);
                        __confolio.application.message(resourceBundle.pasteFailed); //This one says:"Paste failed when making the copy"
                    }
                });
            });
        });
    };

    exports.moveInContext = function(folder) {
        var cb = __confolio.application.getClipboard();
        folio.data.getList(folder, function(list) {
            list.loadMissing(function(childrenE) {
                if (dojo.some(childrenE, function(child) {
                    return child.getId() === cb.entry.getId() && child.getContext().getId() === cb.entry.getContext().getId(); //Second condition needed as moveInContext is called by MoveOutOfContext!
                })) {
                    __confolio.application.message(resourceBundle.resourceOnlyOnceInAFolder);//This one says: "Paste failed since an entry is only allowed once in every folder\n and the entry in the clipboard is already a member of this folder!"
                    return;
                }
                folder.getContext().moveEntryHere(cb.entry, cb.from, folder, function() {
                    __confolio.application.setClipboard(null);
                    __confolio.application.publish("childrenChanged", {entry: folder, source: null}); //TODO check if null causes problem
                    __confolio.application.publish("childrenChanged", {entry: cb.from, source: null}); //TODO check if null causes problem
                    __confolio.application.getMessages().message(resourceBundle.pasteSucceeded);
                }, function() {
                        __confolio.application.getMessages().error(resourceBundle.pasteFailed);
//						this.__confolio.application.message(this.resourceBundle.pasteFailed); //This one says:"Paste failed"
                });
            });
        });
    };

    return exports;
});
