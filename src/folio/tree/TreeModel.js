/*global define*/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array"
], function(declare, lang, array) {

    return declare(null, {
        constructor: function (args) {
            lang.mixin(this, args);
        },
        // =======================================================================
        // Methods for traversing hierarchy
        getRoot: function (onItem) {
            if (this.root) {
                onItem(this.root);
            } else {
                this.context.loadEntryFromId("_systemEntries", {}, lang.hitch(this, function (entry) {
                    this.root = entry;
                    onItem(this.root);
                }), lang.hitch(this, function () {
                    var mesg = "No _systemEntries in context " + this.context.getId();
//				this.application.message(mesg);
                    throw mesg;
                }));
            }
        },
        mayHaveChildren: function (/*dojo.data.Item*/ item) {
            if (item) {
                if (item === this.context) {
                    return true;
                } else {
                    return folio.data.isListLike(item);
                }
            }
            // summary
            //            Tells if an item has or may have children.  Implementing logic here
            //            avoids showing +/- expando icon for nodes that we know don't have children.
            //            (For efficiency reasons we may not want to check if an element actually
            //            has children until user clicks the expando node)
        },
        getChildren: function (/*dojo.data.Item*/ parentItem, /*function(items)*/ onComplete) {
            if (parentItem) {
                if (parentItem.isResourceAccessible()) {
                    if (parentItem === this.context) {
                        this._getChildrenOfContext(onComplete, lang.hitch(this, this.showError, parentItem));
                    } else {
                        var onErr = lang.hitch(this, function () {
                            this.showError(parentItem);
                            onComplete([]);
                        });
                        var self = this;
                        folio.data.getList(parentItem, function (list) {
                            list.getChildren(function (childrenEntries) {
                                if (self.onlyLists) {
                                    onComplete(array.filter(childrenEntries, function (entry) {
                                        return folio.data.isListLike(entry)
                                    }));
                                } else {
                                    onComplete(childrenEntries);
                                }
                            }, onErr);
                        }, onErr);
                    }
                } else {
                    onComplete([]);
//				this.application.message("listing children for folder "+parentItem.getUri()+" failed since it is not readable");
                }
            } else {
                onComplete([]);
            }
            // summary
            //           Calls onComplete() with array of child items of given parent item, all loaded.
            //            Throws exception on error.
        },
        showError: function (entry, message) {
//		this.application.message("Opening tree on entry "+entry.getUri()+" failed, maybe due to lack of rights."); //Why is this commented out? No longer needed?
        },

        _getChildrenOfContext: function (onComplete, onError) {
            var topLevel = [];
            var check = function () {
                if (topLevel[0] && topLevel[1]) {
                    onComplete(topLevel);
                }
            };
            this.context.loadEntryFromId("_top", {limit: 0}, function (entry) {
                topLevel[0] = entry;
                check();
            }, onError);
            this.context.loadEntryFromId("_systemEntries", {}, function (entry) {
                topLevel[1] = entry;
                check();
            }, onError);
        },
        // =======================================================================
        // Inspecting items
        getIdentity: function (/* item */ item) {
            if (item) {
                return item.getUri();
            }
            // summary: returns identity for an item
        },
        getLabel: function (/*dojo.data.Item*/ item) {
            if (item) {
                if (item === this.context) {
                    return "Portfolio";
                } else {
                    return folio.data.getLabel(item);
                }
            }
            return "No tree";
            // summary: get the label for an item
        },


        // =======================================================================
        // Write interface
        newItem: function (/* Object? */ args, /*Item?*/ parent) {
            // summary
            //            Creates a new item.   See dojo.data.api.Write for details on args.
        },
        pasteItem: function (/*Item*/ childItem, /*Item*/ oldParentItem, /*Item*/ newParentItem, /*Boolean*/ bCopy) {
            // summary
            //            Move or copy an item from one parent item to another.
            //            Used in drag & drop.
            //            If oldParentItem is specified and bCopy is false, childItem is removed from oldParentItem.
            //            If newParentItem is specified, childItem is attached to newParentItem.
        },
        // =======================================================================
        // Callbacks
        onChange: function (/*dojo.data.Item*/ item) {
            // summary
            //            Callback whenever an item has changed, so that Tree
            //            can update the label, icon, etc.   Note that changes
            //            to an item's children or parent(s) will trigger an
            //            onChildrenChange() so you can ignore those changes here.
        },
        onChildrenChange: function (/*dojo.data.Item*/ parent, /*dojo.data.Item[]*/ newChildrenList) {
            // summary
            //            Callback to do notifications about new, updated, or deleted items.
        }
    });
});