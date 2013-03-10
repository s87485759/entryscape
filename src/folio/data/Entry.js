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

dojo.provide("folio.data.Entry");
dojo.require("folio.data.EntryUtil");
dojo.require("folio.data.Constants");
dojo.require("rdfjson.Graph");

dojo.declare("folio.data.Entry", null, {
	locType: folio.data.LocationType.LOCAL,
	repType: folio.data.RepresentationType.INFORMATION_RESOURCE,
	buiType: folio.data.BuiltinType.NONE,
	constructor: function(args) {
		dojo.mixin(this, args);
	},
	
	/*===========Loading and refreshing==============================*/
	needRefresh: function() {
		return this.refreshMe;// || this.isStub;
	},
	setRefreshNeeded: function() {
		this.refreshMe = true;
		delete this.info;
		delete this.metadata;
		delete this.resource;
		delete this.list;
	},
	refresh: function(onEntry, onError, refreshParams) {
		var params = {entry: this, infoUri: this.entryInfo.infoUri, limit: 0, sort: (this.noSort ? undefined : null), 
				onEntry: dojo.hitch(this, function(entry) {
						this.refreshMe = false;
						if (onEntry) {
							onEntry(entry);
						}
					}), onError: onError};
		if (refreshParams != undefined) {
			dojo.mixin(params, refreshParams);
		}
		this.context.communicator.loadJSONEntry(params);
	},
	
	/*============Identifiers========================================*/
	getId: function() {
		return this.entryInfo.entryId;
	},
	getUri: function() {
		return this.entryInfo.entryUri;
	},
	getLocalMetadataUri: function() {
		return this.localMetadataUri;
	},
	getExternalMetadataUri: function() {
		return this.externalMetadataUri;
	},
	getExternalMetadataCacheUri: function() {
		return this.externalMetadataCacheUri; 
	},
	getResourceUri: function() {
		return this.resourceUri;
	},
	getRelationUri: function() {
		return this.relationUri;
	},
	getAliasUri: function() {
		return this.getContext().getUri()+"/alias/"+this.getId();
	},
	
	/*============Relations===========================================*/
	getContext: function() {
		return this.context;
	},
	getInfo: function() {
		return this.info ? this.info : this.info_stub;
	},
	isMetadataAccessible: function() {
		return this.readAccessToMetadata;
		//return !this.noAccessToMetadata;
	},
	isMetadataModifiable: function() {
		return this.writeAccessToMetadata;
		//return !this.noAccessToMetadata;
	},
	possibleToAdmin: function() {
		return this.adminRights;
	},
	getLocalMetadata: function() {
		return this.localMetadata ? this.localMetadata :
		 new rdfjson.Graph();
	},
	getMetadata: function() {
		//summary: finds any metadata, checks local, external, local_stub and finally external_stub.
		if (this.localMetadata) {
			return this.localMetadata;
		} else if (this.metadata_stub) {
			return this.metadata_stub;
		} else if (this.externalMetadata) {
			return this.externalMetadata;
		} else if (this.externalMetadata_stub){
			return this.externalMetadata_stub;
		}
	},
	getExternalMetadata: function() {
		return this.externalMetadata ? this.externalMetadata : this.extermalMetadata_stub;
	},
	isResourceAccessible: function() {
		return this.readAccessToResource;
		//return !this.noAccessToResource;
	},
	isResourceModifiable: function(){
		return this.writeAccessToResource;
	},
	getResource: function() {
		return this.resource;
	},
	getRelation: function() {
		return this.relation;
	},

	/*============Utility access methods for the entryinfo================*/
	getLocationType: function() {
		return this.locType;
	},
	getBuiltinType: function() { //Returnes the buildtinType as a string from the entry info
		return this.buiType;
	},
	getRepresentationType: function() { //Returnes the buildtinType as a string from the entry info
		return this.repType;
	},
	getMimeType: function() {
		return folio.data.getFirstFromMDThenInfo(this, folio.data.DCTermsSchema.FORMAT);
	},
	getSize: function() {
		//Do not check metadata since extent is used for multiple things there.
//		return folio.data.getFirstFromMDThenInfo(this, folio.data.DCTermsSchema.EXTENT);
		var ei = this.getInfo(); //Whatever we have...
		if (ei) {
			return ei.findFirstValue(this.getResourceUri(), folio.data.DCTermsSchema.EXTENT);
		}
	},
	getHomeContext: function() {
		return this.getInfo().findFirstValue(this.getResourceUri(), folio.data.SCAMSchema.HOME_CONTEXT) ||
			(this.resource != null && this.resource.homecontext != null ? this.getContext().getBaseUri()+this.resource.homecontext : null); //Fallback, old way of setting homecontext.
	},
	/*
	 * @param contextUri should be the uri to the context resource, e.g. http://entrystore.com/store/4
	 */
	setHomeContext: function(contextUri) {
		var info = this.getInfo();
		var sts = info.find(this.getResourceUri(), folio.data.SCAMSchema.HOME_CONTEXT);
		for (var i=0;i<sts.length;i++) {
			info.remove(sts[i]);
		}
		info.create(this.getResourceUri(), folio.data.SCAMSchema.HOME_CONTEXT, {type: "uri", value: contextUri});
	},
	/**
	 * @return {Array} of Strings that are entryUris to all lists where this entry is a child.
	 */
	getLists: function() {
		return folio.data.getEntriesRelatedToEntry(this, folio.data.SCAMSchema.HAS_LIST_MEMBER);
	},
	/**
	 * @deprecated use getLists instead.
	 */
	getReferrents: function() {
		return this.getLists();
	},
	getComments: function() {
		return folio.data.getEntriesRelatedToEntry(this, "http://ontologi.es/like#regarding");		
	},
	/**
	 * @return {Array} of Strings that are entryUris to all groups where this user is a member.
	 */
	getGroups: function() {
		return folio.data.getEntriesRelatedToEntry(this, folio.data.SCAMSchema.HAS_GROUP_MEMBER);
	},
	getCreationDate: function() {
		return this.getInfo().findFirstValue(this.getUri(), folio.data.DCTermsSchema.CREATED);
	},
	getModificationDate: function() {
		return this.getInfo().findFirstValue(this.getUri(), folio.data.DCTermsSchema.MODIFIED);
	},
	getCreator: function() {
		return this.getInfo().findFirstValue(this.getUri(), folio.data.DCTermsSchema.CREATOR);
	},
	getContributors: function() {
		return dojo.map(this.getInfo().find(this.getUri(), folio.data.DCTermsSchema.CONTRIBUTOR), function(statement) {return statement.getValue();});
	},
	
	/*===============Saving methods=======================*/
	saveInfo: function(onSuccess, onError) {
		this.context.communicator.saveJSON(this.getUri(), {info: this.getInfo().exportRDFJSON()}, onSuccess, onError);
	},
	saveInfoWithRecusiveACL: function(saveRecursively, onSuccess, onError) {
		this.context.communicator.saveJSON(this.getUri()+(saveRecursively? "?applyACLtoChildren=true":""), {info: this.getInfo().exportRDFJSON()}, onSuccess, onError);
	},
	saveMetadata: function(onSuccess, onError) {
		if (this.locType != folio.data.LocationType.REFERENCE) {
			this.context.communicator.saveJSON(this.getMetadataUri(), {metadata: this.getLocalMetadata().exportRDFJSON()}, onSuccess, onError);
		}
	},
	saveResource: function(onSuccess, onError) {
		if (this.locType == folio.data.LocationType.LOCAL && this.buiType != folio.data.BuiltinType.NONE) {
			var resource = this.resource;
			if (this.buiType == folio.data.BuiltinType.LIST || this.buiType == folio.data.BuiltinType.GROUP) {
				folio.data.getList(this, dojo.hitch(this, function(list) {
					list.getResource(dojo.hitch(this, function(res) {
						this.context.communicator.saveJSONIfUnmodified(this.getResourceUri(), {resource: res}, dojo.date.stamp.fromISOString(this.getModificationDate()).toUTCString(), onSuccess, onError);
					}));
				}), onError);
			} else {
				this.context.communicator.saveJSON(this.getResourceUri(), {resource: resource}, onSuccess, onError);
			}
		} else if (onError) {
			onError();
		}
	},
	hasUserAccess: function(userEntry, callback) {
		//TODO
	},
	setResourceUri:function(/*String*/ newUri) {
//TODO this method is probably not complete.
//No saving, and what about all the other tripples (outgoing)
		var infoGraph = this.getInfo();
		this.resourceUri = newUri; //No need to refresh...
		var arr = infoGraph.find(this.getUri(), folio.data.SCAMSchema.RESOURCE);
		if (arr != null && arr.length === 1) {
			arr[0].setValue(newUri);
		}
	},
	setMimeType:function(/*String*/ newMIMEType) {
//TODO this method is probably not complete.
//No saving, and what about all the other tripples (outgoing)
		var infoGraph = this.getInfo();
		var arr = infoGraph.find(this.getResourceUri(), folio.data.DCTermsSchema.FORMAT);
		if (arr != null && arr.length === 1) {
			arr[0].setValue(newMIMEType);
		}
	}
});

dojo.declare("folio.data.SystemEntry", folio.data.Entry, {

	getLocalMetadata: function() {
		return this._getSystemMetadata();
	},
	getMetadata: function() {
		return this._getSystemMetadata();
	},
	
	_getSystemMetadata: function() {
		dojo.requireLocalization("folio", "systemFolderMetadata");
		var resourceBundle = dojo.i18n.getLocalization("folio", "systemFolderMetadata");
		var resourceUri = this.getResourceUri();
		var graph = new rdfjson.Graph();
		var value = resourceBundle[this.getId()+"_Label"];
		if (value != null) {
			graph.create(this.getResourceUri(), folio.data.DCTermsSchema.TITLE, {type: "literal", value: value, lang: dojo.locale});
		}
		value = resourceBundle[this.getId()+"_Description"];
		if (value != null) {
			graph.create(this.getResourceUri(), folio.data.DCTermsSchema.DESCRIPTION, {type: "literal", value: value, lang: dojo.locale});			
		}
		return graph;
	}
});