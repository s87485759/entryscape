/*global dojo,folio*/
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

dojo.provide("folio.Config");

/**
 * Holds the configurations for Confolio, both loaded attributes 
 * and utility functions against these attributes. 
 * 
 * Most of the public attributes and their default values are here listed 
 * for informative purposes only as the default values are needed before
 * this class has been instantiated. Hence, this class should be kept in
 * sync with any changes made to the bootstrap.js file.
 */
dojo.declare("folio.Config", null, {
	//=================================================== 
	// Public Attributes 
	//===================================================
	"title":                "Confolio",
	"startContext":         "1",
	"showLogin":            "false",
	"username":             "",
	"password":             "",
	"unloadDialog":			true,
	"scamPath":				"scam",
	"definitionsPath":		"definitions",
	"CLI":					false,
	"app":					"folio.apps.Default",

	//=================================================== 
	// Public API 
	//===================================================
	getIcon: function(entry, resolution) {
		if (dojo.isString(entry)) {
			return this._resolveIconResolution(this.definitions.specialIcons[entry], resolution);
		} else {
			var alts = this.definitions.icons;
			return this._resolveIconResolution(
					this._getFromBT(alts, entry) ||
						this._getFromAT(alts, entry) ||
						this._getFromMT(alts, entry) ||
						this._getFromLT(alts, entry) ||
						alts.defaultIcon, resolution);
		}
	},
	 
	/**
	 * Uses the definitions part of the config to look up a suitable 
	 * MetadataProfile for presenting the local metadata of the given entry.
	 * A MetadataProfile consists of an array of id/properties to use, 
	 * typically they should be used as a basis for constructing an rforms Template.
	 * An example of a MetadataProfile:
	 * {"items": [
	 *		"http://purl.org/dc/terms/title", 
	 *		"http://purl.org/dc/terms/description"]
	 * }
	 *  
	 * @param {Object} entry that the MetadataProfile should be used for.
	 * @return {Object} a MetadataProfile for the given entry.
	 */
	getMPForLocalMD: function(entry) {
		var alts = this.definitions["MPMap-localMetadata"];
		return this._resolveMPName(
				 this._getFromBT(alts, entry) ||
					this._getFromServices(alts, entry) ||
					this._getFromAT(alts, entry) ||
					this._getFromLT(alts, entry) ||
					alts.defaultMP);
	},
	
	/**
	 * Uses the definitions part of the config to look up the default 
	 * MetadataProfile for presenting the local metadata.
	 *  
	 * @return {Object} the default MetadataProfile given in the definitions-file.
	 */
	getDefaultMP: function() {
		var alts = this.definitions["MPMap-localMetadata"];
		if (alts.defaultMP){
			return this._resolveMPName(alts.defaultMP);
		} else {
			return "";
		}
	},

	/**
	 * Uses the definitions part of the config to look up a suitable 
	 * MetadataProfile for presenting the external metadata of the given entry.
	 * 
	 * @param {Object} entry that the MetadataProfile should be used for.
	 * @return {Object} a MetadataProfile for the given entry.
	 */
	getMPForExternalMD: function(entry) {
		var altsLocal = this.definitions["MPMap-localMetadata"];
		var altsExternal = this.definitions["MPMap-externalMetadata"];
		if (!altsExternal) {
			return this.getMPForLocalMD(entry);
		}
		
		/*
		 * Next block is used when the entry is an internal reference,
		 * ie when the external MD is on the same baseURI and builtinType == NONE
		 */
		var buiType = entry.getBuiltinType();
		if(buiType === folio.data.BuiltinType.NONE){
			var baseURI = entry.getContext().getBaseURI();
			var mdURI = entry.getExternalMetadataUri();
			if(mdURI && mdURI.indexOf(baseURI,0)>-1){
				var innerExternal = this._getMPFromInnerRef(altsExternal);
				var resolvedMP = this._resolveMPName(innerExternal);
				if(resolvedMP){
					return resolvedMP;
				}
			}
		}
		
		return this._resolveMPName(
				this._getFromBT(altsExternal, entry) ||
					this._getFromBT(altsLocal, entry) ||
					this._getFromServices(altsExternal, entry) ||
					this._getFromServices(altsLocal, entry) ||
					this._getFromAT(altsExternal, entry) ||
					this._getFromAT(altsLocal, entry) ||
					this._getFromLT(altsExternal, entry) ||
					this._getFromLT(altsLocal, entry) ||
					altsExternal.defaultMP ||
					altsLocal.defaultMP);
	},
	
	getMPLanguages: function() {
		if (this.definitions.MPLanguages) {
			return this.definitions.MPLanguages;
		}
	},
	
	getMPForType: function(type) {
		var alts = this.definitions["MPMap-localMetadata"];
		if (alts.AT == null) {
			return this._resolveMPName(alts.defaultMP);
		}
		return this._resolveMPName(alts.AT[type] || alts.defaultMP);
	},
	getComments: function() {
		return this.definitions.comments;
	},

	//=================================================== 
	// Inherited methods 
	//=================================================== 
	constructor: function(params) {
		dojo.mixin(this, params);
	},


	//=================================================== 
	// Private methods 
	//===================================================	 
	_resolveIconResolution: function(iconStruct, resolution) {
		if (resolution != null && iconStruct[resolution]) {
			return iconStruct.base+resolution+"/"+iconStruct.filename;			
		}
		return iconStruct.base+iconStruct.filename;
	},
	_resolveMPName: function(mPName) {
		var resolve = this.definitions.MPName2Id[mPName];
		if (resolve && !resolve.label) {
			resolve.lavel = this.definitions.labelFallback;
		}
		return  resolve || {items: [mPName], label: this.definitions.labelFallback};
	},
	_getFromServices: function(services2values, entry) {
	},
	_getFromBT: function(types2values, entry) {
		var bt = entry.getBuiltinType();
		if (bt !== folio.data.BuiltinType.NONE &&
			types2values.BT) {
			for (var key in folio.data.BuiltinType) {
				if (folio.data.BuiltinType[key] === bt) {
					return types2values.BT[key];
				}
			}
		}
	},
	_getFromLT: function(types2values, entry) {
		var lt = entry.getLocationType();
		if (types2values.LT) {
			for (var key in folio.data.LocationType) {
				if (folio.data.LocationType[key] === lt) {
					return types2values.LT[key];
				}
			}
		}
	},
	_getFromMT: function(types2values, entry) {
		var mt = entry.getMimeType();
		var alts = types2values.MT;
		if (alts == null || mt == null) {
			return;
		}
		var val = alts[mt];
		if (val != null) {
			return val;
		}
		if (mt.indexOf("/")) {
			return alts[mt.substring(0,mt.indexOf("/"))];
		}
	},

	_getFromAT: function(types2values, entry) {
		if (!types2values.AT) {
			return;
		}
		var md = entry.getMetadata();
		if (md != null) {
			var statements = md.find(entry.getResourceUri(), folio.data.RDFSchema.TYPE);
			var atArr = types2values.AT;
			for (var ind in atArr) {
				if (atArr.hasOwnProperty(ind)) {
					var expanded = this._expand(ind);
					for (var i=0;i<statements.length;i++) {
						var value = statements[i].getValue();
						if (expanded === value) {
							return atArr[ind];
						}
					}
				}
			}
		}
	},
	_expand: function(nsuri) {
		var arr = nsuri.split(":");
		if (arr.length === 2 && this.definitions.namespaces[arr[0]] != null) {
			return this.definitions.namespaces[arr[0]]+arr[1];
		}
		return nsuri;
	},
	_getMPFromInnerRef: function(types2MPs){
		return types2MPs.internalReferenceMP;
	}
});
