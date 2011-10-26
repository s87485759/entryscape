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

dojo.provide("jdil.EditableGraph");
dojo.require("jdil.Graph");

dojo.declare("jdil.EditableGraph", jdil.Graph, {
	constructor: function(){
		this.counter = 1;
	},
	createNewBlank: function() {
		var nid = "_"+this.counter++;
		var nblank = {"@id": nid, "@isBlank": true};
		this.resources[nid] = nblank; 
		return nblank;
	},
	_addToReversedIndex: function(object, subject) {
		if (!this.objects2Subjects) {
			this.objects2Subjects = {};
		}
		var arr = this.objects2Subjects[object["@id"]];
		if (arr) {
			arr.push(subject);
		} else {
			var narr = [];
			narr.push(subject);
			this.objects2Subjects[object["@id"]] = narr;
		}
	},
	
	//debugger i javascript.
	
	_removeFromReversedIndex: function(object, subject) {
		var arr = this.objects2Subjects[object["@id"]];
		if (arr) {
			arr.splice(dojo.indexOf(subject), 1);
			if (arr.length == 0) {
				delete this.objects2Subjects[object["@id"]];
			}
		}
	},
	_getReferences: function(object) {
		if (this.objects2Subjects) {
			return this.objects2Subjects[object["@id"]];
		}
	},
	remove: function(/*String OR Object*/ subject, /*String?*/ predicate, /*String? OR Object?*/ object, /*Boolean?*/ recurse) {
		var subj = this.get(subject);
		if (!subj) {
			return false;
		}
		//predicate not given, maybe object
		if (!predicate) {
			for (var pred in subj) {
				if (pred.charAt(0) != "@") {
					this._remove(subj, pred, object, recurse);
				}
			}
			this._removeResourceIfAlone(subj);
			return true;
		}
		//predicate given, maybe object.
		var result = this._remove(subj, predicate, object, recurse);
		this._removeResourceIfAlone(subj);		
		return result;
	},
	_remove: function(subj, pred, object, recurse) {
		var obj = subj[pred];
		if (typeof obj == "undefined") {
			return false;
		}
		if (dojo.isArray(obj)) {
			if (object) {
				var index = dojo.indexOf(obj, object);
				if (index != -1) {
					if (obj[index]["@id"]) {
						this._removeFromReversedIndex(obj[index], subj);
						if (recurse && !this._getReferences(obj[index])) {
							this.remove(obj[index], null, null, recurse);
						}
					}
					obj.splice(index, 1);
					if (obj.length == 0) {
						delete subj[pred];
					} else if (obj.length == 1) {
						subj[pred] = subj[pred][0];
					}
				} else {
					return false;
				}
			} else {
				for (var i=0;i<obj.length;i++) {
					if (obj[i]["@id"]) {
						this._removeFromReversedIndex(obj[i], subj);
						if (recurse && !this._getReferences(obj[i])) {
							this.remove(obj[i], null, null, recurse);
						}
					}
				}
				delete subj[pred];
			}
		} else if (!object || obj == object) {
			if (obj["@id"]) {
				this._removeFromReversedIndex(obj, subj);
				if (recurse && !this._getReferences(obj)) {
					this.remove(obj, null, null, recurse);
				}
			}
			delete subj[pred];
		} else {
			return false;
		}
		return true;
	},
	removeResource: function(resource, recurse) {
		var subjects = this.objects2Subjects[resource["@id"]];
		if (subjects) {
			for (var i=0;i<subjects.length; i++) {
				this.remove(subjects[i], null, resource);
			}
		}
		return this.remove(resource, null, null, recurse);
	},
	_removeResourceIfAlone: function(resource) {
		for (var pred in resource) {
			if (pred.charAt(0) != "@") {
				return;
			} else if (pred == "@Seq" || pred == "@Bag" || pred == "@Alt") {
				if (dojo.isArray(resource[pred]) && resource[pred].length == 0) {
					return;
				}
			}
		}
		if (this._getReferences(resource)) {
			return;
		}
		delete this.resources[resource["@id"]];
	}
 });