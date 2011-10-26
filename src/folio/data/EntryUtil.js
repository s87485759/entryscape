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

dojo.provide("folio.data.EntryUtil");
dojo.require("folio.data.List");

folio.data.extractEntryInfo = function(entry) {
	entry.localMetadataUri = entry.entryInfo.base+entry.entryInfo.contextId+"/metadata/"+entry.entryInfo.entryId;
	entry.externalMetadataCacheUri = entry.entryInfo.base+entry.entryInfo.contextId+"/external-metadata-cache/"+entry.entryInfo.entryId;
	entry.resourceUri = entry.getInfo().findFirstValue(entry.getUri(), folio.data.SCAMSchema.RESOURCE);
	entry.relationUri = entry.entryInfo.base+entry.entryInfo.contextId+"/relation/"+entry.entryInfo.entryId;
	folio.data._excavateTypes(entry);
	if (entry.locType == folio.data.LocationType.LINK_REFERENCE ||
			entry.locType == folio.data.LocationType.REFERENCE) {
		entry.externalMetadataUri = entry.getInfo().findFirstValue(entry.getUri(), folio.data.SCAMSchema.EXTERNAL_METADATA);
	}
	//		
};

//graph.getCanonicalURI(graph.getFirstObjectValue("sc:resource"));
//---------The three types------------------
folio.data._excavateTypes = function(entry) {
	//Reset types to default.
	entry.locType = folio.data.LocationType.LOCAL;
	entry.repType = folio.data.RepresentationType.INFORMATION_RESOURCE;
	entry.buiType = folio.data.BuiltinType.NONE;

	//LocationType as rdf:type on entryURI (Root in entryInfo).
	var locTypeStr = entry.getInfo().findFirstValue(entry.getUri(), folio.data.RDFSchema.TYPE);
	if (locTypeStr) {
		var locType = folio.data._excavateType(locTypeStr, folio.data.LocationTypeSchema, folio.data.LocationType);
		if (locType) {
			entry.locType = locType;
		}
	}

	//RepresentationType and BuiltinType as rdf:type on the resourceURI.
	var arr = entry.getInfo().find(entry.getResourceUri(), folio.data.RDFSchema.TYPE); //FIXME resource URI is not abbreviated, Jdil must support this.
	for (var i=0;i<arr.length;i++) {
		var repType = folio.data._excavateType(arr[i].getValue(), folio.data.RepresentationTypeSchema, folio.data.RepresentationType);
		if (repType) {
			entry.repType = repType;
		}
		var buiType = folio.data._excavateType(arr[i].getValue(), folio.data.BuiltinTypeSchema, folio.data.BuiltinType);
		if (buiType) {
			entry.buiType = buiType;
		}
	}
};

folio.data._excavateType = function(str, strEnum, intEnum) {
	for (var key in strEnum) {
		if (strEnum[key] == str) {
			return intEnum[key];
		}
	}
};


folio.data.getContextForResource = function(entry) {
	if (entry.getLocationType() != folio.data.LocationType.LOCAL) {
		return entry.context.store.getContextFor(entry.getResourceUri());
	} else {
		return entry.context;
	}
};

