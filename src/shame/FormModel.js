/**
 * @author matthias
 */
dojo._hasResource["shame.FormModel"] = true;
dojo.provide("shame.FormModel");

dojo.require("shame.base");
dojo.require("shame.Loader");
dojo.require("shame.Connector");
dojo.require("shame.GroupNode");
dojo.require("shame.GroupGridNode");
dojo.require("shame.TextNode");
dojo.require("shame.ChoiceNode");
dojo.require("shame.FormTemplate");
dojo.require("shame.OntologyBrowser");
shame.editState = {
	MANDATORY: "mandatory",
	RECOMMENDED: "recommended",
	OPTIONAL: "optional"
};

shame.setEditStateClass = function(node, editState) {
	for (var key in shame.editState) {
		var cls = shame.editState[key];
		if (editState == cls) {
			if (!dojo.hasClass(node, cls)) {
				dojo.addClass(node, cls);
			}
		} else {
			if (dojo.hasClass(node, cls)) {
				dojo.removeClass(node, cls);
			}
		}
	}
};

dojo.declare("shame.AbstractFormModel", null, {
	editState: shame.editState.RECOMMENDED,
	constructor: function(parameters) {
		this.struct = parameters.struct;
		this.editListeners = [];
		this.template = parameters.template;
		this.nrOfTextAreaRows = parameters.nrOfTextAreaRows;
		this.root = this.createFormNode(this.struct, this.template); //maker sure this function is provided in subclasses.
		this.edited = false;
		this.localize();
	},
	localize: function() {
		dojo.requireLocalization("shame", "common");
		this.resourceBundle = dojo.i18n.getLocalization("shame", "common");
	},
	clear: function() {
		if (this.struct) {
			this.struct.c = [];
			this.root = this.createFormNode(this.struct, this.template);			
//			this.createNew(this.root.getValue());
		} else {
			this.struct.c = null;
			this.root = null;
		}
	},
	createMissing: function() {
		if (this.root.isStub()) {
			this.root.toggleStub();
		} else {
			this.root.createMissingChildren();			
		}
	},
	removeEmptyValues: function() {
		this.root.removeEmptyNodes();
	},
	getJSON: function() {
		return this.struct;
	},
	isPresentation: function() {
		return false;
	},
	setEditState: function(newState) {
		this.editState = newState;
		this.root.updateEditState(newState);
	},
	getEditState: function() {
		return this.editState;
	},
	/**
	 * If level is 1 the method does not check the top level
	 * For all other values it does
	 * 
	 * @param {Object} integer level
	 */
	markAndReportIfMissingMandatory: function(/* integer */ level) { 
		if(level ===1){
			var childrenToBeChecked = this.root.children;
			var child;
			var report = false;
			for (child in childrenToBeChecked){
				if((childrenToBeChecked[child] instanceof shame.GroupNode)){
					var tn = childrenToBeChecked[child].getTemplateNode();
					if (tn.getMinOccurence() === 0){
						var underHasValue = false;
						for (var i = 0; i < childrenToBeChecked[child].children.length; i++) {
							if (childrenToBeChecked[child].children[i].hasValue()) {
								underHasValue = true;
								break;
							}
						}
				        if (underHasValue) {
							for (var j = 0; j < childrenToBeChecked[child].children.length; j++) {
								if (childrenToBeChecked[child].children[j].markAndReportIfMissingMandatory()) {
									report = true;
								}
							}
						}
					}
				}
			}
			return report;
		}
		
		return this.root.markAndReportIfMissingMandatory();
	},
	setEdited: function(edited) {
		if (edited === false) {
			this.edited = false;
		} else {
			this.edited = true;
		}
		var index;
		for (index in this.editListeners) {
			this.editListeners[index].editNotification();
		}
	},
	isEdited: function() {
		return this.edited;
	},
	addEditListeners: function(listener) {
		this.editListeners.push(listener);
	}
});

