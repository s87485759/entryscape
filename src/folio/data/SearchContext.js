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

dojo.provide("folio.data.SearchContext");
dojo.require("folio.data.Context");

dojo.declare("folio.data.SearchContext", folio.data.Context, {
	isSearch: true,
	constructor: function(args) {
		this.localize();
	},
	postCreate: function() {
		this.inherited("postCreate", arguments);
		
	},
	loadEntry: function(entryInfo, params, onEntry, onError){
		entryInfo = folio.data.normalizeEntryInfo(entryInfo); //Is already normalized in store.loadEntry
		var entry = this.entries[entryInfo.entryId]; // fetch from cache.
		if (entry) {
			onEntry(entry);
		} else {
			this.search({term: entryInfo.entryId, limit: params.limit, onSuccess: onEntry, onError: onError, queryType:params.queryType, locationType: ["local", "link"]});
		}
	},
	/*
	 * parameters={term: "search term(s)", 
	 * 		onSuccess: callback,     // called with an resultList entry as argument.
	 * 		onError: callback,       //dojo standardized errBack function
	 * 		inContext: "contextId"   //if not specified search is performed in all contexts.
	 *      locationType: ["local", "link", ...]         //any set of locationTypes to include in search.
	 *      builtinType: ["list", "user", ...] //which builtintypes to include in search (not supported yet).
	 *  }
	 */
	search: function(parameters) {
		var base = this.getBase();
		var entryInfo = folio.data.normalizeEntryInfo({entryId: parameters.term || "any", contextId: "_search", base: base});
		entryInfo.resourceURI = base+"_search/resource/"+parameters.term;
		
		if(parameters.locationType){
		   var lt = "&entrytype=" + parameters.locationType.join(",");
		} else {
			lt = "";
		}
		
		if(parameters.builtinType){
			var bt = "&resourcetype=" + parameters.builtinType.join(",");
		} else {
			bt = "";
		}
		
		var inContext = parameters.context == null ? "" : "&context="+escape(base+parameters.context);
		if(!parameters.queryType){ 
		   var searchURI = base+"search?type=simple&query="+parameters.term+lt+bt+inContext;//simple
		} else if (parameters.queryType === 'solr'){
			var hasTerm = parameters.term != null;
			searchURI = base+"search?type=solr&query=";
			if(hasTerm){
				if(parameters.useLiteralField){
					searchURI+="(literal:"+parameters.term+" OR "+parameters.term+")";
				} else {
					searchURI+=parameters.term;
				}
			}
			if(parameters.locationType){
				if(parameters.locationType.length > 1){
					var locTypesToAdd = "(";
					for(i in parameters.locationType){
						locTypesToAdd += "entryType:"+parameters.locationType[i];
						if(i < parameters.locationType.length-1){
							locTypesToAdd += "+OR+";
						}
					}
					locTypesToAdd += ")";
					searchURI += (hasTerm ? "+AND+" : "")+locTypesToAdd;
					hasTerm = true;
				} else if(parameters.locationType.length === 1){
				    searchURI += (hasTerm ? "+AND+" : "") +"entryType:"+parameters.locationType[0];
					hasTerm = true;
				}
			}
			if(parameters.builtinType){
				if(parameters.builtinType.length > 1){
					var buiTypesToAdd = "(";
					for(i in parameters.builtinType){
						buiTypesToAdd += "resourceType:"+parameters.builtinType[i];
						if(i < parameters.builtinType.length-1){
							buiTypesToAdd += "+OR+";
						}
					}
					buiTypesToAdd += ")";
					searchURI += (hasTerm ? "+AND+" : "")+buiTypesToAdd;
					hasTerm = true;
				} else if(parameters.builtinType.length === 1){
				    searchURI += (hasTerm ? "+AND+" : "") + "resourceType:"+parameters.builtinType[0];
					hasTerm = true;
				}
			}
			
			//Lists
			if(parameters.folders){
				if(dojo.isArray(parameters.folders) && parameters.folders.length >0){
					var inFolders = "";
					for(f in parameters.folders){
						inFolders += "lists:"+encodeURIComponent(parameters.folders[f].replace(/:/g,"\\:"));
						if(f < parameters.folders.length - 1){
							inFolders += "+OR+";
						}
					}
					inFolders = parameters.folders.length >1 ? "("+inFolders+")" : inFolders; 
				} else {
					inFolders = "lists:" + encodeURIComponent(parameters.folders.replace(/:/g,"\\:"));
				}
				searchURI += (hasTerm ? "+AND+" : "")+inFolders;
				hasTerm = true;
		    } else if(parameters.excludeLists){
				if(dojo.isArray(parameters.excludeLists) && parameters.excludeLists.length >0){
					var excludeFolders = "";
					for(exf in parameters.excludeLists){
						excludeFolders += "lists:"+encodeURIComponent(parameters.excludeLists[exf].replace(/:/g,"\\:"));
						if(exf < parameters.excludeLists.length - 1){
							excludeFolders += "+OR+";
						}
					}
					excludeFolders = parameters.excludeLists.length >1 ? "("+excludeFolders+")" : excludeFolders; 
				}
				searchURI += (hasTerm ? "+AND+NOT+" : "NOT")+excludeFolders;
				hasTerm = true;
			}
			else if(parameters.context){ //Search on both folders and contexts would in some cases be inconsistent,
		                                   // the folder search is in those cases prioritized
				//TODO: Perhaps make support for several contexts?
				searchURI += (hasTerm ? "+AND+" : "")+"context:"+base.replace(/:/g, "\\%3A")+parameters.context;
				hasTerm = true;
			}
			if(parameters.resource){
				searchURI += (hasTerm ? "+AND+" : "")+"resource:"+encodeURIComponent(parameters.resource.replace(/:/g,"\\:"));
			}
			
			if (parameters.sort) {
				searchURI += "&sort="+parameters.sort;
			}
		} else {
			searchURI = base+"search?type="+parameters.queryType+"&query="+encodeURIComponent(parameters.term)+lt+inContext;
		}
		entryInfo.infoUri = searchURI;
		console.log("searching via: "+searchURI);
		var entry = new folio.data.Entry({entryInfo: entryInfo, context: this, communicator: this.communicator});
		entry.localMetadata = new rdfjson.Graph();
		entry.localMetadata.create(entryInfo.resourceURI, folio.data.DCTermsSchema.TITLE, {"type": "literal", "value": this.resourceBundle.searchedFor+(parameters.queryType == 'subfield' ? 'learning resources': parameters.term)});
		entry.info = new rdfjson.Graph();
		entry.info.create(entryInfo.entryUri, folio.data.SCAMSchema.RESOURCE, {"type":"uri", "value": entryInfo.resourceURI});
		entry.info.create(entryInfo.resourceURI, folio.data.RDFSchema.TYPE, {"type": "uri", "value": folio.data.BuiltinTypeSchema.RESULT_LIST});
		entry.buiType = folio.data.BuiltinType.RESULT_LIST;
		this.communicator.getEntry({entry: entry, infoUri: searchURI, limit: parameters.limit}).then(
					dojo.hitch(this, function(entry) {
						var md = entry.getLocalMetadata();
						if (!entry.resource || !entry.resource.results || entry.resource.results === 0) {
							var msg = this.resourceBundle.noMatch;
							md.create(entryInfo.resourceURI, folio.data.DCSchema.DESCRIPTION, {type: "literal", value: msg});
						}
						this.cacheEntry(entry);
						parameters.onSuccess(entry);
					}), 
					parameters.onError);
	},
	getAlias: function(onLoad) {
		onLoad("_search");
	},
	localize: function() {
		dojo.requireLocalization("folio", "context");
		this.resourceBundle = dojo.i18n.getLocalization("folio", "context");
	}
});