folio.data.getLabelRaw = function(entry) {
	var builtinType = entry.getBuiltinType();
	var result;
	if(builtinType === folio.data.BuiltinType.USER){
		result = folio.data.getStringFromProperties(entry, [folio.data.FOAFSchema.NAME]);
		if(!result){
			var firstname = folio.data.getStringFromProperties(entry, [folio.data.FOAFSchema.FIRSTNAME]);
			if(firstname){
				result = firstname;
			}
			var surname = folio.data.getStringFromProperties(entry, [folio.data.FOAFSchema.SURNAME]);
			if(surname){
				if(firstname){
					result = firstname+" "+surname;
				} else{
					result = surname;
				}
			}
		}
	} else if(builtinType === folio.data.BuiltinType.GROUP){
		result = folio.data.getStringFromProperties(entry, [folio.data.FOAFSchema.NAME]);
	}
	if(result){
		return result;
	}
	return folio.data.getStringFromProperties(entry, [folio.data.DCSchema.TITLE, folio.data.DCTermsSchema.TITLE]);
};
folio.data.getLabel = function(entry) {
	//var label = folio.data.getStringFromProperties(entry, [folio.data.DCTermsSchema.TITLE, folio.data.DCSchema.TITLE, folio.data.FOAFSchema.NAME]);
	var label = folio.data.getLabelRaw(entry);
	if (!label) {
		dojo.requireLocalization("folio", "common");
		var resourceBundle = dojo.i18n.getLocalization("folio", "common");
		if (entry.readAccessToMetadata) {
			label = resourceBundle.noTitleFound;
		} else {
			label = resourceBundle.insufficientRights;
		}
	} else {
		label = label.replace(/</g,'&lt;').replace(/>/g,"&gt;");
	}
	return  label;
};
folio.data.getDescription = function(entry) {
	var desc = folio.data.getStringFromProperties(entry, [folio.data.DCTermsSchema.DESCRIPTION+","+folio.data.RDFSchema.VALUE, folio.data.DCSchema.DESCRIPTION]) || "";
	if(desc){
		return desc.replace(/</g,'&lt;').replace(/>/g,"&gt;");
	}
	return desc;
};
folio.data.getStringFromProperties = function(entry, props) {
	var result = folio.data._getString(entry.getLocalMetadata(), props, entry.getResourceUri(), true);
	var extMetadata = entry.getExternalMetadata();
	if (extMetadata) {
		result = dojo.mixin(folio.data._getString(entry.getExternalMetadata(), props, entry.getResourceUri(), true),result);
	}
	if(!result){//Fallback if the entry only contains stub-info (which it should not do anymore)
		result = folio.data._getString(entry.getMetadata(), props, entry.getResourceUri(), true);
	}
	if (result.perfectLocaleLanguageValue !== undefined ||
		result.localeLanguageValue !== undefined ||
		result.englishLanguageValue !== undefined ||
		result.emptyLanguageValue !== undefined ||
		result.anyLanguageValue !== undefined) {
			var languageValue = null
			if (result.perfectLocaleLanguageValue) {
				languageValue = result.perfectLocaleLanguageValue;
			} else if(result.localeLanguageValue) {
				languageValue = result.localeLanguageValue;
			} else if(result.englishLanguageValue) {
				languageValue = result.englishLanguageValue;
			} else if(result.emptyLanguageValue) {
				languageValue = result.emptyLanguageValue;
			} else if (result.anyLanguageValue) {
				languageValue = result.anyLanguageValue;
			} else {
				dojo.requireLocalization("folio", "common");
				var resourceBundle = dojo.i18n.getLocalization("folio", "common");
				languageValue = resourceBundle.noValueFound;
			}
			return languageValue;
	}
};

folio.data._getString = function(metadata, props, subject, checkLanguage) {
	//Rewrite by priority of properties to use from context, store and only then use some kind of default.
	var result = {}, resultArr = [], obj, lang, proparr, prop, values;
	if (metadata) {
		for (var i=0;i<props.length;i++) {
			proparr = props[i].split(",");
			prop = proparr[0];
			values = metadata.find(subject, prop);
			if (values == null || values.length == 0) {
				continue;
			}
			for (var j = 0; j < values.length; j++) {
				obj = values[j];
				switch (obj.getType()) {
					case "uri":
					case "bnode":
						if (proparr.length > 1) {
							if (checkLanguage) {
								dojo.mixin(result, folio.data._getString(metadata, [proparr.slice(1).join(",")], obj.getValue(), checkLanguage));
							} else {
								resultArr = resultArr.concat(folio.data._getString(metadata, [proparr.slice(1).join(",")], obj.getValue(), checkLanguage));
							}
						}
						continue;
					case "literal":
						if (checkLanguage !== true) {
							resultArr.push(obj.getValue());
							continue;
						}
						lang = obj.getLanguage();
						if (lang == null) {
							result.emptyLanguageValue = obj.getValue();
						} else {
							if (lang == dojo.locale) {
								result.perfectLocaleLanguageValue = obj.getValue();
							} else if (lang.substring(0, 1) == dojo.locale.substring(0, 1)) {
								result.localeLanguageValue = obj.getValue();
							} else if (lang.indexOf("en") != -1) {
								result.englishLanguageValue = obj.getValue();
							} else {
								result.anyLanguageValue = obj.getValue();
							}							
						}
				}
			}
		}
	}
	if (checkLanguage !== true) {
		return resultArr;
	} else {
		return result;
	}
};
folio.data.getFromMD = function(entry, property) {
	var md = entry.getMetadata(); //Whatever we have...
	if (md) {
		return md.findFirstValue(entry.getResourceUri(), property);
	}	
};
folio.data.getFirstFromMDThenInfo = function(entry, property) {
	//Try first mimetype from metadata.
	var md = entry.getMetadata(); //Whatever we have...
	if (md) {
		var str = md.findFirstValue(entry.getResourceUri(), property);
		if(str) {
			return str;
		}
	}
	//Now try to find from entryInfon.
	var ei = entry.getInfo();
	if (ei) {
		return ei.findFirstValue(entry.getResourceUri(), property);		
	}
	return false;
};
	
