define([
    "exports",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dojo/on"
], function(exports, construct, attr, on) {

    exports.lazyLoadImage = function(node, url, done, cancel) {
        var img = construct.create("img");
        on(img, "load", function() {
            attr.set(node, "innerHTML", "");
            construct.place(img, node);
            done && done(img);
        });
        if (cancel) {
            on(img, "error", cancel);
            on(img, "abort", cancel);
        }
        attr.set(img, "src", url);
    };
});
