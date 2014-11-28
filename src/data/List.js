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

dojo.provide("folio.data.List");
dojo.require("folio.data.EntryUtil");
dojo.require("folio.data.Constants");

dojo.declare("folio.data.List", null, {
	getSize: function() {},
	getLoadedSize: function() {},
	getDefaultLimit: function() {},
	isPaginated: function() {},
	getNumberOfPages: function(limit) {},
	getPage: function(pageNr, limit, onChildren, onError) {},
	loadMissing: function(onChildren, onError) {},
	getChildren: function(onChildren, onError) {},
	loadChildrenIds: function(onChildrenids, onError) {},
	loadChildren: function(limit, offset, onChildren, onError) {},
	getResource: function(onResource, onError) {},
	addEntry: function(entry, atPosition) {},
	removeEntry: function(fromPosition) {},
	removeEntryId: function(entryId) {},
	moveEntry: function(fromPosition, toPosition) {},
	switchEntries: function(entryPosition1, entryPosition2) {},
	save: function(onSuccess, onError) {},
	setOrder: function(order) {}
});

dojo.declare("folio.data.AbstractList", folio.data.List, {
	entry: null,
	loadedSize: 0,
	constructor: function(entry) {
		this.childrenE = [];
		this.entry = entry;
	},
	getLoadedSize: function() {
		return this.loadedSize;
	},
	getSize: function() {
		return this.size;
	},
	getDefaultLimit: function() {
		return this.entry.context.communicator.getDefaultLimit();
	},
	isPaginated: function() {
		return this.size === undefined ? true : this.size > this.getDefaultLimit();
	},
	getNumberOfPages: function(limit) {
		if (!limit) {
			limit = this.getDefaultLimit();
		}
		return Math.floor((this.size !== undefined ? this.size-1 : this.loadedSize)/limit)+1;
	},
	getPage: function(pageNr, limit, onChildren, onError) {
		if (limit === 0) {
			limit = this.getDefaultLimit();
		}
		var offset = limit == -1 ? 0 : limit*pageNr;
		this.loadChildren(limit, offset, onChildren, onError);
	},
	getChildren: function(onChildren, onError) {
		this.loadChildren(-1, 0, onChildren, onError);		
	},
	_detectMissing: function(limit, offset) {
		if (this.size === undefined) {
			this.missing = true;
		} else {
			if (this.missing === undefined) { //Check entire list if anything is missing.
				this.missing = false;
				delete this.firstMissing;
				for(var i=0;i<this.size;i++) {
					if (this.childrenE[i] === undefined) {
						this.missing = true;
						this.firstMissing = i;
						break;
					}
				}
			}
		}
		if (this.missing === false) {
			return false;
		}
		if (limit == -1) {
			return true;
		}
		for(var j=offset;j<offset+limit;j++) {
			if (this.childrenE[j] === undefined) {
				return true;
			}
		}
		return false;
	},
	loadMissing: function(onChildren, onError) {
		this._detectMissing(-1, 0);
		if (this.missing) {
			this.loadChildren(-1, this.firstMissing, dojo.hitch(this, function() {
					onChildren(this.childrenE);
				}), onError);
		} else {
			onChildren(this.childrenE);			
		}
	},
	_getChildrenSlice: function(offset, limit) {
		if (limit == -1 || this.childrenE.length <= offset+limit) {
			return this.childrenE.slice(offset, this.childrenE.length);
		} else {
			return this.childrenE.slice(offset, offset+limit);
		}
	},
	getResource: function(onResource, onError) {
		this._detectMissing();
		if (this.missing) {
			this.loadMissing(function(children) {
				onResource(dojo.map(children, function(e) {return e.getId();}));				
			}, onError);
		} else {
			onResource(dojo.map(this.childrenE, function(e) {return e.getId();}));
		}
	},
	addEntry: function(entry, atPosition) {
		if (atPosition === undefined) {
			this.childrenE.push(entry);			
		} else {
			this.childrenE.splice(atPosition, 0, entry);
		}
		this.size++;
		this.loadedSize++;
	},
	removeEntry: function(fromPosition) {
		this.childrenE.splice(fromPosition, 1);
		this.size--;
		this.loadedSize--;
	},
	removeEntryId: function(entryId) {
		var pos = -1;
		for (var i=0;i<this.childrenE.length;i++) {
			if (this.childrenE[i].getId() == entryId) {
				pos = i;
			}
		}
		this.childrenE.splice(pos, 1);
		this.size--;
		this.loadedSize--;
	},
	moveEntry: function(fromPosition, toPosition) {
		if (fromPosition < toPosition) {
			this.addEntry(this.childrenE[fromPosition], toPosition);
			this.removeEntry(fromPosition);
		} else {
			var entry = this.childrenE[fromPosition];
			this.removeEntry(fromPosition);
			this.addEntry(entry, toPosition);
		}
	},
	switchEntries: function(entryPosition1, entryPosition2) {
		var e1 = this.childrenE[entryPosition1];
		this.childrenE[entryPosition1] = this.childrenE[entryPosition2];
		this.childrenE[entryPosition2] = e1;
	},
	save: function(onSuccess, onError) {
		this.entry.saveResource(onSuccess, onError);
	},
	canBeSorted: function() {
		return true;
	},
	isSorted: function() {
		return this.sortObj != null;
	},
	checkSortChange: function() {
		if (!this.entry.noSort && this.sortObj != this.entry.context.communicator.getSort()) {
			this.setSort();
		}
	},
	setSort: function(sortObj) { //sort, descendingOrder, language, prio) {
		if (sortObj === null) {
			this.sortObj = null;
		} else if (sortObj === undefined) {
			this.sortObj = this.entry.context.communicator.getSort();
		} else {
			this.sortObj = sortObj;
		}
		this.childrenE = [];
		this.loadedSize = 0;
		delete this.size;
	}
});