dojo.declare("shame.FormModel", shame.AbstractFormModel, {
	constructor: function (parameters) {
		this.domNode = parameters.container;
		this.editState = parameters.editState ? parameters.editState : shame.editState.RECOMMENDED;
		this.htmlGenerate = false;
	},
	isHtmlGenerated: function() {
		return this.htmlGenerated;
	},
	generateHtml: function() {
		this.table = document.createElement("table");
		if (this.isPresentation()) {
			this.table.className = "shameRoot shamePresentationMode";
		} else {
			this.table.className = "shameRoot";
		}
		var tbody = document.createElement("tbody");
		this.domNode.appendChild(this.table);
		this.table.appendChild(tbody);
		this.root.generateHtml(tbody, null);

		//Tooltipdialog for information:
		var tt = document.createElement("div");
		this.domNode.appendChild(tt);
		tt.innerHTML = "<div></div>";
		tt.style.display = "none";
		this.tooltipDialog = new dijit.TooltipDialog({autofocus: false}, tt.firstChild);
		this.tooltipDialog._onBlur = function() {
			dijit.popup.close(this);
			this.toolTipNode = null;
		};
		//Ontologydialog
/*		var od = document.createElement("div");
		this.domNode.appendChild(od);
		od.innerHTML = "<div></div>";
		od.style.display = "none";
		this.ontologyDialog = new dijit.TooltipDialog({}, od.firstChild);
		this.ontologyDialog._onBlur = function() {
			dijit.popup.close(this);
		};*/
		this.htmlGenerated = true;
	},
	clear: function() {
		if (this.root) {
			this.root.removeHtml();
		}
		if (this.table) {
			this.domNode.removeChild(this.table);
		}
		this.inherited("clear", arguments);
	},
	_connectToTooltip: function(node, description) {
		if (description == undefined || description == "") {
			return;
		}
		var img = document.createElement("img");
		dojo.addClass(img, "infoIcon");
		img.src=dojo.moduleUrl("shame", "images/information.png");
		node.appendChild(img);

		dojo.connect(img, "onclick", dojo.hitch(this, function(e){
			if (this.toolTipNode === node) {
				dijit.popup.close(this);
				this.toolTipNode = null;
				e.preventDefault();
				return;
			}
			this.toolTipNode = node;
			// stop the native click
			this.tooltipDialog.attr("content", description.replace(/(\r\n|\r|\n)/g, "<br/>"));
			e.preventDefault();
			dijit.popup.open({popup: this.tooltipDialog, around: img});
			dijit.focus(this.tooltipDialog.domNode);
		}));
	},
	_connectBrowseOntology: function(node, formNode, filteringSelect) {
		
		var el = document.createElement("span");
		node.appendChild(el);
		el.innerHTML = "<div dojoType=\"dijit.form.DropDownButton\" width=\"100%\">"+
									"<span>" + this.resourceBundle.browseButtonLabel + "</span>"+
 				           			"<div dojoType=\"dijit.TooltipDialog\">"+
							        "</div>"+
							   "</div>";
		var instances = dojo.parser.parse(el);
		var store = formNode.getTemplateNode().getVocabularyStore();
		var tree = new dijit.Tree({store: store, 
								childrenAttr: ["children"], 
								query: {top: true}});
		instances[1].attr("content", tree.domNode);
		tree.getLabelClass = function(item) {
								if(item == null)
									return "";
								var value = store.getValue(item, "d");
								if(store.getValue(item, "selectable") === false)
									return "notselectable";
								var selected = filteringSelect.attr("value");
								if (value == selected) {
									return "currentselection";
								}
								return "default";
							};
		tree.onClick = function(item) {
								if (store.getValue(item, "selectable") !== false) {
									filteringSelect.attr("value", store.getValue(item, "d"));
								}
							};
		
		//Experiment below with tooltipdialog launched on click instead on launch of form.
		//Did not work due to tree takes time to be built before the size is calculated, 
		// first thereafter should it be showned to get a correct positioning.
		//Therefore the timeout was used, ugly.
/*		var buttonNode = document.createElement("div");
		node.appendChild(buttonNode);
		var button = new dijit.form.Button({label: "Browse"}, buttonNode);
		dojo.connect(button, "onClick", dojo.hitch(this, function(e){
			var store = formNode.getTemplateNode().getVocabularyStore();
			var tree = new dijit.Tree({store: store, 
							childrenAttr: ["children"], 
							query: {top: true},
							getLabelClass: function(item) {
								if(item == null)
									return "";
								var value = store.getValue(item, "d");
								if(store.getValue(item, "selectable") === false)
									return "notselectable";
								var selected = filteringSelect.attr("value");
								if (value == selected) {
									return "currentselection";
								}
								return "default";
							},
							onClick: function(item) {
								if (store.getValue(item, "selectable") !== false) {
									filteringSelect.attr("value", store.getValue(item, "d"));
								}
							}});
			this.ontologyDialog.attr("content", tree.domNode);
			e.preventDefault();
			window.setTimeout(dojo.hitch(this, function() {
				dijit.popup.open({
				 orient: {'RT':'LT'},
				popup: this.ontologyDialog, around: button.domNode});
				dijit.focus(this.ontologyDialog.domNode);
			}), 100);
		}));*/
	}
});

dojo.declare("shame.EditingFormModel", shame.FormModel, {
	constructor: function (parameters) {
		this.createMissing();
		this.generateHtml();
//		console.debug("Empty valuefields added according to FormTemplate");
	},
	createFormNode: function(child, template) {
	  var tnode = template.getNode(child.r);
	  switch (tnode.getType()) {
		case 'group':
			if (tnode.hasStyle("Grid")) {
				return new shame.GroupGridNode(child, tnode, this);			
			} else {
				return new shame.GroupNode(child, tnode, this);				
			}
			break;
		case 'text':
			return new shame.TextNode(child, tnode, this.nrOfTextAreaRows);
			break;
		case 'choice':
			return new shame.ChoiceNode(child, tnode);
			break;
	  }
	}	
});

dojo.declare("shame.PresentationFormModel", shame.FormModel, {
	constructor: function (parameters) {
		this.generateHtml();
	},
	createFormNode: function(child, template) {
	  var tnode = template.getNode(child.r);
	  switch (tnode.getType()) {
		case 'group':
			return new shame.GroupNode(child, tnode, this);
			break;
		case 'text':
			return new shame.PresentationTextNode(child, tnode);
			break;
		case 'choice':
			return new shame.PresentationChoiceNode(child, tnode);
			break;
	  }
	},
	isPresentation: function() {
		return true;
	}
});