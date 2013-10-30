/*global define, __confolio*/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/event",
    "dojo/on",
    "dojo/dom-class",
    "dojo/keys",
    "folio/list/operations",
    "folio/list/Remove",
    "folio/security/RightsDialog",
    "folio/comment/CommentDialog"
], function(declare, lang, event, on, domClass, keys, operations, Remove, ShareDialog, CommentDialog) {

return declare(null, {
	//=================================================== 
	// Public Attributes 
	//===================================================
	iconMode: false,
	list: null,
	listChildren: [],
	selectedIndex: -1,
	publishFocusEvents: true,

	//=================================================== 
	// Public API
	//===================================================
	setIconMode: function(iconMode) {
		this.iconMode = iconMode;
		if (this.list) {
			this.showList(this.list);
		}
	},
    listenForKeyEvents: function() {
        this._keyEventConnector = on(dojo.doc, "keypress", lang.hitch(this, this.handleKeyPress));
    },
    stopListenForKeyEvents: function() {
        if (this._keyEventConnector) {
            this._keyEventConnector.remove();
            delete this._keyEventConnector;
        }
    },

    getSelectedEntry: function() {
		if (this.selectedIndex != -1) {
			return this.listChildren[this.selectedIndex];
		}
	},
	refresh: function(entry) {
		if (entry != null && this.listChildren != null) {
			var uri = entry.getUri();
			if (this.list && this.list.getUri() === uri) {
				this._updateHead();
				return;
			}
			for (var i=0;i<this.listChildren.length;i++) {
				if (uri === this.listChildren[i].getUri()) {
					this._refreshChild(i);			
					return;
				}
			}
		}
		this.showList(this.list);			
	},
	showList: function(folderItem, page) {
		this.selectedIndex = -1; //clear selection.
		this.list = folderItem;
	},
	showPage: function(page) {
		this.showList(this.list, page);
	},
	openChild: function(index, event) {
		var entry = this.listChildren[index];
		this.application.getHrefLinkLike(entry, function(hrefObj) {
			if (hrefObj.blankTarget) {
				window.open(hrefObj.href);
			} else {
				window.location = hrefObj.href;
			}
		});
		if (event) {
			event.stopPropagation();
		}
	},
	
	handleEvent: function(index, ev) {
		//Do not handle events when a link (or icon inside of a link) was clicked.
		if (this.selectedIndex === index && (ev.target.nodeName === "A" || domClass.contains(ev.target, "iconCls") || domClass.contains(ev.target, "external") || domClass.contains(ev.target, "download"))) {
			__confolio.ignoreUnloadDialog();
			ev.stopPropagation();
			return;
		}
		var action = this.extractActionFromEvent(ev);
		if (action != null) {
			this._handleAction(action, index, ev);
		}

		if (this.selectedIndex != index) {
			this.changeFocus(index);
		}
		event.stop(ev);
	},
	
	handleKeyPress: function(event) {
		if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) {
			return;
		}
		if (this._focused && this.list) {
			if (this._renameEditor) {
				switch (event.keyCode) {
					case keys.ESCAPE:
						this._abort_rename();
						event.stop(event);
						break;
					case keys.ENTER:
						this._do_rename();
						event.stop(event);
						break;
				}
				return;
			}
			if (event.keyCode == keys.BACKSPACE) {
				var refs = this.list.getReferrents();
				if (refs.length > 0) {
					this.application.openEntry(refs[0]);
				} else {
					this.application.openEntry(this.list.getContext().getUri()+"/entry/_systemEntries");
				}
				event.stop(event);
				return;
			}

			var maxIndex = this.listChildren.length-1;
			if (maxIndex == -1) {
				return;
			}
			switch (event.keyCode) {
				case keys.RIGHT_ARROW:
				case keys.DOWN_ARROW:
					if (this.selectedIndex == -1) {
						this.changeFocus(0);
					} else if (this.selectedIndex < maxIndex){
						this.changeFocus(this.selectedIndex+1);
					}
					event.stop(event);
					break;
				case keys.LEFT_ARROW:
				case keys.UP_ARROW:
					if (this.selectedIndex > 0) {
						this.changeFocus(this.selectedIndex -1);
					} else if (this.selectedIndex == -1){
						this.changeFocus(maxIndex);
					}
					event.stop(event);
					break;
				case keys.ESCAPE:
					this.changeFocus(-1);
					event.stop(event);
					break;
				case keys.ENTER:
					if (this.selectedIndex != -1) {
						this.openChild(this.selectedIndex);
					}
					event.stop(event);
					break;
				case keys.DELETE:
					if (this.selectedIndex != -1) {
						this._handle_remove(this.listChildren[this.selectedIndex], this.selectedIndex, event);
					}
					event.stop(event);
					break;
				case keys.F2:
					if (this.selectedIndex != -1) {
						this.renameFocused();
					}
					event.stop(event);
					break;
			}
			switch (event.charCode) {				
				case 101: //letter e for edit
					this._handleAction("edit", this.selectedIndex, event);
					event.stop(event);
					break;
				case 97: //letter a for administer
					this._handleAction("admin", this.selectedIndex, event);
					event.stop(event);
					break;
				case 99: //letter c for comment
					this._handleAction("comment", this.selectedIndex, event);
					event.stop(event);
					break;
			}
		}
	},
	changeFocus: function(index, dontPublish) {
		this.doChangeFocus(index, dontPublish);
	},
	focusedEntry: function(entry) {
	},
	doChangeFocus: function(index, dontPublish) {
		var entry = this.list, list;
		if (index !== -1 ) {
			entry = this.listChildren[index];
			list = this.list;
		}
		this.selectedIndex = index;
		this.focusedEntry(entry);
		if (dontPublish !== true && this.publishFocusEvents) {
			this.application.publish("showEntry", {entry: entry, list: list});
		}
	},
	renameFocused: function(select) {
		this._handle_rename(this.listChildren[this.selectedIndex], this.selectedIndex, null, select);		
	},

	//=================================================== 
	// Abstract methods 
	//===================================================
	extractActionFromEvent: function(event) {
		//Override
	},
	isFocus: function (entry) {
	},
	focus: function(entry) {
	},

	//=================================================== 
	// Inherited methods 
	//===================================================
	constructor: function() {
		this.localize();
	},

	localize: function() {
		dojo.requireLocalization("folio", "list");
		this.resourceBundle = dojo.i18n.getLocalization("folio", "list"); 
		//this.attr(this.resourceBundle);
	},
	
	//=================================================== 
	// Private methods 
	//===================================================		
	_acceptedActions: ["details", "comment", "openfolder", "edit", "admin", "rights", "remove", "copy", "cut", "paste", "add", "menu", "rename", "new"],
	_handleAction: function(action, index, event) {
		var entry;
		if (index == -1) {
			entry = this.list;
		} else {
			entry = this.listChildren[index];
		}
		this["_handle_"+action](entry, index, event);		
	},
	_handle_rename: function(entry, index, event) {
		//Implement me
	},
	_handle_menu: function(entry, index, event) {
		console.log("MenuClicked");
		this.showMenu(entry, index, event);
	},
	_handle_openfolder: function(entry, index, event) {
		var refs = entry.getReferrents();
		if (refs.length > 0) {
			this.application.openEntry(entry.getUri(), "default", refs[0]);			
		}
	},
	_handle_details: function(entry, index, event) {
		console.log("DetailsClicked");
		this.showDetails(event.target, entry);
	},
	_handle_comment: function(entry, index, event) {	
		if(entry instanceof folio.data.SystemEntry){
			return;
		}
		console.log("CommentClicked");
		var comment = new CommentDialog({
			entry: entry,
			application: this.application
		});
		comment.show();
	},
	_handle_edit: function(entry, index, event) {
		if(!entry.isMetadataModifiable()){
			return;
		}
		console.log("EditClicked");
		entry.setRefreshNeeded();
		this.application.publish("showMDEditor", {entry: entry});
	},
	_handle_admin: function(entry, index, event) {
	    if(!entry.possibleToAdmin()){
			return;
		}
		console.log("AdminClicked");
		entry.setRefreshNeeded();
		this.application.publish("entryAdmin", {entry: entry});
	},
    _handle_rights: function(entry, index, event) {
        if(!entry.possibleToAdmin()){
            return;
        }

        var d = new ShareDialog({
            entry: entry,
            onHide: lang.hitch(this, this.listenForKeyEvents)
        });
        d.startup();
        this.stopListenForKeyEvents();
        d.show();
    },
	_handle_remove: function(entry, index, event) {
	    if((index == -1 && (!entry.possibleToAdmin() || folio.data.getChildCount(entry) == 0)) //Need childcount for _trash?
				|| (index>-1 && !((this.list.isMetadataModifiable() && this.list.isResourceModifiable() || this.list.getContext().getId() =="_search") && entry.possibleToAdmin()))){
			return;
		}
		console.log("Remove Clicked");
		var remove = new Remove({});
		var haveAccessToThrash = true;
		entry.getContext().loadEntryFromId("_trash", {limit: 0},
		 lang.hitch(this, function(trashEntry){
		 	var trashAccess = false;
			if(trashEntry){
				trashAccess = (trashEntry.isResourceModifiable() && trashEntry.isMetadataModifiable()) || trashEntry.possibleToAdmin();
			}
			remove.show({
			   entry: entry,
			   parent: this.list,
			   index: index + this.currentPage*this.application.getCommunicator().getDefaultLimit(),
			   application: this.application,
			   accessToThrash: trashAccess
			   });
		 }),
		 lang.hitch(this, function(){
			remove.show({
			   entry: entry,
			   parent: this.list,
			   index: index + this.currentPage*this.application.getCommunicator().getDefaultLimit(),
			   application: this.application,
			   accessToThrash: false
			   });
			})
		);
	},
	_handle_copy: function(entry, index, event) {
	    if(!(entry.isMetadataAccessible() && entry.isResourceAccessible())){
			return;
		}
		console.log("CopyClicked");
		this.application.setClipboard({
			entry: entry,
			operation: "copy"
		});
	},
	_handle_cut: function(entry, index, event) {
        if(!entry.possibleToAdmin() || 
		    entry instanceof folio.data.SystemEntry){  //Should not be possible to move system-entries
                return;
        }
		console.log("CutClicked");
        if(this.list instanceof folio.data.SystemEntry){
				var typeOfSystemEntry = this.list.entryInfo.entryId;
                switch (typeOfSystemEntry) {
                     case "_latest":
                        break;
                     case "_systemEntries":
                        break;
                }
	 	} else if(this.list.getContext() instanceof folio.data.SearchContext){
			var listsWithEntry = entry.getLists();
			if(listsWithEntry.length === 1){
				var entryObj = folio.data.normalizeEntryInfo(listsWithEntry[0]);
				entryObj.refreshMe = true;
	            entry.getContext().getStore().loadEntry(entryObj, {limit: this.application.getCommunicator().getDefaultLimit()},
				   lang.hitch(this,function(result){
				   	this.application.setClipboard({
						entry:entry,
						operation: "cut",
						from:result,
						index: index + this.currentPage*this.application.getCommunicator().getDefaultLimit()
					});
				   }),
				   lang.hitch(this,function(){
				   	this.application.message("Could not find the folder the item was located in");
				   })); //TODO: In case of a failure of loading
			} else if (listsWithEntry.length > 1){
				this.application.message("Could not cut this item as it appears in two or more folders");
			} else {
				this.application.message("Could not cut this item as it appears to not appear in any folder");
			}
		    return;
	    }
        this.application.setClipboard({
                entry: entry,
                operation: "cut",
                from: this.list,
                index: index + this.currentPage*this.application.getCommunicator().getDefaultLimit()
        });
	},
	_handle_paste: function(entry, index, event) {
		if (index == -1) {
			console.log("HeaderPasteClicked");
			if (!this.isPasteDisabled) {
                folio.list.operations.pasteInto(this.list);
			}
		} else {
			console.log("ItemPasteClicked");
			if (!this.isPasteIntoDisabled && entry.isResourceModifiable()) {
                folio.list.operations.pasteInto(entry);
			}
		}
	},
	_handle_add: function(entry, index, event) {
		console.log("AddClicked");
		//var d = new dojo.Deferred();
		var application = this.application;
		var home = application.getUser().homecontext;
		var contextURI = application.repository+home;
		
		/*
		 * Function that is called after the contacts-list has been loaded.
		 */
		var entryLoaded = function(contacts) {
			if(contacts.resource && contacts.resource.children){
				for(var ii=0; ii<contacts.resource.children.length;ii++){
					var child = contacts.resource.children[ii];
					var childId = child.info["sc:resource"]["@id"];
					if(childId === entry.getResourceUri()){
						return;
					}
				}
			}
		    
			/*
			 * Function called after a successful creation of a new reference-entry to 
			 * the contacts-list
			 */
			var updateEntry = function(entry) {
				folio.data.getList(contacts, lang.hitch(this, function(list) {
					list.entry.setRefreshNeeded();
					var clickedNode=event.originalTarget;
					if(clickedNode && !domClass.contains(clickedNode,"disabledEntryButton")){
						domClass.add(clickedNode,"disabledEntryButton");
					}
					this.application.message(this.resourceBundle.addedToContactsMessage);
				}));
			};
			
			var builtinTypeString = "";
			if(entry.getBuiltinType() === folio.data.BuiltinType.USER){
				builtinTypeString = "user";
			} else if (entry.getBuiltinType() === folio.data.BuiltinType.GROUP){
				builtinTypeString = "group";
			}
			var linkEntry = {
				context: contacts.getContext(),
				parentList: contacts,
				params: {
					representationType: "informationresource",
					locationType: "reference",
					builtinType: builtinTypeString,//entry.getBuiltinType(),
					'cached-external-metadata': entry.getLocationType() === folio.data.LocationType.LOCAL ? entry.getLocalMetadataUri(): entry.getExternalMetadataUri(),
					resource: entry.getResourceUri()}};
			contacts.getContext().createEntry(linkEntry, lang.hitch(this, updateEntry));//lang.hitch(d, d.errback));
		};
		
		application.getStore().getContext(contextURI).loadEntryFromId("_contacts", {}, lang.hitch(this, entryLoaded));//, lang.hitch(d, d.errback));
	}
});
});