dojo.declare("folio.data.SCAMList", folio.data.AbstractList, {
	constructor: function(entry) {
		if (!entry.noSort) {
			this.sortObj = this.entry.context.communicator.getSort();
		}
		this._importChildren(0);
		this.size = this.entry.resource.size;
	},
	loadChildren: function(limit, offset, onChildren, onError) {
		this.checkSortChange();
		if (this._detectMissing(limit, offset)) {
			this.entry.context.communicator.getEntry({entry: this.entry, infoUri: this.entry.entryInfo.infoUri, 
			  limit: limit, offset: offset, sort: this.entry.noSort ? undefined : this.sortObj}).then(
			  dojo.hitch(this, function(entry) {
				this._importChildren(offset);
				if (limit == -1) {
					this.missing = false;
					this.size = this.loadedSize;
				} else {
					delete this.missing;
					if (this.loadedSize < offset+limit) {
						this.size = this.loadedSize;
					}
				}
				onChildren(this._getChildrenSlice(offset, limit));
			}), onError);
		} else {
			onChildren(this._getChildrenSlice(offset, limit));
		}
	},
	_importChildren: function(offset) {
		if (this.entry.resource === undefined) {
			return;
		}
		var children = this.entry.resource.children;
		for (var i=0;i<children.length; i++) {
			var context;
			if (children[i].contextId != null) {
				var neu = folio.data.normalizeEntryInfo({base: this.entry.getContext().getBaseURI(), entryId: children[i].entryId, contextId: children[i].contextId})
				context = this.entry.context.store.getContextFor(neu.entryUri);				
			} else {
				context = this.entry.getContext();
			}

			//Fetch an existing loaded entry from the context or create a stub for it.		
			//try {
				this.childrenE[offset+i] = folio.data.entryFromStub(context, children[i]);
			/*} catch (error) {
				throw("Entry is a list, cannot load child number "+ i + ":\n"+error);
			}*/
		}
		if (this.loadedSize < (offset+children.length)) {
			this.loadedSize = offset+children.length;
		}
	},
	loadChildrenIds: function(onChildren, onError) {
		if (this.entry.resource != undefined && this.entry.resource.allUnsorted != undefined) {
			onChildren(this.entry.resource.allUnsorted);
			return;
		}
		this._detectMissing(-1, 0);
		if (this.isSorted() || this.missing) {
			this.entry.context.communicator.GET(this.entry.getResourceUri()).then(onChildren, onError);
		} else {
			onChildren(dojo.map(this.childrenE, function(ce) {return ce.getId();}));
		}
	}
});

