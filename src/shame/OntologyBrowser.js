dojo.provide("shame.OntologyBrowser");
dojo.require("dijit.form.TextBox")

dojo.declare("shame.OntologyBrowser", [dijit._Widget, dijit._Templated], {
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("shame", "OntologyBrowserTemplate.html"),	
	constructor: function(args) {
	},
	postCreate: function() {
		this.inherited("postCreate", arguments);
		dojo.connect(this.searchField, "onKeyUp", this, function(evt) {
			if(evt.keyCode == dojo.keys.ENTER) {
	            dojo.stopEvent(evt);
	    		console.log("searched for term: "+this.searchField.attr("value"));
	    		this.searchClicked();
	        }
		});
	},
	searchClicked: function() {
		var search = this.searchField.attr("value");
		this.store.fetch({query: {}, sort: [{attribute: "n"}], scope: this, onComplete: function(choices) {
			this.updateList(choices);
		}});
	},
	prepare: function(formNode) {
		this.formNode = formNode;
		this.store = formNode.getTemplateNode().getVocabularyStore();
		this.treeCP.attr("content", new dijit.Tree({region: "left", splitter: true, store: this.store, childrenAttr: ["children"], 
				query: {top: true}, onClick: function(item) {
					/*if (cp.isSelectable(item)) {
						cp.setItem(item);
					}*/
				}}));
	},
	updateList: function(list) {
		var div = document.createElement("div");
		for(var i=0;i<list.length;i++) {
			var childDiv = document.createElement("div");
			childDiv.innerHTML = this.store.getValue("n", list[i]);
			childDiv.id = "__"+this.store.getValue("d", list[i]);
			div.appendChild(childDiv);
		}
		this.filteredChoices.attr("content", div);
	}
});