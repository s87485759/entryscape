dojo.provide("shame.formulator.List");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare("shame.formulator.List", [dijit._Widget, dijit._Templated], {
	// A very simple list view using a table where every item 
	// in the list is listed on one row.
	//
	templateString: "<div><table class=\"simpleList\" dojoAttachPoint='containerNode'></table></div>",	
	constructor: function(args) {
	},
	openOn: function(folderItem) {
		dojo.fadeOut({
				node: this.containerNode,
				duration:150,
				onEnd: dojo.hitch(this, this._replace, folderItem)
		}).play();
	},
	_replace: function(folderItem) {
		var childrenIds = folderItem.getResource();
		var context = folderItem.getContext();
		
		var self = this;
		folderItem.getChildren(function(childrenEntries) {
			while (self.containerNode.rows.length>0) {
				self.containerNode.deleteRow(0);
			}
			
			for (var i=childrenEntries.length-1; i>=0; i--) {
				self._insertItemRow(childrenEntries[i], i);
			}
			self._insertHead(folderItem);
			dojo.fadeIn({	
					node: self.containerNode,
					duration:150
			}).play();
		});		
	},
	_markRow: function(row, entry, clicked, event) {
		if (this.markedRow) {
			dojo.toggleClass(this.markedRow, "markedRow");
		}
		this.markedRow = row;
		dojo.toggleClass(this.markedRow, "markedRow");
		this.application.listViewEntrySelected(entry);			
		if (clicked) {
			this.application.listViewEntryClicked(entry);
		}
		event.stopPropagation();
	},
	_insertHead: function(list) {
		var th = this.containerNode.createTHead();
		var tr = th.insertRow(0);
		dojo.toggleClass(tr, "listHead");
		this._insertItemRowImpl(tr, list);
	},
	_insertItemRow: function(child, number) {
		var tr = this.containerNode.insertRow(this.containerNode.length);
		dojo.toggleClass(tr, "oddRow", number%2 != 0);
		dojo.toggleClass(tr, "clickable", child.isWebContent() || child.isList());
		this._insertItemRowImpl(tr, child);
	},
	_insertItemRowImpl: function(tr, child) {
		dojo.connect(tr, "onclick", dojo.hitch(this, this._markRow, tr, child, false));
		var td1 = tr.insertCell(0);
		dojo.toggleClass(td1, "firstColumn");
		var span = document.createElement("span");
		span.innerHTML = child.getLabel();
		td1.appendChild(span);
		dojo.connect(span, "onclick", dojo.hitch(this, this._markRow, tr, child, true));		
		var td2 = tr.insertCell(1);
		dojo.toggleClass(td2, "secondColumn");
		td2.innerHTML = child.getDescription();
	}
});