dojo.declare("folio.data.SCAMResultList", folio.data.SCAMList, {
	constructor: function(entry) {
		var maxExpected = this.entry.resource.limit === undefined ? -1 : this.entry.resource.limit;
		if (this.entry.resource.results != maxExpected) {
			this.size = this.entry.resource.results;
			if (this.entry.resource.offset !== undefined) {
				this.size += this.entry.resource.offset;
			}
		}
		this.sortObj = null;
		if (this.entry.resource.children.length < this.entry.resource.limit) {
			//Trust the children length instead since the limit is higher than the amount of results.
			this.size = this.entry.resource.children.length;
		} 
	},
	canBeSorted: function() {
		return false; //TODO: If Solr-search is activated the sorting should be possible
	},
	isSorted: function() {
		return false; //TODO: If Solr-search is activated the sorting should be possible
	}
});

folio.data.googleFeedAPIAvailable = undefined;
folio.data.loadGoogleFeedAPI = function(onLoaded, onError) {
	if (folio.data.googleFeedAPIAvailable !== undefined) {
		if (folio.data.googleFeedAPIAvailable) {
			onLoaded();
		} else {
			onError();
		}
		return;
	}
	if (window.google === undefined) {
		folio.data.googleFeedAPIAvailable = false;
		onError();
	}
	google.load("feeds", "1", {callback: function() {
		folio.data.googleFeedAPIAvailable = true;
		onLoaded();
	}});
};

dojo.declare("folio.data.FeedList", folio.data.AbstractList, {
	constructor: function(entry) {
		var context = this.entry.getContext();
		this.tmpContext = context.store.getContext(context.getBase()+"_tmp");
	},
	loadChildren: function(limit, offset, onChildren, onError) {
		if (this._detectMissing(limit, offset)) {
			folio.data.loadGoogleFeedAPI(dojo.hitch(this, function() {
				var feed = new google.feeds.Feed(this.entry.getResourceUri());
				if (limit == -1 || limit+offset > 100) {
					feed.setNumEntries(-1);
				} else {
					feed.setNumEntries(limit+offset);			
				}
	  			feed.load(dojo.hitch(this, function(result) {
	  				for (var i = offset; i < result.feed.entries.length; i++) {
	    				var fentry = result.feed.entries[i];
		    			var link = fentry.link;
		    			if (link) {
			    			var childE = this.tmpContext.createLink(link);
		    				var md = childE.getLocalMetadata();							
							//Setting a title
			    			md.create(link, folio.data.DCTermsSchema.TITLE, {
								"type": "literal",
								"value": fentry.title
							});
							//Setting the description
							var stmt = md.create(link, folio.data.DCTermsSchema.DESCRIPTION);
							md.create(stmt.getValue(), folio.data.RDFSchema.VALUE, {type: "literal", value: fentry.contentSnippet});
		    				this.childrenE[i] = childE;
				    	}
			  		}
					if (limit == -1) {
						this.missing = false;
					} else {
						delete this.missing;
					}
					if (result.feed.entries.length != offset+limit) {
						this.size = result.feed.entries.length;
						this.loadedSize = this.size;
					} else {
						this.loadedSize = result.feed.entries.length;
					}
					onChildren(this._getChildrenSlice(offset, limit));
				}));
			}), onError);
		} else {
			onChildren(this._getChildrenSlice(offset, limit));
		}
	},
	canBeSorted: function() {
		return false;
	},
	isSorted: function() {
		return false;
	}
});