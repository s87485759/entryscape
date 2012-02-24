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
	localize: function() {
		dojo.requireLocalization("folio", "editor");
		this.resourceBundle = dojo.i18n.getLocalization("folio", "editor"); 
	},

	buildRendering: function() {
		this.dialog = new dijit.Dialog();
		this.innerNode = dojo.create("div");
		this.dialog.set("content", this.innerNode);
		this.extPresenter = new folio.editor.RFormsPresenter({style: "float:left;height: 100%;border-right-style: solid", "class": "thinBorder"}, dojo.create("div", null, this.innerNode));
		this.editor = new folio.editor.RFormsEditor({style: "height:100%"}, dojo.create("div", null, this.innerNode));
		this.editor.startup();
		dojo.connect(this.editor, "doneEditing", this.dialog, "hide");
		this.localize();
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
		var viewport = dijit.getViewport();
		var w = Math.floor(viewport.w * 0.70);
		var leftw = Math.floor(w*0.4-7);
		var rightw = Math.floor(w*0.6-5);
		var h = Math.floor(viewport.h * 0.70);
		dojo.style(this.innerNode, {
			width: w+"px",
            height: h+"px",
            overflow: "auto",
            position: "relative"    // workaround IE bug moving scrollbar or dragging dialog
		});
		this.editor.show(entry);
		if (folio.data.isReference(entry)) {
			dojo.style(this.extPresenter.domNode, "display", "block");
			dojo.style(this.extPresenter.domNode, {"width": leftw+"px", "paddingRight": "5px"});
			dojo.style(this.editor.domNode, {"width": rightw+"px", "paddingLeft": "5px"});
			this.extPresenter.show(entry, true);
			this.dialog.set("title", this.resourceBundle.externalAndLocalMDEditorTitle);
		} else {
			dojo.style(this.extPresenter.domNode, "display", "none");
			dojo.style(this.editor.domNode, {"width": w+"px", "paddingLeft": "0px"});
			this.dialog.set("title", this.resourceBundle.LocalMDEditorTitle);
		}

		dijit.focus(this.innerNode);
		this.dialog.show();
		setTimeout(dojo.hitch(this, function() {
			this.editor.resize();
		}), 1);
	}
});