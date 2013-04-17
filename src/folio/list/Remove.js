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

dojo.provide("folio.list.Remove");
dojo.require("folio.WidgetApplication");
dojo.require("dojo.DeferredList");
dojo.require("dijit.ProgressBar");

dojo.declare("folio.list.Remove", [dijit.layout._LayoutWidget, dijit._Templated], {
	widgetsInTemplate: true,
	templatePath: null,
	templateString: "<div style=\"height:100%; width:100%\"><div dojoAttachPoint=\"contentPane\" style=\"height:100%; width:100%\"></div></div>",	
	constructor: function(args) {
		dojo.requireLocalization("folio", "remove");
		this.rBundle = dojo.i18n.getLocalization("folio", "remove");
	},
	
	startup: function() {
		this.containerNode = this.domNode;
		this.inherited("startup", arguments);
	},	
	show: function(args) {
		args.dialog = args.application.getDialog();
		args.dialog.clearButtons();
		if (args.entry.getId() == "_trash")  {
			args.dialog.addStandardButtons(dojo.hitch(this, this.removeCompletely, args));
			this.contentPane.innerHTML="<p>"+this.rBundle.emptyTrash + " </p>";
			args.dialog.show(this, this.rBundle.removeDialogTitle);
			return;		
		}
		
		if (args.entry instanceof folio.data.SystemEntry) {
			args.application.message(this.rBundle.removeSystemEntriesNA);
			return;
		}
		var referrents = args.entry.getReferrents();
		switch(referrents.length) {
			case 0: 
				if (args.parent.getId() == "_unlisted") {
					args.dialog.addStandardButtons(dojo.hitch(this, this.moveUnlistedToTrash, args));
				} else {
					args.dialog.addStandardButtons(dojo.hitch(this, this.moveToTrashNoParent, args));					
				}
				this.contentPane.innerHTML="<p>"+this.rBundle.moveToTrash+" </p>";
				args.dialog.show(this, this.rBundle.removeDialogTitle);
			break;
			case 1:
				//entry occurs in only one folder
				if (args.parent.getContext().getId() == "_search") {
//					args.application.message(this.rBundle.removeListedEntryFromSearchResultNA);
					this.contentPane.innerHTML="<p>"+this.rBundle.removeCompletely+" </p>";
					args.dialog.addStandardButtons(dojo.hitch(this, this.removeCompletely, args));
					args.dialog.show(this, this.rBundle.removeDialogTitle);
				} else if (args.parent.getId() == "_trash" || !args.accessToThrash) {
					this.contentPane.innerHTML="<p>"+this.rBundle.removeCompletely+ " </p>";
					args.dialog.addStandardButtons(dojo.hitch(this, this.removeCompletely, args));
					args.dialog.show(this, this.rBundle.removeDialogTitle);
				} else {
					this.contentPane.innerHTML="<p>"+this.rBundle.moveToTrash+ " </p>";
					args.dialog.addStandardButtons(dojo.hitch(this, this.moveToTrash, args));
					args.dialog.show(this, this.rBundle.removeDialogTitle);					
				}
				break;
			default:
				//entry occurs in many folders.
				//case A: remove from all folders and add to _trash NOT IMPLEMENTED
				//case B: remove only from this folder.
				if (args.parent.getContext().getId() == "_search") {
					args.application.message(this.rBundle.removeListedEntryFromSearchResultNA);
				} else if (args.parent.getId() == "_trash" || !args.accessToThrash) {
					this.contentPane.innerHTML="<p>"+this.rBundle.removeCompletely+" </p>";
					args.dialog.addStandardButtons(dojo.hitch(this, this.removeCompletely, args));
					args.dialog.show(this, this.rBundle.removeDialogTitle);
				} else{
					this.contentPane.innerHTML="<p>"+this.rBundle.removeFromFolder+" </p>";
					args.dialog.addButton(new dijit.form.Button({label:this.rBundle.removeFromCurrent, onClick: dojo.hitch(this, this.removeFromFolder, args)}));
					args.dialog.addButton(new dijit.form.Button({label:this.rBundle.removeFromAll, onClick: dojo.hitch(this, this.removeFromAllFolders, args)}));
					args.dialog.addCancelButton();
//			args.dialog.addStandardButtons(dojo.hitch(this, this.removeFromFolder, args));
					args.dialog.show(this, this.rBundle.removeDialogTitle);					
				}
		}
	},
	removeFromAllFolders: function(args) {
		args.dialog.clearButtons();
		var referrents = args.entry.getReferrents();
		var refreshCountdown = referrents.length;
		var savedCountdown = referrents.length-1;
		dojo.attr(this.contentPane, "innerHTML", "");
		var node1 = document.createElement("div");
		this.contentPane.appendChild(node1);
		var self = this;
		var pb1 = new dijit.ProgressBar({annotate: true, maximum: refreshCountdown, report: function() {
			return dojo.string.substitute(self.rBundle.folderRefreshProgress, [this.progress, this.maximum]);
		}}, node1);
		var node2 = document.createElement("div");
		this.contentPane.appendChild(node2);
		var pb2 = new dijit.ProgressBar({annotate: true, maximum: refreshCountdown, report: function() {
			return dojo.string.substitute(self.rBundle.folderSaveProgress, [this.progress, this.maximum]);
		}}, node2);

		var entry = args.entry;
		var context = entry.getContext();

		var failure = dojo.hitch(this, function(message) {
			console.log(message);
			refreshCountdown = -1;
			savedCountdown = -1;
			var node3 = document.createElement("div");
			this.contentPane.appendChild(node3);			
			dojo.attr(node3, "innerHTML", self.rBundle.removeFromAllFailed);
			args.dialog.addFinishButton();
		});
		
		var moveToTrash = dojo.hitch(this, function() {
			savedCountdown--;
			pb2.update({progress: referrents.length-savedCountdown});
			if (savedCountdown != 0) {
//				dojo.attr(this.contentPane, "innerHTML", "Removing "+savedCountdown);
				return;
			}
			dojo.attr(this.contentPane, "innerHTML", "Moving to trash");
			this.moveToTrash(args);
		});
		
		var removeFromParent = dojo.hitch(this, function(ref) {
			if (ref == args.parent.getResourceUri()) {
				return;
			}
			pb2.update({progress: referrents.length-savedCountdown});
//			dojo.attr(this.contentPane, "innerHTML", "Removing "+savedCountdown);
			var parent = context.getEntryFromEntryURI(ref);
			folio.data.getList(parent, dojo.hitch(this, function(list) {
				list.loadMissing(dojo.hitch(this, function() {
					list.removeEntryId(entry.getId());
					list.save(dojo.hitch(this, function() {
						entry.setRefreshNeeded();
						parent.setRefreshNeeded();
						moveToTrash();
					}), failure);
				}));
			}));
		});
		
		var removeFromParents = dojo.hitch(this, function() {
			refreshCountdown--;
			pb1.update({progress: referrents.length-refreshCountdown});
			if (refreshCountdown != 0) {
	//			this.contentPane.innerHTML = "Refreshing "+refreshCountdown;
				return;
			}
			dojo.forEach(referrents, removeFromParent);
		});
		
//		this.contentPane.innerHTML = "Refreshing "+refreshCountdown;
		dojo.forEach(referrents, function(ref) {
			var parent = context.getEntryFromEntryURI(ref);
			if (parent == null) {
				context.loadEntryInfo(ref, {limit: 0, sort: null}, function(entry) {
					removeFromParents();
				}, failure);
			} else {
				removeFromParents();
			}
		});
	},
	removeCompletely: function(args) {
		args.entry.getContext().removeEntry(args.entry,
				function() {
					args.dialog.done();
					args.parent.setRefreshNeeded();
					args.application.dispatch({action: "childrenChanged", entry: args.parent, source: this});
				},
				function(error) {
					console.dir(error);
			});
	},
	removeFromFolder: function(args) {
		var self = this;
		folio.data.getList(args.parent, function(list) {
			list.loadMissing(function() {
				list.removeEntry(args.index);
				list.save(function() {
					args.entry.setRefreshNeeded();
					args.entry.refresh(function() {
						args.dialog.done();
						args.application.dispatch({action: "childrenChanged", entry: args.parent, source: self});
					});
				});
			});
		});
	},
	moveToTrash: function(args) {
		if (args.parent === undefined) {
			console.log("You must go up one level and press remove on this folder as a child of another folder.");
			return;
		}

		var err = function(res){
			//Close the dialog
			args.dialog.done();
			//Notify that the move failed.
			args.application.message("Remove failed");
      	}

		var context = args.entry.getContext();
		context.loadEntryFromId("_trash", {limit: 0}, dojo.hitch(this, function(trash) {   //Load the _trash entry.
			context.moveEntryHere(args.entry, args.parent, trash, 
					dojo.hitch(this, function() {
						//Close the dialog
						args.dialog.done();                        
						//Notify the application that the parent list has changed.
						args.application.dispatch({action: "childrenChanged", entry: args.parent, source: this});
					}), err);
		}), err);
	},
	moveToTrashNoParent: function(args) {
		this._moveToTrashNoParent(args);
	},
	moveUnlistedToTrash: function(args) {
		this._moveToTrashNoParent(args, true);		
	},
	_moveToTrashNoParent: function(args, parentIs_unlisted) {
		var err = function(res){
			console.log("Error in moveToTrash"+res);
      	}
		args.entry.getContext().loadEntryFromId("_trash", {limit: 0}, function(trash) {
			folio.data.getList(trash, function(list) {
				list.loadMissing(function() {
					list.addEntry(args.entry);
					list.save(function(res){
						args.entry.setRefreshNeeded(); //Because of referrents.
						args.entry.refresh(function() {
							args.dialog.done();
							if (parentIs_unlisted) {
								args.parent.setRefreshNeeded();
								args.application.dispatch({action: "childrenChanged", entry: args.parent, source: this});								
							}
						}, err);
      				}, err);
				}, err);
			}, err);
		}, err);
	}
});