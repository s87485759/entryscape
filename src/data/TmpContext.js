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

dojo.provide("folio.data.TmpContext");
dojo.require("folio.data.Context");
dojo.require("rdfjson.Graph");

dojo.declare("folio.data.TmpContext", folio.data.Context, {
	isSearch: true,
	
	createLocal: function(builtinType) {
		return this._createEntry(null, builtinType, folio.data.LocationTypeSchema.LOCAL);
	},
	
	createLink: function(resourceUri, builtinType) {
		return this._createEntry(resourceUri, builtinType, folio.data.LocationTypeSchema.LINK);
	},
	createLinkReference: function(resourceUri, externalMetadataUri, builtinType) {
		var entry = this._createEntry(resourceUri, builtinType, folio.data.LocationTypeSchema.LINK_REFERENCE);
		entry.info.create(entry.getUri(), folio.data.SCAMSchema.EXTERNAL_METADATA, {"type":"uri", "value": externalMetadataUri});
		entry.externalMetadataUri = externalMetadataUri;
		return entry;
	},
	createReference: function(resourceUri, externalMetadataUri, builtinType) {
		var entry = this._createEntry(resourceUri, builtinType, folio.data.LocationTypeSchema.REFERENCE);
		entry.info.create(entry.getUri(), folio.data.SCAMSchema.EXTERNAL_METADATA, {"type":"uri", "value": externalMetadataUri});
		entry.externalMetadataUri = externalMetadataUri;
		return entry;
	},
	
	//===================================================
	// Inherited methods
	//===================================================
	getAlias: function(onLoad) {
		onLoad("_tmp");
	},

	//===================================================
	// Private methods
	//===================================================
	_createEntry: function(resourceUri, graphType, entryType) {
		var entry = this._createPlainEntry();
		entry.resourceURI = resourceUri || this.getBase()+"_tmp/resource/"+entry.getId();
		entry.info.create(entry.getUri(), folio.data.SCAMSchema.RESOURCE, {"type":"uri", "value": resourceUri});
		
		entry.info.create(resourceUri, folio.data.RDFSchema.TYPE, {"type": "uri", "value": graphType});
		entry.info.create(resourceUri, folio.data.RDFSchema.TYPE, {"type": "uri", "value": entryType});
		folio.data._excavateTypes(entry);
		return entry;
	},
	_createPlainEntry: function() {
		if (this.tmpCounter === undefined) {
			this.tmpCounter = 1;
		} else {
			this.tmpCounter++;
		}
		var entry = new folio.data.Entry({entryInfo: this.createEntryInfo(this.tmpCounter), context: this, communicator: this.communicator});
		
		entry.localMetadata = new rdfjson.Graph();
		entry.info = new rdfjson.Graph();
		this.cacheEntry(entry);
		return entry;
	}	
});