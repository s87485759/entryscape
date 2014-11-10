/*global define, __confolio*/
define(["dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/_base/array",
    "dojo/_base/event",
    "dojo/_base/fx",
    "dojo/dom",
    "dojo/dom-style",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dojo/dom-geometry",
    "dojo/json",
    "dojo/keys",
    "folio/entry/Details",
    "folio/editor/RFormsLabelEditor",
    "folio/create/CreateMenu",
    "folio/list/AbstractList",
    "folio/list/ListControls", //in template
    "dijit/layout/_LayoutWidget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/layout/ContentPane", //in template
    "dijit/layout/BorderContainer", //in template
    "dijit/form/TextBox", //in template
    "dojo/text!./ListTemplate.html"
], function (declare, lang, on, array, event, fx, dom, domStyle, domClass, domConstruct, domAttr, domGeometry,
             json, keys, Details, RFormsLabelEditor, CreateMenu,
             AbstractList, ListControls, _LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin,
             ContentPane, BorderContainer, TextBox, template) {

    /**
     * Provides a listing of entries.
     */
    return declare([AbstractList, _LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin], {
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
        //===================================================
        // Inherited methods
        //===================================================
        postCreate: function () {
            this.inherited("postCreate", arguments);
            if (this.headLess) {
                this.borderContainerDijit.removeChild(this.listHeadDijit);
            }
            if (this.controlsLess) {
                domStyle.set(this.listControlsDijit.domNode, "display", "none");
            }

//        this._insertSorter(domConstruct.create("div", {"class": "sortCls"}, this.sorterNode));

            domClass.add(this.domNode, "cleanList");
            on(this.listChildrenDijit, "click", lang.hitch(this, this.handleEvent, -1));
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
                    this.handleEvent(k - 1, ev);
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
        showList: function (folderEntry, page, callback) {
            this.inherited("showList", arguments);
//		this.editBar.setActiveFolder(folderEntry);
            this.selectedIndex = -1;
            this.faded = false;
            this.newChildren = null;
            folio.data.getList(folderEntry, lang.hitch(this, function (list) {
                //The if-case is to cover up when the list-entry is actually is a reference to a list-Entry
                //which means that the folder/list in the UI is entered via a reference and therefore some adjustments have to be made
                if (folio.data.isReference(folderEntry) && this.application.repository && folderEntry.getExternalMetadataUri().indexOf(this.application.repository, 0) > -1) {
                    this.list = list.entry;
                }
//			this.editBar.setActiveFolder(this.list);
                var p = page != undefined ? page : 0;
                this.currentPage = p;
                list.getPage(p, 0, lang.hitch(this, function (children) {
                    this.listControls.update(list, p);
                    this.newChildren = children;
                    if (this.faded) {
                        this._rebuildList();
                        if (callback) {
                            callback();
                        }
                    }
//			this.editBar.updateButtons();
                }));
            }));
            fx.fadeOut({
                node: this.listChildrenDijit.domNode,
                duration: this.fadeDuration,
                onEnd: lang.hitch(this, function () {
                    this.faded = true;
                    if (this.newChildren) {
                        this._rebuildList();
                        if (callback) {
                            callback();
                        }
                    }
                })
            }).play();
        },
        /**
         * Extracts the className for the tag (but only for spans) firing the event
         * Only takes the first class
         * (so the returned value for tags will only be the first class
         * even if there are several classes)
         * @param {Object} ev
         */
        extractActionFromEvent: function (ev) {
            if (ev.target.tagName == "SPAN" || ev.target.tagName == "IMG") {
                var action, spaceIndex = ev.target.className.indexOf(" ");
                if (spaceIndex != -1) {
                    action = ev.target.className.slice(0, spaceIndex);
                } else {
                    action = ev.target.className;
                }
                if (array.indexOf(this._acceptedActions, action) != -1) {
                    return action;
                }
            }
        },
        handleEvent: function (index, ev) {
            //If clicking on the same row when rename editor is open, do nothing as it is only about moving the cursor.
            if (this._renameEditor && ev && ev.target && this.selectedIndex >= 0
                && dom.isDescendant(ev.target, this.listNodes[this.selectedIndex])) {
                return;
            }
            this._abort_rename();
            this.inherited("handleEvent", arguments);
        },
        changeFocus: function (index, dontPublish) {
            if (this.focusBlock) {
                return;
            }
            if (this.selectedIndex != -1) {
                var hideNode = this.listNodes[this.selectedIndex];
                domClass.remove(hideNode, "selected");
            }
            this.doChangeFocus(index, dontPublish);
            if (index != -1) {
                var showNode = this.listNodes[index];
                domClass.add(showNode, "selected");
            }
        },
        isFocus: function (entry) {
            if (this.selectedIndex == -1 || this.listChildren == null) {
                return false;
            }
            return this.listChildren[this.selectedIndex].getId() === entry.getId();
        },
        focus: function (folder, entry) {
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
                if (!this.isFocus(entry)) {
                    this.changeFocus(index, true);
                }
            });
            if (folder !== this.list || this.currentPage != page) {
                this.showList(folder, page, f);
            } else {
                f();
            }
        },

        focusAndRename: function (newEntry) {
            setTimeout(lang.hitch(this, function () {
                this.focus(this.list, newEntry);
                this.renameFocused(true);
            }), this.fadeDuration * 3);
        },

        showDetails: function (detailsNode, entry) {
            Details.show(detailsNode, entry);
        },
        showMenu: function (entry, index, ev) {
            console.log("launch menu");
            var self = this, menu = new dijit.Menu({});
            this._getEditActions(entry, function (eas) {
                array.forEach(eas, function (ea) {
                    menu.addChild(new dijit.MenuItem({
                        label: ea.label,
                        disabled: !ea.enabled,
                        onClick: function () {
                            self["_handle_" + ea.action](entry, index, ev);
                        }
                    }));
                });
                menu.startup();
                event.stop(ev);

                //WARNING, using private method in Menu, since there is no public method available.
                menu._scheduleOpen(ev.target, null, {x: ev.pageX, y: ev.pageY});
                if (self.selectedIndex != index) {
                    self.changeFocus(index);
                }
            });
        },
        //=================================================== 
        // Private methods
        //===================================================
        _rebuildList: function () {
            this.listChildren = this.newChildren;
            this.listNodes = [];
            if (!this.headLess) {
                this.listHeadDijit.set("content", "");//Just to clear if the asynchronous call is slow.
                if (this.list.getId() == "_systemEntries") {
                    this.list.getContext().getOwnEntry(lang.hitch(this, this._updateHead));
                } else {
                    this._updateHead();
                }
            }

            var childrenContainer = domConstruct.create("div", {style: {"height": "100%"}});
            on(childrenContainer, "contextmenu", lang.hitch(this, this._showHeaderMenu));

            for (var i = 0; i < this.listChildren.length; i++) {
                var childNode = domConstruct.create("div", null, childrenContainer);
                this.listNodes[i] = childNode;
                if (this.listChildren[i] && this.listChildren[i].needRefresh()) {
                    this.listChildren[i].refresh(lang.hitch(this, function (cn, tmpi, refreshedEntry) {
                        this._insertChild(refreshedEntry, tmpi, cn);
                    }, childNode, i));
                }
                else {
                    this._insertChild(this.listChildren[i], i, childNode);
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
            this.showMenu(this._headEntry, -1, ev);
        },
        _updateHead: function (mdEntry) {
            var headContainer = domConstruct.create("div");
            var mde = mdEntry || this.list;
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
            if (this.list.isResourceModifiable()) {
                newicon = domConstruct.create("span", {"class": "new icon24 operation"}, listControls);
                this.connect(newicon, "mouseover", this._handle_new);
                this.createMenu = new CreateMenu({list: this}, domConstruct.create("div", {}, listControls));
            } else {
                newicon = domConstruct.create("span", {"class": "new icon24 operation disabled", title: "You do not have sufficient rights to create entries in this folder."}, listControls);
            }

            this._insertRefreshButton(domConstruct.create("span", {"class": "refresh icon24"}, listControls));

            var comments = mde.getComments();
            if (comments.length > 0) {
                domConstruct.create("span", {"title": "" + comments.length + " comments", "class": "comment operation icon"}, listControls);
            }
            domConstruct.create("span", {"class": "menu operation icon24"}, listControls);

            on(headContainer, "contextmenu", lang.hitch(this, this.showMenu, mde, -1));
            on(headContainer, "click", lang.hitch(this, this.handleEvent, -1));
            this.listHeadDijit.set("content", headContainer);
        },
        _insertRefreshButton: function (refreshNode) {
            domAttr.set(refreshNode, "title", "Press to refresh list");
            on(refreshNode, "click", lang.hitch(this, function () {
                this.list.setRefreshNeeded();
                this.refresh();
            }));
        },

        //=================================================== 
        // Private methods for generating a child starts here
        _refreshChild: function (index) {
            this._insertChild(this.listChildren[index], index, this.listNodes[index], true);
        },
        _handle_new: function (entry, index, ev) {
            this.createMenu.show(this.list);
        },
        _handle_rename: function (entry, index, ev, select) {
            var child = this.listChildren[index];
            if (child.isMetadataModifiable()) {
                domClass.remove(this.domNode, "no_user_select");
                var node = this.listNodes[index];
                this._renameEditor = new RFormsLabelEditor({entry: child, select: select}, domConstruct.create("div", null, node));
                this._renameEditor.focus();
            }
        },
        _do_rename: function () {
            if (this._renameEditor) {
                this._renameEditor.save();
            }
            return this._abort_rename();
        },
        _abort_rename: function () {
            if (this._renameEditor) {
                domClass.add(this.domNode, "no_user_select");
                this._renameEditor.destroy();
                delete this._renameEditor;
                dijit.focus(this.domNode);
                return true;
            }
        },
        _insertChild: function (child, number, childNode, refresh) {

            if (refresh === true) {
                domAttr.set(childNode, "innerHTML", "");
            } else {
                on(childNode, "click", lang.hitch(this, this.handleEvent, number));
                on(childNode, "contextmenu", lang.hitch(this, this.showMenu, child, number));
            }

            var f = lang.hitch(this, function (hrefObj) {
                if (this.iconMode) {
                    this._insertEntryAsIcon(child, childNode, number);
                } else {
                    this._insertIcon(child, childNode, hrefObj);
                    //Capture doubleclicks
                    if (refresh !== true) {
                        on(childNode, "dblclick", lang.hitch(this, function (ev) {
                            if (this._renameEditor && ev && ev.target && this.selectedIndex >= 0
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
        _insertModifiedDate: function (child, childNode) {
            var mod = child.getModificationDate() || child.getCreationDate();
            mod = mod ? mod.slice(0, 10) : "";
            domConstruct.create("div", {
                "class": "modCls",
                "innerHTML": "<span class=\"modified\">" + this.resourceBundle.modified + "</span>:&nbsp;" + mod
            }, childNode);
        },
        _insertChildCountIfList: function (child, childNode) {
            if (folio.data.isListLike(child)) {
                var nr = folio.data.getChildCount(child);
                domConstruct.create("div", {
                    "class": "modCls",
                    "innerHTML": "<span class=\"modified\">" + this.resourceBundle.items + "</span>:&nbsp;" + (nr != undefined ? nr : "?") + "&nbsp;&nbsp;&nbsp;"
                }, childNode);
            }
        },
        _insertTitle: function (child, childNode, noDownload, hrefObj) {
            var rowOperations = domConstruct.create("div", {"class": "rowOperations"}, childNode);

            if (hrefObj != null) {
                if (noDownload == null && (child.getLocationType() == folio.data.LocationType.LOCAL &&
                    child.getBuiltinType() == folio.data.BuiltinType.NONE) && !this.iconMode) {
                    var download = domConstruct.create("a", {"href": child.getResourceUri() + "?download", "title": "Download", "class": "operation externalLink"}, rowOperations);
                    domConstruct.create("span", {"class": "download operation icon"}, download);
                }


                var aNode = domConstruct.create("a", {"href": hrefObj.href, "class": "titleCls", "innerHTML": folio.data.getLabel(child)}, childNode);
                if (hrefObj.blankTarget) {
                    domAttr.set(aNode, "target", "_blank");
                }

                if (hrefObj.blankTarget && !this.iconMode) {
                    var linkArrow = domConstruct.create("a", {"href": hrefObj.href, "target": "_blank", "title": "Open in new window or tab", "class": "externalLink"}, childNode);
                    domConstruct.create("span", {"class": "external operation icon"}, linkArrow);
                }
            } else {
                domConstruct.create("span", {"class": "titleCls disabledTitleCls", "innerHTML": folio.data.getLabel(child)}, childNode);
            }
            if (this.openFolderLink && !this.iconMode) {
                domConstruct.create("span", {"class": "openfolder operation icon", "title": "Show in folder"}, rowOperations);
            }
            if (!this.iconMode && __confolio.config["possibleToCommentEntry"] === "true") {
                var comments = child.getComments();
                if (comments.length > 0) {
                    domConstruct.create("span", {"title": "" + comments.length + " comments", "class": "comment operation icon"}, rowOperations);
                }
            }
            if (this.detailsLink && !this.iconMode) {
                domConstruct.create("span", {"class": "details operation icon", "title": "Open details"}, rowOperations);
            }
            if (!this.iconMode) {
                domConstruct.create("span", {"class": "menu operation icon", "title": "Open menu"}, rowOperations);
            }
        },
        _insertDescription: function (child, childNode) {
            domConstruct.create("div", {"class": "descCls", "innerHTML": folio.data.getDescription(child).replace(/(\r\n|\r|\n)/g, "<br/>")}, childNode);
        },
        _getEditActions: function (child, callback) {
            var o = [];
            var isTrashFolder = child.getId() === "_trash";
            if (!this.user) {
                callback(o);
            }

            if (this.includeDetails) {
                o.push({action: "details", enabled: true, label: this.resourceBundle.details});
            }

            o.push({action: "edit", enabled: child.isMetadataModifiable(), label: this.resourceBundle.edit});
            o.push({action: "rename", enabled: child.isMetadataModifiable(), label: this.resourceBundle.rename});
            if (__confolio.config["possibleToCommentEntry"] === "true") {
                o.push({action: "comment", enabled: true, label: this.resourceBundle.comment}); //is not a system entry
            }
            //o.push({action: "admin", enabled: child.possibleToAdmin(), label: this.resourceBundle.admin});
            o.push({action: "rights", enabled: child.possibleToAdmin(), label: this.resourceBundle.rights});
            o.push({action: "remove", enabled: (child.possibleToAdmin() && this.list.isResourceModifiable() && this.list.isMetadataModifiable), label: (isTrashFolder ? this.resourceBundle.empty : this.resourceBundle.remove)});
            o.push({action: "copy", enabled: (child.isMetadataAccessible() && child.isResourceAccessible() && !isTrashFolder), label: this.resourceBundle.copy}); //ChildMD and Resource is accessible
            o.push({action: "cut", enabled: child.possibleToAdmin() && !(child instanceof folio.data.SystemEntry), label: this.resourceBundle.cut}); //entry admin rights + not system entry

            if (child.getBuiltinType() == folio.data.BuiltinType.LIST && !this.isPasteIntoDisabled) {
                var cb = this.application.getClipboard();
                o.push({action: "paste", enabled: cb != null && cb.entry != null && child.isResourceModifiable(), label: this.resourceBundle.pasteInto});
            }

            o.push({action: "convert", enabled: true, label: this.resourceBundle.convert});

            //add to contacts is possible, remains to check if user is already in contacts (requires asynchrous call).
            if (child.getBuiltinType() == folio.data.BuiltinType.USER && this.user && this.user.homecontext) {
                var homeContext = this.application.getStore().getContext(this.application.repository + this.user.homecontext);
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
                        o.push({action: "add", enabled: !isInContacts, label: this.resourceBundle.add});
                    } else {
                        o.push({action: "add", enabled: true, label: this.resourceBundle.add});
                    }
                    callback(o);
                }));
            } else {
                callback(o);
            }
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
            if (this.list.getId() == "_systemEntries") {
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