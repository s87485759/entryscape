dojo.provide("shame.meditor.ResourceList");
dojo.require("dojox.grid.compat.Grid");
dojo.require("dojox.grid.compat._data.model");

dojo.declare("shame.meditor.ResourceList", dojox.Grid, {
	constructor: function() {		
		this.structure = [{
			type: "shame.meditor.AutoScrollView",
			cells: [
			[{name: "Title", width: "100%", headerStyles: '',cellStyles: 'font-weight: bold;'}],
			[{name: "Description", width: "100%", cellStyles: 'font-style: italic ; max-height: 20px ; overflow: hidden;'}]
		]}];
	},
	getResource: function(rowIndex) {
		return this.orderedURIs[rowIndex];		
	},
	build: function(struct) {
		var data = [];
		var bindings = struct.results.bindings;
		this.resultEntries = {};
		for (var i=0; i<bindings.length; i++) {
			var row = bindings[i];
			if (!this.resultEntries[row.res.value]) {
				this.resultEntries[row.res.value] = {};
			}
			if (row.title) {
				this.resultEntries[row.res.value].title = row.title.value;
			}
			if (row.desc) {
				this.resultEntries[row.res.value].desc = row.desc.value;
			}
		}
		this.orderedURIs = [];
		var data = [];
		for (var uri in this.resultEntries) {
			this.orderedURIs.push(uri);
			var entry = this.resultEntries[uri];
			data.push([entry.title?entry.title:"no title", entry.desc]);
		}		
		this.setModel(new dojox.grid.data.Table(null, data));
	}
});

dojo.declare("shame.meditor.AutoScrollView", dojox.GridView, {
	hasScrollbar: function(){
		return (this.scrollboxNode.clientHeight != this.scrollboxNode.scrollHeight); // Boolean
	},
    adaptWidth: function(){
		this.inherited("adaptWidth", arguments);
		if (!this.hasScrollbarMemory) {
			console.log("no scrollbar");
			this.noscroll = true;
			this.inherited("adaptWidth", arguments);
			this.noscroll = false;		
		} else {
			console.log("scrollbar");
		}
		this.hasScrollbarMemory = this.hasScrollbar()
	},
	adaptHeight: function(){
		if(!this.grid.autoHeight){
			var h = this.domNode.clientHeight;
			dojox.grid.setStyleHeightPx(this.scrollboxNode, h);
		}
	}
});