folio.data.isReference = function(entry) { //If LinkReference or Reference
	var locType = entry.getLocationType();
	return locType == folio.data.LocationType.LINK_REFERENCE || locType == folio.data.LocationType.REFERENCE;
};
folio.data.isLink = function(entry) { //If Link
	var locType = entry.getLocationType();
	return locType == folio.data.LocationType.LINK || locType == folio.data.LocationType.LINK_REFERENCE;
};

folio.data.isLinkLike = function(entry) { //Link, LinkReference or Reference
	return folio.data.isLink(entry) || folio.data.isReference(entry);
};
	
folio.data.isList = function(entry) { // Check if entry is list
	var btype = entry.getBuiltinType();
	return  btype == folio.data.BuiltinType.LIST || btype == folio.data.BuiltinType.RESULT_LIST;
};

folio.data.isGroup = function(entry) { // Check if entry is Group
	return  entry.getBuiltinType() == folio.data.BuiltinType.GROUP;
};

folio.data.isUser = function(entry) { // Check if entry is User
	return  entry.getBuiltinType() == folio.data.BuiltinType.USER;
};

folio.data.isListLike = function(entry) {
	return folio.data.isList(entry) || folio.data.isGroup(entry); 
};

folio.data.isContext = function(entry) { // Check if entry is list
	var btype = entry.getBuiltinType();
	return  btype == folio.data.BuiltinType.CONTEXT || btype == folio.data.BuiltinType.SYSTEM_CONTEXT;
};

folio.data.isWebContent = function(entry) {
	return entry.getBuiltinType() ==  folio.data.BuiltinType.NONE && entry.getRepresentationType() == folio.data.RepresentationType.INFORMATION_RESOURCE;
};


folio.data.isImage = function(entry) {
	// Returns true if entry is an image of a supporting format
	var format = entry.getMimeType();
	if(format) {
		// regular expression "re"
		re = /image/;
		// returnes the value of "re" if "re" is in "format"
		return format.match(re) == "image";			
	}
	return false;
};

folio.data.isFeed = function(entry) {
	var mt = entry.getMimeType();
	return mt == "application/atom+xml" || mt == "application/rss+xml";
};

folio.data.isInternalReference = function(entry){
	if(!entry){
		return false;
	} 
	if(folio.data.isReference(entry)) {
		var baseURI = entry.getContext().getBaseURI();
		var mdURI = entry.getExternalMetadataUri();
		return mdURI && mdURI.indexOf(baseURI,0)>-1;
	}
	return false;
};

folio.data.isRefToExternalLink = function(entry){
	if(!entry){
		return false;
	}
	if(folio.data.isReference(entry)){
		var baseURI = entry.getContext().getBaseURI();
		var resURI = entry.getResourceUri();
		return resURI && resURI.indexOf(baseURI,0) !== 0;
	}
	return false;
};

folio.data.getChildCount = function(entry) {
	if (entry.list) {
		return entry.list.getSize();
	}
	if (entry.childCount) {
		return entry.childCount;
	}
	if (entry.resource && entry.resource.size) {
		return entry.resource.size;
	}
};

folio.data.getLinkedLocalEntry = function (entry, onComplete, onError) {
	entry.getContext().store.loadReferencedEntry(entry, {limit: 0}, onComplete, onError);	
};

