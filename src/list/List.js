/*global define, __confolio*/
define([
    "dojo/_base/declare",
    "dojo/_base/lang"
], function(declare, lang) {

    return declare(null, {
        //===================================================
        // Public Attributes
        //===================================================
        iconMode: false,
        list: null,
        listChildren: [],
        selectedIndex: -1,
        publishSelectEvents: true,
        ui: null,

        //===================================================
        // Public API
        //===================================================
        setIconMode: function (iconMode) {
            this.iconMode = iconMode;
            if (this.listEntry) {
                this.showList(this.listEntry);
            }
        },
        getSelectedEntry: function () {
            if (this.selectedIndex != -1) {
                return this.listChildren[this.selectedIndex];
            }
        },
        getSelectedIndex: function() {
            return this.selectedIndex;
        },
        getEntry: function(index) {
            return this.listChildren[index];
        },
        getListEntry: function() {
            return this.listEntry;
        },
        showList: function (folderEntry, page, callback) {
            this.selectedIndex = -1; //clear selection.
            this.childrenLoading = true;
            this.ui.showList(folderEntry, page, callback);
            folio.data.getList(folderEntry, lang.hitch(this, function (list) {
                //The if-case is to cover up when the list-entry is actually is a reference to a list-Entry
                //which means that the folder/list in the UI is entered via a reference and therefore
                // some adjustments have to be made
                if (folio.data.isReference(folderEntry) && this.application.repository
                    && folderEntry.getExternalMetadataUri().indexOf(this.application.repository, 0) > -1) {
                    this.listEntry = list.entry;
                } else {
                    this.listEntry = folderEntry;
                }
                var p = page != undefined ? page : 0;
                this.currentPage = p;
                list.getPage(p, 0, lang.hitch(this, function(children) {
                    this.childrenLoading = false;
                    this.listChildren = children;
                    this.ui.showListChildren(children, callback);
                }), lang.hitch(this, function() {
                    this.childrenLoading = false;
                    this.listChildren = [];
                    this.ui.showListChildren([], callback);
                    //TODO better error handling.
                }));
            }), lang.hitch(this, function() {
                this.childrenLoading = false;
                this.listEntry = folderEntry;
                this.listChildren = [];
                this.ui.showListChildren([], callback);
                //TODO handle errors better.
            }));
        },
        showPage: function (page) {
            this.showList(this.listEntry, page);
        },
        isSelected: function (entry) {
            if (this.selectedIndex == -1 || this.listChildren == null) {
                return false;
            }
            return this.listChildren[this.selectedIndex].getId() === entry.getId();
        },
        setSelectedByIndex: function (index, dontPublish) {
            var entry = this.listEntry, list;
            if (index !== -1) {
                entry = this.listChildren[index];
                list = this.listEntry;
            }
            var oldSI = this.selectedIndex;
            this.selectedIndex = index;
            if (dontPublish !== true && this.publishSelectEvents) {
                this.application.publish("showEntry", {entry: entry, list: list});
            }
            this.ui.newSelection(oldSI,index);
        },
        select: function (folder, entry) {
            //This only works when there is only one page or the focused entry is on the first page.
            var page = this.currentPage != null ? this.currentPage : 0;
            var f = lang.hitch(this, function () {
                var index = 0;
                for (var i = 0; i < this.listChildren.length; i++) {
                    if (entry === this.listChildren[i]) {
                        index = i;
                        break;
                    }
                }
                if (!this.isSelected(entry)) {
                    this.setSelectedByIndex(index, true);
                }
            });
            if (folder !== this.listEntry || this.currentPage != page) {
                this.showList(folder, page, f);
            } else {
                f();
            }
        },
        //===================================================
        // Abstract methods
        //===================================================
        extractActionFromEvent: function (ev) {
            //Override
        },
        showListChildren: function(children) {
            //Override
        },

        //===================================================
        // Inherited methods
        //===================================================
        constructor: function (ui) {
            this.ui = ui;
            this.application = ui.application;
        }
/*
        localize: function () {
            dojo.requireLocalization("folio", "list");
            this.resourceBundle = dojo.i18n.getLocalization("folio", "list");
            //this.attr(this.resourceBundle);
        }*/
    });
});