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

dojo.provide("imlfolio.apps.DefaultFolio");
dojo.require("folio.WidgetApplication");
dojo.require("imlfolio.TreeModel");
dojo.require("folio.simple.List");
dojo.require("folio.simple.ThickList");
dojo.require("folio.simple.Tree");
dojo.require("folio.simple.Overview");
dojo.require("folio.simple.Details");
dojo.require("folio.simple.Content");
dojo.require("folio.simple.Message");
dojo.require("folio.simple.NavigationBar");
dojo.require("dijit.layout.BorderContainer");
dojo.require("folio.create.CreateWizard");
dojo.require("folio.editor.ResourceEditor");
dojo.require("folio.editor.AnnotationProfileEditor");
dojo.require("folio.editor.EntryAdminEditor");
dojo.require("dijit.Tree");

/**
 * The special Iml DefaultFolio.
 * Some of the options and buttons are removed from this class,
 * but the code to remove them is wrapped in massive if cases.
 * The idea is that hopefully the system will not break  if something change in future versions of Confolio. 
 */
dojo.declare("imlfolio.apps.DefaultFolio", folio.WidgetApplicationAbstract, {
	templatePath: dojo.moduleUrl("imlfolio.apps", "DefaultFolioTemplate.html"),
    widgetsInTemplate: true,
	constructor: function(args) {
	},
	startup: function() {
		this.inherited("startup", arguments);
		this.bc.resize();
		
		// Hide the Organic.Edunet project condition
		if (this.createDialog &&
			this.createDialog.getCreateWizard() &&
			this.createDialog.getCreateWizard().hasCondition) {
			this.createDialog.getCreateWizard().hasCondition = false;
			this.createDialog.getCreateWizard().reset();
		}
		
		// Hide the new object button
		if (this.listView &&
			this.listView.editBar &&
			this.listView.editBar.createButton &&
			this.listView.editBar.createButton.domNode) {
			this.listView.editBar.createButton.domNode.style.display = "none";
		}
		
		// Change what is displayed in the view to the left
		if (this.overView &&
			this.overView.tabOverview) {
			
			// Remove the contacts, featured and rss icons in the icon view
			if (this.overView.tabOverview.icons &&
				this.overView.tabOverview.icons.entry2Icon) {
				this.overView.tabOverview.icons.entry2Icon = {"_top": "folder_home", "_trash": "trashcan_full"};
			}
			
			// Change what is displayed in the tree view by redefining the initTree method in folio.simple.Tree
			// See imlfolio.TreeModel
			if (this.overView.tabOverview.tree &&
				this.overView.tabOverview.tree.initTree) {
				var tree = this.overView.tabOverview.tree;
				tree.initTree = dojo.hitch(tree.initTree, function(context, root) {
					// Create a imlfolio.TreeModel
					var treeModel = new imlfolio.TreeModel({store: tree.store, application: tree.application, onlyLists: true, 
						context: context,root: root});
					tree.tree = new dijit.Tree({model: treeModel, showRoot: false,
								onClick: dojo.hitch(tree, function(entry) {
									tree.application.dispatch({action: "showEntry", entry: entry, source: tree});
								})
							});
					tree.treePort.addChild(tree.tree, 0);
				});
			}
		}
	}
});