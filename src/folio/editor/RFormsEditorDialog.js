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

dojo.provide("folio.editor.RFormsEditorDialog");
dojo.require("dijit._Widget");
dojo.require("folio.editor.RFormsEditor");
dojo.require("folio.Application");
dojo.require("folio.ApplicationView");

dojo.declare("folio.editor.RFormsEditorDialog", [dijit._Widget, folio.ApplicationView], {
	constructor: function() {
		this.application = __confolio.application;
	},
	buildRendering: function() {
		this.dialog = new dijit.Dialog();
		var node = dojo.create("node");
		this.dialog.set("content", node);
		this.editor = new folio.editor.RFormsEditor({}, dojo.create("div", null, node));
		this.editor.startup();
		dojo.connect(this.editor, "doneEditing", this.dialog, "hide");
	},
	getSupportedActions: function() {
		return ["showMDEditor"];
	},
	handle: function(event) {
		switch (event.action) {
		case "showMDEditor":
			this.show(event.entry);
			break;
		}
	},
	show: function(entry) {
		console.log("showing dialog");
		this.editor.show(entry);
		var viewport = dijit.getViewport();
		dojo.style(this.editor.domNode, {
			width: Math.floor(viewport.w * 0.70)+"px",
                                        height: Math.floor(viewport.h * 0.70)+"px",
                                        overflow: "auto",
                                        position: "relative"    // workaround IE bug moving scrollbar or dragging dialog
				});
		this.editor.resize();
		dijit.focus(this.editor.domNode);
		this.dialog.show();
	}
});