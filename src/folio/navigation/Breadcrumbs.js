/*global define, __confolio*/
define(["dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/_base/array",
    "dojo/dom",
    "dojo/dom-style",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dojo/dom-geometry",
    "dijit/popup",
    "dijit/focus",
    "dijit/layout/_LayoutWidget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "folio/navigation/PrincipalInfo", //in template
    "folio/navigation/CommandLine", //in template
    "folio/navigation/FDO",
    "folio/util/dialog",
    "folio/ApplicationView",
    "dojo/text!./BreadcrumbsTemplate.html"
], function (declare, lang, on, array, dom, domStyle, domClass, domConstruct, domAttr, domGeometry,
             popup, focus, _LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin,
             PrincipalInfo, CommandLine, FDO, dialog, ApplicationView, template) {

    /**
     * Provides a breadcrumb list where you can see the folder hierarchy.
     * You can switch between the folders in the current branch without
     * the breadcrumbs being cut of, the selected folder is shown as pressed.
     * Before every breadcrumb there is a dropdown dialog which allows you to see
     * and select other folders on the same level.
     */
    return declare([_LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin, FDO, ApplicationView], {

        //===================================================
        // Inherited Attributes
        //===================================================
        templateString: template,

        //===================================================
        // Internal Attributes
        //===================================================
        _listListMode: true,
        _CLIMode: false,
        _crumbChoices: null,

        //===================================================
        // Public API
        //===================================================
        setCurrentFolder: function (folderEntry) {
            if (folderEntry.getId() == "_systemEntries") {
                folderEntry.getContext().getOwnEntry(lang.hitch(this, this.setCurrentFolder));
            } else {
                this._setCurrentFolder(folderEntry);
            }
        },

        //===================================================
        // Inherited methods
        //===================================================
        constructor: function (args) {
            this.stack = [];
        },
        getSupportedActions: function () {
            return ["changed", "deleted", "clear", "showEntry", "userChange", "localeChange"];
        },
        resize: function (size) {
            this.inherited("resize", arguments);
            if (this._CLIMode) {
                var box = domGeometry.getContentBox(this.domNode);
                var bbox = domGeometry.getContentBox(this.bcNode);
                domGeometry.getMarginBox(this.CLIDijit.domNode, {w: box.w, h: box.h - bbox.h});
                this.CLIDijit.resize();
            }
        },
        handle: function (event) {
            switch (event.action) {
                case "localeChange":
                    this._localize();
                    break;
                case "showEntry":
                    if (!event.list) { //Avoid focus events within current list.
                        this.setCurrentFolder(event.entry);
                    } else if (this.current === null) {
                        this.setCurrentFolder(event.list);
                    } else if (this.current !== event.list) {
                        this.setCurrentFolder(event.list);
                    }
                    break;
                case "deleted":
                case "clear":
                case  "userChange":
                    if (this.stack.length > 0) {
                        this.application.getStore().loadEntry(this.stack[this.stack.length - 1].getUri(),
                            {limit: 0, sort: null}, lang.hitch(this, this.setCurrentFolder));
                    }
                    break;
                    //TODO
                    break;
            }
        },
        setApplication: function () {
            this.inherited("setApplication", arguments);
            this.init();
        },
        postCreate: function () {
            this.containerNode = this.domNode;
            this.inherited("postCreate", arguments);
            this.afterPostCreate = true;
            this.init();
        },
        init: function () {
            if (this.application === undefined || this.afterPostCreate === undefined) {
                return;
            }
            this.application.getStore().loadEntry(this.application.repository + "_contexts/entry/_all",
                {},
                lang.hitch(this, function (entry) {
                    if (folio.data.isList(entry)) {
                        var f = function (children) {
                            var nchilds = array.map(children, function (child) {
                                var alias = child.alias;
                                return {entryId: child.getId(), hasAlias: alias != undefined, alias: alias || child.getId()};
                            });
                        };
                        folio.data.getAllChildren(entry, lang.hitch(this, f));
                    }
                }),
                null);
            this._listListMode = true;
            domClass.toggle(this.listListModeNode, "selected");

            if (this.application.getConfig()["CLI"] === "true") {
                domStyle.set(this.CLIModeNode, "display", "");
                //TODO, this icon has been removed, restore it.
                domAttr.set(this.CLIModeNode, "src", require.toUrl("folio/icons_oxygen/22x22/shellscript.png"));
                on(this.CLIModeNode, "click", lang.hitch(this, this._toggleCLIMode));
                this.CLIDijit.fdo = this;
            }
        },
        /**
         * @see folio.navigation.FDO#cdEntryUri
         */
        cdEntryUri: function (entryUri, callback) {
            if (entryUri == this.stack[0].getUri()) {
                this.application.dispatch({action: "showContext", entry: this.stack[index]});
            } else {
                this.application.dispatch({action: "showEntry", entry: entryUri});
            }
            callback(this.code.SUCCESS);
        },


        //===================================================
        // Private methods
        //===================================================
        _toggleTree: function () {
            this.treeVisible = !this.treeVisible;
            domClass.toggle(this.showTreeNode, "distinctBackground");
            if (this.treeVisible) {
                this.application.publish("viewState", {treeVisible: true});
            } else {
                this.application.publish("viewState", {treeVisible: false});
            }
        },
        _showListLikeList: function () {
            if (this._listListMode) {
                return;
            }
            this._listListMode = true;
            domClass.toggle(this.listListModeNode, "distinctBackground");
            domClass.toggle(this.iconListModeNode, "distinctBackground");
            this.application.publish("viewState", {listViewMode: "list"});
        },
        _showListLikeIcons: function () {
            if (!this._listListMode) {
                return;
            }
            this._listListMode = false;
            domClass.toggle(this.listListModeNode, "distinctBackground");
            domClass.toggle(this.iconListModeNode, "distinctBackground");
            this.application.publish("viewState", {listViewMode: "icon"});
        },
        _toggleCLIMode: function () {
            if (this._CLIMode) {
                this._CLIMode = false;
                domStyle.set(this.CLIDijit.domNode, "display", "none");
                domStyle.set(this.domNode, "height", "");
            } else {
                this._CLIMode = true;
                domStyle.set(this.CLIDijit.domNode, "display", "");
                domStyle.set(this.domNode, "height", "100%");
            }
            domClass.toggle(this.CLIModeNode, "selected");
            this.getParent().resize();
        },

        _setCurrentFolder: function (folderEntry) {
            if (this.choicesDialogDijit) {
                popup.close(this.choicesDialogDijit);
            }
            this.current = folderEntry;
            if (array.indexOf(this.stack, folderEntry) != -1) {
                this._draw();
                return;
            }
            if (folio.data.isContext(folderEntry)) {
                this.stack = [folderEntry];
                this._draw();
                return;
            }
            var parentUri = folderEntry.getReferrents()[0];
            var parentLocation = -1;
            array.forEach(this.stack, function (parent, index) {
                if (parent.getResourceUri() === parentUri) {
                    parentLocation = index;
                }
            });
            if (parentLocation == -1) {
                //no connection, to the current breadcrumb, reset and find the new parents
                this.stack = [folderEntry];
                this._findParents(folderEntry);
            } else if (parentLocation == this.stack.length - 1) {
                //Went into a subfolders of the last breadcrumb.
                this.stack.push(folderEntry);
                this._draw();
            } else {
                //Went into a subfolder of some of the breadcrumbs.
                this.stack = this.stack.slice(0, parentLocation + 1);
                this.stack.push(folderEntry);
                this._draw();
            }
        },

        /**
         * The entry is added to the stack, find and also add its parents to the stack.
         */
        _findParents: function (entry) {
            var referents = entry.getReferrents();
            if (entry instanceof folio.data.SystemEntry || referents.length == 0) {
                if (entry.getId() != "_systemEntries") {
                    entry.getContext().getOwnEntry(lang.hitch(this, function (contextEntry) {
                        this.stack.splice(0, 0, contextEntry);
                        this._draw();
                    }));
                }
                return; //at the top of the branch.
            }
            this.application.getStore().loadEntry(referents[0], {limit: 0, sort: null}, lang.hitch(this, function (parent) {
                this.stack.splice(0, 0, parent);
                this._findParents(parent);
            }));
        },
        _draw: function () {
            //draw the breadcrumbs.
            domAttr.set(this.breadcrumbs, "innerHTML", "");
            /*		if (this.crumbDijits) {
             array.forEach(this.crumbDijits, function(inst) {inst.destroy();});
             }*/
            this.crumbDijits = [];
            var trail = false;
            array.forEach(this.stack, lang.hitch(this, function (crumb, index) {
//			var cls = crumb == this.current ? "label selected" : "label";
                var crumbNode;
                if (index === 0) {
                    this._drawOwnerBar(crumb);
                    return;
                } else if (index === 1) {
                    crumbNode = domConstruct.create("div", {"class": "crumb"}, this.breadcrumbs);
                    domConstruct.create("span", {"class": "crumbSeparatorRectangular distinctBackground"}, crumbNode);
                } else {
                    crumbNode = domConstruct.create("div", {"class": "crumb"}, this.breadcrumbs);
                    var arrow = domConstruct.create("span", {"class": "crumbSeparatorArrow distinctBackground"}, crumbNode);
                    domConstruct.create("div", null, arrow);
                }
                var sep = domConstruct.create("span", {"class": "icon menu"}, crumbNode);
                on(sep, "click", lang.hitch(this, this._showChoicesDialog, sep, crumbNode));
                var label = folio.data.getLabel(crumb);
                if (crumb == this.current) {
                    trail = true;
                    domConstruct.create("span", {innerHTML: label}, crumbNode);
                } else {
                    var ael = domConstruct.create("a", {innerHTML: label, href: this.application.getHref(crumb, "default")}, crumbNode);
                    if (trail) {
                        domClass.add(crumbNode, "trail");
                    }
                }
                //this.crumbDijits.push(new dijit.form.Button({label:label},domConstruct.create("div", null, crumbNode)));
//			arr.push("<span class='crumb'><span class='choices'><span class='choicesLabel'>▼</span></span><span class='"+cls+"'>"+label+"</span></span>");
            }));
        },
        _drawOwnerBar: function (entry) {
            var acl = array.filter(folio.data.getACLList(entry), function (principalRow) {
                return principalRow.admin === true || principalRow.mwrite === true || principalRow.rwrite === true;
            });
            var count = acl.length;
            var oEntries = [];
            var done = lang.hitch(this, function () {
                if (oEntries.length === 1) {
                    this.principalInfoDijit.show(oEntries[0]);
                    /*				var name = folio.data.getLabelRaw(oEntries[0]) || oEntries[0].resource.name;
                     domAttr.set(this.ownerBarNode, "innerHTML", name);
                     domAttr.set(this.profileNode, "href", this.application.getHref(oEntries[0].getUri(), "profile"));
                     domStyle.set(this.ownerIconsNode, "display", "");*/
                } else {
                    /*				domStyle.set(this.ownerIconsNode, "display", "none");
                     domAttr.set(this.ownerBarNode, "innerHTML", this._getContextLabel(entry));*/
                }
            });
            var f = function (ownerEntry) {
                if (ownerEntry && ownerEntry.getHomeContext() === entry.getResourceUri()) {
                    oEntries.push(ownerEntry);
                }
                count--;
                if (count === 0) {
                    done();
                }
            };

            if (acl.length > 0) {
                for (var i = 0; i < acl.length; i++) {
                    this.application.getStore().loadEntry(acl[i].uri, {limit: 0, sort: null}, f);
                }
            } else {
                done();
            }
        },
        _showChoicesDialog: function (sep, crumb) {
            var index = array.indexOf(this.breadcrumbs.children, crumb) + 1;

            var f = lang.hitch(this, function (entry) {
                folio.data.getChildren(entry, lang.hitch(this, function (chldr) {
                    var children = array.filter(chldr, function (child) {
                        return folio.data.isList(child);
                    });
                    var prepareDialog = lang.hitch(this, function (innerNode, onReady) {
                        if (children && children.length > 0) {
                            if (children.length > 20) {
                                domStyle.set(innerNode, "height", "300px");
                                domStyle.set(innerNode, "overflow", "auto");
                            }
                            children.sort(lang.hitch(this, function (a, b) {
                                    var aa = folio.data.getLabel(a);
                                    var bb = folio.data.getLabel(b);
                                    if (aa > bb) {
                                        return 1
                                    } else if (aa < bb) {
                                        return -1
                                    } else {
                                        return 0
                                    }
                                }
                            ));
                        }
                        array.forEach(children, function (child, idx) {
                            if (this.current === child) {
                                domConstruct.create("span", {innerHTML: folio.data.getLabel(child)}, innerNode);
                            } else {
                                if (folio.data.isLinkLike(child) && !folio.data.isFeed(child) && child.getBuiltinType() !== folio.data.BuiltinType.RESULT_LIST) {
                                    folio.data.getLinkedLocalEntry(child, lang.hitch(this, function (linkedEntry) {
                                        domConstruct.create("a", {href: this.application.getHref(linkedEntry), innerHTML: folio.data.getLabel(child)}, innerNode);
                                    }));
                                } else {
                                    domConstruct.create("a", {href: this.application.getHref(child), innerHTML: folio.data.getLabel(child)}, innerNode);
                                }
                            }
                            domConstruct.create("br", {}, innerNode);
                        }, this);
                        focus.focus(innerNode);
                        onReady();
                    });
                    this.choicesDialogDijit = dialog.launchToolKitDialog(sep, prepareDialog);
                }));
            });
            if (index > 1) {
                f(this.stack[index - 1]);
            } else if (index == 1) {
                //TODO: for unlisted folders this will not work...
                this.application.getStore().loadEntry(this.stack[index].getContext().getUri() + "/entry/_systemEntries", {limit: 0, sort: null}, f);
            } else if (index == 0) {
                f = lang.hitch(this, function (entry) {
                    folio.data.getAllChildren(entry, lang.hitch(this, function (chldr) {
                        var prepareDialog = lang.hitch(this, function (innerNode, onReady) {
                            if (children.length > 20) {
                                domStyle.set(innerNode, "height", "300px");
                                domStyle.set(innerNode, "overflow", "auto");
                            }
                            children.sort(lang.hitch(this, function (a, b) {
                                var aa = this._getContextLabel(a).toLowerCase();
                                var bb = this._getContextLabel(b).toLowerCase();
                                if (aa > bb) {
                                    return 1
                                } else if (aa < bb) {
                                    return -1
                                } else {
                                    return 0
                                }
                            }));

                            array.forEach(children, function (child) {
                                if (child.isResourceAccessible()) {
                                    if (this.current === child) {
                                        domConstruct.create("span", {innerHTML: this._getContextLabel(child)}, innerNode);
                                    } else {
                                        domConstruct.create("a", {href: this.application.getHref(child.getResourceUri() + "/resource/_top"), innerHTML: this._getContextLabel(child)}, innerNode);
                                    }
                                    domConstruct.create("br", {}, innerNode);
                                }
                            }, this);
                            focus.focus(innerNode);
                            onReady();
                        });
                        this.choicesDialogDijit = dialog.launchToolKitDialog(sep, prepareDialog);
                    }));
                });
                this.application.getStore().loadEntry(this.application.repository + "_contexts/entry/_all", {}, f, null);
            }
        },
        _getContextLabel: function (entry) {
            return folio.data.getLabelRaw(entry) || entry.alias || entry.getId();
        }
    });
});