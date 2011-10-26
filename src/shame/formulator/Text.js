dojo._hasResource["shame.formulator.Text"] = true;
dojo.provide("shame.formulator.Text");
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
dojo.require("dijit.form.Form");

dojo.declare("shame.formulator.Text", [dijit._Widget, shame.formulator.FormItem, dijit._Templated], {
	templatePath: dojo.moduleUrl("shame.formulator", "TextTemplate.html"),
    widgetsInTemplate: true,
	constructor: function(parameters, srcNodeRef) {
	},
	postCreate: function() {
		this.inherited("postCreate", arguments);
		this.addToToolbar();
	},
	exportJSON: function() {
		var result = this.inherited("exportJSON", arguments);
		result.type = "text";
		return result;
	}
});