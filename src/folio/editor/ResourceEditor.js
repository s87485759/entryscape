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

dojo.provide("folio.editor.ResourceEditor");
dojo.require("folio.Application");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("folio.ApplicationView");

dojo.declare("folio.editor.ResourceEditor", null, {
	widgetsInTemplate: true,
	handle: function(event) {
		//override me.
	},
	onFinish: function() {
		//override me.
	},
	resize: function() {
		//Must exist so that it can be added to contentpane programmatically.
		//override me.
	}
});


dojo.declare("folio.editor.ResourceEditorDialog", [dijit._Widget, dijit._Templated, folio.ApplicationView], {
	widgetsInTemplate: true,
	templateString: "<div><div dojoAttachPoint=\"dialog\" dojoType=\"dijit.Dialog\">" +
			"<div dojoAttachPoint=\"contentPane\" dojoType=\"dijit.layout.ContentPane\"></div></div></div>",
	getSupportedActions: function() {
		return ["showResourceEditor"];
	},
	handle: function(event) {
		this.showDialog(event, event.widgetClass, event.dialogTitle);
	},
	showDialog: function(event, cls, title) {
/*		this.resourceEditor = new cls({region: "center"});
		this.resourceEditor.setApplication(this.application);
		this.contentPane.attr("content", this.resourceEditor.domNode);*/
		this.contentPane.attr("content", "<div dojoType='"+cls.prototype.declaredClass+"' region='center'></div>");
		this.resourceEditor = this.contentPane.getDescendants()[0];
		this.resourceEditor.setApplication(this.application);
		this.resourceEditor.onFinish = dojo.hitch(this, function() {
			this.dialog.hide();
		});
		this.resourceEditor.handle(event);
		this.dialog.titleNode.innerHTML = title ? title : "Change resource";
		var viewport = dijit.getViewport();
		
		var dialogWidth = event.width ? event.width : Math.floor(viewport.w * 0.70)+"px";
		var dialogHeight = event.height ? event.height : Math.floor(viewport.h * 0.65)+"px";
		
		dojo.style(this.contentPane.domNode, {
                        width: dialogWidth, height: dialogHeight, overflow: "auto",
                        position: "relative"    // workaround IE bug moving scrollbar or dragging dialog
		});
		this.contentPane.resize();
		this.dialog.show();
	}
});