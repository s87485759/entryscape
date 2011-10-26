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
	popup: null,	
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("folio.comment", "CommentDialogTemplate.html"),
	sendButton: null,
	cancelButton: null,

	/**
 	* Constructor. 
 	* Does the initial localization and sets the default text for the text area.
 	* It also creates the dialog box that actually shows the content.
 	* @param {Object} args - The entry which comments are to be loaded and 
 	* the application (which is, at least, 
 	* needed for retrieving the home context for the user)
 	*/
	constructor: function(args) {
		dojo.mixin(this, args);
		dojo.requireLocalization("folio", "comment");
		this.rBundle = dojo.i18n.getLocalization("folio", "comment");
		this.defaultTextAreaText = this.rBundle.defaultTextAreaText;
		this.popup = new dijit.Dialog();
		this.popup.attr("title", this.rBundle.commentDialogTitle + " "+ folio.data.getLabel(args.entry));
		this.popup.attr("height", "auto");
		this.popup.attr("parseOnLoad", false);
	},
		
	/**
 	* Runs after the CommentDialog is constructed.
 	* Adds the buttons making it possible to send (and cancel) comments. 
 	*/
	postCreate: function() {			
		this.popup.attr("content", this.domNode);
		//Add Buttons
		this.cancelButton = new dijit.form.Button({
			label: this.rBundle.cancelButtonLabel, 
			onClick: dojo.hitch(this, function() {
				this.hide();
		})});

		this.sendButton = new dojox.form.BusyButton({
			label: this.rBundle.finishButtonLabel, 
			busyLabel: this.rBundle.busyButtonLabel, 
			onClick: dojo.hitch(this, function() {
				if (this.cancelButton) {
					this.cancelButton.attr("disabled", true);		
				}
				this.send();
		})});

		// Circumvent dijit textarea incompatbility with Opera (cannot read its value)
		this.textArea = document.createElement("textarea");
		this.textArea.className = "dijitTextarea";
		this.textArea.innerHTML = this.defaultTextAreaText;
		this.textPane.domNode.appendChild(this.textArea);

		dojo.place(this.cancelButton.domNode, this.buttonArea);
		dojo.place(this.sendButton.domNode, this.buttonArea);
		
		this.loadComments();
		
		
        this.inherited(arguments);

	},
	

	/**
	 * Shows the dialog
	 */
	show: function() {		
		this.popup.show();
	},
	
	/**
	 * Destroys the dialog box and its content 
	 * (i.e. removes it so that it is no longer visible). 
	 */
	hide: function(){
		this.popup.destroy();
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
				this.sendButton.cancel();
				this.cancelButton.attr("disabled", false);
				
      		}),
        	error: dojo.hitch(this, function(response, ioArgs) {
				// Something went wrong! Deal with it
              //  console.error(response);
			//	console.error("Error sending comment");
				var errorText = dojo.doc.createTextNode(this.rBundle.sendErrorLabel);
				dojo.place(errorText, jsErrorArea.domNode, "first");
				this.cancelButton.attr("disabled", false);
				
			})
		});
	},
	
	/**
	 * Loads the comments for the current entry.
	 * Only loads the JSON for "relation" for the entry 
	 * (i.e. gets the URI:s to the resources of the comments). 
	 * showComments loads the actual comments. 
	 */
	loadComments: function() {
		var context = this.entry.getContext();
		var relationUri = context.getUri() + "/relation/" + this.entry.getId();	
		context.communicator.loadJSON(relationUri, 
			dojo.hitch(this, function(results) {
				this.showComments(results);
				}),
			dojo.hitch(this, function() {
				/*
				 * An error in showComments could actually result in this error 
				 */
				console.error("ERROR loading comment URI:s");
				})
			);
	},
	
	/**
	 * Called when the initial loading of the relations resource for an entry
	 * is loaded (which contains the comments). 
	 * Proceeds to add additional information about the comment 
	 * (who created it and when) to the dialog 
	 * 
	 * @param {Object} JSONObject - The JSON object retrieved from the relations
	 *  for the entry 
	 * (ie ../scam/1/entry/2 gets the relations from ../scam/1/relations/2)
	 */
	showComments: function(JSONObject) {	
		var entryUri = this.entry.getUri();
		var context = this.entry.getContext();
		var comments = JSONObject[entryUri];
		var localDate = new Date();		
		
		var key;
		var isComment;
		/*
		 * For each comment resource URI: retrieve information about the comment
		 */
		for (key in comments) {
			isComment = false;
			/*
			 * make sure that only comments are printed
			 * (not group members or whatnot that can possibly be present in 
			 * the relation grahp)
			 */
			for (var relationIndex in comments[key]) {
				if (comments[key][relationIndex] == "sc:commentsOn") {
					isComment = true;
					break;
				}
			}
			if (isComment) {
				var commentEntryUri = key.replace("/resource/", "/entry/");
				commentEntryUri = commentEntryUri + "?includeAll=true";
				
				
				/*
				 * Load the entry for the comment
				 */
				context.communicator.loadJSON(commentEntryUri, dojo.hitch(this, function(results){
				
					// make sure that there is some content in the response
					if (results.resource["sc:body"]) {
						var date = results.info["dcterms:created"]["@value"];
						var commentString = results.resource["sc:body"]["@value"];
						
						/*
						* Load the user who created the comment
						* (to retrieve the name of that user)
					 	*/
						context.communicator.loadJSON(
							results.info["dcterms:creator"]["@id"], 
							dojo.hitch(this, function(additionalResults){
						
								/*
					 			* All information for the comment is retrieved.
								* Proceeding to add it to the dialog
								*/
								var commentDate = this.translateTimeZone(date, localDate);
							
								this.placeComment(commentDate, commentString, additionalResults);
							
								// Move the dialog so that is still centered
								var viewport = dijit.getViewport();
								var mb = dojo.marginBox(this.popup.domNode);
							
								var style = this.popup.domNode.style;
								style.left = Math.floor((viewport.l + (viewport.w - mb.w) / 2)) + "px";
								style.top = Math.floor((viewport.t + (viewport.h - mb.h) / 2)) + "px";
							
							}), 
							dojo.hitch(this, function(additionalResults){
								console.error("Error loading creator");
								// This should be handled
							}));
					}
				}), dojo.hitch(this, function(){
					console.error("Error loading comment");
				//This should also be taken care of better than this.
				}));
			}
		}
					
	},
	

	//-----------------------------
	// Utility methods
	//-----------------------------

	/**
	 * Handle a date. 
	 * Makes sure that the date retrieved from the server is translated 
	 * according to the timezone of the user
	 * (it might possibly work...)
	 * 
	 * @param {Date} date - The date for the comment 
	 * (as retrieved from the server)
	 * @param {Date} localDate - The date according to the client 
	 * (simply a new Date() )
	 */
	translateTimeZone: function(date, localDate) {
		//console.log("kaka");
		var year = date.slice(0,4);
		//console.log("Year: " + year);
		var month = date.slice(5, 7);
		//console.log("Month: " + month);
		var day = date.slice(8,10);
		//console.log("Day: "+ day);
		var hours = date.slice(11, 13);
		//console.log("Hours:" + hours);
		var minutes = date.slice(14, 16);
		//console.log("Minutes: " + minutes);
		var seconds = date.slice(17, 19);
		//console.log("Seconds: " + seconds);
		var timeZoneOffsetString = date.slice(23, 29);
		//console.log("TimeZoneOffsetString: " + timeZoneOffsetString);
							
		var timeZoneOffsetNumber;
		//console.log("Extra: " + timeZoneOffsetString.slice(4, 6));
							
		if(timeZoneOffsetString.charAt(0) == "-") {
			timeZoneOffsetNumber = 
				"-" + timeZoneOffsetString.slice(1, 3) + 
				"." + timeZoneOffsetString.slice(4, 6);
		} else {
			timeZoneOffsetNumber = 
				timeZoneOffsetString.slice(1, 3) + 
				"." + timeZoneOffsetString.slice(4, 6);
		}
													
		var commentDate = new Date();
		commentDate.setFullYear(year);
		commentDate.setMonth(month - 1);
		commentDate.setDate(day);
		commentDate.setHours(hours);
		commentDate.setMinutes(minutes);
		commentDate.setSeconds(seconds);
											
		// adjust for time zone
		var ms = commentDate.getTime() + 
			(localDate.getTimezoneOffset() * 60000) + 
			timeZoneOffsetNumber * 3600000;
														
		commentDate.setTime(ms);
		return commentDate;
	},
	
	/**
	 * Places the comment in an appropriate place (i.e. the last comment first)
	 * (and all information about it such as creator and date of creation)
	 * 
	 * @param {Date} commentDate - The date when the comment was created
	 * @param {String} commentString - The comment itself
	 * @param {Object} additionalResults - Additional results, 
	 * mainly holding the name of the creator (under additionalResults["name"])
	 */
	placeComment: function(commentDate, commentString, additionalResults) {

		// Create a comment to add to the page		
		var comment = new folio.comment.Comment({
			name: additionalResults.name,
			date: commentDate.toDateString(),//("isoDate"),
			time: commentDate.toTimeString()//("isoTime")
		});
		var contentNode = dojo.doc.createTextNode(commentString);
		dojo.place(contentNode, comment.contentArea);
			
		/*
		 * For each comment already present: 
		 * check the date and if the newly loaded comment is newer than the one 
		 * being checked, place the new comment before the other comment 
		 */
		var previousComments = jsComments.getDescendants(true);
		for(var i in previousComments){
  			 var c  = previousComments[i];
			 if (c) {
			 	if (c.time) {
					var d = new Date();
					var year = c.date.slice(0,4);
					var month = c.date.slice(5,7);
					var day = c.date.slice(8,10);
					
					var hour = c.time.slice(0,2);
					var minute = c.time.slice(3,5);
					var second = c.time.slice(6,8);
					
					d.setFullYear(year);
					d.setMonth(month - 1);
					d.setDate(day);
					
					d.setHours(hour);
					d.setMinutes(minute);
					d.setSeconds(second);
					
					
					var diff = dojo.date.compare(commentDate, d, "datetime");
					// if the loaded comment is more recent
					if(diff >= 0) {
						// place the comment before the last checked comment 
						// (which is older than the newly loaded comment)
						dojo.place(comment.domNode, c.domNode, "before");
						return;
					}
					
				}
			 }
		}
		// Place the comment in the container 
		// (this only happens if there are no previous comments present already)
		dojo.place(comment.domNode, jsComments.domNode);
	}

});