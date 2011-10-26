dojo._hasResource["shame.formulator.ToolbarTitlePane"] = true;
dojo.provide("shame.formulator.ToolbarTitlePane");
dojo.require("dijit.layout.LayoutContainer");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.TitlePane");
dojo.require("dijit.form.Button");

dojo.require("dijit.form.TextBox");  
dojo.require("dijit.form.TimeTextBox");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.DateTextBox");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.form.Textarea");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.NumberSpinner");
dojo.require("dijit.Toolbar");

dojo.declare("shame.formulator.ToolbarTitlePane", dijit.TitlePane, {
	constructor: function(parameters, srcNodeRef) {
	},
	postCreate: function() {
		this.inherited("postCreate", arguments);
		var node = document.createElement("Div");
		this.titleBarNode.insertBefore(node, this.titleNode);
		this.toolbar = new dijit.Toolbar({}, node);
		this.toolbar.domNode.setAttribute("style", "float: right;position: relative;top: -7px;right: 10px;background: none");
	},
	getToolbar: function() {
		return this.toolbar;
	}
});