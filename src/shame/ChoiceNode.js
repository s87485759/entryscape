dojo.provide("shame.ChoiceNode");
dojo.require("shame.FormNode");

dojo.require("dojo.parser");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.Dialog");
dojo.require("dijit.Tree");

dojo.declare("shame.ChoiceNode", shame.AbstractRowNode, {
	constructor: function (struct, templateNode) {
//		console.debug("ChoiceNode constructed");
	},
	
	generateValueField: function(container) {
		var tn = this.getTemplateNode();
		if (tn.hasVocabulary()) {
			if (false) { //tn.hasStyle("ExpandableTree")) {
				var fs = document.createElement("div");
				container.appendChild(fs);
				new dijit.form.FilteringSelect({store: tn.getVocabularyStore(),
								query: {top: true}}, fs);
				
				el.innerHTML = "<div dojoType=\"dijit.form.FilteringSelect\" width=\"100%\"></div>";
				var instances = dojo.parser.parse(el);
				var cp = new shame.ChoicePresenter(this, null, instances[0]);
				this.getFormModel()._connectBrowseOntology(container, cp);
				var self = this;
				var tree = new dijit.Tree({store: tn.getVocabularyStore(), 
								childrenAttr: ["children"], 
								query: {top: true}});
				instances[1].attr("content", tree.domNode);
				tree.onClick = function(item) {
					if (cp.isSelectable(item)) {
						cp.setItem(item);
					}
				};
				tree.getLabelClass = function(item) {
					if(item == null)
						return "";
					if(this.store.getValue(item, "selectable") === false)
						return "notselectable";
					if (item == cp.currentItem) {
						return "currentselection";
					}
					return "default";
                };
                                 
			} else if (tn.getSizeOfVocabulary() <= 5 &&
				tn.isMaxOccurenceBounded() && tn.getMaxOccurence() == 1) {
				var store = tn.getVocabularyStore();
				var node = this;	
				var gotItems = function(items, request) {
					for (var i=0; i<items.length;i++) {
						var item = items[i];
						var input = document.createElement("input");
						container.appendChild(input);
						var rb = new dijit.form.RadioButton({
							name: tn.getId(),
							value: store.getValue(item, "d"),
							checked: store.getValue(item, "d") == node.getValue()
							}, input);
						dojo.connect(rb, "onClick", function() {
								node.setValue(this.value);
							});
						container.appendChild(document.createTextNode(store.getValue(item, "n")+" "));
						if (i < items.length-1){
						    container.appendChild(document.createElement("br"));
						}
					}
				}
				store.fetch({onComplete: gotItems});
			} else {
				var select = document.createElement("select");
				container.appendChild(select);
				var selel = new dijit.form.FilteringSelect({store: tn.getVocabularyStore(), disabled: this.isDisabled(), size: "100%", autoComplete: true, searchAttr: "n"}, select);
				if (this.hasValue()) {
					selel.attr("value", this.getValue());
				}
				var node = this;
				selel.onChange = function (newvalue) {
					node.setValue(newvalue);
				};
				
				if (tn.hasStyle("ExpandableTree")) {
					this.getFormModel()._connectBrowseOntology(container, this, selel);
				}
			}
		}
	}
});

dojo.declare("shame.PresentationChoiceNode", shame.AbstractRowNode, {
	constructor: function (struct, templateNode) {
	},
	generateValueField: function(container) {
		var span = document.createElement("span");
		container.appendChild(span);		
		new shame.ChoicePresenter(this, span);
	}
});

dojo.declare("shame.ChoicePresenter", null, {
	constructor: function (node, span, button) {
		this.node = node;
		this.store = this.node.getTemplateNode().getVocabularyStore();
		this.span = span;
		this.button = button;
		this.currentItem = null;
		this.setDefaultValue();	
	},
	setValue: function(value) {
		var self = this;
		var tn = this.node.getTemplateNode();
		if (tn.hasVocabulary()) {			
			this.store.fetchItemByIdentity({identity: value, onItem: function(item) {
				self.setItem(item);
			}});			
		}
	},
	isSelectable: function(item) {
		return this.store.getValue(item, "selectable") !== false;
	},
	setItem: function(item, outsideVocabLabel) {
		var oldItem = this.currentItem;
		this.currentItem = item;
		if (oldItem != null) {
			this.store.setValue(oldItem, "_selected", false);
		}

		if (item != null) {
			this.node.setValue(this.store.getValue(item, "d"));
			this.store.setValue(item, "_selected", true);
			this.setLabel(this.store.getValue(item, "n"));
		} //Case when a choice-literal is out of scope
		  //only to be used in presentation-mode! 
		else if(outsideVocabLabel){
			this.setLabel(outsideVocabLabel);
		} else {
			this.setLabel("Error: Value not in vocabulary.");
		}
	},
	setLabel: function(str) {
		if (str == null) {
			if (this.span) {
				if (this.span.firstChild) {
					this.span.removeChild(this.span.firstChild);					
				}
			} else if (this.button) {
				this.button.attr("label", "");
			}
		} else {
			if (this.span) {
				if (this.span.firstChild) {
					this.span.removeChild(this.span.firstChild);
				}
				this.span.appendChild(document.createTextNode(str));							
			} else if (this.button) {
				this.button.attr("label", str);
			}
		}
	},
	setDefaultValue: function() {
		if (this.node.hasValue()) {
			if (this.node.struct.onlyForPresentation) {//ie outside of vocab.
				this.setItem(null, this.node.getValue());
			}
			else {
				this.setValue(this.node.getValue());
			}
		}
	}
});