folio.data.getList = function(entry, onComplete, onError) {
	if (entry.list) {
		onComplete(entry.list);
		return;
	}
	if (entry.getLocationType() != folio.data.LocationType.LOCAL) {
		if (folio.data.isFeed(entry)) {
			entry.list = new folio.data.FeedList(entry);
			onComplete(entry.list);
		} else {
			entry.getContext().store.loadReferencedEntry(entry, {limit: 0}, function(ent) {
					folio.data.getList(ent, onComplete, onError);
				}, onError);
		}
	} else {
		var f = function() {
			if (entry.isResourceAccessible()) {
				if (entry.getBuiltinType() == folio.data.BuiltinType.RESULT_LIST) {
					entry.list = new folio.data.SCAMResultList(entry);
				} else if (entry.getBuiltinType() == folio.data.BuiltinType.LIST) {
					entry.list = new folio.data.SCAMList(entry);
				} else if (entry.getBuiltinType() == folio.data.BuiltinType.GROUP) {
					entry.list = new folio.data.SCAMList(entry);	
				} else {
					onError("There is no list representation of the entry.");
					return;
				}
				onComplete(entry.list);
			} else {
				if (onError) {
					onError("You are not authorized to look at the resource ");
				} else {
					console.debug("You are not authorized to look at resource ");
				}
			}
		};
		if (entry.needRefresh() || entry.resource === undefined) {
			entry.refresh(f);
		} else {
			f();
		}
	}
};

folio.data.getChildren = function(entry, onComplete, onError) {
	folio.data.getList(entry, function(list) {
		list.getPage(0, 0, onComplete, onError);
	}, onError);
};

folio.data.getAllChildren = function(entry, onComplete, onError) {
	folio.data.getList(entry, function(list) {
		list.getChildren(onComplete, onError);
	}, onError);
};

folio.data.getACLList = function(entry) {
	var info = entry.getInfo();
	var resURI = entry.getResourceUri();
	var metURI = entry.getLocalMetadataUri();
	var jobs = [{key: "admin", prop: folio.data.SCAMSchema.WRITE, res: entry.getUri()},
		{key: "rread", prop: folio.data.SCAMSchema.READ, res: resURI},
		{key: "rwrite", prop: folio.data.SCAMSchema.WRITE, res: resURI},
		{key: "mread", prop: folio.data.SCAMSchema.READ, res: metURI},
		{key: "mwrite", prop: folio.data.SCAMSchema.WRITE, res: metURI}];
	var acl = [];
	var lookup = {};
	dojo.forEach(jobs, function (job) {
		var principals = info.find(job.res, job.prop);
		dojo.forEach(principals, function (principal) {
			if (principal.getType() === "uri") {
				var uri = principal.getValue();
				var arr = uri.split("/");
				var id = arr[arr.length-1];
				var row = lookup[id];
				if (!row) {
					row = {uri: uri, entryId: id};
					lookup[id] = row;
					acl.push(row);
				}
				row[job.key] = true;
			}
		});
	});
	return acl;
};

folio.data.setACLList = function(entry, list) {
	var info = entry.getInfo();
	var resURI = entry.getResourceUri();
	var metURI = entry.getLocalMetadataUri();
	var entryURI = entry.getUri();
	var base = entry.getContext().getBase();
	folio.data.fillACLInRDFJSONGraph(info, entryURI, resURI, metURI, base, list);
};

folio.data.createNewEntryHelperObj = function(context) {
	var c = {};
	c.cId = context.getId();
	c.base = context.getBase();
	c.entryURI = c.base + c.cId+"/entry/_newId";
	c.resURI = c.base + c.cId+"/resource/_newId";
	c.metURI = c.base + c.cId+"/metadata/_newId";
	c.info = new rdfjson.Graph();
	c.info.create(c.entryURI, folio.data.SCAMSchema.RESOURCE, {"type": "uri", "value": c.resURI});
	c.info.create(c.entryURI, folio.data.SCAMSchema.LOCAL_METADATA, {"type": "uri", "value": c.metURI});
	c.metadata = new rdfjson.Graph();
	return c;
};
folio.data.createEntryGraphFromACLList = function(context, list) {
	var c = folio.data.createNewEntryHelperObj(context);
	folio.data.fillACLInRDFJSONGraph(c.info, c.entryURI, c.resURI, c.metURI, c.base, list);
	return c;
};

