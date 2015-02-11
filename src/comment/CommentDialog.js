/*global define, __confolio*/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/window",
    "dojo/_base/window",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dojo/request/xhr",
    "dijit/Dialog", //in template
    "dijit/focus",
    "folio/util/Widget",
    "folio/comment/Comment",
    "dojox/form/BusyButton", //in template
    "dijit/layout/BorderContainer", //in template
    "dijit/layout/ContentPane", //in template
    "dijit/Editor", //in template
    "rdfjson/Graph",
    "rdforms/model/Engine",
    "rdforms/view/Editor",
    "dojo/text!./CommentDialogTemplate.html"
], function (declare, lang, array, winUtil, win, domStyle, domConstruct, domAttr, xhr,
             Dialog, focusUtil, Widget, Comment, BusyButton, BorderContainer, ContentPane, Editor,
             Graph, Engine, RDFormsEditor, template) {

    /**
     * Shows a dialog within which all comments for an entry are displayed.
     * Also provides the user with a textbox where an additional comment can be
     * written and sent to the server.
     *
     * Problems to fix (in no particular order):
     *
     * 1. There is no paging of comments, all comments are shown directly
     * (could be a problem or not...)
     *
     * 2. No errors are handled as they should.
     *
     * 3. The dates are only formatted to look nicer.
     * Timezones etc are not taken into account.
     * - Possibly solved (though not tested).
     */
    return declare(Widget, {
        nlsBundles: ["common", "comment"],
        templateString: template,
        postDijit: null,
        cancelDijit: null,

        /**
         * Runs after the CommentDialog is constructed.
         * Adds the buttons making it possible to send (and cancel) comments.
         */
        postCreate: function() {
            this.inherited("postCreate", arguments);
            var home = this.application.getUser().homecontext;
            this.homeContext = this.application.getStore().getContextById(home);
            this.helpObj = folio.data.createNewEntryHelperObj(this.homeContext);
            this.resourceURI= this.helpObj.resURI;
            this.init();
            this.showComments();
        },

        localeChange: function() {
            this.defaultTextAreaText = this.NLSBundles.comment.defaultTextAreaText;
            this.popupDijit.set("title", this.NLSBundles.comment.commentDialogTitle + " "+ folio.data.getLabel(this.entry));
            this.postDijit.set("busyLabel", this.NLSBundles.comment.busyButtonLabel);
        },

        init: function() {
            this.application.getItemStore(lang.hitch(this, function(itemStore) {
                this.graph = new Graph({});
                var config = this.application.getConfig();
                var commentStyle = config.getComments()[0];
                this.graph.create(this.resourceURI, commentStyle["property"], {value: this.entry.getUri(), "type": "uri"});
                this.graph.create(this.resourceURI, folio.data.RDFSchema.TYPE, {value: commentStyle["class"], "type": "uri"});

                var template = itemStore.detectTemplate(this.graph, this.resourceURI, config.getTemplateForApplicationType(commentStyle["class"]));
                var langs = config.getMPLanguages();
                var binding = Engine.match(this.graph, this.resourceURI, template);
                var node = domConstruct.create("div");
                this.mdEditorContainer.set("content", node);
                this.mdEditor = new RDFormsEditor({template: template, languages: langs, binding: binding, includeLevel: "optional", compact: true}, node);
                this.contentEditorDijit.set("value", "");
            }));
        },

        onPost: function() {
            this.cancelDijit.set("disabled", true);

            folio.data.addMimeType(this.helpObj.info, this.helpObj.resURI, "text/html+snippet");
            var args = {
                    context: this.homeContext,
                    metadata: this.graph.exportRDFJSON(),
                    info: this.helpObj.info.exportRDFJSON(),
                    params: {entrytype: "local",
                            informationresource: true,
                            graphtype: "none"}};
            var onError = lang.hitch(this, function() {
                //TODO Message.
                this.postDijit.cancel();
                this.cancelDijit.set("disabled", false);
            });

            this.homeContext.createEntry(args, dojo.hitch(this, function(entry) {
                var str = this.contentEditorDijit.get("value");
                var onSuccess = lang.hitch(this, function() {
                    this.init();
                    this.entry.setRefreshNeeded();
                    this.entry.refresh(lang.hitch(this, function(entry) {
                        this.postDijit.cancel();
                        this.cancelDijit.set("disabled", false);
                        this.showComments();
                        this.application.publish("changed", {entry: entry, source: this});
                    }), onError);
                });
                if (str != null && str != "") {
                    var putArgs = {
                        data: str,
                        headers: {"Content-Type": "text/html"},
                        handleAs: "text"
                    };
                    xhr.put(entry.getResourceUri(), __confolio.application.getCommunicator().insertAuthArgs(putArgs))
                        .then(onSuccess, onError);
                } else {
                    onSuccess();
                }
            }), onError);
        },
	
        /**
         * Shows the dialog
         */
        show: function() {
            var viewport = winUtil.getBox();
            domStyle.set(this.bc.domNode, {
                width: Math.floor(viewport.w * 0.70)+"px",
                height: Math.floor(viewport.h * 0.70)+"px",
                overflow: "auto",
                position: "relative"    // workaround IE bug moving scrollbar or dragging dialog
            });
            focusUtil.focus(this.bc.domNode);
            this.popupDijit.show();
        },

        /**
         * Destroys the dialog box and its content
         * (i.e. removes it so that it is no longer visible).
         */
        hide: function(){
            this.popupDijit.destroy();
            this.destroy();
        },
        /**
         * Adds a comment to the entry.
         *
         * Only as "commentsOn" and the language is set to english.
         * The dialog should possibly be updated and show the new comment,
         * but this is not done yet.
         */
        send: function(){
            var home = this.application.getUser().homecontext;
            var contextUri = this.application.repository+home;
            var finalUri = contextUri+"?entrytype=local&graphtype=string&list="+contextUri+"/resource/_comments";

            var data = {
                "metadata": {"sc:commentsOn": {"@id": this.entry.getUri()}},
                "resource": {"sc:body": {"@value": this.textArea.value, "@language": "English"}}
            };

            // Send the actual data
            xhr.post(finalUri, {
                preventCache: true,
                handleAs: "json",
                headers: this.entry.getContext().communicator.headers,
                postData: dojo.toJson(data),
                timeout: 1000}).then(
                    lang.hitch(this, function(response, ioArgs) {
                        /*
                         * Add the comment to the top of the list
                         * (does not retrieve the comment from the server but instead
                         * "fakes" it and just shows all known information about the
                         * created comment as well as the current date and time).
                         */
                        var date = new Date();

                        // Create a comment to add to the page
                        var comment = new Comment({
                            name: this.application.getUser().user,
                            date: date.toDateString(),//date.format("isoDate"),
                            time: date.toTimeString()//date.format("isoTime")
                        });


                        var contentNode = win.doc.createTextNode(this.textArea.value);
                        domConstruct.place(contentNode, comment.contentArea);

                        // Place the comment in the container
                        domConstruct.place(comment.domNode, jsComments.domNode, "first");

                        //this.textArea.attr("value", "");
                        this.postDijit.cancel();
                        this.cancelDijit.set("disabled", false);
                    }),
                    lang.hitch(this, function(response, ioArgs) {
                        // Something went wrong! Deal with it
                        //  console.error(response);
                        //	console.error("Error sending comment");
                        var errorText = win.doc.createTextNode(this.NLSBundles.comment.sendErrorLabel);
                        domConstruct.place(errorText, this.jsErrorArea.domNode, "first");
                        this.cancelDijit.set("disabled", false);
                    }));
        },

        /**
         * Shows the list of comments for the entry, needs to load them first though.
         */
        showComments: function() {
            var entryUri = this.entry.getUri();
            var context = this.entry.getContext();
            var comments = this.entry.getComments();
            var localDate = new Date();

            var commentDijits = [], container = this.commentsNode;
            domAttr.set(container, "innerHTML", "");
            comments.sort(); //The entry id is incremented, later posts has higher numbers... hence this works.
            array.forEach(comments, function(comment) {
                this.application.getStore().loadEntry(comment, {}, function(entry) {
                    commentDijits.push(new Comment({entry:entry}, domConstruct.create("div", null, container)));
                });
            }, this);
        }
    });
});