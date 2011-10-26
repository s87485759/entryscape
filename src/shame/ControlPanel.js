dojo._hasResource["shame.ControlPanel"] = true;
dojo.provide("shame.ControlPanel");
dojo.require("dijit.Toolbar");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Button");
dojo.require("shame.Connector");

dojo.declare("shame.ControlPanel", null, {
	constructor: function(parameters) {
		// parameters:
		// loader the central class that loads the FormModel and FormTemplate and builds the GUI.
		// domNodeId used to detect a position for the controlpanel.
		// defaultResource an initial resource-URI (optional) to be chown in the load dialog.
		// defaultAP an initial Annotation Profile to be chown in the load dialog.
		// defaultService an initial service-URI to load and save metadata records from.
		// baseFTURL a base URL used when generating URLs for requesting FormTemplates.
		// baseFMURL a base URL used when generating URLs for requesting FormModels.
		
		console.debug("Intializing Control-panel");
		this.loader = parameters.loader;
		this.connector = new shame.ServiceConnector(parameters.loader, parameters.baseFTURL, parameters.baseFMURL);
		this.domNode = dojo.byId(parameters.domNodeId);
		
		var self = this;
		this.controlPanel = new dijit.Toolbar({}, this.domNode);		
		this.controlPanel.addChild(new dijit.form.Button({
			label: this.getModeLabel(), 
		    onClick: function() {
				self.loader.changeMode();
				this.setLabel(self.getModeLabel());
				}}));

		var openDialogNode = document.createElement("div");
		this.domNode.appendChild(openDialogNode);
	
		openDialogNode.innerHTML = "<div id='od' dojoType='dijit.Dialog'><form id='of'><table>" +
				"<tr><td><b>Resource:</b></td><td><div name='resource' value='" + parameters.defaultResource + "' dojoType='dijit.form.TextBox'></div></td></tr>" +
				"<tr><td><b>Repository:</b></td><td><div name='sparqlservice' value='" + parameters.defaultService + "' dojoType='dijit.form.TextBox'></div></td></tr>" +
				"<tr><td><b>Profile:</b></td><td><div name='ap' value='" + parameters.defaultAP + "' dojoType='dijit.form.TextBox'></div></td></tr>" +
				"</table></form><div id='but' dojoType='dijit.form.Button' label='Open'></div></div>";
		dojo.parser.parse(openDialogNode);
		this.openDialogWidget = dijit.byId("od");
		var dialog = this.openDialogWidget;
		this.dialogForm = dojo.byId('of');
		dojo.connect(dijit.byId('but'), 'onClick', this, 'openClicked');
		if (this.loader.isEmpty()) {
			dialog.show();
		}
		this.controlPanel.addChild(new dijit.form.Button({
			label: "Open", 
		    onClick: function() {
		    	dialog.show();
				}}));
		this.controlPanel.addChild(new dijit.form.Button({
			label: "Save", 
		    onClick: function() {
		    	self.loader.save();
				}}));
		this.controlPanel.addChild(new dijit.form.Button({
			label: "Clear", 
		    onClick: function() {
		    	self.loader.clear();
				}}));
		this.controlPanel.startup();
	},
	getModeLabel: function() {
		if (this.loader.present) {
			return "Edit";
		} else {
			return "Present";
		}		
	},
	openClicked: function() {
		console.debug("openClicked");
		this.loader.clear();
		this.openDialogWidget.hide();
		this.connector.setResource(this.dialogForm.resource.value);
		this.connector.setAP(this.dialogForm.ap.value);
		this.connector.setRepository(this.dialogForm.sparqlservice.value);
		if (this.connector.operational()) {
			this.connector.load();
		}
	}
});