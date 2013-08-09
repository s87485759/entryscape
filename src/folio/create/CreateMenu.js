define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/connect",
    "dojo/mouse",
    "dojo/_base/window",
    "dojo/dom-geometry",
    "dojo/topic",
    "dojo/query",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dojo/_base/fx",
    "dojo/NodeList-fx",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "folio/list/operations",
    "dojo/text!./CreateMenuTemplate.html"
], function(declare, lang, connect, mouse, win, domgeom, topic, query, domClass, style, construct, attr, fx, nlfx,
            _Widget, _TemplatedMixin, operations, template) {

    return declare([_Widget, _TemplatedMixin], {
        templateString: template,
        list: null,
        postCreate: function() {
            this.inherited("postCreate", arguments);
            this.moveMeToTop = construct.place(this.moveMeToTop, win.body());
            this.moveMeToTopB = construct.place(this.moveMeToTopB, win.body());
            this.connect(this.moveMeToTopB , "onclick", this.hide);
            this.connect(this.moveMeToTop, mouse.leave, this.hide);
            var application = __confolio.application;
            query(".text", this.moveMeToTop).on("click", lang.hitch(this, function() {
                this.hide();
                operations.createText(this.list.list, lang.hitch(this.list, this.list.focusAndRename));
            }));
            query(".folder", this.moveMeToTop).on("click", lang.hitch(this, function() {
                this.hide();
                operations.createFolder(this.list.list, lang.hitch(this.list, this.list.focusAndRename));
            }));
            query(".link", this.moveMeToTop).on("click", lang.hitch(this, function() {
                this.hide();
                application.publish("showCreateWizard", {type: "linkto", entry: this.list.list});
            }));
            query(".upload", this.moveMeToTop).on("click", lang.hitch(this, function() {
                this.hide();
                application.publish("showCreateWizard", {type: "upload", entry: this.list.list});
            }));
        },
        initState: function() {
            style.set(this.moveMeToTop, {
                display: "none"
            });
        },
        show: function() {
            var pos = domgeom.position(this.domNode);
            var woff = 14;
            var hoff = 0;
            style.set(this.moveMeToTop, {
                display: ""
            });
            query(".distinctThickBorder", this.moveMeToTop).style("display", "none").fadeOut({duration: 0}).play(); //Make sure faded out.
            style.set(this.moveMeToTopB, "display", "");

            query(".new", this.moveMeToTop).style({
                    top: pos.y-12+"px",
                    left: Math.floor(pos.x-12-woff)+"px"
            });
            fx.animateProperty({
                node: this.moveMeToTop,
                duration: 120,
                properties: {
                    display: "",
                    width: {start: 34, end: 110},
                    height: { start: 34, end: 110 },
                    left: {start: pos.x - woff-17, end: pos.x - woff - 55},
                    "border-radius": {start: 17, end: 55},
                    top: {start: pos.y-hoff-18, end: pos.y - hoff - 56}
                },
                onEnd: lang.hitch(this, function() {
                    query(".distinctThickBorder", this.moveMeToTop).style("display", "").fadeIn({duration: 100}).play();
                })
            }).play();
        },
        hide: function() {
            var pos = domgeom.position(this.domNode);
            var woff = 14;
            var hoff = 0;
            var dtb = query(".distinctThickBorder", this.moveMeToTop);
            dtb.fadeOut({duration: 100,
            onEnd: lang.hitch(this, function() {
                dtb.style("display", "none");

                fx.animateProperty({
                    node: this.moveMeToTop,
                    duration: 120,
                    properties: {
                        display: "",
                        width: {end: 34, start: 110}, //Difference is 76, radius difference 38.
                        height: {end: 34, start: 110 },
                        left: {end: pos.x - woff -17, start: pos.x - woff - 55},
                        "border-radius": {end: 17, start: 55},
                        top: {end: pos.y-hoff-18, start: pos.y - hoff - 56}
                    },
                    onEnd: lang.hitch(this, function() {
                        style.set(this.moveMeToTop, "display", "none");
                        style.set(this.moveMeToTopB, "display", "none");
                    })
                }).play();
            })}).play();
        }
    });
});
