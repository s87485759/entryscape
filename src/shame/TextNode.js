/**
 * @author matthias
 */
dojo._hasResource["shame.TextNode"] = true;
dojo.provide("shame.TextNode");
dojo.require("shame.form.Duration");

dojo.require("shame.FormNode");
dojo.require("dojo.parser");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.DateTextBox");
dojo.require("dijit.form.Textarea");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.SimpleTextarea");

dojo.declare("shame.TextNode", shame.AbstractRowNode, {
	constructor: function (struct, templateNode, nrOfTextAreaRows) {
		this.nrOfTextAreaRows = nrOfTextAreaRows;
	},
	generateValueField: function(container) {
		var table = document.createElement("table");
		table.style.width = "100%";
		table.className = "shameTable";
		var tr = document.createElement("tr");
		var td = document.createElement("td");
		container.appendChild(table);
		var tbody = document.createElement("tbody");
		table.appendChild(tbody);
		tbody.appendChild(tr); 
		tr.appendChild(td);
		var node = this;
		var variable = this.getTemplateNode().getVariable();
		if (variable.isURI()) {
			var uriNode = document.createElement("div");
			td.appendChild(uriNode);
			this.value = new dijit.form.ValidationTextBox({regExp: shame.base.URIRegExp, disabled: this.isDisabled(), invalidMessage: "Should be a URI"}, uriNode);
			if (this.getTemplateNode().hasDescription()) {
				this.value.promptMessage = this.getTemplateNode().getDescription([dojo.locale, 'en']);
			}
			this.value.attr("value", this.getValue());
		} else if (variable.isLiteral()) {
			if (!variable.isDatatype()) {
				if (!this.getTemplateNode().hasStyle("MultiLine")) {
					var textNode = document.createElement("div");
					td.className = "shameText";
					td.appendChild(textNode);
					this.value = new dijit.form.TextBox({trim: true, disabled: this.isDisabled()}, textNode);
				} else {
					var textArea = document.createElement("textarea");
					td.className = "shameText";
					td.appendChild(textArea);
					if(this.nrOfTextAreaRows && this.nrOfTextAreaRows >0){
						this.value = new dijit.form.SimpleTextarea({trim: true, disabled: this.isDisabled(), rows: this.nrOfTextAreaRows, style: "width:100%"}, textArea);
					} else{
						this.value = new dijit.form.Textarea({trim: true, disabled: this.isDisabled()}, textArea);
					}
				}
				this.value.attr("value", this.getValue());
				if (!variable.forbiddsLanguage() 
						&& this.getTemplateNode().hasStyle("LanguageControlled")) {
					var td2 = document.createElement("td");
					td2.className = "shameLangCell";
					tr.appendChild(td2);
					shame.base.appendLanguageInput(td2, "l-en", this, variable);
				}
			} else { 	//datatype
				var textNode = document.createElement("div");
				td.appendChild(textNode);

				if (variable.getDatatype() == "http://www.w3.org/2001/XMLSchema#date" || variable.getDatatype() == "http://purl.org/dc/terms/W3CDTF") {
					this.value = new dijit.form.DateTextBox({disabled: this.isDisabled()}, textNode);
					var dateStringValue = this.getValue();
					if(dateStringValue.length>0){
						this.value.attr("value", dojo.date.stamp.fromISOString(this.getValue()));
					} else {
						this.value.attr("value", this.getValue());
					}
				} else if (variable.getDatatype() == "http://www.w3.org/2001/XMLSchema#integer") {
					this.value = new dijit.form.ValidationTextBox({disabled: this.isDisabled(), regExp: "[0-9]*"}, textNode);
					this.value.attr("value", this.getValue());
				} else if (variable.getDatatype() == "http://www.w3.org/2001/XMLSchema#anyURI") {
					this.value = new dijit.form.ValidationTextBox({disabled: this.isDisabled()}, textNode);
					this.value.attr("value", this.getValue());
				} else if (variable.getDatatype() == "http://www.w3.org/2001/XMLSchema#duration") {
					this.value = new shame.form.Duration({disabled: this.isDisabled()}, textNode);
					this.value.attr("value", this.getValue());
				} else  {
					this.value = new dijit.form.TextBox({disabled: this.isDisabled()}, textNode);
					this.value.attr("value", this.getValue());
				}
			}
		}
		this.value.onChange = dojo.hitch(this, this.valueUpdate);
	},
	valueUpdate: function(newvalue) {
		if(newvalue instanceof Date) {
			this.setValue(dojo.date.stamp.toISOString(newvalue));
		} else{
   			this.setValue(newvalue == undefined || newvalue == null ? newvalue 
			: newvalue.replace(/^\s+|\s+$/g, ''));
		}		
	},
	forceValueUpdate: function() {
		this.valueUpdate(this.value.attr("value"));
	}
});

dojo.declare("shame.PresentationTextNode", shame.AbstractRowNode, {
	constructor: function (struct, templateNode) {
	},
	generateValueField: function(container) {
		var table = document.createElement("table");
		table.style.width = "100%";
		table.className = "shameTable";
		var tr = document.createElement("tr");
		var td = document.createElement("td");
		container.appendChild(table);
		var tbody = document.createElement("tbody");
		table.appendChild(tbody);
		tbody.appendChild(tr); 
		tr.appendChild(td);
		var node = this;
		var variable = this.getTemplateNode().getVariable();
		if (variable.isURI()) {
			var uriNode = document.createElement("a");
			td.appendChild(uriNode);
			uriNode.appendChild(document.createTextNode(this.getValue()));
			uriNode.href = this.getValue();
		} else if (variable.isLiteral()) {
				var textNode = document.createElement("div");
				textNode.className = "shameValuePresentation";
				td.appendChild(textNode);
			if (!variable.isDatatype()) {
				textNode.innerHTML=this.getValue().replace(/(\r\n|\r|\n)/g, "<br/>");
				if (!variable.forbiddsLanguage() && this.hasLanguage()) {
					var td2 = document.createElement("td");
					td2.className = "shameLangCell";
					tr.appendChild(td2);
					shame.base.appendSingleLanguageInput(td2, this, variable);
				}
			} else {
				var dt = variable.getDatatype();
				if (dt == "http://www.w3.org/2001/XMLSchema#date" || dt == "http://purl.org/dc/terms/W3CDTF") {
					var date = dojo.date.stamp.fromISOString(this.getValue());//.toLocaleFormat("%Y - %Om - %d");
					var year = date.getFullYear();
					var month = date.getMonth()+1;
					var dayOfMonth = date.getDate();
					if(dayOfMonth <10){
						dayOfMonth = "0"+dayOfMonth;
					}
					if(month < 10){
						month = "0"+month;
					}
					textNode.innerHTML = year+"-"+month+"-"+dayOfMonth;//dojo.date.stamp.fromISOString(this.getValue()).toLocaleFormat("%Y - %Om - %d");
				} else if (variable.getDatatype() == "http://www.w3.org/2001/XMLSchema#duration") {
					this.value = new shame.form.DurationPresentation({disabled: this.isDisabled()}, textNode);
					this.value.attr("value", this.getValue());
				} else {
					textNode.innerHTML=this.getValue().replace(/(\r\n|\r|\n)/g, "<br/>");
				}
			}
		}
	}
});