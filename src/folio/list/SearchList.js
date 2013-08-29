/*global define*/
define(["dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/_base/connect",
    "dojo/dom-style",
    "dijit/layout/_LayoutWidget",
    "folio/list/List"
], function (declare, lang, aspect, connect, style, _LayoutWidget, List) {

    /**
     * Searches for entries according to the given parameters and displays
     * 50 of the first hits with a title, a description and a modification date.
     * Currently only material that has a title and has at least one parent folder is displayed,
     * the rest is discarded from the listing.
     * Every title is a link to the default view with this material selected in one of its parent folders,
     * if there are several parent folders one is choosen arbitrarily.
     *
     */
    return declare(_LayoutWidget, {
        //===================================================
        // Public api
        //===================================================
        show: function (params, callback) {
            this.searchParams = params;
            this._show(params, 0, callback);
        },
        onResults: function (nrOfHits) {
        },
        entrySelected: function (entry) {
        },

        //===================================================
        // Inherited methods
        //===================================================
        buildRendering: function () {
            this.domNode = this.srcNodeRef;
            this.application = __confolio.application;
            this._list = new List(
                {application: this.application,
                    user: this.application.getUser(),
                    headLess: true,
                    controlsLess: true,
                    detailsLink: true,
                    openFolderLink: true,
                    publishFocusEvents: false},
                dojo.create("div", null, this.srcNodeRef));
            style.set(this._list.domNode.parentNode, "height", "100%");
            connect.subscribe("/confolio/userChange", lang.hitch(this, this._userChange));
            aspect.before(this._list, "changeFocus", lang.hitch(this, function (index) {
                if (index !== -1) {
                    this.entrySelected(this._list.listChildren[index]);
                }
            }));
        },
        getChildren: function () {
            return [this._list];
        },
        resize: function (size) {
            this.inherited("resize", arguments);
            if (this._list != null) {
                this._list.resize();
            }
        },

        //===================================================
        // Private methods
        //===================================================
        _userChange: function () {
            this._list.user = this.application.getUser();
        },
        _show: function (params, page, callback) {
            if (params === null) {
                params = this.searchParams;
            }
            params = lang.mixin(params, {
                limit: 20,
                onSuccess: lang.hitch(this, function (entryResult) {
                    callback && callback();
                    folio.data.getList(entryResult, lang.hitch(this, function (list) {
                        //update list
                        this._list.showList(entryResult);
                        this.onResults(list.getSize());
                    }));
                }),
                onError: lang.hitch(this, function (error) {
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
        }
    });
});