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

dojo.provide("folio.editor.RFormsEditor");
dojo.require("folio.editor.EntryChooser");
dojo.require("dijit.layout._LayoutWidget");
dojo.require("folio.Application");
dojo.require("rforms.view.Editor");

dojo.declare("folio.editor.RFormsEditor", [dijit.layout._LayoutWidget, dijit._Templated], {
	dialogTitle: "",
	dialogCancelLabel: "",
	dialogDoneLabel: "",
	dialogDoneBusyLabel: "",
	dataLabel: "",
	mandatoryLabel: "",
	recommededLabel: "",
	optionalLabel: "",
	colorLabel: "",
	optional: false,
	recommended: true,
	attributeMap: dojo.mixin(dojo.clone(dijit.layout.ContentPane.prototype.attributeMap), {
        mandatoryLabel: {node: "mandatoryLabelNode", type: "innerHTML"},
        recommendedLabel: {node: "recommendedLabelNode", type: "innerHTML"},
        optionalLabel: {node: "optionalLabelNode", type: "innerHTML"},
        colorLabel: {node: "colorLabelNode", type: "innerHTML"}
	}),

	templatePath: dojo.moduleUrl("folio", "editor/RFormsEditorTemplates.html"),
	widgetsInTemplate: true,

	constructor: function() {
		this.application = __confolio.application;
	},
	resize: function() {
		this.inherited("resize", arguments);
		if (this.bc) {
			this.bc.resize();
		}
	},
	postCreate: function() {
		this.inherited("postCreate", arguments);
		dojo.subscribe("/confolio/localeChange", dojo.hitch(this, this.localize));
		this.localize();		
	},
	localize: function() {
		dojo.requireLocalization("folio", "annotationProfile");
		this.resourceBundle = dojo.i18n.getLocalization("folio", "annotationProfile");
		if (this.resourceBundle) {
			this.set(this.resourceBundle);
		}
	},
	show: function(entry, ID) {
		this._show(entry, ID);
	},
	_show: function(entry, rformsIDs, refresh) {
		if (this.editor != null) {
			this.editor.destroy();
		}
		if (refresh !== true) {
			if (entry == null) {
				return;
			}
			this.entry = entry;
			this.graph = new rdfjson.Graph(entry.getLocalMetadata().exportRDFJSON());
		}
		this.explicitRforms = rformsIDs;
		this.application.getItemStore(dojo.hitch(this, function(itemStore) {
			var config = this.application.getConfig();
			var graph = entry.getLocalMetadata();
			var langs = config.getMPLanguages();
			var mp = config.getMPForLocalMD(entry);
			if (!this.explicitRforms || this.explicitRforms.length < 1) {
				var template = itemStore.detectTemplate(graph, entry.getResourceUri(), (mp != null && mp.items != null ? mp.items : null));
			} else {
				var mpItems = (mp != null && mp.items != null ? mp.items : null); 
				var explicitPlusMp = this.explicitRforms;
				if(mpItems){
					explicitPlusMp.concat(mpItems);
				}
				template = itemStore.detectTemplate(graph, entry.getResourceUri(), explicitPlusMp);
			}
//			var template = itemStore.createTemplateFromChildren([folio.data.DCTermsSchema.TITLE,folio.data.DCTermsSchema.DESCRIPTION]);
			var binding = rforms.model.match(this.graph, entry.getResourceUri(), template);
			var includeLevel = this.optional ? "optional" : this.recommended ? "recommended" : "mandatory";
			this.editor = new rforms.view.Editor({template: template, languages: langs, binding: binding, includeLevel: includeLevel}, dojo.create("div", null, this.rformsEditorNode));			
		}));
	},
	editStateColorChange: function() {
	},
	recommendedChange: function() {
		this.recommended = !this.recommended;
		this.show(this.entry);
	},
	optionalChange: function() {
		this.optional = !this.optional;
		this.recommendedCheckBox.set("disabled", this.optional);
		if (this.optional) {
			this.recommendedCheckBox.set("checked", true);
		}
		this._show(this.entry, this.explicitRforms, true);
	},
	donePressed: function() {
		var onSuccess = dojo.hitch(this, function(){
			this.entry.refresh(dojo.hitch(this, function(entry){
				this.application.dispatch({action: "changed", entry: entry, source: this});
				this.application.getStore().updateReferencesTo(entry);
			}));
			delete this.entry;
			this.dialogDone.cancel();
			this.doneEditing();
		});
		var onError = dojo.hitch(this, function(message){
			if(message.status===412){
				this.application.message(this.modifiedPreviouslyOnServer);
			} else { 
			    this.application.message(this.failedSavingUnsufficientMDRights);
			}
			this.dialogDone.cancel();
		}); 

		var modDate = dojo.date.stamp.fromISOString(this.entry.getModificationDate());		
		this.entry.getContext().communicator.saveJSONIfUnmodified(
				this.entry.getLocalMetadataUri(),
				this.graph.exportRDFJSON(), modDate.toUTCString(),
				onSuccess, onError);
	},
	doneEditing: function() {
	},
	_setDialogCancelLabelAttr: function(value) {
		this.dialogCancel.set("label", value);
		this.dialogCancelLabel = value;
	},
	_setDialogDoneLabelAttr: function(value) {
		this.dialogDone.set("label", value);
		this.dialogDone._label = value; //Seems like a bug in BusyButton
		this.dialogDoneLabel = value;
	},
	_setDialogDoneBusyLabelAttr: function(value) {
		this.dialogDone.set("busyLabel", value);
		this.dialogDoneBusyLabel = value;
	}
});