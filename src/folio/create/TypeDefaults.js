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

dojo.provide("folio.create.TypeDefaults");
dojo.require("dojo.store.Memory");

folio.create.getCreateLanguages = function(config) {
	var arr = [];
	var hash = config.definitions.languages;
	for (var key in hash) {
		var row = dojo.clone(hash[key]);
		row["id"] = key;
		row["label"] = row[key] || key;
		arr.push(row);
	}
	folio.create.createLanguages = arr;
	return folio.create.createLanguages;
};

folio.create.builtinType = dojo.map([
        {id:"context", en: "Portfolio", system: true},
        {id:"user", en:"User", system: true},
        {id:"group", en:"Group", system: true},
        {id:"list", en:"Folder", system: false},
        {id:"resultlist", en:"Search folder", system: false}], function(element) {
	return dojo.mixin(element, {scheme: "bT", rT:"informationresource"});
 });

folio.create.locationType = dojo.map([
        {id:"local", en: "In portfolio"},
        {id:"link", en: "Link"},
        {id:"reference", en:"Reference"}], function(element) {
	return dojo.mixin(element, {scheme: "lT"});
});

folio.create.representationType = dojo.map([
        {id:"informationresource", en: "Digital resource", advanced: false},
        {id:"resolvableinformationresource", en: "Resolvable digital resource", advanced: true},
        {id:"unkown", en:"Unkown", advanced: true},
        {id:"namedresource", en:"Named resource", advanced: false}], function(element) {
	return dojo.mixin(element, {scheme: "rT"});
});


folio.create.getCreateTypeStore = function(config) {
	if (!folio.create.mixedTypeStore) {//Should this check for folio.create.createTypeStore instead?
		folio.create._getNRApplicationType(config);
		folio.create.createTypes = dojo.clone(folio.create.builtinType).concat(dojo.clone(folio.create.nrApplicationType));
		folio.create.createTypeStore = new dojo.store.Memory({data: folio.create.createTypes});
	}
	return folio.create.createTypeStore;	
};

folio.create.getMixedTypeStore = function(config) {
	if (!folio.create.mixedTypeStore) {
		folio.create._getIRApplicationType(config);
		folio.create._getNRApplicationType(config);
		folio.create.builtinPlusApplicationType = dojo.clone(folio.create.builtinType).concat(dojo.clone(folio.create.nrApplicationType)).concat(dojo.clone(folio.create.irApplicationType));
		folio.create.mixedTypeStore = new dojo.store.Memory({data: folio.create.builtinPlusApplicationType});
	}
	return folio.create.mixedTypeStore;	
};
								
folio.create.getMimeTypeStore = function(config) {
	if (!folio.create.mimeTypeStore) {
		var mimeTypes = folio.create._convertHashToIdArray(config["definitions"]["mimeTypes"], config);
		mimeTypes.splice(0, 0, {id: " ", en: "Detect"});
		folio.create.mimeTypeStore = new dojo.store.Memory({data: mimeTypes});		
	}
	return folio.create.mimeTypeStore;
};

folio.create._getNRApplicationType = function(config) {
	if (!folio.create.nrApplicationType) {
		folio.create.nrApplicationType = dojo.map(folio.create._convertHashToIdArray(config["definitions"]["applicationTypes-NR"], config),  
			function(element) {
				return dojo.mixin(element, {scheme: "aT", rT: "namedresource"});
		});
	}
	return folio.create.nrApplicationType;
}

folio.create._getIRApplicationType = function(config) {
	if (!folio.create.irApplicationType) {
		folio.create.irApplicationType = dojo.map(folio.create._convertHashToIdArray(config["definitions"]["applicationTypes-IR"], config),
			function(element) {
				return dojo.mixin(element, {scheme: "aT", rT: "informationresource"});
		});
	}
	return folio.create.irApplicationType;
}

folio.create._convertHashToIdArray = function(hash, config) {
	var arr = [];
	for (var key in hash) {
		var row = dojo.clone(hash[key]);
		var nss = config.definitions.namespaces;
		for (var ns in nss) {
			if (key.indexOf(ns) === 0) {
				key = nss[ns]+ key.substr(ns.length+1);
				break;
			}
		}
		row["id"] = key;
		arr.push(row);
	}
	return arr;
};