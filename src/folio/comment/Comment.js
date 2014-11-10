/*global define, __confolio*/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-attr",
    "folio/editor/RFormsPresenter", //in template
    "folio/content/ContentViewSwitcher", //in template
    "folio/util/Widget",
    "dojo/text!./CommentTemplate.html"
], function(declare, lang, domAttr, RFormsPresenter, ContentViewSwitcher, Widget, template) {

    return declare(Widget, {
        templateString: template,
        entry: null,

        /**
         * Constructor.
         * Does the initial localization and sets the default text for the text area.
         * It also creates the dialog box that actually shows the content.
         * @param {Object} args - The entry which comments are to be loaded and
         * the application (which is, at least,
         * needed for retrieving the home context for the user)
         */
        constructor: function(args) {
            this.name = args.name;
            this.date = args.date;
            this.time = args.time;
            this.application = __confolio.application;
            //this.content = args.content;
        },
        postCreate: function() {
            this.inherited("postCreate", arguments);
            this.presenterDijit.show(this.entry, false);
            var cre = this.entry.getCreationDate();
            if (cre != null) {
                domAttr.set(this.timeNode, "innerHTML", cre);
            }
            var creator = this.entry.getCreator();
            if (creator != null) {
                this.application.getStore().loadEntry(creator, {}, lang.hitch(this, function(ent) {
                    domAttr.set(this.creatorNode, "innerHTML", folio.data.getLabel(ent));
                }),lang.hitch(this, function(mesg) {
                    domAttr.set(this.creatorNode, "innerHTML", "Unknown");
                }));
            } else {
                domAttr.set(this.creatorNode, "innerHTML", "Unknown");
            }
            this.contentViewDijit.show(this.entry);
        }
    });
});