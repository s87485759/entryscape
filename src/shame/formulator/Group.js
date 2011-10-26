dojo._hasResource["shame.formulator.Group"] = true;
dojo.provide("shame.formulator.Group");
dojo.require("dijit.layout.LayoutContainer");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.form.Button");
dojo.require("dijit.TitlePane");
dojo.require("dijit.Menu");

dojo.require("dijit.form.TextBox");  
dojo.require("dijit.form.TimeTextBox");
dojo.require("dijit.form.DateTextBox");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.form.Textarea");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.NumberSpinner");

dojo.declare("shame.formulator.FormItem", null, {
	defaultPreferredCardinality: 1,
	addToToolbar: function () {
		if (this.parent) {
			var toolbar = this.toolbarTitle.getToolbar();
			var self = this;
			this.upButton = new dijit.form.Button({label: "up", onClick: 
					function(event) {self.parent.up(self);dojo.stopEvent(event);}});
			this.downButton = new dijit.form.Button({label: "down", onClick: 
					function(event) {self.parent.down(self);dojo.stopEvent(event);}});
			this.deleteButton = new dijit.form.Button({label: "delete", onClick: 
					function(event) {self.parent.deleteFI(self);dojo.stopEvent(event);}})
			this.addBelowMenu = new dijit.Menu({});
			this.addBelowButton = new dijit.form.DropDownButton({label: "add below", dropDown: this.addBelowMenu});
			dojo.connect(this.addBelowButton, "_onDropDownClick", function(event) {dojo.stopEvent(event);});
			var nodeType = ["Group", "Text", "Choice"];
			for (i=0;i<nodeType.length;i++) {
				this.addBelowMenu.addChild(new dijit.MenuItem({label: nodeType[i], onClick: 
					dojo.hitch(this.parent, this.parent.addBelow, this, nodeType[i])}));
			}
			toolbar.addChild(this.upButton);
			toolbar.addChild(this.downButton);
			toolbar.addChild(this.deleteButton);
			toolbar.addChild(this.addBelowButton);
		}
	},	
	convertToFormJSON: function(from) {
		var to = {};
		to.constraint = from.constraint;
		to.property = from.property;
		to.min = from.min;
		to.pref = from.pref;
		to.max = from.max;
		to.reuseVariable = from.reuseVariable;
		to.nodeType = from.nodeType;
		if (!from.reuseVariable) {
			to.reuseVariable="none";
		}
		if (!from.nodeType) {
			to.nodeType = "default";
		}

		//Default enabled.
		to.editable = "on";
		to.indented = "on";

		for(prop in from) {
			if (typeof from[prop] == "boolean") {
				if (from[prop]) {
					to[prop] = "on"; 
				} else {
					delete to[prop];
				}
			} else if (prop.indexOf("label_") ==0) {
				to.label = from[prop];
				to.llanguage = prop.substring(6);
			} else if (prop.indexOf("description_") ==0) {
				to.description = from[prop];
				to.dlanguage = prop.substring(12);
			}
		}
		return to;
	},
	importJSON: function(from) {
		this.configuration.setValues(this.convertToFormJSON(from));
	},
	convertToExternalJSON: function(from) {
		var to = {};
		dojo.mixin(to, from);
		if (from.reuseVariable == "none") {
			delete to.reuseVariable;
		}
		if (from.nodeType == "default") {
			delete to.nodeType;
		}

		if (from.usePropertyAs == "fixed") {
			delete to.usePropertyAs;
		}

		//Convert from representation in form JSON e.g. "on" to boolean.
		var types = ["hidden", "hiddenValue", "frame", "section", "multiLine", "hasLanguage", "expandableTree"];
		for(var ind in types) {
			var prop = types[ind];
			if (from[prop] && from[prop].length > 0 && from[prop][0] == "on") {
				to[prop] = true;
			} else {
				delete to[prop];
			}
		}
		
		//Opposite is default for editable and indented
		types = ["indented", "editable"];
		for(var ind in types) {
			var prop = types[ind];
			if (from[prop] && from[prop].length == 0) {
				to[prop] = false;
			} else {
				delete to[prop];
			}
		}

		delete to.label;
		delete to.llanguage;
		to["label_"+from.llanguage] = from.label;
		
		delete to.description;
		delete to.dlanguage;
		to["description_"+from.dlanguage] = from.description;
		
		//Remove empty strings
		for(var ind in to) {
			if (dojo.isString(to[ind])) {
				if (to[ind] == "") {
					delete to[ind];
				}
			}
		}
		//Remove undefined cardinalities
		if (isNaN(to.min) || to.min == 0) {
			delete to.min;
		}
		if (isNaN(to.max)) {
			delete to.max;
		}
		if (isNaN(to.pref) || to.min == this.defaultPreferredCardinality) {
			delete to.pref;
		}
		return to;
	},
	exportJSON: function() {
		return this.convertToExternalJSON(this.configuration.getValues());
	}
});

