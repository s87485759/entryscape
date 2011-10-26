dojo._hasResource["shame.GroupNode"] = true;
dojo.provide("shame.GroupNode");
dojo.require("shame.FormNode");
dojo.require("dijit.form.Button");

dojo.declare("shame.AbstractGroupNode", shame.AbstractFormNode, {
	constructor: function (struct, templateNode, formModel) {
		this.formModel = formModel;
		this.children = null;

		this.setChildren(this.parseChildren(struct, templateNode.getTemplate()));
		this.detectInitialStub();
	},
	parseChildren: function(struct, template) {
		if (typeof struct.c == "undefined") {
			return [];
		}
	
		var childArray = [];
		for (i in struct.c) {
			child = struct.c[i];
			if (i == 0) {
				childArray.push(this.formModel.createFormNode(child, template));
				childArray[childArray.length-1].manage(child);
			} else {
				if (childArray[childArray.length-1].manage(child)) { //Give the formNode a chance to manage the next formItem.
					childArray.push(childArray[childArray.length-1]);
				} else {
					childArray.push(this.formModel.createFormNode(child, template));					
					childArray[childArray.length-1].manage(child);
				}
			}
		}
		return childArray;
    },
	removeChild: function (formNode, ignoreCardinality) {
		var occ = this.getOccurenceOfChild(formNode);		

		var index = dojo.indexOf(this.children, formNode);
		
		var tn = formNode.getTemplateNode();
		if (occ == 1 && !ignoreCardinality) {
			if (tn.getType() != "group"
				|| tn.getPreferredOccurence() > 0) {
				this.children.splice(index, 1);
				this.struct.c.splice(index, 1);
				this._createChild(index, tn);
			} else {
				//group as stubb
				formNode.toggleStub();
			}
		} else {
			this.children.splice(index, 1);
			this.struct.c.splice(index, 1);
			for (i in this.children) {
				if (this.children[i].getTemplateNode() == tn) {
					this.children[i].updateOccurenceModifiers(occ - 1);
				}
			}	
		}
	},
	duplicateChild: function (formNode) {
		var occ = this.getOccurenceOfChild(formNode);
		var index = dojo.indexOf(this.children, formNode);
		var nc = this._createChild(index + 1, formNode.getTemplateNode());
		for (i in this.children) {
			if (this.children[i].getTemplateNode() == formNode.getTemplateNode()) {
				this.children[i].updateOccurenceModifiers(occ + 1);
			}
		}
		if (formNode.getTemplateNode().getType() == "group" && nc.isStub()) {
			nc.toggleStub();
		}
	},
	_createChild: function (index, templateNode, recursiveChildrenCreation) {	
		var nstruct = {r: templateNode.getId(), d: {}};
		if (!this.struct.c) {
			this.struct.c = [];
		}
		var newchild = this.formModel.createFormNode(nstruct, templateNode.getTemplate());
		newchild.setParent(this);
		this._insertChild(index, nstruct, newchild);
		var belement = null;
		if (index+1 != this.children.length) {
			belement = this.children[index + 1].getBeforeElement();
		}
		if (this.formModel.isHtmlGenerated()) {
			newchild.generateHtml(this.getChildContainer(), belement);			
		}

		if (recursiveChildrenCreation !== false && templateNode.getType() == "group" && !newchild.isStub()) {
			newchild.createChildren();
		}
		return newchild;
	},
	_insertChild: function(index, struct, node) {
		this.struct.c.splice(index, 0, struct);
		this.children.splice(index, 0, node);
	},
	removeChildren: function() {
		this.children = [];
		this.struct.c = [];		
	},
	createChildren: function() {
		this.removeChildren();
		var tchildren = this.getTemplateNode().getChildren();
		for (var i in tchildren) {
			this._createChild(parseInt(i), tchildren[i], false);
		}
		var c = this.children.slice();
		for (var j=0;j<c.length; j++) {
			var child = c[j];
			if (child.getTemplateNode().getType() == "group" && !child.isStub()) {
				child.createChildren();
			}
		}
	},
	/*
	 * Removes itself if empty.
	 * Returnes true if it contains some value.
	 */
	removeEmptyNodes: function() {
		var empty = true;
		var tchildren = [].concat(this.children);
		var last;
		for (var i in tchildren) {
			var child = tchildren[i];
			if (last === child) {
				continue;
			}
			last = child;
			if (child.isGroup()) {
				if (child.removeEmptyNodes()) {
					empty = false;
				}
			} else if (child.hasValue()) {
				empty = false;
			} else {
				child.destruct(true);
			}
		}
		if (empty) {
			this.destruct(true);
		}
		return !empty;
	},
	createMissingChildren: function() {
		var cindex = 0;
		var tchildren = this.getTemplateNode().getChildren();
		for (var i=0;i<tchildren.length;i++) {
			if (!this.children[cindex]) { //If at end in childarray.
				this._createChild(cindex, tchildren[i], false);
				cindex++;
			} else {
				if (this.children[cindex].getTemplateNode() == tchildren[i]) { //If we find a match.
					while (this.children[cindex] && this.children[cindex].getTemplateNode() == tchildren[i]) {
						cindex++;
					}
				} else { //no match, insert new child for the missing templatenode.
					this._createChild(cindex, tchildren[i], false);
					cindex++;
				}
			}
		}

		//Now, createMissing children on the preexisting children.
		var c = this.children.slice();
		for (var j=0;j<c.length;j++) {
			if (c[j].getTemplateNode().getType() == "group" &&  !c[j].isStub()) {
				if (j == 0 || c[j] != c[j-1]) { //Avoid calling for instance the same GroupGridNode multiple times.
					c[j].createMissingChildren(); //create missing children recursively.
				}
			}
		}
	},
	setChildren: function(children) {
		this.children = children;
		for (i in children) {
			children[i].setParent(this);
		}
	},
	markAndReportIfMissingMandatory: function() {
		var report = false;
		var tn = this.getTemplateNode();
		if (tn) {
			if(tn.getMinOccurence() > 0) {
			   for (var i=0;i<this.children.length;i++) {
				   if (this.children[i].markAndReportIfMissingMandatory()) {
					   report = true;
				   }
			   }
		   } else {
			  	var underHasValue = false;
		   	     for (var i=0;i<this.children.length;i++) {
				 	if(this.children[i].hasValue()){
						underHasValue = true;
						break;
					}
				 }
				 if(underHasValue){
				 	for (var i=0;i<this.children.length;i++) {
				      if (this.children[i].markAndReportIfMissingMandatory()) {
					      report = true;
				      }
			      }
				}
		   }
		}
		return report;
	},
	updateEditState: function(newState, editState) {
		if (this.inherited("updateEditState", arguments)) {
			for (var i=0;i<this.children.length;i++) {
				this.children[i].updateEditState(newState, editState);
			}
		}
	},
	detectInitialStub: function() {
		this.stub = this.children.length == 0 && this.getTemplateNode().getPreferredOccurence() == 0;
	},
	isStub: function() {
		return this.stub;
	},
	toggleStub: function() {
		this.stub = !this.stub;
		if (this.formModel.isHtmlGenerated()) {
			this.removeHtml();
			this.generateHtml(this.getContainer(), this.getBeforeElementForMe());			
		}
		if (this.stub) {
			this.removeChildren();
		} else {
			this.createChildren();
		}
	},
	getBeforeElementForMe: function () {
		if (this.getParent()) {
			var pchildren = this.getParent().children;
			var index = dojo.indexOf(pchildren, this);
			if (pchildren[index + 1]) {
				return pchildren[index + 1].getBeforeElement();
			}
		}
		return null;
	},
	getOccurenceOfChild: function(child) {
		tid = child.getTemplateNode().getId();
		counter = 0;
		for (i in this.children) {
			ctid = this.children[i].getTemplateNode().getId();
			if (ctid == tid) {
				counter++;
			}
		}
		return counter;
	},
	getChildContainer: function() {
		return null; //Must override!
	},
	getContainer: function () {
		//Must override
	},
	isGroup: function() {
		return true;
	}
});

