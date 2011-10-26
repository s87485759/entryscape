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

dojo.provide("folio.data.Communicator");
dojo.require("dojox.encoding.base64");
dojo.require("dojo.io.iframe"); 

dojo.declare("folio.data.Communicator", null, {
	defaultLimit: 20,
	sortObj: {sortBy: "title", prio: "List"},
	constructor: function(args) {
		dojo.mixin(this, args);
		this.headers = {"Accept": "application/json",
						"Content-type": "application/json; charset=UTF-8"
						};//, "Authorization": this.make_base_auth("Donald", "donalddonald")};
	},
	setSort: function(sortObj) {
		this.sortObj = sortObj;
	},
	getSort: function() {
		return this.sortObj;
	},
	make_base_auth: function(user, password) {
		  var tok = user + ':' + password;
		  var tokArr = [];
		  for (var i=0; i<tok.length; i++) {
			  tokArr.push(tok.charCodeAt(i));
		  }
		  var hash = dojox.encoding.base64.encode(tokArr);
		  return "Basic " + hash;
	},
	// Authentication placeholder to be overridden to set login details
	insertAuthArgs: function(xhrArgs) {
		return xhrArgs;
	},
	// Authentication placeholder to be overridden to set login details
	insertAuthParams: function(url) {
		return url;
	},
	loadJSON: function(uri, onLoad, onError) {
		var xhrArgs = {
			url: uri,
			/*
			 * preventCache added to make sure that changes are detected in IE
			 * (example: if a user changes the title of an entry, the entry will 
			 * still seem to have the same title until the user manually empties 
			 * the cache and reloads the page)
			 */
			preventCache: true,
			handleAs: "json-comment-optional",
			headers: this.headers
		}; 
		var req = dojo.xhrGet(this.insertAuthArgs(xhrArgs));
		req.addCallback(onLoad);
		req.addErrback(onError);
	},
	saveJSON: function(uri, data, onSuccess, onError) {
		this.saveJSONIfUnmodified(uri, data, undefined, onSuccess, onError);
	},
	saveJSONIfUnmodified: function(uri, data, modifiedDate, onSuccess, onError) {
		var headers = dojo.clone(this.headers);
		if (modifiedDate) {
			headers["If-Unmodified-Since"] = modifiedDate;			
		}
		var xhrArg = {
			url: uri,
			/*
			 * preventCache added to make sure that changes are detected in IE
			 * (example: if a user changes the title of an entry, the entry will 
			 * still seem to have the same title until the user manually empties 
			 * the cache and reloads the page)
			 */
			preventCache: true,
//			handleAs: "json-comment-optional",
   			headers: headers,
			load: onSuccess,
			error: onError};
   		xhrArg.putData = dojo.toJson(data);

		dojo.rawXhrPut(this.insertAuthArgs(xhrArg));
	},
	saveJSONFormModel: function(mdURI, FormModel, AnnPURI, onSuccess, onError){
		var xhrArg = {
			url: mdURI+'?ap='+escape(AnnPURI),
			/*
			 * preventCache added to make sure that changes are detected in IE
			 * (example: if a user changes the title of an entry, the entry will 
			 * still seem to have the same title until the user manually empties 
			 * the cache and reloads the page)
			 */
			preventCache: true,
			headers: {"Content-Type": "application/json"},
			load: onSuccess,
			error: onError
			};
		xhrArg.putData = dojo.toJson(FormModel.getJSON());
		
		
		dojo.rawXhrPut(this.insertAuthArgs(xhrArg));
	},
	putFile: function(resourceURI, inputNode, onSuccess, onError) {
		  if(!inputNode.value){ return; }
          
          var _newForm; 
          if(dojo.isIE){
                  // just to reiterate, IE is a steaming pile of code. 
                  _newForm = document.createElement('<form enctype="multipart/form-data" method="post">');
                  _newForm.encoding = "multipart/form-data";
          }else{
                  // this is how all other sane browsers do it
                  _newForm = document.createElement('form');
                  _newForm.setAttribute("enctype","multipart/form-data");
          }
          
          _newForm.appendChild(inputNode);
          dojo.body().appendChild(_newForm);

          dojo.io.iframe.send({
                  url: this.insertAuthParams(resourceURI+(resourceURI.indexOf("?") < 0 ? "?" : "&")+"method=put&textarea=true"),
				/*
				 * preventCache added to make sure that changes are detected in IE
				 * (example: if a user changes the title of an entry, the entry will 
				 * still seem to have the same title until the user manually empties 
				 * the cache and reloads the page)
				 */
				  preventCache: true,
                  form: _newForm,
                  handleAs: "json",
                  handle: function (data, ioArgs) {
        	  		if (data.error) {
        	  			onError(data.error);
        	  		} else {
        	  			onSuccess(data);
        	  		}
          		}
          });
	},
	loadViaSCAMProxy: function(params) {
		var url = __confolio.application.getRepository()+"proxy?url="+encodeURIComponent(params.url);
		if (params.from != null) {
			url += "&fromFormat="+params.from;
		}
		var req = dojo.xhrGet({
			url: this.insertAuthParams(url),
			preventCache: true,
			handleAs: params.handleAs || "json-comment-optional",
			headers: this.headers,
			load: params.onSuccess,
			error: params.onError || function(mesg) {
				console.error(mesg);
			}
		});
	},
	
	/** params contains:
	 * 	 entry - the entry to fill in
	 *   infoUri - the uri to use when loading the entry.
	 *   onEntry - the callback function for success, will be called with the filled in entry.
	 *   onError - the callback function on failure, will be called with an error.
	 *   
	 *   If the entry is a list the following additional attributes are considered:
	 *   limit - only a limited number of children are loaded, -1 means no limit, 0 or undefined means default limit.
	 *   offset - only children from offest and forward is returned, has to be positive to take effect.
	 *   sort - information on how to sort the children , 
	 *          if sort is not provided this entry will not be sorted now and not later either,
	 *          if sort is given as null the defaults of communicator will be used.
	 *          if sort is given as an emtpy object sorting is active for this entry but the natural order is used for now.
	 *          If sort is given as a non emtpy object the following attributes are taken into account:
	 *   	sortBy - the attribute instructs which metadata field to sort the children by, that is title, created, modified, or size.
	 *   	lang - if sort is title and the title is provided in several languages a prioritized language can be given.
	 *   	prio - allows specific builtintypes to be prioritized (e.g. show up in the top of the list).
	 *   	descending - if true the children are shown in descending order.
	 */
	loadJSONEntry: function(params) {
		this.nextPageJSONEntry(params);
	},
	
	nextPageJSONEntry: function(params) { //entry, infoUri, limit, offset, onEntry, onError) {
		var strL = "";
		if (params.limit === 0) {
			strL = "&limit="+this.defaultLimit;
		} else if (params.limit > 0) {
			strL = "&limit="+params.limit;
		}
		var strO = params.offset == undefined || params.offset === 0 ? "" : "&offset="+params.offset;
		var sort = params.sort === null ? this.sortObj : params.sort;
		var strSort = "";
		var strDesc = "";
		var strPrio = "";
		if (sort !== undefined) {
			strSort = sort.sortBy == undefined ? "" : "&sort="+sort.sortBy;
			strDesc = sort.descending === true  ? "&order=desc" : "";
			strPrio = sort.prio == undefined ? "" : "&prio="+sort.prio;	
			//TODO lang remains.		
		}
		
		var xhrArgs = {
			url: this.insertAuthParams(params.infoUri+strL+strO+strSort+strDesc+strPrio),
			/*
			 * preventCache added to make sure that changes are detected in IE
			 * (example: if a user changes the title of an entry, the entry will 
			 * still seem to have the same title until the user manually empties 
			 * the cache and reloads the page)
			 */
			preventCache: true,
			handleAs: "json-comment-optional",
			headers: this.headers
		};		
		var req = dojo.xhrGet(xhrArgs);
		if (!params.onError) {
			params.onError = function(mesg) {
				console.error(mesg);
				};
		}
		req.addCallback(function(data) { //	Fill in entry when returning from callback
			if (data.error) {
				params.entry.setRefreshNeeded();
				params.onError("When trying to load entry: "+params.entry.getId()+" in context "+params.entry.getContext().getId()+" I get the following error:\n"+data.error);
				return;
			}
			try {
				params.entry.noSort = sort === undefined;
				folio.data.fillInEntry(params.entry, data, false);
			} catch (error) {
				params.entry.setRefreshNeeded();
				params.onError("When trying to load entry: "+params.entry.getId()+" in context "+params.entry.getContext().getId()+" I get the following error:\n"+error);
				return;
			}
			params.onEntry(params.entry);
		});
		req.addErrback(function(error) {
			console.log(error);
			params.onError(error);});
	},
	moveEntry: function(entry, fromList, toList, onSuccess, onError) {
		var uri = toList.getResourceUri()+"?moveEntry="+entry.getContext().getId()+"/entry/"+entry.getId()+"&fromList="+fromList.getContext().getId()+"/resource/"+fromList.getId();
		var xhrArg = {
			url: uri,
			/*
			 * preventCache added to make sure that changes are detected in IE
			 * (example: if a user changes the title of an entry, the entry will 
			 * still seem to have the same title until the user manually empties 
			 * the cache and reloads the page)
			 */
			preventCache: true,
			handleAs: "json-comment-optional",
			headers: this.headers,
			load: function(data) {
				entry.setRefreshNeeded();
				fromList.setRefreshNeeded();
				toList.setRefreshNeeded();
				onSuccess();
			},
			error: onError};
		//xhrArg.postData = {};//Remove this as IE 8 (probably also 7) did not like this variable to be an empty object
		dojo.rawXhrPost(this.insertAuthArgs(xhrArg));		
	},
	createEntry: function(args, onSuccess, onError) {
		// Enter xhr-arguments, uri is requiered. 
		var uri = args.context.getUri()+"?";
		for (var arg in args.params) {
			uri = uri+arg+"="+args.params[arg]+"&";
		}
		if (args.parentList) {
			uri = uri+"listURI="+args.parentList.getResourceUri()+"&";			
		}
		uri = uri.slice(0,-1);
		var xhrArg = {
			url: uri,
			/*
			 * preventCache added to make sure that changes are detected in IE
			 * (example: if a user changes the title of an entry, the entry will 
			 * still seem to have the same title until the user manually empties 
			 * the cache and reloads the page)
			 */
			preventCache: true,
			handleAs: "json-comment-optional",
			headers: this.headers, //{"Content-Type": "application/json", "Authorization": this.auth},
			load: function(data) { 
				onSuccess(data.entryId+"");
			},
			error: onError};
		if (args.metadata || args.info || args.resource || args.cachedExternalMetadata) {
			var postData = {};
			if (args.metadata) {
				postData.metadata = args.metadata;
			}
			if (args.resource) {
				postData.resource = args.resource;
			}
			if (args.info) {
				postData.info = args.info;
			}
			if (args.cachedExternalMetadata) {
				postData["cached-external-metadata"] = args.cachedExternalMetadata
			}
   			xhrArg.postData = dojo.toJson(postData);
		}

		dojo.rawXhrPost(this.insertAuthArgs(xhrArg));
	},
	// Delete entry
	/**
	 * params may containt the following attributes:
	 *   entry - the entry to remove
	 *   recursive - if true and the entry is a list the entire folder tree is removed.
	 *   onSuccess - a callback that will be called on success.
	 *   onError - a callback that will be called on error.
	 * @param {Object} params
	 */
	removeEntry: function(params){
		var uri = params.entry.getUri();
		if (params.recursive === true) {
			uri += "?recursive=true";
		}
		
		var xhrArgs = {
			url: uri,
			/*
			 * preventCache added to make sure that changes are detected in IE
			 * (example: if a user changes the title of an entry, the entry will 
			 * still seem to have the same title until the user manually empties 
			 * the cache and reloads the page)
			 */
			preventCache: true,
			handleAs: "json-comment-optional",
			headers: this.headers //{"Content-Type": "application/json", "Authorization": this.auth}
		};
		// This is the removing action. 
		var req = dojo.xhrDelete(this.insertAuthArgs(xhrArgs));
		req.addCallback(params.onSuccess);
		req.addErrback(params.onError);
	}
});
