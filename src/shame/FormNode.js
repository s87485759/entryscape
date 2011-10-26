dojo._hasResource["shame.FormNode"] = true;
dojo.provide("shame.FormNode");
dojo.require("shame.FormModel");
dojo.require("dijit.Tooltip");
dojo.require("dijit.form.Button");

dojo.declare("shame.AbstractFormNode", null, {
	constructor: function(struct, templateNode) {
		this.struct = struct;
		this.addButton = null;
		this.removeButton = null;
		this.templateNode = templateNode;
		this.parent = null;
		this.localize();
	},
	localize: function() {
		dojo.requireLocalization("shame", "common");
		this.resourceBundle = dojo.i18n.getLocalization("shame", "common");
	},
	destruct: function (ignoreCardinality) {
		if (this.getParent()) {
			this.removeHtml();
			this.getParent().removeChild(this, ignoreCardinality);	
		} else {
			this.toggleStub();
		}
	},
	checkAndMarkMissingMandatory: function() {
		//Override
	},
	forceEditState: function() {
		this.updateEditState(this.getFormModel().getEditState());
	},
	updateEditState: function(newState) {
		var hasValue = this.hasValue();
		var nodeIs = this.getTemplateNode().getMinOccurence() > 0 ? shame.editState.MANDATORY 
						: this.getTemplateNode().getPreferredOccurence() > 0 ? shame.editState.RECOMMENDED 
						: shame.editState.OPTIONAL;
		switch (newState) {
			case shame.editState.MANDATORY:
				var visible = nodeIs == shame.editState.MANDATORY || hasValue;
				this.setVisible(visible, nodeIs);
				return visible;
			case shame.editState.RECOMMENDED:
				var visible = nodeIs == shame.editState.MANDATORY || nodeIs == shame.editState.RECOMMENDED  || hasValue;
				this.setVisible(visible, nodeIs);
				return visible;
			case shame.editState.OPTIONAL:
				this.setVisible(true, nodeIs);
				return true;
		}
	},
	setVisible: function(visible, editState) {
	},
	isDisabled: function() {
		return this.getTemplateNode().hasStyle("NonEditable");
	},
	isPresentation: function() {
		if (this.formModel) {
			return this.formModel.isPresentation();
		}
		
		return this.getParent().isPresentation();
	},
	hasLanguage: function() {
		return shame.base.hasLanguage(this.struct);
	},
	getLanguagePlain: function() {
		return this.struct.d.l;
	},
	getLanguage: function() {
		return "l-"+this.struct.d.l;
	},
	setLanguage: function(lang) {
		if (lang == null || lang == "" || lang === undefined) {
			delete this.struct.d.l;
		} else {
			this.struct.d.l = lang.substring(2);			
		}
	},
	hasValue: function() {
		return dojo.isString(this.struct.d) || typeof(this.struct.d.v) != "undefined";		
	},
	getValue: function() {
		return shame.base.getValue(this.struct);
	},
	isEqual: function(oldVal, newVal) {
		return oldVal === newVal || (oldVal == undefined && (newVal == null || newVal == "" || newVal == undefined));
	},
	isValueInValid: function(value) {
		return value == null || value == "" || value == undefined;
	},
	setValue: function(value) { 
		if (this.isEqual(this.struct.d.v, value)) {
			return;
		}
		if (this.isValueInValid(value)) {
			delete this.struct.d.v;
		} else {
			this.struct.d.v = value;
		}
		if (this.formModel) {
			this.formModel.setEdited();
		} else {
			this.parent.formModel.setEdited();
		}
	},
	getTemplateNode: function() {
		return this.templateNode;
	},
	/**
	 * If this formNode manages multiple formItems, e.g. GroupGridNode does this, then true.
	 */
	manage: function(formItem) {
		return false; 
	},
	setParent: function(parent) {
		this.parent = parent;
	},
	getParent: function() {
		return this.parent;
	},
	getOccurence: function() {
		if (this.parent) {
			return this.parent.getOccurenceOfChild(this);
		}
		return 1;
	},
	updateOccurenceModifiers: function(occurence) {
		var tn = this.getTemplateNode();
		if (this.removeButton) {
			this.removeButton.attr("disabled", occurence <= tn.getMinOccurence() || this.isDisabled());
		}
		if (this.addButton) {
			this.addButton.attr("disabled", (tn.isMaxOccurenceBounded() && occurence >= tn.getMaxOccurence()) || this.isDisabled());
		}		
	},
	getPreviousSibling: function () {
		if (this.getParent()) {
			var pchildren = this.getParent().children;
			var index = dojo.indexOf(pchildren, this);
			if (pchildren[index - 1]) {
				return pchildren[index - 1];
			}
		}
		return null;
	},
	getBeforeElement: function() {
		return null; //Must override!
	},
	generateHtml: function() {
		//Must override
	},
	removeHtml: function() {
		//Must override
	},
	isGroup: function() {
		return false;
	},
	getFormModel: function() {
		if (this.isGroup()) {
			return this.formModel;
		} else {
			return this.getParent().formModel;
		}
	}
});

