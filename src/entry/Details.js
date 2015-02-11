/*global define, __confolio*/
define(["dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/_base/array",
    "dojo/dom-style",
    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/_base/fx",
    "di18n/NLSMixin",
    "folio/util/utils",
    "folio/util/dialog",
    "folio/content/ContentViewSwitcher", //in template
    "folio/editor/RFormsPresenter", //in template
    "dijit/layout/BorderContainer", //in template
    "dijit/layout/ContentPane", //in template
    "dijit/Menu", //in template
    "dijit/CheckedMenuItem", //in template
    "dijit/form/Button", //in template
    "dijit/form/ComboButton", //in template
    "dijit/layout/_LayoutWidget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/focus",
    "dojo/text!./DetailsTemplate.html"
], function (declare, lang, aspect, array, domStyle, domAttr, domClass, domConstruct, fx, NLSMixin, utils, dialog,
             ContentViewSwitcher, RFormsPresenter, BorderContainer, ContentPane, Menu, CheckedMenuItem, Button,
             ComboButton, _LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin, focusUtil, template) {

    /**
     * Shows an entry's metadata and an embedded version of the entry's resource if possible.
     * If the resource can be embedded, the area is divided vertically so that the
     * embedded resource is above and the metadata below.
     * The details header contains the url to the resource.
     * The details footer contains creation and modification date, the creator and potential contributors.
     *
     * If the entry is a LinkedReference the metadata are is divided into two areas with
     * external metadata below local metadata, headings above each section tells the difference.
     */
    var Details = declare([_LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin, NLSMixin], {

        //===================================================
        // Public Attributes
        //===================================================
        doFade: false,
        singleReferrentsVisible: false,
        referrentsVisibleByDefault: false,
        nlsBundles: ["details"],
        nlsBundleBase: "nls/",


        //===================================================
        // Inherited Attributes
        //===================================================
        templateString: template,

        //===================================================
        // Internal Attributes
        //===================================================
        _parentListUrl: null,

        //===================================================
        // i18n Attributes
        //===================================================
        extInformationText: "",
        locInformationText: "",
        creatorText: "",
        modifiedText: "",
        createdText: "",
        referentsLabel: "",


        //===================================================
        // Public API
        //===================================================
        update: function (entry) {
            this._previousEntry = this.entry;
            this.entry = entry;
            // Fade out content to make changes
            if (this.doFade) {
                fx.fadeOut({
                    node: this.domNode,
                    duration: 150,
                    onEnd: lang.hitch(this, this._replace, entry)
                }).play();
            } else {
                this._replace(entry);
            }
        },
        clear: function () {
            this.update(null);
        },

        //===================================================
        // Public hooks
        //===================================================

        //===================================================
        // Inherited methods
        //===================================================
        constructor: function (args) {
            if (window.AudioPlayer) {
                //Needs to be changed, does not work in built mode.
//			AudioPlayer.setup(dojo.moduleUrl("folio", "../../lib/audio/player.swf"), {width: 280});			
            }
        },
        localeChange: function() {
            if (this.entry) {
                this.update(this.entry);
            }
            this.embedButtonDijit.set("label", this.NLSBundles.details.embed);
            this._editContentLabel();
        },
        getChildren: function () {
            return [this.detailsLayoutDijit];
        },
        resize: function (a, b, c) {
            this.inherited("resize", arguments);
            if (this.detailsLayoutDijit && this.detailsLayoutDijit.resize) {
                this.detailsLayoutDijit.resize(a, b, c);
            }
        },
        startup: function () {
            this.inherited("startup", arguments);
            this.detailsLayoutDijit.startup();
//		domStyle.set(this.contentAreaDijit.getSplitter("top").domNode, "display", "none");
            aspect.after(this.contentViewDijit, "contentUpdated", lang.hitch(this, function () {
                /*if (this.contentViewDijit.showing) {
                 domStyle.set(this.contentViewDijit.domNode, "display", "");
                 domStyle.set(this.contentAreaDijit.getSplitter("top").domNode, "display", "");
                 domStyle.set(this.imgPreviewNode, "display", "none");
                 } else {
                 domStyle.set(this.contentViewDijit.domNode, "display", "none");
                 domStyle.set(this.contentAreaDijit.getSplitter("top").domNode, "display", "none");
                 //Have to rely on the contentview since it is not certain that the Details have been updated yet.
                 var entry = this.contentViewDijit.entry;
                 if (folio.data.isWebContent(entry) && entry.getLocationType() != folio.data.LocationType.LOCAL) {
                 domAttr.set(this.imgPreviewNode, "src", "http://open.thumbshots.org/image.pxf?url=" + entry.getResourceUri());
                 domStyle.set(this.imgPreviewNode, "display", "");
                 } else {
                 domStyle.set(this.imgPreviewNode, "display", "none");
                 }
                 }*/

                this.editContentButtonDijit.set("disabled", !this.contentViewDijit.isContentEditable());
                this.contentAreaDijit.resize();
                this.resize();
            }));
        },
        postCreate: function () {
            this.inherited("postCreate", arguments);
            this.initNLS();
            aspect.after(this.configureMenuDijit, "onExecute", lang.hitch(this, this._embedToggled));
            //this.locShameDijit.setApplication(this.application);
            //this.extShameDijit.setApplication(this.application);
//		domStyle.set(this.editContentButtonDijit.domNode, "display", "none");
        },

        //===================================================
        // Private methods
        //===================================================
        _embedToggled: function () {
            setTimeout(lang.hitch(this, function () {
                this.contentViewDijit.webInline = this.webpageCheckDijit.get("checked");
                this.contentViewDijit.pdfInline = this.pdfCheckDijit.get("checked");
                this.contentViewDijit.flashInline = this.flashCheckDijit.get("checked");
                this.contentViewDijit.imgInline = this.imageCheckDijit.get("checked");
                if (this.entry) {
                    //Fake an event
                    this.contentViewDijit.show(this.entry);
                }
            }), 1);
        },
        _replace: function (entry) {
            this.contentViewDijit.show(entry);
            this._replaceURL(entry);
            this._replaceMetadata(entry);
            //this._replaceContent(entry);
            this._replaceEntryInformation(entry);
            this.detailsLayoutDijit.resize();
            this._showReferents();

            // Fade in animation after details have been updated
            if (this.doFade) {
                fx.fadeIn({
                    node: this.domNode,
                    duration: 150
                }).play();
            }
        },
        _replaceContent: function (entry) {
            //Audioplayer
            if (entry.getMimeType() == "sound/mp3") {
                domStyle.set(this.detailsLayoutHead.domNode, "height", "115px");
                utils.insertAudioPlayer(this.infoCenter, entry.getResourceUri());
            } else {
                domAttr.set(this.infoCenter, "innerHTML", "");
                domStyle.set(this.detailsLayoutHead.domNode, "height", "100px");
            }
        },
        _replaceMetadata: function (entry) {
            if (entry == null) {
                domStyle.set(this.extInfoPaneNode, "display", "none");
                domStyle.set(this.locInfoPaneNode, "display", "none");
                return;
            }
            switch (entry.getLocationType()) {
                case folio.data.LocationType.LOCAL:
                    domClass.remove(this.contentAreaDijit.domNode, "linkReference");
                    domStyle.set(this.locInfoPaneNode, "display", "");
                    domStyle.set(this.extInfoPaneNode, "display", "none");
                    this.locMDDijit.show(entry);
                    break;
                case folio.data.LocationType.LINK:
                    domClass.remove(this.contentAreaDijit.domNode, "linkReference");
                    domStyle.set(this.locInfoPaneNode, "display", "");
                    domStyle.set(this.extInfoPaneNode, "display", "none");
                    this.locMDDijit.show(entry);
                    break;
                case folio.data.LocationType.LINK_REFERENCE:
                    domClass.add(this.contentAreaDijit.domNode, "linkReference");
                    domStyle.set(this.locInfoPaneNode, "display", "");
                    domStyle.set(this.extInfoPaneNode, "display", "");
                    this.locMDDijit.show(entry);
                    this.extMDDijit.show(entry, true);
                    break;
                case folio.data.LocationType.REFERENCE:
                    domClass.remove(this.contentAreaDijit.domNode, "linkReference");
                    domStyle.set(this.locInfoPaneNode, "display", "none");
                    domStyle.set(this.extInfoPaneNode, "display", "");
                    this.extMDDijit.show(entry, true);
                    break;
            }
        },
        _replaceEntryInformation: function (entry) {
            if (entry == null) {
                domAttr.set(this.createdNode, "innerHTML", "");
                domAttr.set(this.modifiedNode, "innerHTML", "");
                domAttr.set(this.creatorNode, "innerHTML", "");
                domAttr.set(this.accessNode, "innerHTML", "");
                domAttr.set(this.rssNode, "innerHTML", "");
                return;
            }
            var cre = entry.getCreationDate();
            var mod = entry.getModificationDate();
            domAttr.set(this.createdNode, "innerHTML", cre ? cre.slice(0, 10) : "");
            domAttr.set(this.modifiedNode, "innerHTML", mod ? mod.slice(0, 10) : "");
            var creator = entry.getCreator();
            if (creator) {
                this.application.getStore().loadEntry(creator, {}, lang.hitch(this, function (ent) {
                    domAttr.set(this.creatorNode, "innerHTML", folio.data.getLabel(ent));
                }), lang.hitch(this, function (mesg) {
                    domAttr.set(this.creatorNode, "innerHTML", this.NLSBundles.details.unknown);
                }));
            } else {
                domAttr.set(this.creatorNode, "innerHTML", this.NLSBundles.details.unknown);
            }

            if (folio.data.isListLike(entry)) {
                var rssImg = "<img src= \"" + this.application.getConfig().getIcon("RSS", "16x16") + "\"/>";
                domStyle.set(this.rssWrapperNode, "display", "");
                if (folio.data.isFeed(entry)) {
                    domAttr.set(this.rssNode, "innerHTML", "<a href=\"" + entry.getResourceUri() + "\">" + rssImg + "</a>");
                } else {
                    domAttr.set(this.rssNode, "innerHTML", "<a href=\"" + entry.getContext().getBaseURI() + "" + entry.getContext().getId() + "/resource/" + entry.getId() + "?syndication=rss_2.0\">" + rssImg + "</a>");
                }
            } else {
                domStyle.set(this.rssWrapperNode, "display", "none");
            }

            //Check access, fix user.
            /*entry.getOwnEntry(lang.hitch(this, function(context) {
             var private = true;
             var stmts = context.getInfo().find(context.getUri(), folio.data.SCAMSchema.WRITE);
             if (stmts.length > 1 || stmts[0].getValue() !== userEntryURI) {
             private = false;
             ...
             }
             var info = entry.getInfo();
             var stmts = info.find(null, folio.data.SCAMSchema.WRITE);
             if (stmts.length >= 0) {

             }
             }));*/
        },
        /*	_toggleReferents: function() {
         if (this.referentsVisible) {
         this._hideReferents();
         } else {
         this._showReferents();
         }
         },*/
        _showReferents: function () {
            domStyle.set(this.referentsNode, "display", "");
            this.detailsLayoutDijit.resize();
            domAttr.set(this.referentsListNode, "innerHTML", "");
            var refs = this.entry.getReferrents();
            var count = refs.length;
            this.refEntries = [];
            array.forEach(refs, function (ref) {
                this.application.getStore().loadEntry(ref, {limit: 0, sort: null}, lang.hitch(this, function (refE) {
                    count--;
                    this.refEntries.push(refE);
                    if (count == 0) {
                        var first = true;
                        array.forEach(this.refEntries, function (refEntry, index) {
                            if (!first) {
                                domConstruct.create("span", {"innerHTML": ", "}, this.referentsListNode);
                            }
                            first = false;
                            var isParent = this._parentListUrl == refEntry.getUri();
                            var node = domConstruct.create("a",
                                {"href": this.application.getHref(this.entry, "default", refEntry), //       //refEntry.getContext().getId() + "." + refEntry.getId(),
                                    "innerHTML": folio.data.getLabel(refEntry),
                                    "class": isParent ? "" : "clickable"},
                                this.referentsListNode);
                        }, this);
                    }
                    this.detailsLayoutDijit.resize();
                }));
            }, this);
            this.referentsVisible = true;
        },
        /*	_hideReferents: function() {
         domStyle.set(this.referentsNode, "display", "none");
         this.detailsLayoutDijit.resize();
         this.referentsVisible = false;
         },*/
        _replaceURL: function (entry) {
            if (entry == null) {
                domAttr.set(this.urlNode, "innerHTML", "");
            }
            var url = entry.getResourceUri();
            if (entry.getLocationType() == folio.data.LocationType.LOCAL) {
                domAttr.set(this.urlNode, "innerHTML", "<a href=\"" + url + "\" target=\"_blank\">" + entry.getContext().getId() + "/resource/" + entry.getId() + "</a>");
            } else {
                var len = 18, label = decodeURIComponent(url);
                if (label.length > (len * 2 + 3)) {
                    label = label.substring(0, len) + " … " + label.substring(label.length - len); //ellipsis
                }
                domAttr.set(this.urlNode, "innerHTML", "<a href=\"" + url + "\" target=\"_blank\">" + label + "</a>");
            }
        },
        _editContentClicked: function () {
            this.contentViewDijit.toggleEditMode();
            this._editContentLabel();
        },
        _editContentLabel: function() {
            if (this.contentViewDijit.inEditMode()) {
                this.editContentButtonDijit.set("label", this.NLSBundles.details.present);
            } else {
                this.editContentButtonDijit.set("label", this.NLSBundles.details.edit);
            }
        }
    });


    Details.show = function (node, entry) {
        var bb = __confolio.application.getBoundingBox();
        var width = Math.floor((bb.w < 600 ? bb.w : 600 ) * 0.70),
            height = Math.floor((bb.h < 700 ? bb.h : 700) * 0.70);
        dialog.launchToolKitDialog(node, function (innerNode, onReady) {
            domStyle.set(innerNode, {
                width: width + "px",
                height: height + "px",
                overflow: "auto",
                position: "relative"    // workaround IE bug moving scrollbar or dragging dialog
            });

            domClass.add(innerNode, "confolio");
            domClass.add(innerNode, "mainPanel");
            var details = new Details({
                application: __confolio.application,
                style: {"width": "100%", "height": "100%"},
                doFade: false
            }, domConstruct.create("div", {}, innerNode));
            details.startup();
            if (folio.data.isListLike(entry)) {
                details._parentListUrl = entry.getUri();
            } else if (folio.data.isContext(entry)) {
                details._parentListUrl = entry.getContext().getBaseURI() + entry.getId() + "/entry/_systemEntries";
            }
            details.editContentButtonDijit.set("label", this.NLSBundles.details.edit);
            details.update(entry);
            details.contentViewDijit.show(entry);
            //Make sure that someDijit is finished rendering, or at least has some realistic size before making the following calls.
            focusUtil.focus(details.domNode);
            onReady();
            details.resize();
        }, {x: bb.x + bb.w - 75, y: 100, noArrow: true});
    };
    return Details;
});