folio.data.fillACLInRDFJSONGraph = function(info, entryURI, resURI, metURI, base, list) {
	dojo.forEach(info.find(entryURI, folio.data.SCAMSchema.WRITE), info.remove, info);
	dojo.forEach(info.find(resURI, folio.data.SCAMSchema.READ), info.remove, info);
	dojo.forEach(info.find(resURI, folio.data.SCAMSchema.WRITE), info.remove, info);
	dojo.forEach(info.find(resURI, folio.data.SCAMSchema.READ), info.remove, info);
	dojo.forEach(info.find(metURI, folio.data.SCAMSchema.READ), info.remove, info);
	dojo.forEach(info.find(metURI, folio.data.SCAMSchema.WRITE), info.remove, info);

	for (var i=0;i<list.length;i++) {
		var row = list[i];
		var principResURI = base +"_principals/resource/"+row.entryId;
		if (row.admin) {
			info.create(entryURI, folio.data.SCAMSchema.WRITE, {"type": "uri", "value": principResURI});
		}
		if (row.rread) {
			info.create(resURI, folio.data.SCAMSchema.READ, {"type": "uri", "value": principResURI});
		}
		if (row.rwrite) {
			info.create(resURI, folio.data.SCAMSchema.WRITE, {"type": "uri", "value": principResURI});
		}
		if (row.mread) {
			info.create(metURI, folio.data.SCAMSchema.READ, {"type": "uri", "value": principResURI});
		}
		if (row.mwrite) {
			info.create(metURI, folio.data.SCAMSchema.WRITE, {"type": "uri", "value": principResURI});
		}
	}
};
/*
 * This updates the value of the status-property used in the Organice Edunet-project.
 * Returns 1 if the value of parameter newStatus caused an update, otherwise 0 
*/
folio.data.updateStatus = function (entry, newStatus){
	var entryURI = entry.getUri();
	var info = entry.getInfo();
	var arr = info.find(entryURI, folio.data.SCAMBaseUri+"status");
	var dirty = (arr.length === 1 && arr.getValue() !== newStatus) 
		|| (arr.length === 0 && newStatus != null)
		|| (arr.length !== 0 && newStatus == null);

	dojo.forEach(arr, info.remove, info);
	if (newStatus != null) {
		info.create(entryURI, folio.data.SCAMBaseUri+"status", {"type": "literal", "value": newStatus});
	}
	return dirty ? 1 : 0;
};

folio.data.addMimeType = function(info, resURI, mt) {
	info.create(resURI, folio.data.DCTermsSchema.FORMAT, {"type": "literal", "value": mt}, true);
};

folio.data.fillInEntry = function(entry, data) {
	if(data.rights){
		for(var n in data.rights){
			if(data.rights[n] === "administer"){
				entry.adminRights = true;
				entry.readAccessToMetadata = true;
				entry.readAccessToResource = true;
				entry.writeAccessToResource = true;
				entry.writeAccessToMetadata = true;
			} else if (data.rights[n] === "writemetadata") {
				entry.writeAccessToMetadata = true;
				entry.readAccessToMetadata = true;
			} else if(data.rights[n] === "writeresource"){
				entry.writeAccessToResource = true;
				entry.readAccessToResource = true;
			} else if (data.rights[n] === "readmetadata") {
				entry.readAccessToMetadata = true;
			} else if(data.rights[n] === "readresource"){
				entry.readAccessToResource = true;
			}
		}
	}
	
	if (data.info || data.info_stub) {
		entry.info = new rdfjson.Graph(data.info || data.info_stub);
		folio.data.extractEntryInfo(entry);
	}
	
	if (entry.isMetadataAccessible() && !entry.context.isSearch) {
		if (data.metadata || data.metadata_stub) {
			entry.localMetadata = new rdfjson.Graph(data.metadata || data.metadata_stub);
		} else {
			entry.localMetadata = new rdfjson.Graph();
		}
		if (data["cached-external-metadata"]) {
			entry.externalMetadata = new rdfjson.Graph(data["cached-external-metadata"]);
		}
		if(data.relations || data.relation){
			entry.relation = new rdfjson.Graph(dojo.clone(data.relations || data.relation));
		}
	}
	if (data.size) {
		entry.childCount = data.size;
	}

	if (entry.isResourceAccessible()) {
		folio.data.importResource(entry, data);
	}

	if (data.alias) {
		entry.alias = data.alias;
	}
	if (data.name) {
		entry.name = data.name;
	}
	if(data.quota){
		entry.quota = {};
		if(data.quota.quota) {
			entry.quota.quota= data.quota.quota;
		}
		if (data.quota.fillLevel) {
			entry.quota.fillLevel = data.quota.fillLevel;
		}
		else {
			entry.quota.fillLevel = 0;
		}
		entry.quota.hasDefaultQuota = false;
		if(data.quota.hasDefaultQuota){
			entry.quota.hasDefaultQuota = data.quota.hasDefaultQuota
		}
	}
};