dojo.declare("shame.AbstractRowNode", shame.AbstractFormNode, {
	constructor: function (struct, templateNode) {
		this.row = null;
		this.container = null;
		this.value = null;
	},
	getBeforeElement: function() {
		return this.row;
	},
	forceValueUpdate: function() {
	},
	markAndReportIfMissingMandatory: function() {
		var langReqButMissing = false;
		if(this instanceof shame.TextNode && this.hasValue()){
			var langReq = this.getTemplateNode().getVariable().requiresLanguage();
			langReqButMissing = langReq && !this.struct.d.l;
		}
		if (this.getTemplateNode().getMinOccurence() > 0) {
			this.forceValueUpdate();
			
			if (this.hasValue()&& !langReqButMissing) {
				if (dojo.hasClass(this.row, "missing")) {
					dojo.removeClass(this.row, "missing");
				}
				return false;
			} else {
				if (!dojo.hasClass(this.row, "missing")) {
					dojo.addClass(this.row, "missing");
				}
				return true;
			}
		} else if(langReqButMissing && this.hasValue){
		     if (!dojo.hasClass(this.row, "missing")) {
			    dojo.addClass(this.row, "missing");
			 }
			 return true;
		} else {
			if (dojo.hasClass(this.row, "missing")) {
				dojo.removeClass(this.row, "missing");
			}
			return false;
		}
		return false;
	},
	
	setVisible: function(visible, editState) {
		if (this.row) {
			dojo.style(this.row, "display", visible ? "" : "none");
			shame.setEditStateClass(this.row, editState);			
		}
	},
	generateHtml: function(container, beforeRef) {
		var tn = this.getTemplateNode();
		var hiddenValue = tn.hasStyle("HiddenValue") || tn.hasStyle("Hidden");
		this.container = container;
		this.row = document.createElement("tr");
		this.forceEditState();
		var psibling = this.getPrevious//Sibling();
		if (psibling != null && psibling.isGroup()) {
			dojo.addClass(this.row, "shameEntry");
			dojo.addClass(this.row, "shamePop");
		} else {
			dojo.addClass(this.row, "shameEntry");
			dojo.addClass(this.row, "shameLevel");
		}

		if (!hiddenValue) {
			//Label
			var label = document.createElement("td");
			label.className = "shameLabel";
			
			var labelvalue = this.getTemplateNode().getLabel(["l-"+dojo.locale, 'l-en']);
			if(labelvalue == null)
				labelvalue = "";
			label.innerHTML = labelvalue.wordWrap(shame.base.wrapLength, "<br/>", 1);
			if (this.getTemplateNode().hasDescription()) {
				this.getFormModel()._connectToTooltip(label, this.getTemplateNode().getDescription(["l-"+dojo.locale, 'l-en']));
			}
			
			//Value
			var value = document.createElement("td");
			value.className = "shameValue";
			this.generateValueField(value);
	
			//insert into DOM.
			this.row.appendChild(label);
			this.row.appendChild(value);
	
			if (!this.isPresentation()) {
				//Mult
				var mult = document.createElement("td");
				shame.FormNode.generateCardinality(this, mult);
				this.row.appendChild(mult);
			}
		}
				
		this.container.insertBefore(this.row, beforeRef);
	},
	removeHtml: function() {
		this.container.removeChild(this.row);
	},
	generateValueField: function (container) {
		//Override me.
	}
});

shame.FormNode.generateCardinality = function(formNode, container) {
	var table = document.createElement("table");
	table.className = "shameTable shameMult";
	container.appendChild(table);
	var tbody = document.createElement("tbody");
	table.appendChild(tbody);
	var row = document.createElement("tr");
	tbody.appendChild(row);
	var tnode = formNode.getTemplateNode();
	if (tnode.isMaxOccurenceBounded() && tnode.getMaxOccurence() == 1) {
		if (tnode.getMinOccurence() == 0 && tnode.getType() != "text") {
			var td1 = document.createElement("td");
			td1.className = "shameCell";	
			row.appendChild(td1);
			var minus = document.createElement("input");
			td1.appendChild(minus);
			var minusFunction = function() {
				formNode.destruct();
			};
			dojo.requireLocalization("shame", "common");
			var resourceBundle = dojo.i18n.getLocalization("shame", "common");
			formNode.removeButton = new dijit.form.Button({label: resourceBundle.hideButtonLabel, onClick: minusFunction}, minus);
			formNode.updateOccurenceModifiers(formNode.getOccurence());
		}
	} else {
		var td1 = document.createElement("td");
		td1.className = "shameCell";
		var td2 = document.createElement("td");
		td2.className = "shameCell";
		row.appendChild(td1);
		row.appendChild(td2);
		var plus = document.createElement("input");
		var minus = document.createElement("input");
		td1.appendChild(plus);
		td2.appendChild(minus);
		var plusFunction = function() {
			formNode.getParent().duplicateChild(formNode);
		};
		var minusFunction = function() {
			formNode.destruct();
		};
		formNode.addButton = new dijit.form.Button({iconClass: "plusButton", onClick: plusFunction, showLabel: false}, plus);
		formNode.removeButton = new dijit.form.Button({iconClass: "minusButton", onClick: minusFunction, showLabel: false}, minus);
		formNode.updateOccurenceModifiers(formNode.getOccurence());
	}
};