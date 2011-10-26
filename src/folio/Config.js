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
	"unloadDialog": 		true,
	"scamPath": 			"scam",
	"definitionsPath": 		"definitions",
	"CLI": 					false,
	"app": 					"folio.apps.Default",

	//=================================================== 
	// Public API 
	//===================================================	 
	/**
	 * Uses the definitions part of the config to look up a suitable 
	 * MetadataProfile for presenting the local metadata of the given entry.
	 * A MetadataProfile consists of an array of id/properties to use, 
	 * typically they should be used as a basis for constructing an rforms Template.
	 * An example of a MetadataProfile:
	 * {"items": [
	 * 		"http://purl.org/dc/terms/title", 
	 * 		"http://purl.org/dc/terms/description"]
	 * }
	 *  
	 * @param {Object} entry that the MetadataProfile should be used for.
	 * @return {Object} a MetadataProfile for the given entry.
	 */
	getMPForLocalMD: function(entry) {
		var alts = this.definitions["MPMap-localMetadata"];
		return this._resolveMPName(
				 this._getMPFromBT(alts, entry.getBuiltinType())
				 || this._getMPFromServices(alts, entry)
				 || this._getMPFromAT(alts, entry)
				 || alts["defaultMP"]);
	},
	
	/**
	 * Uses the definitions part of the config to look up the default 
	 * MetadataProfile for presenting the local metadata.
	 *  
	 * @return {Object} the default MetadataProfile given in the definitions-file.
	 */
	getDefaultMP: function() {
		var alts = this.definitions["MPMap-localMetadata"];
		if (alts["defaultMP"]){
			return  this._resolveMPName(alts["defaultMP"]);
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
				this._getMPFromBT(altsExternal, entry.getBuiltinType())
				 || this._getMPFromBT(altsLocal, entry.getBuiltinType())
				 || this._getMPFromServices(altsExternal, entry)
				 || this._getMPFromServices(altsLocal, entry)
				 || this._getMPFromAT(altsExternal, entry)
				 || this._getMPFromAT(altsLocal, entry)
				 || altsExternal["defaultMP"]
				 || altsLocal["defaultMP"]);
	},
	
	getMPLanguages: function() {
		if (this.definitions.MPLanguages) {
			return this.definitions.MPLanguages;
		}
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
	_resolveMPName: function(mPName) {
		return this.definitions["MPName2Id"][mPName];
	},
	_getMPFromServices: function(services2MP, entry) {
	},
	_getMPFromBT: function(types2MPs, bt) {
		if (bt !== folio.data.BuiltinType.NONE &&
			types2MPs["BT"]) {
			for (var key in folio.data.BuiltinType) {
				if (folio.data.BuiltinType[key] === bt) {
					return types2MPs["BT"][key] || defaultMP;
				}
			}
		}
	},

	_getMPFromAT: function(types2MPs, entry) {
		if (!types2MPs["AT"]) {
			return;
		}
		var statements = entry.getMetadata().find(entry.getResourceUri(), folio.data.RDFSchema.TYPE);
		var atMap = types2MPs["AT"]
		for (var i=0;i<statements.length;i++) {
			if (atMap[statements[i].getValue()]) {
				return atMap[statements[i].getValue()];
			}
		}
	},
	_getMPFromInnerRef: function(types2MPs){
		return types2MPs["internalReferenceMP"];
	}
});
