/*global define*/
define([
	"dojo/_base/lang",
	"dojo/request",
	"dojo/request/iframe",
	"dojox/encoding/base64",
	"dojo/json",
	"dojo/has", 
	"dojo/_base/sniff",
	"dojo/_base/window",
	"dojo/Deferred"
], function(lang, request, iframe, base64, json, has, sniff, win, Deferred) {

	var sortObj = {sortBy: "title", prio: "List"};
	var defaultLimit = 20;
	var headers = {
		"Accept": "application/json",
		"Content-Type": "application/json; charset=UTF-8"
	};

	var communicator = {
		setSort: function(sortObject) {
			sortObj = sortObject;
		},
		getSort: function() {
			return sortObj;
		},
		getDefaultLimit: function() {
			return defaultLimit;
		},
		setDefaultLimit: function(limit) {
			defaultLimit = limit;
		},
		// Authentication placeholder to be overridden to set login details
		insertAuthArgs: function(xhrArgs) {
			return xhrArgs;
		},
		// Authentication placeholder to be overridden to set login details
		insertAuthParams: function(url) {
			return url;
		},
		
		GET: function(uri, onLoad, onError) {
			return request.get(uri, communicator.insertAuthArgs({
				preventCache: true,
				handleAs: "json",
				headers: headers
			}));
		},
		
		/**
		 * @return a promise on which you can call .then on.
		 */
		PUT: function(uri, data, modDate) {
			var loc_headers = lang.clone(headers);
			if (modDate) {
				loc_headers["If-Unmodified-Since"] = modDate;			
			}
			return request.put(uri, communicator.insertAuthArgs({
				preventCache: true,
				handleAs: "json",
				data: json.stringify(data),
				headers: loc_headers
			}));
		},
		putFile: function(resourceURI, inputNode, mimetype, onSuccess, onError) {
			  if(!inputNode.value){ return; }
	          
	          var _newForm; 
	          if(has("ie")){
	                  // just to reiterate, IE is a steaming pile of shit. 
	                  _newForm = document.createElement('<form enctype="multipart/form-data" method="post">');
	                  _newForm.encoding = "multipart/form-data";
	          }else{
	                  // this is how all other sane browsers do it
	                  _newForm = document.createElement('form');
	                  _newForm.setAttribute("enctype","multipart/form-data");
	                  _newForm.setAttribute("method","post");
	          }
	          
	          _newForm.appendChild(inputNode);
	          win.body().appendChild(_newForm);
	
	          iframe(communicator.insertAuthParams(resourceURI+(resourceURI.indexOf("?") < 0 ? "?" : "&")+"method=put&textarea=true"+
                  (mimetype!= null ? "&mimetype="+mimetype: "")),
				{
					preventCache: true,
	                handleAs: "json",
	                form: _newForm
				}).then(onSuccess, onError);
		},
		
		/** params contains:
		 *   entry - the entry to fill in
		 *   infoUri - the uri to use when loading the entry.
		 *   
		 *   If the entry is a list the following additional attributes are considered:
		 *   limit - only a limited number of children are loaded, -1 means no limit, 0 or undefined means default limit.
		 *   offset - only children from offest and forward is returned, has to be positive to take effect.
		 *   sort - information on how to sort the children , 
		 *          if sort is not provided this entry will not be sorted now and not later either,
		 *          if sort is given as null the defaults of communicator will be used.
		 *          if sort is given as an emtpy object sorting is active for this entry but the natural order is used for now.
		 *          If sort is given as a non emtpy object the following attributes are taken into account:
		 *      sortBy - the attribute instructs which metadata field to sort the children by, that is title, created, modified, or size.
		 *      lang - if sort is title and the title is provided in several languages a prioritized language can be given.
		 *      prio - allows specific builtintypes to be prioritized (e.g. show up in the top of the list).
		 *      descending - if true the children are shown in descending order.
		 *  @return a Promise that you can call .then on.
		 */
		getEntry: function(params) {
			var strL = "";
			if (params.limit === 0) {
				strL = "&limit="+defaultLimit;
			} else if (params.limit > 0) {
				strL = "&limit="+params.limit;
			}
			var strO = params.offset == undefined || params.offset === 0 ? "" : "&offset="+params.offset;
			var sort = params.sort === null ? sortObj : params.sort;
			var strSort = "";
			var strDesc = "";
			var strPrio = "";
			if (sort !== undefined) {
				strSort = sort.sortBy == undefined ? "" : "&sort="+sort.sortBy;
				strDesc = sort.descending === true  ? "&order=desc" : "";
				strPrio = sort.prio == undefined ? "" : "&prio="+sort.prio;	
				//TODO lang remains.		
			}
			
			var d = new Deferred();
			
			communicator.GET(params.infoUri+strL+strO+strSort+strDesc+strPrio).then(
				function(data) { //	Fill in entry when returning from callback
					try {
						params.entry.noSort = sort === undefined;
						folio.data.fillInEntry(params.entry, data, false);
						d.resolve(params.entry);
					} catch (error) {
						params.entry.setRefreshNeeded();
						d.reject("When trying to load entry: "+params.entry.getId()+" in context "+params.entry.getContext().getId()+" I get the following error:\n"+error);
					}
				},
				function(error) {
					console.log(error);
					d.reject(error);
				}
			);
			return d.promise;
		},
		moveEntry: function(entry, fromList, toList) {
			var uri = toList.getResourceUri()+"?moveEntry="+entry.getContext().getId()+"/entry/"+entry.getId()+"&fromList="+fromList.getContext().getId()+"/resource/"+fromList.getId();
			return request.post(uri, communicator.insertAuthArgs({
				preventCache: true,
				handleAs: "json",
				headers: headers
			})).then(function() {
				entry.setRefreshNeeded();
				fromList.setRefreshNeeded();
				toList.setRefreshNeeded();
			});
		},
		createEntry: function(args) {
			// Enter xhr-arguments, uri is requiered. 
			var uri = args.context.getUri()+"?";
			for (var arg in args.params) {
				uri = uri+arg+"="+args.params[arg]+"&";
			}
			if (args.parentList) {
				uri = uri+"listURI="+args.parentList.getResourceUri()+"&";			
			}
			uri = uri.slice(0,-1);
			
			var xhrArgs = {
				headers: headers
			};
			if (args.metadata || args.info || args.resource || args.cachedExternalMetadata || args.informationResource === false) {
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
					postData["cached-external-metadata"] = args.cachedExternalMetadata;
				}
                if (args.informationResource === false) {
                    postData["informationResource"] =  "false";
                }
				xhrArgs.data = json.stringify(postData);
			}
	
			var d = new Deferred();
			var promise = request.post(uri, this.insertAuthArgs(xhrArgs));
			promise.response.then(function(response) {
				var location = response.getHeader('Location');
				var entryId = location.substr(location.lastIndexOf('/')+1);
				d.resolve(entryId);
			},function(error) {
				d.reject(error);
			});
			return d.promise;
		},
	
		/**
		 * @param {folio.data.Entry} the entry to delete
		 * @param {Boolean} recursive if true and the entry is a list the entire folder tree is removed.
		 * @return a promise.
		 */
		deleteEntry: function(entry, recursive){
			var uri = entry.getUri();
	
			if (recursive === true) {
				uri += "?recursive=true";
			}
			return request.del(uri, communicator.insertAuthArgs({
				preventCache: true,
				handleAs: "json",
				headers: headers
			}));
		},
		
		loadViaSCAMProxy: function(params) {
			var url = __confolio.application.getRepository()+"proxy?url="+encodeURIComponent(params.url);
            var hdrs;
            if (params.accept) {
                hdrs = lang.clone(headers);
                hdrs.Accept = params.accept;
            } else {
                hdrs = headers;
            }
			if (params.from != null) {
				url += "&fromFormat="+params.from;
			}
			var req = request.get(communicator.insertAuthParams(url), {
				preventCache: true,
				handleAs: params.handleAs || "json",
				headers: hdrs}
			).then(params.onSuccess, params.onError || function(mesg) {
				console.error(mesg);
			});
		}
	};
	return communicator;
});