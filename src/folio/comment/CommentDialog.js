/*
 * Copyright (c) 2007-2010
 *
 * This file is part of Confolio.
 *
 * Confolio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Confolio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Confolio. If not, see <http://www.gnu.org/licenses/>.
 */

dojo.provide("folio.comment.CommentDialog");
dojo.require("dijit.Dialog");
dojo.require("dijit.form.Textarea");
dojo.require("dojo._base.xhr");
dojo.require("dojo._base.json");
dojo.require("folio.data.Constants");
dojo.require("dijit._base.manager");
dojo.require("dojo._base.html");
dojo.require("dojox.layout.ScrollPane");
dojo.require("dijit._base.place");
dojo.require("folio.comment.Comment");
dojo.require("dojo.date");
dojo.require("dojox.form.BusyButton");
dojo.require("dijit.layout.TabContainer");
dojo.require("folio.editor.RFormsEditorPlain");

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
dojo.declare("folio.comment.CommentDialog", [dijit._Widget, dijit._Templated], {
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("folio.comment", "CommentDialogTemplate.html"),
	postDijit: null,
	cancelDijit: null,

	/**
 	* Constructor. 
 	* Does the initial localization and sets the default text for the text area.
 	* It also creates the dialog box that actually shows the content.
 	* @param {Object} args - The entry which comments are to be loaded and 
 	* the application (which is, at least, 
 	* needed for retrieving the home context for the user)
 	*/
	constructor: function(args) {
		this.application = __confolio.application;
		dojo.requireLocalization("folio", "comment");
		this.rBundle = dojo.i18n.getLocalization("folio", "comment");
		this.defaultTextAreaText = this.rBundle.defaultTextAreaText;
	},
		
	/**
 	* Runs after the CommentDialog is constructed.
 	* Adds the buttons making it possible to send (and cancel) comments. 
 	*/
	postCreate: function() {			
        this.inherited("postCreate", arguments);
    	this.popupDijit.set("title", this.rBundle.commentDialogTitle + " "+ folio.data.getLabel(this.entry));
		//Add Buttons
		this.cancelDijit.set("label", this.rBundle.cancelButtonLabel);
		this.postDijit.set("label", this.rBundle.finishButtonLabel);
		this.postDijit._label = this.rBundle.finishButtonLabel; //Bug in Busybutton.
		this.postDijit.set("busyLabel", this.rBundle.busyButtonLabel);

		var home = this.application.getUser().homecontext;
		this.homeContext = this.application.getStore().getContextById(home);
		this.helpObj = folio.data.createNewEntryHelperObj(this.homeContext);
		this.resourceURI= this.helpObj.resURI;
		
		this.init();
		this.showComments();
	},
	init: function() {
		this.application.getItemStore(dojo.hitch(this, function(itemStore) {
			this.graph = new rdfjson.Graph({});
			var config = this.application.getConfig();
			var commentStyle = config.getComments()[0];
			this.graph.create(this.resourceURI, commentStyle["property"], {value: this.entry.getUri(), "type": "uri"});
			this.graph.create(this.resourceURI, folio.data.RDFSchema.TYPE, {value: commentStyle["class"], "type": "uri"});

			var template = itemStore.detectTemplate(this.graph, this.resourceURI, config.getMPForType(commentStyle["class"]).items);
			var langs = config.getMPLanguages();
			var binding = rforms.model.match(this.graph, this.resourceURI, template);
			var node = dojo.create("div");
			this.mdEditorContainer.set("content", node);
			this.mdEditor = new rforms.view.Editor({template: template, languages: langs, binding: binding, includeLevel: "optional", compact: true}, node);
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
				params: {locationType: "local",
						representationType: "informationresource",
						builtinType: "none"}};
		var onError = dojo.hitch(this, function() {
        	//TODO Message.
			this.postDijit.cancel();
			this.cancelDijit.set("disabled", false);
        });

		this.homeContext.createEntry(args, dojo.hitch(this, function(entry) {
			var str = this.contentEditorDijit.get("value");
			var putArgs = {
                    url: entry.getResourceUri(),
                    putData: str,
                    headers: {"Content-Type": "text/html"},
                    handleAs: "text",
                    load: dojo.hitch(this, function() {
                    	this.init();
            			this.entry.setRefreshNeeded();
            			this.entry.refresh(dojo.hitch(this, function(entry) {
            				this.postDijit.cancel();
            				this.cancelDijit.set("disabled", false);
            				this.showComments();
            			}), onError);
                    }),
                    error: onError
            };
            dojo.xhrPut(__confolio.application.getCommunicator().insertAuthArgs(putArgs));
		}), onError);		
	},
	
	/**
	 * Shows the dialog
	 */
	show: function() {
		var viewport = dijit.getViewport();
		dojo.style(this.bc.domNode, {
			width: Math.floor(viewport.w * 0.70)+"px",
                                        height: Math.floor(viewport.h * 0.70)+"px",
                                        overflow: "auto",
                                        position: "relative"    // workaround IE bug moving scrollbar or dragging dialog
				});
		dijit.focus(this.bc.domNode);
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
		var finalUri = contextUri+"?locationType=local&builtinType=string&listURI="+contextUri+"/resource/_comments";

		var data = {
			"metadata": {"sc:commentsOn": {"@id": this.entry.getUri()}},
			"resource": {"sc:body": {"@value": this.textArea.value, "@language": "English"}}
		};

		// Send the actual data
		dojo.rawXhrPost( {
        	url: finalUri,
			preventCache: true,
        	handleAs: "json",
			headers: this.entry.getContext().communicator.headers,
        	postData: dojo.toJson(data),
        	timeout: 1000,
        	load: dojo.hitch(this, function(response, ioArgs) {
				/*
				 * Add the comment to the top of the list 
				 * (does not retrieve the comment from the server but instead
				 * "fakes" it and just shows all known information about the 
				 * created comment as well as the current date and time).
				 */  				
				var date = new Date();
				
				// Create a comment to add to the page		
				var comment = new folio.comment.Comment({
					name: this.application.getUser().user,
					date: date.toDateString(),//date.format("isoDate"),
					time: date.toTimeString()//date.format("isoTime")
				});
				
				
				var contentNode = dojo.doc.createTextNode(this.textArea.value);
				dojo.place(contentNode, comment.contentArea);
				
				// Place the comment in the container 
				dojo.place(comment.domNode, jsComments.domNode, "first");
				
				//this.textArea.attr("value", "");
				this.postDijit.cancel();
				this.cancelDijit.set("disabled", false);
				
      		}),
        	error: dojo.hitch(this, function(response, ioArgs) {
				// Something went wrong! Deal with it
              //  console.error(response);
			//	console.error("Error sending comment");
				var errorText = dojo.doc.createTextNode(this.rBundle.sendErrorLabel);
				dojo.place(errorText, jsErrorArea.domNode, "first");
				this.cancelDijit.set("disabled", false);
				
			})
		});
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
		dojo.attr(container, "innerHTML", "");
		comments.sort(); //The entry id is incremented, later posts has higher numbers... hence this works.
		dojo.forEach(comments, function(comment) {
			this.application.getStore().loadEntry(comment, {}, function(entry) {
				commentDijits.push(new folio.comment.Comment({entry:entry}, dojo.create("div", null, container)));
			});
		}, this);
	}
});