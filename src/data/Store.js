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

dojo.provide("folio.data.Store");
dojo.require("folio.data.util");
dojo.require("folio.data.Context");
dojo.require("folio.data.SearchContext");
dojo.require("folio.data.TmpContext");

dojo.declare("folio.data.Store", null, {
	constructor: function(args) {
		dojo.mixin(this, args);
		if (this.communicator) {
			this.communicator.store = this;
		}
		this.base2repo = {};
	},
	getContextById: function(contextId) {
		return this.getContextFor({base: __confolio.application.getRepository(), contextId: contextId, entryId: "_top"});
	},
	getContextFor: function(entryInfo) {
		entryInfo = folio.data.normalizeEntryInfo(entryInfo);
		return this._getContextFor(entryInfo);
	},
	clearCache: function() {
		this.base2repo = {};		
	},
	_getContextFor: function(entryInfo) {
		var repo = this.base2repo[entryInfo.base];
		if (!repo) {
			repo = {};
			this.base2repo[entryInfo.base]=repo;
		}
		var context = repo[entryInfo.contextId];
		if (!context) {
			if (entryInfo.contextId === "_search") {
				context = new folio.data.SearchContext({communicator: this.communicator, 
							id: entryInfo.contextId, base: entryInfo.base,
							store: this});				
			} else if (entryInfo.contextId === "_tmp") {
				context = new folio.data.TmpContext({communicator: this.communicator, 
							id: entryInfo.contextId, base: entryInfo.base,
							store: this});				
			} else {
				context = new folio.data.Context({communicator: this.communicator, 
							id: entryInfo.contextId, base: entryInfo.base,
							store: this});
				repo[entryInfo.contextId] = context;
			}
			// Do not cach search context, due to nls problems
//			repo[entryInfo.contextId] = context;
		}
		return context;
	},
	getContext: function(contextURI) {
		var entryInfo = folio.data.normalizeEntryInfo(contextURI+"/entry/_top");
		return this._getContextFor(entryInfo);
	},
	loadEntry: function(entryInfo, params, onEntry, onError) {       //	Loads the entry from context from entryInfo
		if (entryInfo instanceof folio.data.Entry) {
			if (entryInfo.needRefresh()) {
				entryInfo.load(onEntry, onError);
			} else {
				onEntry(entryInfo);
			}
		} else {
			entryInfo = folio.data.normalizeEntryInfo(entryInfo);
			var context = this._getContextFor(entryInfo);        // Load or initialize appropriate context
			context.loadEntry(entryInfo, params, onEntry, onError);		// Loads the entry from the context
		}
	},
	loadReferencedEntry: function(entryReference, params, onEntry, onError) {       //	Loads the entry from context from entryInfo
		this.loadEntry({uri:entryReference.getResourceUri()}, params, onEntry, onError);
	},
	loadEntries: function(resourceURI, onEntries, onError) {
		
	},
	reLoadEntry: function(infoURI, params, onEntry, onError) {
		//entryInfo = folio.data.normalizeEntryInfo(entryInfo);
		var context = this._getContextFor(entryInfo);		// Send context to load entry
		context.loadEntry(entryInfo, params, onEntry, onError);		// Loads the entry from the context
	},
	search: function(criteria, onResult, onError) {
		
	},
	/*Locates all the references to an entry and set them to be refreshed next time they are called*/
	updateReferencesTo: function(entry) {
		if(!entry){
			return;
		}
		var resourceURI = entry.getResourceUri();
		var cachedContexts = this.base2repo[entry.getContext().getBaseURI()];
		var i;
		for (i in cachedContexts){
			var entriesInContext = cachedContexts[i].entries;
			var j;
			for(j in entriesInContext){
				var locType = entriesInContext[j].getLocationType();
				if(locType === folio.data.LocationType.LOCAL || 
				   locType === folio.data.LocationType.LINK){
				   	continue;
				}
				
				if(entriesInContext[j].getResourceUri() === resourceURI){
					entriesInContext[j].setRefreshNeeded();
				}
			}
		}
		
	}
});