dojo.declare("shame.formulator.Group", [dijit._Widget, shame.formulator.FormItem, dijit._Templated], {
	templatePath: dojo.moduleUrl("shame.formulator", "GroupTemplate.html"),
    widgetsInTemplate: true,
	constructor: function(parameters, srcNodeRef) {
		this.defaultPreferredCardinality = 0;
	},
	postCreate: function() {
		this.inherited("postCreate", arguments);
		this.addToToolbar();
		var toolbar = this.toolbarTitle.getToolbar();
		this.addInsideMenu = new dijit.Menu({});
		this.addInsideButton = new dijit.form.DropDownButton({label: "add inside", dropDown: this.addInsideMenu});
		dojo.connect(this.addInsideButton, "_onDropDownClick", function(event) {dojo.stopEvent(event);});
		var nodeType = ["Group", "Text", "Choice"];
		for (i=0;i<nodeType.length;i++) {
			this.addInsideMenu.addChild(new dijit.MenuItem({label: nodeType[i], onClick: 
					dojo.hitch(this, this.addInside, nodeType[i])}));
		}
		toolbar.addChild(this.addInsideButton);		
	},
	buttonsUpdate: function() {
		var arrChilds = this.formitemChildren.getChildren();
		if (arrChilds.length == 1) {
			arrChilds[0].upButton.setAttribute("disabled", true);
			arrChilds[0].downButton.setAttribute("disabled", true);
		} else if (arrChilds.length > 1) {
			arrChilds[0].upButton.setAttribute("disabled",true);
			arrChilds[0].downButton.setAttribute("disabled", false);
			arrChilds[arrChilds.length-1].upButton.setAttribute("disabled",false);
			arrChilds[arrChilds.length-1].downButton.setAttribute("disabled",true);
			for (i=1;i<arrChilds.length-1;i++) {
				arrChilds[i].upButton.setAttribute("disabled",false);
				arrChilds[i].downButton.setAttribute("disabled",false);
			}
		}
	},
	up: function(child) {
		var arrChilds = this.formitemChildren.getChildren();
		var index = dojo.indexOf(arrChilds, child);
		this.formitemChildren.removeChild(child);
		this.formitemChildren.addChild(child, index-1);
		this.buttonsUpdate();
	},
	down: function(child) {
		var arrChilds = this.formitemChildren.getChildren();
		var index = dojo.indexOf(arrChilds, child);
		this.formitemChildren.removeChild(child);
		this.formitemChildren.addChild(child, index+1);
		this.buttonsUpdate();
	},
	deleteFI: function(child) {
		this.formitemChildren.removeChild(child);
		this.buttonsUpdate();
	},
	addBelow: function(child, formitemType) {
		var arrChilds = this.formitemChildren.getChildren();
		var index = dojo.indexOf(arrChilds, child);
		if (formitemType == "Group") {
			this.formitemChildren.addChild(new shame.formulator.Group({parent: this}), index+1);			
		} else if (formitemType == "Text") {
			this.formitemChildren.addChild(new shame.formulator.Text({parent: this}), index+1);			
		} else if (formitemType == "Choice") {
			this.formitemChildren.addChild(new shame.formulator.Choice({parent: this}), index+1);			
		}
		this.buttonsUpdate();
	},
	addInside: function(formitemType, index, ignoreButtonUpdate) {
		var fit = formitemType.toLowerCase();
		if (index === undefined) {
			index = 0;
		}
		var newChild;
		if (fit == "group") {
			newChild = new shame.formulator.Group({parent: this});			
		} else if (fit == "text") {
			newChild = new shame.formulator.Text({parent: this});
		} else if (fit == "choice") {
			newChild = new shame.formulator.Choice({parent: this});			
		}
		if (newChild) {
			this.formitemChildren.addChild(newChild, index);
		}
		if (ignoreButtonUpdate) {
			this.buttonsUpdate();
		}
		return newChild;
	},
	fixthings: function() {
		this.importJSON({type: "group", id: "mainAP", label_sv: "Resurs", desc_sv: "En resurs...", children: [
        					{type: "text", property: "dc:title", hasLanguage: true, nodeType: "LL", label_sv: "Titel"},
        					{type: "group", hidden: true, property: "dc:date", constraint: "ns1:w3cDTF", 
        					 max: 1, pref: 1, min: 1, children:[
               					{type: "text", property: "rdf:value", label_sv: "Date"}
			                ]},
 						    {type: "choice", property: "dc:subject", constraint: "ns2:Subjects", label_sv: "Subject"},
        					{refId: "foaf_knows"}
        				]});
//        alert(this.exportJSON());
	},
	importJSON: function(from) {
		this.inherited("importJSON", arguments);
		
		if (from.children) {
			for (var index in from.children) {
				var jsonChild = from.children[index];
				if (jsonChild.type) {
					var realChild = this.addInside(jsonChild.type, "last", true);
					if (realChild) {
						realChild.importJSON(jsonChild);
					}
				}	
			}
			this.buttonsUpdate();
		}
	},
	exportJSON: function() {
		debugger;
		var result = this.inherited("exportJSON", arguments);
		result.type = "group";
		var arrChilds = this.formitemChildren.getChildren();
		if (arrChilds.length > 0) {
			result.children = [];
			for (var i=0;i<arrChilds.length;i++) {
				result.children.push(arrChilds[i].exportJSON());
			}
		}
		return result;
	}
});