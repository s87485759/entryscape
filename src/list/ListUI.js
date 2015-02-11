/*global define, __confolio*/
define(["dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/_base/array",
    "dojo/_base/fx",
    "dojo/_base/event",
    "dojo/dom",
    "dojo/dom-style",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "folio/create/CreateMenu",
    "folio/list/List",
    "folio/list/ListActions",
    "folio/list/ListEvents",
    "folio/list/ListControls", //in template
    "dijit/layout/_LayoutWidget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "di18n/NLSMixin",
    "di18n/localize",
    "dijit/layout/ContentPane", //in template
    "dijit/layout/BorderContainer", //in template
    "dijit/form/TextBox", //in template
    "dojo/text!./ListUITemplate.html"
], function (declare, lang, on, array, fx, event, dom, domStyle, domClass, domConstruct, domAttr,
             CreateMenu, List, ListActions, ListEvents, ListControls, _LayoutWidget,
             _TemplatedMixin, _WidgetsInTemplateMixin, NLSMixin, localize, ContentPane, BorderContainer,
             TextBox, template) {

    /**
     * Provides a listing of entries.
     */
    return declare([_LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin, NLSMixin], {
        //=================================================== 
        // Public Attributes 
        //===================================================
        fadeDuration: 150,
        listNodes: [],
        headLess: false,
        controlsLess: false,
        includeDetailsButton: false,
        openFolderLink: false,
        detailsLink: false,
        list: null,
        iconMode: false, /*Set on list*/
        publishSelectEvents: true, /*Set on list*/
        nlsBundles: ["list"],
        nlsBundleBase: "nls/",

        //=================================================== 
        // Inherited Attributes 
        //===================================================
        region: "",
        templateString: template,

        //=================================================== 
        // Private Attributes 
        //===================================================
        _entry2Icon: {"_top": "folder_home", "_contacts": "contact", "_featured": "spread", "_feeds": "rss", "_trash": "trashcan_full"},

        //===================================================
        // Public API
        //===================================================
        newSelection: function (oldIndex, newIndex) {
            if (this.focusBlock) {
                return;
            }
            if (oldIndex != -1) {
                var hideNode = this.listNodes[oldIndex];
                domClass.remove(hideNode, "selected");
            }
            if (newIndex != -1) {
                var showNode = this.listNodes[newIndex];
                domClass.add(showNode, "selected");
            }
        },

        showList: function (folderEntry, page, callback) {
            this.fading = true;
            fx.fadeOut({
                node: this.listChildrenDijit.domNode,
                duration: this.fadeDuration,
                onEnd: lang.hitch(this, function () {
                    this.fading = false;
                    if (!this.list.childrenLoading) {
                        this._rebuildList();
                        if (callback) {
                            callback();
                        }
                    }
                })
            }).play();
        },
        showListChildren: function(children, callback) {
            this.listControls.update(this.list.listEntry.list, this.list.currentPage);
            if (!this.fading) {
                this._rebuildList();
                if (callback) {
                    callback();
                }
            }
        },

        selectAndRename: function (newEntry) {
            setTimeout(lang.hitch(this, function () {
                this.list.select(this.list.listEntry, newEntry);
                this.actions.rename(this.list.getSelectedEntry(), this.list.getSelectedIndex(), null, true);
            }), this.fadeDuration * 3);
        },

        //===================================================
        // Inherited methods
        //===================================================
        postCreate: function () {
            this.inherited("postCreate", arguments);
            this.initNLS();
            this.list = new List(this);
            this.actions = new ListActions(this.list, this);
            this.events = new ListEvents(this.list, this.actions);
            this.list.setIconMode(this.iconMode);
            this.list.publishSelectEvents = this.publishSelectEvents;

            if (this.headLess) {
                this.borderContainerDijit.removeChild(this.listHeadDijit);
            }
            if (this.controlsLess) {
                domStyle.set(this.listControlsDijit.domNode, "display", "none");
            }

            domClass.add(this.domNode, "cleanList");
            on(this.listChildrenDijit, "click", lang.hitch(this, "_handleEvent", -1));
            on(this.listChildrenDijit.domNode, "mousemove", lang.hitch(this, function (ev) {
                if (domClass.contains(ev.target, "iconCls") && !this.iconMode) {
                    var parent = ev.target.parentNode;
                    while (parent != null && !domClass.contains(parent, "listEntry")) {
                        parent = parent.parentNode;
                    }
                    var k = 0, e = parent;
                    while (e) {
                        e = e.previousSibling
                        k = k + 1;
                    }
                    this._handleEvent(k - 1, ev);
                }
            }));
        },
        startup: function () {
            this.inherited("startup", arguments);
            this.listControls.setListViewer(this);
        },
        getChildren: function () {
            return [this.borderContainerDijit];
        },
        resize: function (size) {
            this.inherited("resize", arguments);
            if (this.borderContainerDijit != null) {
                this.borderContainerDijit.resize();
            }
        },
        refresh: function (entry) {
            if (entry != null && this.list.listChildren != null) {
                var uri = entry.getUri();
                if (this.list.listEntry && this.list.listEntry.getUri() === uri) {
                    this._updateHead();
                    return;
                }
                for (var i = 0; i < this.list.listChildren.length; i++) {
                    if (uri === this.list.listChildren[i].getUri()) {
                        this._refreshChild(i);
                        return;
                    }
                }
            }
            this.list.showList(this.list.listEntry);
        },

        //===================================================
        // Private methods
        //===================================================
        /**
         * Extracts the className for the tag (but only for spans) firing the event
         * Only takes the first class
         * (so the returned value for tags will only be the first class
         * even if there are several classes)
         * @param {Object} ev
         */
        _handleEvent: function (index, ev) {
            //If clicking on the same row when rename editor is open, do nothing
            // as it is only about moving the cursor.
            if (this.actions.in_rename_mode() && ev && ev.target && this.list.selectedIndex >= 0
                && dom.isDescendant(ev.target, this.listNodes[this.list.selectedIndex])) {
                return;
            }
            this.actions.abort_rename();
            //Do not handle events when a link (or icon inside of a link) was clicked.
            if (this.list.selectedIndex === index
                && (ev.target.nodeName === "A"
                || domClass.contains(ev.target, "iconCls")
                || domClass.contains(ev.target, "external")
                || domClass.contains(ev.target, "download"))) {
                __confolio.ignoreUnloadDialog();
                ev.stopPropagation();
                return;
            }
            if (ev.target.tagName == "SPAN" || ev.target.tagName == "IMG") {
                var action, spaceIndex = ev.target.className.indexOf(" ");
                if (spaceIndex != -1) {
                    action = ev.target.className.slice(0, spaceIndex);
                } else {
                    action = ev.target.className;
                }
                if (array.indexOf(this.actions.accepts, action) != -1) {
                    this.actions.action(action, index, ev);
                }
            }
            if (this.list.selectedIndex != index) {
                this.list.setSelectedByIndex(index);
            }
            event.stop(ev);
        },

        _rebuildList: function () {
            this.listNodes = [];
            if (!this.headLess) {
                this.listHeadDijit.set("content", "");//Just to clear if the asynchronous call is slow.
                if (this.list.listEntry.getId() == "_systemEntries") {
                    this.list.listEntry.getContext().getOwnEntry(lang.hitch(this, this._updateHead));
                } else {
                    this._updateHead();
                }
            }

            var childrenContainer = domConstruct.create("div", {style: {"height": "100%"}});
            on(childrenContainer, "contextmenu", lang.hitch(this, this._showHeaderMenu));

            for (var i = 0; i < this.list.listChildren.length; i++) {
                var childNode = domConstruct.create("div", null, childrenContainer);
                this.listNodes[i] = childNode;
                if (this.list.listChildren[i] && this.list.listChildren[i].needRefresh()) {
                    this.list.listChildren[i].refresh(lang.hitch(this, function (cn, tmpi, refreshedEntry) {
                        this._insertChild(refreshedEntry, tmpi, cn);
                    }, childNode, i));
                }
                else {
                    this._insertChild(this.list.listChildren[i], i, childNode);
                }
            }
            this.listChildrenDijit.set("content", childrenContainer);
            this.resize();

            fx.fadeIn({
                node: this.listChildrenDijit.domNode,
                duration: this.fadeDuration
            }).play();
        },

        //=================================================== 
        // Private methods for generating the head
        _showHeaderMenu: function (ev) {
            this.actions.menu(this._headEntry, -1, ev);
        },
        _updateHead: function (mdEntry) {
            var headContainer = domConstruct.create("div");
            var mde = mdEntry || this.list.listEntry;
            this._headEntry = mde;
            var config = this.application.getConfig();

            domConstruct.create("img", {"class": "iconCls", "src": config.getIcon(mde)}, headContainer);

            var desc = folio.data.getDescription(mde);

            //Title
            domConstruct.create("div", {"class": "titleCls", "title": desc, "innerHTML": folio.data.getLabel(mde)}, headContainer);

            //Sorter and Refresher
            var listControls = domConstruct.create("div", {"class": "expandCls"}, headContainer);
            //Head Metadata

            var newicon;
            if (this.list.listEntry.isResourceModifiable()) {
                newicon = domConstruct.create("span", {"class": "new icon24 operation"}, listControls);
                this.createMenu = new CreateMenu({list: this.list, listUI: this}, domConstruct.create("div", {}, listControls));
                this.connect(newicon, "mouseover", lang.hitch(this.createMenu, this.createMenu.show));
            } else {
                newicon = domConstruct.create("span", {"class": "new icon24 operation disabled", title: this.NLSBundles.list.insufficientRightsToCreate}, listControls);
            }

            this._insertRefreshButton(domConstruct.create("span", {"class": "refresh icon24"}, listControls));

            var comments = mde.getComments();
            if (comments.length > 0) {
                domConstruct.create("span", {"title": "" + comments.length + " comments", "class": "comment operation icon"}, listControls);
            }
            domConstruct.create("span", {"class": "menu operation icon24", title: this.NLSBundles.list.openMenu}, listControls);

            on(headContainer, "contextmenu", lang.hitch(this.actions, "menu", mde, -1));
            on(headContainer, "click", lang.hitch(this, "_handleEvent", -1));
            this.listHeadDijit.set("content", headContainer);
        },
        _insertRefreshButton: function (refreshNode) {
            domAttr.set(refreshNode, "title", this.NLSBundles.list.refresh);
            on(refreshNode, "click", lang.hitch(this, function () {
                this.list.listEntry.setRefreshNeeded();
                this.refresh();
            }));
        },

        //=================================================== 
        // Private methods for generating a child starts here
        _refreshChild: function (index) {
            this._insertChild(this.list.listChildren[index], index, this.listNodes[index], true);
        },
        _handle_new: function (entry, index, ev) {
            this.createMenu.show(this.list.listEntry);
        },
        _insertChild: function (child, number, childNode, refresh) {

            if (refresh === true) {
                domAttr.set(childNode, "innerHTML", "");
            } else {
                on(childNode, "click", lang.hitch(this, "_handleEvent", number));
                on(childNode, "contextmenu", lang.hitch(this.actions, "menu", child, number));
            }

            var f = lang.hitch(this, function (hrefObj) {
                if (this.iconMode) {
                    this._insertEntryAsIcon(child, childNode, number);
                } else {
                    this._insertIcon(child, childNode, hrefObj);
                    //Capture doubleclicks
                    if (refresh !== true) {
                        on(childNode, "dblclick", lang.hitch(this, function (ev) {
                            if (this.actions.in_rename_mode() && ev && ev.target && this.selectedIndex >= 0
                                && dom.isDescendant(ev.target, this.listNodes[this.selectedIndex])) {
                                return;
                            }
                            if (hrefObj.blankTarget) {
                                window.open(hrefObj.href, "_blank");
                            } else {
                                window.location = hrefObj.href;
                            }
                        }));
                    }

                    var rowNode = domConstruct.create("div", {"class": "singleLine"}, childNode);

                    // The child is set to refresh (i.e. info.graph is removed) in method this._insertTitle 
                    //and therefor has to be performed last. 
                    this._insertTitle(child, rowNode, null, hrefObj);
                    domClass.add(childNode, "listEntry");
                    domClass.toggle(childNode, "evenRow", number % 2 != 0); //First row is 0, hence we mark number 1 as even.
                }
            });

            //Preparing the hrefObj for the child.
            if ((folio.data.isWebContent(child) || folio.data.isListLike(child) ||
                folio.data.isContext(child) || folio.data.isUser(child)) && child.isResourceAccessible()) {
                this.application.getHrefLinkLike(child, f);
            } else {
                f();
            }
        },
        _insertIcon: function (child, childNode, hrefObj) {
            var config = this.application.getConfig();
            if (hrefObj != null) {
                childNode = domConstruct.create("a", {"class": "iconCls", "href": hrefObj.href}, childNode);
                if (hrefObj.blankTarget) {
                    domAttr.set(childNode, "target", "_blank");
                }
            }
            domConstruct.create("img", {"class": "iconCls", "src": config.getIcon(child, "16x16")}, childNode);
            if (folio.data.isLinkLike(child)) {
                domConstruct.create("img", {"class": "iconCls", style: {"position": "absolute", "left": "5px"}, "src": "" + config.getIcon("link", "16x16")}, childNode);
            }
        },
        _insertTitle: function (child, childNode, noDownload, hrefObj) {
            var rowOperations = domConstruct.create("div", {"class": "rowOperations"}, childNode);

            if (hrefObj != null) {
                if (noDownload == null && (child.getLocationType() == folio.data.LocationType.LOCAL &&
                    child.getBuiltinType() == folio.data.BuiltinType.NONE) && !this.iconMode) {
                    var download = domConstruct.create("a", {"href": child.getResourceUri() + "?download", "title": this.NLSBundles.list.download, "class": "operation externalLink"}, rowOperations);
                    domConstruct.create("span", {"class": "download operation icon"}, download);
                }


                var aNode = domConstruct.create("a", {"href": hrefObj.href, "class": "titleCls", "innerHTML": folio.data.getLabel(child)}, childNode);
                if (hrefObj.blankTarget) {
                    domAttr.set(aNode, "target", "_blank");
                }

                if (hrefObj.blankTarget && !this.iconMode) {
                    var linkArrow = domConstruct.create("a", {"href": hrefObj.href, "target": "_blank", "title": this.NLSBundles.list.openExternally, "class": "externalLink"}, childNode);
                    domConstruct.create("span", {"class": "external operation icon"}, linkArrow);
                }
            } else {
                domConstruct.create("span", {"class": "titleCls disabledTitleCls", "innerHTML": folio.data.getLabel(child)}, childNode);
            }
            if (this.openFolderLink && !this.iconMode) {
                domConstruct.create("span", {"class": "openfolder operation icon", "title": this.NLSBundles.list.showInFolder}, rowOperations);
            }
            if (!this.iconMode && __confolio.config["possibleToCommentEntry"] === "true") {
                var comments = child.getComments();
                if (comments.length > 0) {
                    domConstruct.create("span", {"title": localize(this.NLSBundles.list, "showComments", comments.length), "class": "comment operation icon"}, rowOperations);
                }
            }
            if (this.detailsLink && !this.iconMode) {
                domConstruct.create("span", {"class": "details operation icon", "title": this.NLSBundles.list.openDetails}, rowOperations);
            }
            if (!this.iconMode) {
                domConstruct.create("span", {"class": "menu operation icon", "title": this.NLSBundles.list.openMenu}, rowOperations);
            }
        },
        _insertDescription: function (child, childNode) {
            domConstruct.create("div", {"class": "descCls", "innerHTML": folio.data.getDescription(child).replace(/(\r\n|\r|\n)/g, "<br/>")}, childNode);
        },
        _insertEditButtons: function (child, childNode) {
            var buts = domConstruct.create("div", {"class": "butsCls selected"}, childNode);
            this._getEditActions(child, function (eas) {
                array.forEach(eas, function (ea) {
                    domConstruct.create("span", {"class": ea.action + " link " + (ea.enabled ? "" : "disabledEntryButton"), "innerHTML": ea.label}, buts);
                });
            });
        },
        _insertEntryAsIcon: function (child, childNode, number) {
            var iconStr;
            var config = this.application.getConfig();
            if (this.list.listEntry.getId() == "_systemEntries") {
                iconStr = this._entry2Icon[child.getId()];
                if (iconStr) {
                    iconStr = "" + dojo.moduleUrl("folio", "icons_oxygen/" + iconStr + ".png");
                } else {
                    iconStr = config.getIcon(child);
                }
            } else {
                iconStr = config.getIcon(child);
            }
            if (iconStr) {
                domClass.add(childNode, "iconView");
                on(childNode, "dblclick", lang.hitch(this.application, function () {
                    this.application.publish("showEntry", {entry: child});
                }));

                var label = folio.data.getLabel(child);
                domConstruct.create("img", {src: iconStr}, childNode);

                if (folio.data.isLinkLike(child)) {
                    domConstruct.create("img", {"class": 'iconCls', "style": {"position": "absolute", "left": 0}, "src": "" + config.getIcon("link", "16x16")}, childNode);
                }
                this._insertTitle(child, childNode, true);
//			domConstruct.create("div", {"class": "entryLabel", "innerHTML": label}, childNode);
            }
        },
        _insertIcons: function () {
            folio.data.getAllChildren(this.systemEntries, lang.hitch(this, function (children) {
                this.icons.innerHTML = "";
                for (var i = 0; i < children.length; i++) {
                    var entry = children[i];
                    var iconStr = this._entry2Icon[entry.getId()];
                    if (iconStr) {
                        var div = document.createElement("div");
                        if (this.selectedEntryId == entry.getId()) {
                            domClass.toggle(div, "selected");
                            this.selectedDiv = div;
                        }
                        on(div, "click", lang.hitch(this, this.select, div, entry));
                        var src = "" + dojo.moduleUrl("folio", "icons_oxygen/" + iconStr + ".png");
                        var label = folio.data.getLabel(entry);
                        div.innerHTML = "<img src='" + src + "'/><br/><center>" + label + "</center>";
                        this.icons.appendChild(div);
                    }
                }
            }));
        }
    });
});