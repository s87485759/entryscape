/*
 * Copyright (c) 2007-2010
 *
 * This file is part of Confolio.
 *
 * Confolio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Confolio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Confolio. If not, see <http://www.gnu.org/licenses/>.
 */

dojo.provide("folio.create.Create");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("folio.editor.MinimalMetadata");
dojo.require("folio.create.ACL");
dojo.require("folio.create.TypeDefaults")

dojo.declare("folio.create.Create", [dijit._Widget, dijit._Templated], {
	attributeMap: dojo.mixin(dojo.clone(dijit.layout.ContentPane.prototype.attributeMap), {
		createTypeLabel: {node: "createTypeLabel", type: "innerHTML"}
	}),
	createTypeLabel: "",
	
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("folio", "create/CreateTemplate.html"),	
	constructor: function(args) {
	},
	postCreate: function() {
		this.inherited("postCreate", arguments);
		this.localize();
		dojo.connect(this.metadata, "onChange", this, "onChange");
	},
	onChange: function() {
		//connect to this function.
	},
	isReady: function() {
		return this.createType != undefined && this.createType != "" && this.metadata.isReady();
	},
	localize: function() {
		dojo.requireLocalization("folio", "create");
		this.resourceBundle = dojo.i18n.getLocalization("folio", "create");
		this.attr(this.resourceBundle);
	},
	launch: function(context, folder) {
		//Init the store.
		this.context = context;
    	this.createTypeSelect.store=folio.create.createTypeStore;
		this.acl.launchNew(context);
	},
	typeSelected: function(type) {
		var self = this;
		this.createType = type;
		folio.create.createTypeStore.fetchItemByIdentity({identity:type, onItem: function(item) {
			self.scheme = folio.create.createTypeStore.getValue(item, "scheme");			
		}});
		this.onChange();
	},
	getCreateObject: function(onFinish) {
		var obj = {metadata: this.metadata.getMetadata(this.context.getBase() + this.context.getId()+"/resource/_newId").exportRDFJSON(), 
				   params: {locationType: "local"}};
		if (this.scheme == "bT") {
			obj.params.builtinType= this.createType;
			obj.params.representationType= "informationresource";
		} else {
			obj.params.builtinType= "none";
			obj.params.representationType= "namedresource";
			obj.metadata[folio.data.RDFSchema.TYPE] = this.createType;
		}
		if (this.acl.hasACL()) {
			this.acl.exportAclToList(dojo.hitch(this, function(list) {
				obj.info = folio.data.createEntryGraphFromACLList(this.context, list).info.exportRDFJSON();
				onFinish(obj);
			}));
		} else {
			onFinish(obj);
		}
	}
});