dojo.provide("folio.content.RTE");
dojo.require("dijit._Widget");
dojo.require("dijit.Editor");

// Commom plugins
dojo.require("dijit._editor.plugins.FullScreen");
dojo.require("dijit._editor.plugins.LinkDialog");
dojo.require("dijit._editor.plugins.Print");
dojo.require("dijit._editor.plugins.ViewSource");
dojo.require("dijit._editor.plugins.FontChoice");
dojo.require("dijit._editor.plugins.TextColor");
dojo.require("dijit._editor.plugins.NewPage");
dojo.require("dijit._editor.plugins.ToggleDir");

//Extension (Less common) plugins
dojo.require("dojox.editor.plugins.ShowBlockNodes");
dojo.require("dojox.editor.plugins.ToolbarLineBreak");
dojo.require("dojox.editor.plugins.Save");
dojo.require("dojox.editor.plugins.InsertEntity");
dojo.require("dojox.editor.plugins.Preview");
dojo.require("dojox.editor.plugins.PageBreak");
dojo.require("dojox.editor.plugins.PrettyPrint");

// Experimental Plugins
dojo.require("dojox.editor.plugins.NormalizeIndentOutdent");
dojo.require("dojox.editor.plugins.FindReplace");

dojo.extend(dojox.editor.plugins.Save, {save: function(content) {
// Set the default header to post as a body of text/html.
    var headers = {
            "Content-Type": "text/html"
    };
    if(this.url){
            var putArgs = {
                    url: this.url,
                    putData: content,
                    headers: headers,
                    handleAs: "text"
            };
            this.button.set("disabled", true);
            var deferred = dojo.xhrPut(__confolio.application.getCommunicator().insertAuthArgs(putArgs));
            deferred.addCallback(dojo.hitch(this, this.onSuccess));
            deferred.addErrback(dojo.hitch(this, this.onError));
    }else{
            console.log("No URL provided, no post-back of content: " + content);
    }
}});

dojo.declare("folio.content.RTE", [dijit.layout._LayoutWidget], {
	entry: null,
	editMode: false,
 
 	isEditable: function() {
		return this.entry.getLocationType() === folio.data.LocationType.LOCAL && this.entry.isResourceModifiable();
	},
 	toggleEditMode: function() {
		this.editMode = ! this.editMode;
		if (this.editMode) {
			this._setEditor();
		} else {
			this._setPresenter();
		}
	},
	inEditMode: function() {
		return this.editMode;
	},

	buildRendering: function() {
        this.domNode = this.srcNodeRef || dojo.create("div", null);
		this._setPresenter();
	},
	_setPresenter: function() {
		dojo.attr(this.domNode, "innerHTML", "");
        dojo.addClass(this.domNode, "contentPresentationMode");
		dojo.xhrGet(__confolio.application.getCommunicator().insertAuthArgs({
			url:this.entry.getResourceUri(),
			handleAs: "text",
			preventCache: true,
			load: dojo.hitch(this, function(data) {
				this.editor = new dijit.layout.ContentPane({content: data, height: "100%"}, dojo.create("div", null, this.domNode));
			}),
			error: dojo.hitch(this, function() {
				this.editor = new dijit.layout.ContentPane({content: "No text yet", height: "100%"}, dojo.create("div", null, this.domNode));				
			})
		}));
	},
	_setEditor: function() {
		dojo.attr(this.domNode, "innerHTML", "");
        dojo.removeClass(this.domNode, "contentPresentationMode");
		var plugins = [
			{name: 'viewSource', stripScripts: true, stripComments: true}, 
			'showBlockNodes', 'newPage', {name: 'save', url: this.entry.getResourceUri()}, '|',
			{name: 'fullscreen', zIndex: 900}, 'preview', 'print', '|',
			'selectAll', 'cut', 'copy','paste', 'delete', 'undo', 'redo', '|',
			'bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', '|',
			'pageBreak', 'insertHorizontalRule', 'insertOrderedList', 'insertUnorderedList', 'indent', 'outdent', '|',
			'justifyLeft', 'justifyRight', 'justifyCenter', 'justifyFull', 'toggleDir', '|',
			'insertEntity', 'createLink', 'unlink', 'insertImage', 'findreplace', '||',
			'fontName', 'fontSize', 'formatBlock', 'removeFormat', 'foreColor', 'hiliteColor', 
			{name: 'prettyprint', indentBy: 3, lineLength: 80, entityMap: dojox.html.entities.html.concat(dojox.html.entities.latin)},
			{name: 'dijit._editor.plugins.EnterKeyHandling', blockNodeForEnter: "P"},
			'normalizeindentoutdent'
		];
		dojo.xhrGet(__confolio.application.getCommunicator().insertAuthArgs({
			url: this.entry.getResourceUri(),
			handleAs: "text",
			preventCache: true,
			load: dojo.hitch(this, function(data) {
				this.editor = new dijit.Editor({value: data, plugins: plugins, height: "100%"}, dojo.create("div", null, dojo.create("div", {}, this.domNode)));
			}),
			error: dojo.hitch(this, function() {
				this.editor = new dijit.Editor({value: "", plugins: plugins, height: "100%"}, dojo.create("div", null, dojo.create("div", {}, this.domNode)));
			})
		}));
	},
	resize: function() {
		this.inherited("resize", arguments);
		if (this.editor) {
			this.editor.resize();			
		}
	}
});