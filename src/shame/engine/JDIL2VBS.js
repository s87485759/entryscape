/**
 * @author matthias
 */
dojo.provide("shame.engine.JDIL2VBS");

dojo.declare("shame.engine.JDIL2VBS", null, {
	constructor: function(template, ontologies) {
		this.template = template;
		this.ontologies = ontologies;
		this.gp = template.getGraphPattern();
		this.v2voc = {};
		this.extractVariable2VocabularyMapping(this.template.getRootNode());
	},
	extractVariable2VocabularyMapping: function(tnode) {
		if (tnode.isChoice() && tnode.hasVocabulary()) {
			this.v2voc[tnode.getVariableRef()] = tnode.getVocabularyStore();
		} else if (tnode.isGroup()) {
			var children = tnode.getChildren();
			if (dojo.isArray(children)) {
				for (var i=0;i<children.length;i++) {
					this.extractVariable2VocabularyMapping(children[i]);
				}
			}
		}
	},
	convert: function(graph) {
		var root = graph.getRoot();
		return {variable: this.gp.objectVariable, 
				value: root["@id"],
				children: this.getChildren(graph, root, this.gp.paths)};		
	},
	getChildren: function(graph, resource, paths) {
		var result = [];
		for (var pathNr in paths) {
			var path = paths[pathNr];
			var objVar = this.template.getVariable(path.objectVariable);
			if (path.predicate) {
				var uri = graph.getNamespacedURI(path.predicate);
				if(uri == path.predicate){
					uri = this._createNSUri(graph, path.predicate);
				}
				result = result.concat(this.match(path, uri, graph, resource, objVar));
			} else {
				var predVar = this.template.getVariable(path.predicateVariable);					
				var self = this;
				dojo.forEach(graph.getPredicates(resource), function(predicate) {
					if (self.fullfillsConstraints({"@id" :predicate}, graph, predVar, path.predicateConstraints)) {
						var objs = self.match(path, predicate, graph, resource, objVar);
						dojo.forEach(objs, function(obj) {
							result.push({variable: predVar.id,
								   		 value: {v: predicate},
								   		 children: [obj]});
						});
					}
				});
			}
		}
		return result;
	},
	_createNSUri: function (graph, uri){
		var graphNS = graph.getNamespaces();
		var ns = "oens";
		var i = 1;
		while(graphNS.namespaces[ns]){
			ns = ns+i;
			i++;
		}
		var h = uri.lastIndexOf('#');
		var slash = uri.lastIndexOf('/');
		var generalPart;
		var specificPart;
		if(slash>h){
			generalPart = uri.substring(0,slash+1);
			specificPart = uri.substring(slash+1);
			graphNS.namespaces[ns] = generalPart; 
		}else{
			generalPart = uri.substring(0,h+1);
			specificPart = uri.substring(h+1);
			graphNS.namespaces[ns] = generalPart; 
		}
		return ns+':'+specificPart;
	},
	match: function(path, predicate, graph, resource, variable) {
		var result = [];
		var objs;
		if (predicate != "rdfs:member") {
			objs = graph.getCanonicalObject(predicate, resource);
			if(!objs && path.predicate != predicate){  //Namespaces are not always used, trying with full URI
				objs = graph.getCanonicalObject(path.predicate, resource);
			}
			if (!dojo.isArray(objs)) {
				if (objs) {
					objs = [objs];
				} else {
					objs = [];
				}
			}
		} else  {
			objs = graph.getMemberObjects(resource);
		}
		for (var i=0;i<objs.length;i++) {
			if (this.isAMatch(objs[i], graph, variable, path.objectConstraints)|| variable.isLiteral()) {//last condition only to be used in presentation-mode
				var val = this.createValue(objs[i], variable, graph);
				if (objs[i]["@id"] && path.paths) {
					var childrenVbs = this.getChildren(graph, objs[i], path.paths);
					if (childrenVbs.length > 0) {
						val.children = childrenVbs;
					}
				}
				result.push(val);
			}
		}
		return result;
	},
	isAMatch: function(obje, graph, variable, constraints) {
		return this.matchesVariable(obje, variable) 
			&& this.fullfillsConstraints(obje, graph, variable, constraints);
	},
	fullfillsConstraints: function(obje, graph, variable, constraints) {
		if (this.v2voc[variable.id] != undefined) {
			var store = this.v2voc[variable.id];
			if (!store._loadFinished)  {
				store._loadFinished = true;
				store._getItemsFromLoadedData(store._jsonData);
				store._jsonData = null;
			}

			if (store._getItemByIdentity(variable.isResource() ? obje["@id"] : obje["@value"]) != null) {
					return true;
			}
			return false;
		}
		if (constraints) {
			var graphs = this.ontologies ? [graph].concat(this.ontologies) : [graph];
			for (var predicate in constraints) {
//				var nsPredicate = graph.getNamespacedURI(predicate);
				if (!dojo.some(graphs, function(g) {
					//Checks wether the constraint is fullfilled in graph g.
					//Check all objects for the given predicate.
					var constrMatchings;
					if(obje["@id"]){
					   constrMatchings = g.getObjectAsArray(predicate, obje["@id"]);
					} else {
						constrMatchings = g.getObjectAsArray(predicate, obje);
					}
					return constrMatchings.length != 0 && dojo.some(constrMatchings, function(co) {
						//Does this statement (object for the searched for predicate) fulfill the constraint?
						return co["@id"]==graph.getNamespacedURI(constraints[predicate]) || co["@id"]==constraints[predicate];
					});
				})) {
					//Constraint was not fullfilled in any of the graphs.
					return false;
				}
			}
		}
		//All constraints where fullfilled in some of the graphs.
		return true;
	},
	matchesVariable: function(obje, variable) {		
		if (variable.isResource()) {
			var id = obje['@id'];
			if (!id) {
				return false;
			}
			if (variable.isBlank() && !obje["@isBlank"]) {
				return false;
			}
			if (variable.isURI() && obje["@isBlank"]) {
				return false;
			}
		} else {
			if (variable.requiresLanguage() && !obje["@language"]) {
				return true; //TODO: Dirty hack...
			}
			if (variable.forbiddsLanguage() && obje["@language"]) {
				return false;
			}
			if (variable.isDatatype() && obje["@datatype"] != variable.getDatatype()) {
				return false;
			}
		}
		return true;
	},

//TODO SHAME expression for RDF nodes differs from jdil expression, unneccessary.
//Change SHAME to JDIL, i.e. use "@value" instead of "v" etc.
	createValue: function(obj, variable, graph) {
		if (variable.isResource()) {
			if(!variable.isBlank() && graph.getNamespacedURI(obj["@id"]) == obj["@id"]){
				return {variable: variable.id,
				    value: {v: graph.getCanonicalURI(obj["@id"])}};
			}
			return {variable: variable.id,
				value: {v: obj["@id"]}};
		} else if(variable.forbiddsLanguage()) {
			return {variable: variable.id,
				    value: {v: obj["@value"]}};
		}else {
		    var re = {variable: variable.id,
				value: {v: obj["@value"]}};
		    if (obj["@language"]) {
		    	re.value.l = obj["@language"];
		    }
		    return re;
		}
	}
});