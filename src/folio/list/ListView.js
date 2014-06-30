/*global define, __confolio*/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "folio/ApplicationView",
    "folio/list/List",
    "dijit/_Widget"
], function (declare, lang, ApplicationView, List, _Widget) {

    return declare([_Widget, ApplicationView], {
        //===================================================
        // Public Attributes
        //===================================================
        iconMode: false,
        includeDetailsButton: false,
        detailsLink: false,

        //===================================================
        // Public Attributes
        //===================================================
        _list: null,

        //===================================================
        // Public API
        //===================================================
        setIconMode: function (iconMode) {
            if (this._list) {
                this._list.setIconMode(iconMode);
            }
        },
        getList: function () {
            return this._list;
        },

        //===================================================
        // Inherited methods
        //===================================================
        constructor: function () {
        },
        buildRendering: function () {
            this._list = new List(
                {application: this.application, iconMode: this.iconMode, includeDetailsButton: this.includeDetailsButton, detailsLink: this.detailsLink},
                this.srcNodeRef);
        },

        getSupportedActions: function () {
            return ["changed", "childrenChanged", "clear", "showEntry",
                "preferredLanguagesChange", "userChange", "localeChange", "orderChange", "viewState"];
        },

        handle: function (event) {
            this._list.user = this.application.getUser();
            if (event.list != null && event.list === this._list.list) {
                this._list.focus(event.list, event.entry);
                return;
            }
            if (event.action !== "childrenChanged" && event.action !== "changed" && event.list == null && event.entry != null && this._list.list != null && this._list.list.getUri() === event.entry.getUri()) {
                return;
            }

            var newList = event.list || event.entry;
            switch (event.action) {
                case "viewState":
                    if (event.listViewMode === "list") {
                        this._list.setIconMode(false);
                    } else if (event.listViewMode === "icon") {
                        this._list.setIconMode(true);
                    }
                    break;
                case "changed":
                    this._list.refresh(event.entry);
                    break;
                case "userChange":
                    //Make more precise.
                    if (this._list.list) {
                        this.application.getStore().loadEntry(this._list.list.getUri(), {limit: 0, sort: null},
                            dojo.hitch(this._list, this._list.showList));
                        dijit.focus(this._list.domNode);
                    }
                    break;
                case "localeChange":
                    this._list.localize();
                case "orderChange":
                    if (this._list.list) {
                        this._list.showList(this._list.list);
                    }
                    break;
                case "showEntry":
                    if (event.list) {
                        this._list.focus(event.list, event.entry);
                    } else {
                        if (folio.data.isListLike(newList)) {
                            this._list.showList(newList);
                        } else if (folio.data.isContext(newList)) {
                            this.application.getStore().loadEntry(newList.getContext().getBaseURI() + newList.getId() + "/entry/_systemEntries", {limit: 0, sort: null},
                                lang.hitch(this._list, this._list.showList));
                        }
                    }
                    break;
                case "childrenChanged":
                    if (this._list.list.getUri() === newList.getUri()) {
                        this._list.showList(newList);
                    }
                    break;
            }
        }
    });
});