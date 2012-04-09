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
dojo.require("rforms.model.Engine");
dojo.require("rforms.model.Binding");
dojo.require("rforms.template.ItemStore");
dojo.require("rforms.template.Template");
dojo.require("rforms.template.Text");
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
			var mp = this.application.getConfig().getMPForLocalMD(this.entry);
			var template = itemStore.createTemplateFromChildren([mp.label]);
			this.entry.setRefreshNeeded();
			this.entry.refresh(dojo.hitch(this, function() {
				this._displayedValue = folio.data.getLabel(this.entry);
				this.textBox.set("value", this._displayedValue);
				if (this.select) {
					this.textBox.focusNode.select();
				}
				this.graph = new rdfjson.Graph(this.entry.getLocalMetadata().exportRDFJSON());
				this._rootBinding = rforms.model.match(this.graph, this.entry.getResourceUri(), template);
				this._valueBinding = this._findOrCreateChildBinding(this._rootBinding);
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

		var modDate = dojo.date.stamp.fromISOString(this.entry.getModificationDate());		
		this.entry.getContext().communicator.saveJSONIfUnmodified(
				this.entry.getLocalMetadataUri(),
				this.graph.exportRDFJSON(), modDate.toUTCString(),
				onSuccess, onError);
		return false;
	},
	_findOrCreateChildBinding: function(binding) {
		if (binding instanceof rforms.model.ValueBinding) {
			return binding;
		}
		var cbs = binding.getItemGroupedChildBindings();
		if (cbs.length > 0) {
			var childItem = binding.getItem().getChildren()[0];
			var vbs = cbs[0];
			if (vbs.length === 0) {
				var b = rforms.model.create(binding, childItem, {});
				if (b instanceof rforms.model.ValueBinding) {
					b.setLanguage(dojo.locale);
				}
				return this._findOrCreateChildBinding(b);
			} else {
				if (!childItem instanceof rforms.template.Text) {
					return this._findOrCreateChildBinding(vbs[0]);					
/*				} else if (childItem.getNodetype() === "LANGUAGE_LITERAL") {
					var vb = vbs[0];
					var result = {};
					for (var i=0;i<vbs.length;i++) {
						var lang = vbs[i].getLanguage();
						if (lang == null) {
							result.emptyLanguageValue = vbs[i];
						} else {
							if (lang == dojo.locale) {
								result.perfectLocaleLanguageValue = vbs[i];
							} else if (lang.substring(0, 1) == dojo.locale.substring(0, 1)) {
								result.localeLanguageValue = vbs[i];
							} else if (lang.indexOf("en") != -1) {
								result.englishLanguageValue = vbs[i];
							} else {
								result.anyLanguageValue = vbs[i];
							}
						}
					}
					return result.perfectLocaleLanguageValue 
						|| result.localeLanguageValue 
						|| result.englishLanguageValue 
						|| result.emptyLanguageValue
						|| vb;*/
				} else {
					var vb = vbs[0];
					for (var i=0;i<vbs.length;i++) {
						if (vbs[i].getValue() === this._displayedValue) {
							vb = vbs[i];
							break;
						}
					}
					return vb;
				}
			}
		}
	}
});