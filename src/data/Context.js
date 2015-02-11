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

dojo.provide("folio.data.Context");
dojo.require("folio.data.Entry");
dojo.require("rdfjson.Graph");

dojo.declare("folio.data.Context", null, {
	constructor: function(args) {
		dojo.mixin(this, args);
		this.entries = {};
		this.deferreds = {};
	},
	clearCache: function() {
		this.entries = {};
	},
	getStore: function() {
		return this.store;
	},
	getId: function() {
		return this.id;
	},
	getUri: function() {
		return this.base+this.id;
	},
	getEntryUri: function() {
		return this.base+"_contexts/entry/"+this.id;
	},
	getBaseUri: function() {
		return this.base;
	},
	/**
	 * @deprecated
	 */
	getBaseURI: function() {
		return this.base; 
	},
	createEntryInfo: function(entryId) {
		return folio.data.normalizeEntryInfo({base: this.base, contextId: this.id, entryId: entryId});
	}, 
	///createResource: function(builtinType, list, onEntry, onError) {
	///},

	///createLink: function(resourceURI, list, onEntry, onError) {
	///},

	///createReference: function(resourceURI, metadataURI, list, onEntry, onError) {
	///},
	moveEntryHere: function(entry, fromListEntry, toListEntry, onSuccess, onError) {
		this.communicator.moveEntry(entry, fromListEntry, toListEntry).then(onSuccess, onError);
	},
	// remove entry from context
	removeEntry: function(entry, onSuccess, onError) {
		var removeTree = folio.data.isList(entry) && folio.data.getChildCount(entry) > 0;
		this.communicator.deleteEntry(entry, removeTree).then(dojo.hitch(this, function(mesg) {
			//If a non empty list, the remove may have removed an entire tree, 
			//hence many entries might have disapered and must be removed from cache
			//(there is currently no REST support to get a list of removed entries)
			if (removeTree) {
				this.getStore().clearCache();
			} else if (!(entry instanceof folio.data.SystemEntry)){
				//(Ignore SystemEntries as they cannot be removed)
				//Refresh lists where the entry appers as child.
				dojo.map(entry.getReferrents(), dojo.hitch(this, function(child) {
					var ent = this.getEntryFromEntryURI(child);
					if (ent) {
						ent.setRefreshNeeded();
					}
				}));

				//Remove only the entry from contexts cache.
				delete this.entries[entry.getId()];
			}
	
			var unlisted = this.entries["_unlisted"];
			if (unlisted) {
				unlisted.setRefreshNeeded();
			}
			onSuccess();
		}), onError);
	},
	getEntryFromEntryURI: function(entryURI) {
		return this.getEntry(entryURI.slice(entryURI.lastIndexOf("/")+1));
	},
	getEntry: function(entryId) {
		return this.entries[entryId];
	},
	/*limit == -1 => no limit, limit==0 default limit, limit >0 custom limit */
	loadEntryFromId: function(entryId, params, onEntry, onError) {
		this.loadEntry({entryId: entryId, contextId: this.id, base: this.base}, params, onEntry, onError);
	},
	/*limit == -1 => no limit, limit==0 default limit, limit >0 custom limit */
	loadEntry: function(entryInfo, params, onEntry, onError) {
		entryInfo = folio.data.normalizeEntryInfo(entryInfo); //Is already normalized in store.loadEntry
		var eId = entryInfo.entryId;
		var def = this.deferreds[eId];
		if (def !== undefined) {
			def.addCallbacks(onEntry, onError);
			return;
		}

		var entry = this.entries[eId]; // Fetch from cache
		if (entry) {
			if (entry.needRefresh()) {
				entry.refresh(onEntry, onError);
			} else {
				onEntry(entry);
			}
		} else {
			if (entryInfo.entryId.charAt(0) == "_") {
				entry = new folio.data.SystemEntry({entryInfo: entryInfo, context: this, communicator: this.communicator});
			}
			else {
				entry = new folio.data.Entry({entryInfo: entryInfo, context: this, communicator: this.communicator});
			}
			def = new dojo.Deferred();
			def.addCallbacks(onEntry, onError);
			this.deferreds[eId] = def;
			this.communicator.getEntry(dojo.mixin({entry: entry, infoUri: entryInfo.infoUri}, params)).then(
				dojo.hitch(this, function(entry) {
					this.cacheEntry(entry);	// Save entry in cache
					delete this.deferreds[eId];
					def.callback(entry);
				}), dojo.hitch(this, function(message, ioArgs) {
					delete this.deferreds[eId];
					def.errback(message, ioArgs);						
				})
			); // get entries from database
		}
	},
	createEntry: function(args, onEntry, onError) {
		args.context = this;
		this.communicator.createEntry(args).then(dojo.hitch(this, function(entryId) {
				if (args.parentList) {
//					args.parentList.resource.push({context: this.getId(), entry: entryId});
					args.parentList.needRefresh();
				}
				if (args.fileInput) {
					args.context.communicator.putFile(this.getUri()+"/resource/"+entryId, args.fileInput, args.mimetype,
						dojo.hitch(this, function(data) {
							this.loadEntryFromId(entryId, {}, onEntry, onError);
						}), 
						dojo.hitch(this, function() {
							this.loadEntryFromId(entryId, {}, onError, onError);
						}));
				} else {
					this.loadEntryFromId(entryId, {}, onEntry, onError);
				}
			}), onError);
	},
	cacheEntry: function(entry) {
		this.entries[entry.getId()] = entry;
	},
	setAlias: function(newAlias, onSuccess, onFailure) {
		this.getOwnEntry(dojo.hitch(this, function(entry) {
			this.communicator.PUT(this.getUri()+"/alias", {alias: newAlias}).then(function(){
				entry.alias = newAlias;
				onSuccess(newAlias);
			}, onFailure);
		}));
	},
	getAlias: function(onLoad) {
		this.getOwnEntry(function(entry) {
			onLoad(entry.alias);
		});
	},
	getOwnEntry: function(onEntry) {
		if (this.entry) {
			onEntry(this.entry);
		} else {
			this.store.loadEntry(this.getEntryUri(), {}, dojo.hitch(this, function(entry) {
				this.entry = entry;
				onEntry(entry);
			}));
		}
	},
	getBase: function() {
		return this.base;
	},
	getResources: function(onLoad, onError) {
		
	},
	
	getQuota: function() {
		
	},
	getEntryBranch: function(entry, onLoad) {
		var branch = [];
		var iterate = dojo.hitch(this, function(entry) {
			var referents = entry.getReferrents();
			if (entry instanceof folio.data.SystemEntry || referents.length == 0) { //at the top of the branch.
				var rBranch = [];
				for (var i=branch.length-1;i>=0;i--) {
					rBranch.push(branch[i]);
				}
				onLoad(rBranch);
				return;
			}
			this.store.loadEntry(referents[0], {limit: 0, sort: null}, dojo.hitch(this, function(parent) {
				branch.push(parent);
				iterate(parent);
			}));
		});
		branch.push(entry);
		iterate(entry);
	}
});