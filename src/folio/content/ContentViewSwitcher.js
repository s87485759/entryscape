/*global define, __confolio*/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dijit/layout/_LayoutWidget",
    "dojox/image/LightboxNano",
    "folio/util/utils",
    "folio/content/RTE"
], function (declare, lang, on, domGeometry, domClass, domStyle, domConstruct, domAttr, _LayoutWidget, LightboxNano, utils, RTE) {

    var flashidx = 0;

    return declare(_LayoutWidget, {
        //===================================================
        // Public Attributes
        //===================================================
        //Special case when content is image, following variables are needed.
        img: null,
        origWidth: 0,
        origHeight: 0,
        webInline: false,
        snippetInline: true,
        flashInline: true,
        imgInline: true,
        pdfInline: true,

        contentNode: null,

        //===================================================
        // Public Methods
        //===================================================
        contentUpdated: function() {
        },
        isContentEditable: function() {
            return this.contentDijit ? this.contentDijit.isEditable() : false;
        },
        toggleEditMode: function() {
            if (this.contentDijit) {
                this.contentDijit.toggleEditMode();
            }
        },
        inEditMode: function() {
            return this.contentDijit ? this.contentDijit.inEditMode() : false;
        },

        //===================================================
        // Inherited methods
        //===================================================
        constructor: function(args) {
            this.application = __confolio.application;
        },
        buildRendering: function() {
            this.domNode = this.srcNodeRef || dojo.create("div");
            domClass.add(this.domNode, "contentViewSwitcher");
            on(this.domNode, "click", function(evt) {
                if (evt.target.href != null) {
                    evt.preventDefault();
                    window.open(evt.target.href, "_blank");
                }
            });
        },
        show: function(entry) {
            if (this._showTimer) {
                clearTimeout(this._showTimer);
            }
            this._showTimer = setTimeout(dojo.hitch(this, function() {
                delete this._showTimer;
                this._show(entry);
                this.contentUpdated();
            }),300);
        },
        _show: function(entry) {
            if (this.entry === entry) {
                return;
            }
            this.entry = entry;

            domAttr.set(this.domNode, "innerHTML", "");
            domClass.remove(this.domNode, "leftAligned");

            this.contentNode = null;
            this.doResize = false;
            this.contentDijit = null;
            var service = folio.data.detectService(entry);
            if (service) {
                this.showing = true;
                switch(service.object) {
                case "flash":
                    if (this.flashInline) {
                        this._contentFlash(entry, service);
                    }
                    break;
                case "iframe":
                    if (this.webInline) {
                        this._contentIframe(entry);
                    }
                    break;
                case "snippet":
                    if (this.snippetInline) {
                        this._contentSnippet(entry, service);
                    }
                    break;
                case "image":
                    if (this.imgInline) {
                        this._contentImage(entry, service);
                    }
                    break;
                default:
                    this.showing = false;
                }
            } else {
                this.showing = false;
                var imgs = folio.data.getImages(entry);
                if (imgs.length > 0) {
                    this._showImage(imgs[0].full || imgs[0].thumb);
                    this.showing = true;
                } else if (folio.data.isWebContent(entry)) {
                    var mimetype = entry.getMimeType();
                    if (mimetype && mimetype.indexOf("image") === 0 && this.imgInline) {
                        this._showImage(entry.getResourceUri());
                        this.showing = true;
                        return;
                    }
                    switch(mimetype) {
                        case "text/html+snippet":
                            this._htmlSnippet(entry);
                            this.showing = true;
                            break;
                        case "text/html":
                            if (this.webInline) {
                                this._contentIframe(entry);
                                this.showing = true;
                            }
                            break;
                        case "application/pdf":
                            if (this.pdfInline) {
                                this._contentIframe(entry);
                                this.showing = true;
                            }
                            break;
                        default:
                            if (this.webInline) {  //&& folio.data.isLinkLike(event.entry)
                                this._contentIframe(entry);
                                this.showing = true;
                            }
                    }
                }
            }
            if (!this.showing) {
                this._showIcon(entry);
                this.showing = true;
            }
        },
        resize: function() {
            var bb = domGeometry.getContentBox(this.domNode);
            this.resizeContent();
            if (this.contentNode) {
                /*var cbb = dojo.marginBox(this.contentNode);
                console.log(dojo.toJson(cbb));
                if (cbb.h < bb.h) {
                    dojo.style(this.contentNode, "marginTop", (bb.h-cbb.h)/2);
                } else {
                    dojo.style(this.contentNode, "marginTop", 0);
                }*/
            }
    //		setTimeout(dojo.hitch(this, function() {
                this.inherited("resize", arguments);
    //		}), 1);
        },
        resizeContent: function() {
            var bb = domGeometry.getContentBox(this.domNode);
            if (this.contentNode && this.doResize) {
                var width = this.origWidth;
                var height = this.origHeight;

                if(width > bb.w){
                        height = Math.floor(height * (bb.w / width));
                        width = bb.w;
                }
                if(height > bb.h){
                        width = Math.floor(width * (bb.h / height));
                        height = bb.h;
                }
                domStyle.set(this.contentNode, "width", ""+width+"px");
                domStyle.set(this.contentNode, "height", ""+height+"px");
                domStyle.set(this.contentNode, "margin", "auto");

                if (this.contentNode.height < bb.h) {
                    domStyle.set(this.contentNode, "marginTop", (bb.h-this.contentNode.height)/2);
                } else {
                    domStyle.set(this.contentNode, "marginTop", 0);
                }
            }
        },

        //===================================================
        // Private methods
        //===================================================
        _showImage: function(url) {
            this.showing = true;
            this.doResize = true;
            this.contentNode = domConstruct.create("div", {"innerHTML": "Loading image..."}, this.domNode);
            utils.lazyLoadImage(this.contentNode, url, lang.hitch(this, function(img) {
                this.origWidth = img.width;
                this.origHeight = img.height;
                img.style.width = "100%";
                img.style.height = "100%";
                if (this._lightbox) {
                    this._lightbox.destroy();
                    delete this._lightbox;
                }
                new LightboxNano({href: url}, img);
                this.resizeContent();
            }), lang.hitch(this, function() {
                domAttr.set(this.contentNode, "innerHTML", "Failed loading image with address:<br>"+url);
            }));
        },

        _htmlSnippet: function(entry) {
            domClass.add(this.domNode, "leftAligned");
            this.contentNode = dojo.create("div", {style: {height: "100%", "overflow-y": "auto"}}, this.domNode);
            this.editable = true;
            this.contentDijit = new RTE({entry: entry}, this.contentNode);
        },

        _contentSnippet: function(entry, service) {
            this.showing = true;
            var url = entry.getResourceUri();
            if (url && url != "" && service) {
                service.getParameters(url,
                    lang.hitch(this, function(param) {
                        if(param) {
                            this.contentNode = domConstruct.create("div", {innerHTML: param.html}, this.domNode);
                        }
                    })
                );
            }
        },
        _contentImage: function(entry, service) {
            this.showing = true;
            var url = entry.getResourceUri();
            if (url && url != "" && service) {
                service.getParameters(url,
                    lang.hitch(this, function(param) {
                        if(param) {
                            this._showImage(param.url);
                        }
                    })
                );
            }
        },
        _contentFlash: function(entry, service) {
            this.showing = true;
            var url = entry.getResourceUri();
            if (url && this.url != "" && service) {
                this.doResize = true;
                flashidx++;
                var flashid = "flashplayer_"+flashidx;
                this.contentNode = domConstruct.create("div", {innerHTML: "<div id='"+flashid+"'></div>"}, this.domNode);


                service.getParameters(url,
                    lang.hitch(this, function (swfArgs) {
                        if (swfArgs) {
                            swfobject.embedSWF(
                            swfArgs.videoSrc,
                            flashid,
                            "100%",
                            "100%",
                            swfArgs.version,
                            "../lib/swfobject/expressInstall.swf",
                            swfArgs.flashvars,
                            swfArgs.params,
                            swfArgs.attributes,
                            lang.hitch(this, function(arg1, arg2) {
                                setTimeout(dojo.hitch(this, function() {
                                    var bb = domGeometry.getContentBox(this.domNode);
                                    if (swfArgs.height < bb.h) {
                                        domStyle.set(this.contentNode, "marginTop", (bb.h-swfArgs)/2);
                                    } else {
                                        domStyle.set(this.contentNode, "marginTop", 0);
                                    }
                                    this.resize();
                                }), 500);
                            }));
                            this.origWidth = swfArgs.width;
                            this.origHeight = swfArgs.height;
                        } else {
                            console.log("folio.simple.ContentFlashPlayer, swfArgs == null");
                        }
                    }));
            }
        },
        _contentIframe: function(entry) {
            this.showing = true;
            this.contentNode = domConstruct.create("iframe", {frameborder: 0, style: {width: "100%", height: "100%"}, src: entry.getResourceUri()}, this.domNode);
        },
        _showIcon: function(entry) {
            var node = domConstruct.create("div", {"class": "contentIcon"}, this.domNode);
            var config = this.application.getConfig();
            var extIcon = false, iconSrc = config.getIcon(entry);
            if (entry.getExternalMetadata != null) {
                var graph = entry.getExternalMetadata();
                if (graph) {
                    var stmts = graph.find(null, folio.data.FOAFSchema.THUMBNAIL, null);
                    if (stmts.length > 0) {
                        extIcon = true;
                        iconSrc = stmts[0].getValue();
                    }
                }
            }
            domConstruct.create("img", {"class": "iconCls", "src": iconSrc || ""}, node);
            if (folio.data.isLinkLike(entry) && !extIcon) {
                domConstruct.create("img", {style: {"position": "absolute", "left": 0}, "src": ""+config.getIcon("link")}, node);
            }
        }
    });
});