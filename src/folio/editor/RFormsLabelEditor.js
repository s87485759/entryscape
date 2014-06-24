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

dojo.provide("folio.editor.RFormsLabelEditor");
dojo.require("dijit._Widget");
dojo.require("rdforms.model.Engine");
dojo.require("rdforms.model.Binding");
dojo.require("rdforms.template.ItemStore");
dojo.require("rdforms.template.Text");
dojo.require("dijit.form.TextBox");

dojo.declare("folio.editor.RFormsLabelEditor", [dijit._Widget], {
	entry: null,
	
	constructor: function(args) {
		this.application = __confolio.application;
		this.entry = args.entry;
		this.select = args.select;
		this.localize();
	},
	localize: function() {
		dojo.requireLocalization("folio", "annotationProfile");
		this.resourceBundle = dojo.i18n.getLocalization("folio", "annotationProfile");
	},

	buildRendering: function() {
		this.inherited("buildRendering", arguments);
		this.domNode = this.srcNodeRef || dojo.create("div");
		dojo.addClass(this.domNode, "labelEditor");
		this.textBox = new dijit.form.TextBox({trim: true}, dojo.create("div", null, this.domNode));
		this.application.getItemStore(dojo.hitch(this, function(itemStore){
			var mpLabel = this.application.getConfig().getLabelTemplate(this.entry, "local");
			var template = itemStore.createTemplateFromChildren([mpLabel]);
			this.entry.setRefreshNeeded();
			this.entry.refresh(dojo.hitch(this, function() {
				this._valueBinding = folio.data.getLabelRForms(this.application.getConfig(), itemStore, this.entry, true);
				this._displayedValue = this._valueBinding.getValue();
				if (this._displayedValue === "") {
					this._displayedValue = folio.data.getLabel(this.entry);					
				}
				this.textBox.set("value", this._displayedValue);
				if (this.select) {
					this.textBox.focusNode.select();
				}
			}));
		}));
	},
	focus: function() {
		this.textBox.focus();
	},
	save: function() {
		var newValue = this.textBox.get("value");
		if (newValue === this._displayedValue) {
			return true;
		}
		this._valueBinding.setValue(this.textBox.get("value"));
		var onSuccess = dojo.hitch(this, function(){
			this.entry.refresh(dojo.hitch(this, function(entry){
				this.application.dispatch({action: "changed", entry: entry, source: this});
				this.application.getStore().updateReferencesTo(entry);
			}));
			this.application.getMessages().message(this.resourceBundle.metadataSaved+this.entry.getUri());
		});
		var onError = dojo.hitch(this, function(message){
			if(message.status===412){
				this.application.getMessages().warn(this.resourceBundle.modifiedPreviouslyOnServer);
			} else { 
				this.application.getMessages().warn(this.resourceBundle.failedSavingUnsufficientMDRights);
			}
		}); 

		this.entry.saveLocalMetadata(this._valueBinding.getGraph()).then(onSuccess, onError);
		return false;
	}
});