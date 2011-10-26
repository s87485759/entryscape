dojo.provide("shame.GroupGridNode");
dojo.require("shame.FormNode");
dojo.require("dijit.form.Button");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dojox.grid.DataGrid");
dojo.require("dojox.grid.cells.dijit");



dojo.declare("shame.GroupGridNode", shame.AbstractFormNode, {
	constructor: function (struct, templateNode, formModel) {
		this.formModel = formModel;
		this.vocNameCache = {};
		this.store = new shame.ShameStore({ggn: this, data: {identifier: "rowId", items: []}});
		this.createColumns();
		this.children = [];
		this.rows = [];
		//this.manage(struct);
	},
	createColumns: function() {
		this.columns = [];
		var tnode = this.getTemplateNode();
		var row = tnode.getChildren();
		this.tnId2ColNr = {};
		var editable = !this.formModel.isPresentation();
		for (var r=0;r<row.length;r++) {
			var tn = row[r];
			this.tnId2ColNr[tn.getId()] = r;
			var name = tn.getLabel(["l-"+dojo.locale, 'l-en']);
			var field = tn.getId();
			if (tn.hasStyle("Row")) {
				this.rowTN = tn;
				this.columns.push({name: name, field: field, editable: false /* Can't edit ID's of dojo.data items */});
			} else {
				if (row[r].getType() == "text") {
					this.columns.push(this.suitableEditor({name: name, editable: editable, field: field}, tn));
				} else {
					this.columns.push({name: name, editable: editable, field: field, styles: 'text-align: center;', type: dojox.grid.cells.ComboBox, 
					options: this.getVocabularyOptions(tn)});
				}
			}
		}
	},
	suitableEditor: function(obj, tn) {
		var variable = tn.getVariable();
		if (variable.isURI()) {
			this.value = new dijit.form.ValidationTextBox({regExp: shame.base.URIRegExp, disabled: this.isDisabled(), invalidMessage: "Should be a URI"}, uriNode);
			if (tn.hasDescription()) {
				obj.constraint.promptMessage = tn.getDescription([dojo.locale, 'en']);
			}
		} else if (variable.isLiteral()) {
			if (variable.isDatatype()) {
				if (variable.getDatatype() == "http://www.w3.org/2001/XMLSchema#date" || variable.getDatatype() == "http://purl.org/dc/terms/W3CDTF") {
					obj.type = dojox.grid.cells.DateTextBox;
					obj.constraint = {formatLength: 'long', selector: "date"};
					obj.formatter = function(inDatum) {return inDatum ? dojo.date.locale.format(new Date(inDatum), this.constraint) : "";};
				} else if (variable.getDatatype() == "http://www.w3.org/2001/XMLSchema#integer") {
					obj.widgetClass = dijit.form.NumberTextBox;
					obj.formatter = function(value) {return isNaN(value) ? "" : value;};
				} /*else if (variable.getDatatype() == "http://www.w3.org/2001/XMLSchema#anyURI") {
					this.value = new dijit.form.ValidationTextBox({disabled: this.isDisabled()}, textNode);
				} else if (variable.getDatatype() == "http://www.w3.org/2001/XMLSchema#duration") {
					this.value = new shame.form.Duration({disabled: this.isDisabled()}, textNode);
				} else  {
					this.value = new dijit.form.TextBox({disabled: this.isDisabled()}, textNode);
				}*/
			}
		}
		return obj;
	},
	getVocabularyOptions: function(templateNode) {
		if (!this.vocNameCache[templateNode.getId()]) {
			var voc = templateNode.getVocabulary();
			this.vocNameCache[templateNode.getId()] = dojo.map(voc, function(item) {return item.n});;
		}
		return this.vocNameCache[templateNode.getId()];
	},
	getNameFromChoice: function(templateNode, choice) {
		var voc = templateNode.getVocabulary();
		for (var i=0;i<voc.length;i++) {
			if (voc[i].d == choice) {
				return voc[i].n;					
			}
		}
	},
	getChoiceFromName: function(templateNode, name) {
		var voc = templateNode.getVocabulary();
		for (var i=0;i<voc.length;i++) {
			if (voc[i].n == name) {
				return voc[i].d;
			}
		}
	},
	manage: function(formItem) {
		var tnode = this.getTemplateNode();
		if (tnode == tnode.getTemplate().getNode(formItem.r)) {
			this.addFormItem(formItem);
			return true;
		}
		return false;
	},
	normalizeFIChildren: function(fi) {
		var nc = [];
		var tnode = this.getTemplateNode();
		var row = tnode.getChildren();		
		for (var r=0;r<row.length;r++) {
			var tn = row[r];
			nc.push({r: tn.getId(), d: {}});
		}
		for (var i=0;i<fi.c.length;i++) {
			var child = fi.c[i];
			nc[this.tnId2ColNr[child.r]] = child;
		}
		fi.c = nc;
	},
	addFormItem: function(formItem) {
		if (formItem.c == undefined) {
			formItem.c = [];
		}
		var newItem = {rowId: this.children.length};
		for (var i=0;i<formItem.c.length;i++) {
			var fi = formItem.c[i];
			var ftn = this.getTemplateNode().getTemplate().getNode(fi.r);
			if (ftn.getType() == "choice") {
				if (ftn == this.rowTN) {
					this.rows.push(fi.d.v);
				}
				newItem[fi.r]=this.getNameFromChoice(ftn, fi.d.v);
			} else {
				var variable = ftn.getVariable();
				if (variable.getDatatype() == "http://www.w3.org/2001/XMLSchema#date" || variable.getDatatype() == "http://purl.org/dc/terms/W3CDTF") {
					if (fi.d.v != undefined && fi.d.v.length>0){
						newItem[fi.r] = dojo.date.stamp.fromISOString(fi.d.v);
					} else {
						newItem[fi.r] = fi.d.v;
					}
				} else {
					newItem[fi.r]=fi.d.v;
				}
			}
		}
		this.store.newItem(newItem);
		this.normalizeFIChildren(formItem);
		this.children.push(formItem);
	},
	removeChildren: function() {
	},
	removeEmptyNodes: function() {
		var atLeastOneFound = false;
		var parentStruct = this.getParent().struct;
		var parentChildren = this.getParent().children;
		var findex = dojo.indexOf(parentChildren, this);		
		var lindex = dojo.lastIndexOf(parentChildren, this);
		for (var i=findex;i<=lindex;i++) {
			if (this.removeChildrenAndCheckIfEmpty(parentStruct.c[i])) {
				parentChildren.splice(i, 1);
				parentStruct.c.splice(i, 1);
				i--;
				lindex--;
			} else {
				atLeastOneFound = true;
			}
		}
		return atLeastOneFound;
	},
	removeChildrenAndCheckIfEmpty: function(struct) {
		if (struct.c == undefined) {
			return true;
		}

		var r = this.rowTN.getId();
		var isEmpty = true;
		for (var i=0;i<struct.c.length;i++) {
			if (struct.c[i].r == r) {
				continue;
			}
			if (struct.c[i].d != undefined && struct.c[i].d.v != undefined) {
				isEmpty = false;
			} else {
				struct.c.splice(i, 1);
				i--;
			}
		}
		return isEmpty;
	},
	createChildren: function() {
		this.createMissingChildren();
	},
	createMissingChildren: function() {
		console.log(shame.cmcCounter);
		var parentStruct = this.getParent().struct;
		var parentChildren = this.getParent().children;
		var index = dojo.lastIndexOf(parentChildren, this)+1;
		var voc = this.rowTN.getVocabulary();
		if (this.rows.length == 0) { //In case a GroupGridNode has been created with an empty struct (no required column).
			var struct = parentStruct.c[index-1];
			struct.c = [{r: this.rowTN.getId(), d: {v: voc[0].d}}];
			this.addFormItem(struct);
			voc = voc.slice(1);
		}
		var rowIds = dojo.clone(this.rows);
		dojo.map(voc, dojo.hitch(this, function(item) {
			if (dojo.indexOf(rowIds, item.d) == -1) {
				var struct = {r: this.getTemplateNode().getId(), c: [{r: this.rowTN.getId(), d: {v: item.d}}]};
				this.addFormItem(struct);
				parentStruct.c.splice(index, 0, struct);
				parentChildren.splice(index, 0, this);
				index++;
			}
		}));
	},
	setValue: function(rowId, tnId, value) {
		var data = this.children[rowId].c[this.tnId2ColNr[tnId]].d;
		var tn = this.getTemplateNode().getTemplate().getNode(tnId);
		if (tn.getType() == "choice") {
			value = this.getChoiceFromName(tn, value);
		}
		var variable = tn.getVariable();
		if (variable.getDatatype() == "http://www.w3.org/2001/XMLSchema#date" 
			|| variable.getDatatype() == "http://purl.org/dc/terms/W3CDTF") {
			if (!this.isValueInValid(value)) {
				value = shame.dateFormatter(value);				
			}
		}
		if (variable.getDatatype() == "http://www.w3.org/2001/XMLSchema#integer") {
			if (isNaN(value)) {
				value = null;
			}
		}
		if (this.isEqual(data.v, value)) {
			return;
		}
		if (this.isValueInValid(value)) {
			delete data.v;
		} else {
			data.v = value;
		}
		if (this.formModel) {
			this.formModel.setEdited();
		} else {
			this.parent.formModel.setEdited();
		}
	},
	markAndReportIfMissingMandatory: function() {
		return false; //TODO
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
	isGroup: function() {
		return true;
	},
	isStub: function() {
		return false;
	},
	getContainer: function () {
		return this.container;
	},
	generateHtml: function(container, beforeRef) {
		if (this.container) {
			return;
		}
		this.container = container;

		//Label and description
		var tr = document.createElement("tr");
		var td = document.createElement("td");
		var td2 = document.createElement("td");
		td.colSpan = 2;
		tr.appendChild(td);
		tr.appendChild(td2);
		td.className = "shameLabel";
		var labelvalue = this.getTemplateNode().getLabel(["l-"+dojo.locale, 'l-en']);
		if(labelvalue == null)
			labelvalue = "";
		td.innerHTML = labelvalue.wordWrap(shame.base.wrapLength, "<br/>", 1);
		if (this.getTemplateNode().hasDescription()) {
			this.getFormModel()._connectToTooltip(td, this.getTemplateNode().getDescription(["l-"+dojo.locale, 'l-en']));
		}
		//Button for clearing selected rows
		var but = new dijit.form.Button({label: "Clear selected"}, document.createElement("div"));
		dojo.connect(but, "onClick", this, this.clearSelected);
		dojo.style(but.domNode, "float", "right");
		td2.appendChild(but.domNode);
		container.appendChild(tr);

		//Grid
		tr = document.createElement("tr");
		td = document.createElement("td");
		td.colSpan = 3;
		container.appendChild(tr);
		tr.appendChild(td);
		var structure = [{defaultCell: {editable: true, width: "auto", type: dojox.grid.cells._Widget},
						 rows: this.columns, constraint: {defaultValue: ""}}];
		this.grid = new dojox.grid.DataGrid({width: "100%", store: this.store, sortInfo: 1, structure: structure, autoHeight: true}, document.createElement("div"));
		td.appendChild(this.grid.domNode);
		var f = dojo.hitch(this, function() {this.grid.resize()});
		setTimeout(f, 1);
	//	new dijit.form.Button({label: "click me", onClick: f}, dojo.create("div", null, td));
		dojo.style(this.grid.domNode, "width", "100%");
		this.grid.startup();
		this.grid.resize();
	},
	clearSelected: function() {
		var skipField = this.rowTN.getId();
		var selected = this.grid.selection.getSelected();
		for (var i=0;i<selected.length;i++) {
			for (var j=0;j<this.columns.length;j++) {
				var field = this.columns[j].field;
				if (field != skipField) {
					this.store.setValue(selected[i], field, "");
				}
			}
		}
	}
});

shame.dateFormatter = function(value) {
	if(value instanceof Date) {
		return dojo.date.stamp.toISOString(value);
	} else{
   		return (value == undefined || value == null) ? value : value.replace(/^\s+|\s+$/g, '');
	}
};

dojo.declare("shame.ShameStore", dojo.data.ItemFileWriteStore, {
	constructor: function(keyWordParameters) {
		this.ggn = keyWordParameters.ggn;
	},
	setValue: function(/* item */ item, /* string */ attribute, /* almost anything */ value) {
		this.inherited("setValue", arguments);
		this.ggn.setValue(this.getValue(item, "rowId"), attribute, value);
	}
});