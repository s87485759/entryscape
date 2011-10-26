/**
 * @author matthias
 */
dojo.provide("shame.engine.FM2JDIL");
dojo.require("jdil.EditableGraph");

dojo.declare("shame.engine.FM2JDIL", null, {
	constructor: function(template, namespaces) {
		this.template = template;
		this.namespaces = namespaces;
		this.gp = template.getGraphPattern();
		if (this.gp == undefined) {
			throw "Cannot convert FormModel to JDIL since there is no GraphPattern in the template.";
		}
	},
	convert: function(fm) {
		var gfi = fm.root;
		this.graph = new jdil.EditableGraph({"@id": gfi.getValue()}, this.namespaces);
		for (var i=0; i<gfi.children.length;i++) {
			var fmChild = gfi.children[i];
				if (fmChild instanceof shame.GroupGridNode) {
					this.convertGroupGridNode(this.gp, this.graph.getRoot(), fmChild, i);					
				} else {
					this.convertNode(this.gp, this.graph.getRoot(), fmChild);
				}
		}
		return this.graph;
	},
	convertNode: function(gpPos, graphPos, fmNode) {
		if (fmNode.isGroup()) {
			var newGpPos = gpPos;
			var newGraphPos = graphPos;
			var predFmNode, objFmNode;
			if (fmNode.getTemplateNode().getVariable()) {
				var gpPath = this.detectGPPath(gpPos, fmNode.getTemplateNode().getVariable().id); //Should always work.
				newGpPos = gpPath[gpPath.length-1];
				//If we have a constant on predicate position, build the path.
				if (newGpPos.predicate) {
					newGraphPos = this.buildPath(gpPath, graphPos, fmNode.getTemplateNode(), this.buildValueObj(fmNode));
				} else { //variabel on predicate position, find the predicate and object values and remember them so they are not added twice.
					newGraphPos = this.buildPath_except_last(gpPath, graphPos);
					predFmNode = this.findFMNode(fmNode, newGpPos.predicateVariable);
					objFmNode = this.findFMNode(fmNode, newGpPos.objectVariable);
					if (predFmNode == undefined || objFmNode == undefined) {
						return;
					}
					newGraphPos = this.buildPath_last(gpPath[gpPath.length-1], newGraphPos, objFmNode.getTemplateNode(), this.buildValueObj(objFmNode), predFmNode.getValue());
				}
			}
			for (var i=0;i<fmNode.children.length;i++) {
				var fmChild = fmNode.children[i];
				if (fmChild === predFmNode || fmChild === objFmNode) { //Do not add nodes that have already been added when variable on predicate position.
					continue;
				}
				//If groupGridNode, tell which position it is in so that a correct valueObject can be constructed
				//(the same groupGridNode is used for all values so you need to know which position in the parents children array it is in to get the correct value)
				if (fmChild instanceof shame.GroupGridNode) {
					this.convertGroupGridNode(newGpPos, newGraphPos, fmChild, i);					
				} else {
					this.convertNode(newGpPos, newGraphPos, fmChild);
				}
			}
		} else {
			var gpPath = this.detectGPPath(gpPos, fmNode.getTemplateNode().getVariable().id); //Should always work.
			this.buildPath(gpPath, graphPos, fmNode.getTemplateNode(), this.buildValueObj(fmNode));
		}
	},
	convertGroupGridNode: function(gpPos, graphPos, fmNode, fmNodeRepetition) {
		var gpPath = this.detectGPPath(gpPos, fmNode.getTemplateNode().getVariable().id); //Should always work.
		var newGpPos = gpPath[gpPath.length-1];

		var valueStruct = fmNode.getParent().struct.c[fmNodeRepetition];
		//Only supports blanks in groupGridNode position.
		var valueObj = this.graph.createNewBlank();
		//Only supports static predicate yet, build the path.
		var newGraphPos = this.buildPath(gpPath, graphPos, fmNode.getTemplateNode(), valueObj);
		
		for (var i=0;i<valueStruct.c.length;i++) {
			var fmChildStruct = valueStruct.c[i];
			var childTn = fmNode.getTemplateNode().getTemplate().getNode(fmChildStruct.r);
			gpPath = this.detectGPPath(newGpPos, childTn.getVariable().id); //Should always work.
			this.buildPath(gpPath, newGraphPos, childTn, this.buildValueObjFromStruct(childTn, fmChildStruct));
		}
	},
	findFMNode: function(fmNode, variable) {
		//Check breadth first
		for (var i=0;i<fmNode.children.length;i++) {
			if (fmNode.children[i].getTemplateNode().getVariable().id == variable) {
				return fmNode.children[i];
			}
		}

		//Then check deeper.
		for (var i=0;i<fmNode.children.length;i++) {
			if (fmNode.children[i].isGroup()) {
				var found = this.findFMNode(fmNode.children[i], variable);
				if (found) {
					return found;
				}
			}
		}
	},
	buildPath: function(path, graphPos, templateNode, valueObject) {
		var subj = this.buildPath_except_last(path, graphPos);
		return 	this.buildPath_last(path[path.length-1], subj, templateNode, valueObject);
	},
	buildPath_except_last: function(path, graphPos) {
		var subjObj = graphPos;
		for (var p=0;p<path.length-1;p++) {
			var newObj = this.graph.createNewBlank();
			this.graph.add(subjObj, this.graph.getCanonicalURI(path[p].predicate), newObj);
			this.addConstraints(newObj, path[p]);
			subjObj = newObj;
		}
		return subjObj;
	},
	buildValueObj: function(fmNode) {
		return this.buildValueObjFromStruct(fmNode.getTemplateNode(), fmNode.struct);
	},
	buildValueObjFromStruct: function(formTemplate, struct) {
		var obj;
		var variable = formTemplate.getVariable();
		if (variable.isLiteral()) {
			obj = {"@value": shame.base.getValue(struct)};
			if (shame.base.hasLanguage(struct)) {
				obj["@language"] = struct.d.l;
			}
			if (variable.isDatatype()) {
				obj["@datatype"] = variable.getDatatype();
			}
		} else {
			if (variable.isURI()) {
				obj = {"@id": shame.base.getValue(struct)};
			} else {
				obj = this.graph.createNewBlank();
			}
		}
		return obj;
	},
	buildPath_last: function(gpPos, graphPos, templateNode, obj, explicitPredicate) {
		if (explicitPredicate) {
			this.graph.add(graphPos, this.graph.getCanonicalURI(explicitPredicate), obj);		
		} else  {
			this.graph.add(graphPos, this.graph.getCanonicalURI(gpPos.predicate), obj);			
		}
		if (templateNode.getType() != "choice") {
			this.addConstraints(obj, gpPos);
		}
		return obj;
	},
	addConstraints: function(graphPos, gpPos) {
		if (gpPos.objectConstraints) {
			for (pred in gpPos.objectConstraints) {
				var constr = gpPos.objectConstraints[pred];
				this.graph.add(graphPos, this.graph.getCanonicalURI(pred), {"@id": this.graph.getCanonicalURI(constr)});
			}
		}
	},
	detectGPPath: function(gpPos, variableId) {
		var path = this._detectGPPath(gpPos, variableId);
		if (path) {
			path.reverse();
			return path.slice(1);
		}
	},
	_detectGPPath: function(gpPos, variableId) {
		if (gpPos.objectVariable == variableId || 
			gpPos.predicateVariable == variableId) {
			return [gpPos];
		} else if (gpPos.paths) {
			for (var i=0;i<gpPos.paths.length;i++) {
				var gpPath = this._detectGPPath(gpPos.paths[i], variableId);
				if (gpPath) {
					gpPath.push(gpPos);
					return gpPath;
				}
			}
		}
	}
});