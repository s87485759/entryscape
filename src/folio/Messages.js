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

dojo.provide("folio.Messages");

/**
 * Holds a list of messages for the application.
 * 
 * Each message looks like:
 * {
 * 	 message: "Failed saving ...",
 *   debugText: "Exception in method X and Y, variable Z is undefined.",
 *   type: "message"|"warning"|"error"|"fatal",
 *   debug: true | false,
 *   interaction: "notify"|"dialog"|"none",
 *   persistant: true,
 *   context: "folio.create.ACL"
 * }
 */
dojo.declare("folio.Messages", null, {
	//=================================================== 
	// Private Attributes 
	//===================================================
	_messages: null,

	//=================================================== 
	// Public API 
	//===================================================
	/**
	 * @param filter {Function} if provided it should should return true for each message that it accepts.
	 * @return the last message or null if no messages exists that matches the 
	 * 	filter or no messages exists at all in case no filter is provided.
	 */
	getLastMessage: function(filter) {
		var lastMessage;
		for (var i=this._messages.length-1;i>=0;i--) {
			var mesg = this._messages[i];
			if (filter == null || filter(mesg)) {
				return mesg;
			}
		}
	},
	getMessage: function(filter) {
		if (filter) {
			return dojo.filter(this._messages, filter);			
		} else {
			return this._messages;
		}
	},
	
	/**
	 * The default info message looks like:
	 * {text: "info text", type: "message", debug: false, interaction: "notify", persistant: false}
	 * 
	 * @param {String|Object} message if a string an object message is created with it as text, 
	 *   if object, all attributes provided will override the default info message 
	 */
	message: function(message) {
		if (dojo.isString(message)) {
			message = {message: message};
		}
		this._push(dojo.mixin({type: "info", debug: false, interaction: "notify", persistant: false}, message));
	},

	/**
	 * The default warn message looks like:
	 * {text: "warn text", type: "warning", debug: false, interaction: "dialog", persistant: false}
	 * 
	 * @param {String|Object} message if a string an object message is created with it as text, 
	 *   if object, all attributes provided will override the default warn message 
	 */
	warn: function(message) {
		if (dojo.isString(message)) {
			message = {message: message};
		}
		this._push(dojo.mixin({type: "warning", debug: false, interaction: "dialog", persistant: false}, message));
	},

	/**
	 * The default error message looks like:
	 * {text: "error text", type: "error", debug: false, interaction: "dialog", persistant: true}
	 * 
	 * @param {String|Object} message if a string an object message is created with it as text, 
	 *   if object, all attributes provided will override the default error message 
	 */
	error: function(message) {
		if (dojo.isString(message)) {
			message = {message: message};
		}
		this._push(dojo.mixin({type: "error", debug: false, interaction: "dialog", persistant: true}, message));
	},	

	//=================================================== 
	// Hook methods
	//===================================================
	/**
	 * Called for all messages.
	 */
	onMessage: function(message) {
//		alert(message.text);
	},

	/**
	 * Called only for notify messages.
	 */
	onNotifyMessage: function(message) {
		dojo.publish("notifyMessages", [message]);
	},
	
	/**
	 * Called only for dialog messages.
	 */
	onDialogMessage: function(message) {
		dojo.publish("dialogMessages", [message]);
	},
	
	//=================================================== 
	// Inherited methods 
	//=================================================== 
	constructor: function(params) {
		this._messages = [];
	},

	//=================================================== 
	// Private methods 
	//===================================================
	_push: function(message) {
		this._messages.push(message);
		this.onMessage(message);
		if (message.interaction === "notify") {
			this.onNotifyMessage(message);
		} else if (message.interaction === "dialog") {
			this.onDialogMessage(message);
		}
	}
});