folio.data.importResource = function(entry, data) {
	//summary: Imports the resource with a special treatment if it is a list, 
	// otherwise the resource is just stored plainly in the entry.
	if (data.resource) {
		entry.resource = data.resource;
		entry.resource.results = data.results; //Ugly hack, correct JSON.
		entry.resource.offset = data.offset; //Ugly hack, correct JSON.
		entry.resource.limit = data.limit; //Ugly hack, correct JSON.
	}
};

folio.data.entryFromStub = function(context, stub) {
	var entry = context.getEntry(stub.entryId);
	if (!entry) {
		var einfo;
		if (stub.entryId !== undefined) {
			einfo = context.createEntryInfo(stub.entryId);
		} else {
			throw ("RDFJSON change made this approach obsolete, really needed?");
//			einfo = folio.data.normalizeEntryInfo(stub.info["@id"]);
		}
		if (einfo.entryId.charAt(0) == "_") {
			entry = new folio.data.SystemEntry({entryInfo: einfo, context: context, communicator: context.communicator});
		} else {
			entry = new folio.data.Entry({entryInfo: einfo, context: context, communicator: context.communicator});
		}
		
		context.cacheEntry(entry);
		folio.data.fillInEntry(entry, stub, true);
	} else if (entry.needRefresh()){
		folio.data.fillInEntry(entry, stub, true);		
	}
	return entry;
};

/**
 * Loads all groups that a user is a member of.
 * When all group Entries are loaded onLoaded is called with an array of the groups as an argument.
 */
folio.data.loadUserGroups = function(store, /* folio.data.Entry */ user, /* function([folio.data.Entry]) */ onLoaded, /* function(String) */ onError) {
	var groupArray = new Array();
	var groupsLoaded = 0;
	var groupUriArray = new Array();
	user.getContext().communicator.loadJSON(
			user.getUri().replace(/entry/, "relation") + "?includeAll",
			dojo.hitch(this, function(data) {
				var rgraph = new rdfjson.Graph(data);
				var arr = rgraph.find(null, folio.data.SCAMSchema.HAS_GROUP_MEMBER, {"type": "uri", "value": user.getUri()});
				dojo.forEach(arr, function(stmt) {
					groupUriArray.push(stmt.getSubject());					
				});
				if (groupUriArray.length > 0) {
					for (var i=0; i<groupUriArray.length; i++) {
						store.loadEntry(
								groupUriArray[i],
								{},
								dojo.hitch(this, function(groupEntry) {
									groupArray.push(groupEntry);
									groupsLoaded++;
									if (groupsLoaded == groupUriArray.length) {
										onLoaded(groupArray);
									}
								}),
								dojo.hitch(this, function(msg) {
									onError(msg);
								}));
					}
				}
				else {
					onLoaded(groupArray);
				}
			}),
			dojo.hitch(this, function(msg) {
				onError(msg);
			})
		);
};

/**
 * The function uses folio.data.getLabel to determine the sort order.
 * Returns a sorted array, does not modify the entries array.
 * 
 * @param entries An array of entries.
 */
folio.data.sortEntriesByLabel = function(/* [folio.data.Entry] */ entries) {
	return folio.data.ArraySortEntriesByLabel(entries);
};

/**
 * Sorts the entries by the lexical order of the metadata.
 * If an entry has no value of the predicate provided, it will be placed first.
 * Returns a sorted array, does not modify the entries array.
 * 
 * @param entries An array of entries.
 * @param predicate A string representation of the predicate.
 */
folio.data.sortEntriesByMetadata = function(/* [folio.data.Entry] */ entries, /* String */ predicate) {
	return folio.data.ArraySortEntriesByMetadata(entries, predicate);
};

/**
 * Returns the value from the entry's metadata with the associated predicate.
 */
