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

dojo.provide("jdil.Graph");
dojo.require("jdil.Namespaces");

dojo.declare("jdil.Graph", null, { // Creates a new Graph. Uses namespaces to put names in the correct context.
	constructor: function(rootResource, namespaces){
		this.resources = {};
		this.namespaces = namespaces;
		if (rootResource && rootResource["@id"]) {
			if (rootResource["@namespaces"]) {
				this.namespaces = new jdil.Namespaces({namespaces: rootResource["@namespaces"], 
										parent: this.namespaces});
			}
			this.root = this.getCanonicalURI(rootResource["@id"]); // changes namespace
			this.addResource(rootResource);
		}
	},
	getNamespaces: function() {
		return this.namespaces;
	},
	_addToReversedIndex: function(object, subject) {
	},
	_removeFromReversedIndex: function(object, subject) {
	},
	_addObjects: function(objects, fromSubject) {
		var nobjs = [];
		for (var i=0; i<objects.length; i++) {
			var obj = objects[i];
			if (obj["@id"]) {
				obj = this.addResource(obj);
				this._addToReversedIndex(obj, fromSubject);
			}
			nobjs.push(obj);
		}
		return nobjs;
	},
	_addObject: function(object, fromSubject) {
		if (dojo.isArray(object)) {
			return this._addObjects(object, fromSubject);
		} else if (object["@id"]) {
			object = this.addResource(object);
			this._addToReversedIndex(object, fromSubject);			
			return object;
		} else {
			return object;
		}
	},
	addResource: function(resource) {
		var uri = this.getCanonicalURI(resource["@id"]); //Changes namespace
		if (!uri) {
			return;
		}
		for (var pred in resource) {
			if (pred.charAt(0) != "@" || pred == "@Bag" || pred == "@Seq" || pred == "@Alt") {
				this.add(uri, pred, resource[pred]);
			}
		}
		var newResource = this.resources[uri];
		if (!newResource) {
			newResource = {"@id": uri};
			this.resources[uri] = newResource;
		}
		if (resource["@isBlank"]) {
			newResource["@isBlank"] = true;
		}
		return newResource;
	},
	add: function(/*String or Object*/  subject, /*String*/ predicate, /*Object*/ object) {
		var sr;
		if (dojo.isString(subject)) {
			if (!this.resources[subject]) {
				this.resources[subject] = {"@id": subject};
			}
			sr = this.resources[subject];
		} else {
			sr = subject;
		}
		var isStarred = predicate.charAt(0) == '*';
		if (isStarred) {
			predicate = predicate.substring(1);
			if (dojo.isArray(object)) {
				object = dojo.map(object, function(item) {return {"@id": item}});
			} else if (dojo.isString(object)){
				object = {"@id": object};
			} else {
				return;
			}
		}
		
		//Expand namespace for predicate
		predicate = this.getCanonicalURI(predicate);
		//Expand namespace for (all) object(s)
		var self = this;
		if (dojo.isArray(object)) {
			dojo.forEach(object, function(member) {
				if (dojo.isObject(member) && member["@id"]) {
					member["@id"] = self.getCanonicalURI(member["@id"]);
				}
			});
		} else if (dojo.isObject(object) && object["@id"]) {
			object["@id"] = this.getCanonicalURI(object["@id"]);
		}
		
		if (!sr[predicate]) {
			sr[predicate] = this._addObject(object, sr);
		} else if (dojo.isArray(sr[predicate])) {
			var newobj = this._addObject(object, sr);
			if (dojo.isArray(newobj)) {
				sr[predicate].concat(newobj);
			} else {
				sr[predicate].push(newobj);
			}
		} else {
			var na = [];
			na.push(sr[predicate]);
			var newobj = this._addObject(object, sr);
			if (dojo.isArray(newobj)) {
				na.concat(newobj);
			} else {
				na.push(newobj);
			}
			sr[predicate] = na;
		}
	},
	get: function(/*String*/ subject) {
		if (dojo.isString(subject)) {
			return this.resources[subject];
		} else if (subject) {
			return subject["@id"] ? this.resources[subject["@id"]] : undefined;
		} else if (this.root) {
			return this.resources[this.root];
		}
		return;
	},
	getRoot: function() {
		return this.get();
	},
	_findSubject: function(subject) {
		if (!subject) {
			if (this.root) {
				return this.resources[this.root];
			}
			return;
		} else if (dojo.isString(subject)) {
			return this.get(subject);
		} else {
			if (subject["@id"] && this.get(subject["@id"])) {
				return subject;
			}
			return;
		}
	},
	getPredicates: function(/*String OR Object*/ subjectUri) {
		var subj = this._findSubject(subjectUri);
		if (!subj) {
			return;
		}
		var arr = [];
		for (var pred in subj) {
			if (pred.charAt(0) != "@") {
				arr.push(pred);
			}
		}
		return arr;
	},
	_canonize: function(obj) {
		if (dojo.isString(obj)) {
			return {"@value":obj};
		} else if (dojo.isArray(obj)) {
			return dojo.map(obj, function(item) {return dojo.isString(item) ? {"@value": item} : item});
		}
		return obj;	
	},
	getMemberObjects: function(/*String? OR Object?*/subject) {
		var subj = this._findSubject(subject);
		if (!subj) {
			return;
		}
		var arr = [];
		for (var pred in subj) {
			if (pred.indexOf(folio.data.RDFBaseUri+"_") == 0) { //Match expanded namespace.
				arr[0 + pred.slice(5,1)] = this.getCanonicalObject(pred, subj);
			}
		}
		return arr;
	},
	getObject: function(/*String*/ predicate, /*String? OR Object?*/subject) {
		var subj = this._findSubject(subject);
		if (!subj) {
			return;
		}
		var obj = subj[predicate];
		if (typeof obj == "undefined") {
			return;
		}
		return obj;
	},
	getObjectAsArray: function(/*String*/ predicate, /*String? OR Object?*/subject) {
		var obj = this.getObject(predicate, subject);
		if (typeof obj == "undefined") {
			return [];
		}
		if (dojo.isArray(obj)) {
			return obj;
		} else {
			return [obj];
		}
	},
	getCanonicalObject: function(/*String*/ predicate, /*String? OR Object?*/subject) {
		return this._canonize(this.getObject(predicate, subject));
	},
	getFirstObject: function(/*String*/ predicate, /*String OR Object*/subject) {
		var obj = this.getObject(predicate, subject);
		if (typeof obj == "undefined") {
			return;
		}
		if (dojo.isArray(obj)) {
			return obj[0];
		} else {
			return obj;
		}
	},
	getCanonicalFirstObject: function(/*String*/ predicate, /*String OR Object*/subject) {
		return this._canonize(this.getFirstObject(predicate, subject));
	},
	getFirstObjectValue: function(/*String*/ predicate, /*String OR Object*/ subject) {
		var obj = this.getFirstObject(predicate, subject);
		if (typeof obj == "undefined") {
			return;
		}
		if (dojo.isString(obj)) {
			return obj;
		} else if (obj["@id"]) {
			return obj["@id"];
		}else if (obj["@value"]) {
			return obj["@value"];
		} else {
			return;
		}
	},
	getCanonicalURI: function(nsuri) {
		if (!jdil.isURI_simple(nsuri)) {
			if (this.namespaces) {
				return this.namespaces.getCanonicalURI(nsuri);
			}
			throw "Cannot make canonical URI since there are no namespace definitions.";
		}
		return nsuri;
	},
	getNamespacedURI: function(uri) {
		if (this.namespaces) {
			return this.namespaces.getNamespacedURI(uri);
		}
		return uri;
	}
 });