dojo.declare("shame.GroupNode", shame.AbstractGroupNode, {
	constructor: function (struct, templateNode, formModel) {
		this.container = null;
		this.childContainer = null;
		this.head = null;
		this.group = null;
	},
	getContainer: function () {
		return this.container;
	},
	getBeforeElement: function() {
		return this.head;
	},
	getChildContainer: function() {
		return this.childContainer;
	},
	generateHtml: function(container, beforeRef) {
		var tn = this.getTemplateNode();
		var hiddenValue = tn.hasStyle("HiddenValue");
		var hidden = tn.hasStyle("Hidden");
		var noIndent = tn.hasStyle("NoIndent");
		if (hidden) {
			return;
		}
		this.container = container;
		this.head = document.createElement("tr");
		var psibling = this.getPreviousSibling();
		if (psibling != null && psibling.isGroup()) {
			this.head.className = "shameGroupHead shameGroupPop";
		} else {
			this.head.className = "shameGroupHead shameGroupLevel";
		}
		
		if (!hiddenValue) {
			//Group Label
			var label = document.createElement("td");
			label.className = "shameLabel";
			var labelValue = this.getTemplateNode().getLabel(["l-"+dojo.locale, 'l-en']);
			if(!labelValue){
				labelValue = "";
			}
			label.innerHTML = labelValue.wordWrap(shame.base.wrapLength, "<br/>", 1);
			this.head.appendChild(label);


			//Group Mult
			if (!this.isPresentation()) {
				var mult = document.createElement("td");
				mult.className = "shameMult";
				this.head.appendChild(mult);
			}
			
			if (this.getTemplateNode().hasDescription()) {
				this.getFormModel()._connectToTooltip(label, this.getTemplateNode().getDescription(["l-"+dojo.locale, 'l-en']));
			}
		}
		this.container.insertBefore(this.head, beforeRef);
		this.group = null;
		
		if (!this.stub) {
			//Cardinality as mult
			if (!this.isPresentation() && !hiddenValue) {
				shame.FormNode.generateCardinality(this, mult);
			}
		
			//Group
			this.group = document.createElement("tr");
			var td =  document.createElement("td");
			if (!noIndent) {
				td.className = "shameIndent";
			}
			td.colSpan = 3;
			this.group.appendChild(td);
			var table = document.createElement("table");
			table.className = "shameGroup";
			td.appendChild(table);
			this.childContainer = document.createElement("tbody");
			table.appendChild(this.childContainer);
			
			for(i in this.children) {
				this.children[i].generateHtml(this.childContainer, null);
			}
			
			this.container.insertBefore(this.group, beforeRef);
		} else {
			//Stub as mult
			var stub = document.createElement("input");
			if (!this.isPresentation() && !hiddenValue) {
				mult.appendChild(stub);
			}
			var item = this;
			var stubFunction = function() {
				item.toggleStub();
			};
			new dijit.form.Button({label: this.resourceBundle.unfoldButtonLabel, disabled: this.isDisabled(), onClick: stubFunction}, stub);
		}
		this.forceEditState();
	},
	setVisible: function(visible, editState) {
		if (this.head != null) {
			dojo.style(this.head, "display", visible ? "" : "none");
			shame.setEditStateClass(this.head, editState);
		}
		if (this.group != null) {
			dojo.style(this.group, "display", visible ? "" : "none");
			shame.setEditStateClass(this.group, editState);
		}
	},
	removeHtml: function() {
		if (this.head != null) {
	 		this.container.removeChild(this.head);
			this.head = null;
		}
		if (this.group != null) {
			this.container.removeChild(this.group);
			this.group = null;
		}
		this.childContainer = null;
	}
});