folio.data.getObjectFromMetadata = function(/* Entry */entry, /* String */ predicate) {
	return entry.getMetadata() ? entry.getMetadata().findFirstValue(entry.getResourceUri(), predicate) : null;
};

/**
 * Compares the two predicates str1 and str2.
 * Converts the predicate strings to lower case.
 * If str1 > str2, 1 is returned.
 * If str1 < str2, -1 is returned.
 * If str1 == str2, 0 is returned.
 * 
 * If only str1 is null, -1 is returned.
 * If only str2 is null, 1 is returned.
 * If both is null, 0 is returned.
 */
folio.data.comparePredicates = function(str1, str2) {
	if (str1) {
		if (str2) {
			str1 = str1.toLowerCase();
			str2 = str2.toLowerCase();
			if (str1 > str2) {
				return 1;
			}
			else if (str1 == str2) {
				return 0;
			}
			else {
				return -1;
			}
		}
		else {
			return 1;
		}
	}
	else {
		if (str2) {
			return -1;
		}
		else {
			return 0;
		}
	}
};

/**
 * Uses the built in sort function in the Array object to sort the entries.
 */
folio.data.ArraySortEntriesByLabel = function(/* [folio.data.Entry] */ entries) {
	var copy = entries.slice(0);
	var sorter = function(entry1, entry2) {
		var str1 = folio.data.getLabel(entry1).toLowerCase();
		var str2 = folio.data.getLabel(entry2).toLowerCase();
		if (str1 > str2) {
			return 1;
		}
		else if (str1 == str2) {
			return 0;
		}
		else {
			return -1;
		}
	};
	copy.sort(sorter);
	return copy;
};

/**
 * Uses the built in sort function in the Array object to sort the entries.
 */
folio.data.ArraySortEntriesByMetadata = function(/* [folio.data.Entry] */ entries, /* String */ predicate) {
	var copy = entries.slice(0);
	var sorter = function(entry1, entry2) {
		var val1 = folio.data.getObjectFromMetadata(entry1, predicate);
		var val2 = folio.data.getObjectFromMetadata(entry2, predicate);
		return folio.data.comparePredicates(val1, val2);
	};
	copy.sort(sorter);
	return copy;
};

/**
 * Uses the shaker sort algorithm to sort the entries.
 */
folio.data.shakerSortEntriesByMetadata = function(/* [folio.data.Entry] */ entries, /* String */ predicate) {
	var sortedArray = entries.slice(0);
	var compare = folio.data.comparePredicates;

	var begin = 0;
	var end = entries.length - 1;
	var min = begin;
	var max = begin;
	var index = 0;
	
	var minObj = null;
	var maxObj = null;
	var indexObj = null;
	
	while (begin < end) {
		min = begin;
		max = begin;
		minObj = folio.data.getObjectFromMetadata(sortedArray[min], predicate);
		maxObj = minObj;
		for (index = begin + 1; index <= end; index++) {
			indexObj = folio.data.getObjectFromMetadata(sortedArray[index], predicate);
			if (compare(indexObj, minObj, predicate) < 0) {
				min = index;
				minObj = indexObj;
			}
			else if (compare(indexObj, maxObj, predicate) > 0) {
				max = index;
				maxObj = indexObj;
			}
		}
		var swap = sortedArray[min];
		sortedArray[min] = sortedArray[begin];
		sortedArray[begin] = swap;
		// Because begin and min has changed places
		if (max == begin) {
			swap = sortedArray[min];
			sortedArray[min] = sortedArray[end];
			sortedArray[end] = swap;
		}
		else {
			swap = sortedArray[max];
			sortedArray[max] = sortedArray[end];
			sortedArray[end] = swap;
		} 
		
		
		
		begin++;
		end--;
	}
	return sortedArray;
};

/**
 * Returns an Array with URIs that the given entry is listed in, if the entry is unlisted an empty Array is returned
 */
folio.data.getEntriesRelatedToEntry = function (/* [folio.data.Entry] */ entry, prop) {
	var returnArray = [];
	var relations = entry.getRelation();
	if (relations != null) {
		var arr = relations.find(null, prop, {"type": "uri", "value": entry.getUri()});
		return dojo.map(arr, function(stmt) {
			return stmt.getSubject();
		});
	}
	return returnArray;
};