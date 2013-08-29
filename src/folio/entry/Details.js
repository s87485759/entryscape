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

dojo.provide("folio.entry.Details");
dojo.require("folio.Application");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit._Templated");
dojo.require("dijit.layout._LayoutWidget");
dojo.require("folio.util.details");
dojo.require("folio.content.ContentViewSwitcher");
dojo.require("rforms.model.Engine");
dojo.require("rforms.view.Presenter");
dojo.require("folio.editor.RFormsPresenter");

/**
 * Shows an entry's metadata and an embedded version of the entry's resource if possible.
 * If the resource can be embedded, the area is divided vertically so that the  
 * embedded resource is above and the metadata below.
 * The details header contains the url to the resource.
 * The details footer contains creation and modification date, the creator and potential contributors.
 * 
 * If the entry is a LinkedReference the metadata are is divided into two areas with 
 * external metadata below local metadata, headings above each section tells the difference.
 */
dojo.declare("folio.entry.Details", [dijit.layout._LayoutWidget, dijit._Templated], {
	
	//===================================================
	// Public Attributes
	//===================================================	
	doFade: false,
	singleReferrentsVisible: false,
	referrentsVisibleByDefault: false,
	
	//===================================================
	// Inherited Attributes
	//===================================================
	attributeMap: dojo.mixin(dojo.clone(dijit.layout.ContentPane.prototype.attributeMap), {
		extInformationText: {node: "extInformationTextNode", type: "innerHTML"},
		locInformationText: {node: "locInformationTextNode", type: "innerHTML"},
		creatorText: {node: "creatorTextNode", type: "innerHTML"},
		modifiedText: {node: "modifiedTextNode", type: "innerHTML"},
		createdText: {node: "createdTextNode", type: "innerHTML"},
		referentsLabel: {node: "referentsLabelNode", type: "innerHTML"},
		accessText: {node: "accessTextNode", type: "innerHTML"}
	}),
	templatePath: dojo.moduleUrl("folio.entry", "DetailsTemplate.html"),
	widgetsInTemplate: true, //Because Details has subwidgets

	//===================================================
	// Internal Attributes
	//===================================================	
	_parentListUrl: null,

	//===================================================
	// i18n Attributes
	//===================================================
	extInformationText: "",
	locInformationText: "",
	creatorText: "", 
	modifiedText: "",
	createdText: "",
	referentsLabel: "",
	    

	//===================================================
	// Public API
	//===================================================	
	update: function(entry) {
		this._previousEntry = this.entry;
		this.entry = entry;
		// Fade out content to make changes
		if (this.doFade) {
			dojo.fadeOut({
				node: this.domNode,
				duration:150,
				onEnd: dojo.hitch(this, this._replace, entry)
			}).play();	
		} else {
			this._replace(entry);
		}
	},
	clear: function() {
		this.update(null);
	},

	//===================================================
	// Public hooks
	//===================================================
	
	//===================================================
	// Inherited methods
	//===================================================
	constructor: function(args) {
		if (window.AudioPlayer) {
			//Needs to be changed, does not work in built mode.
//			AudioPlayer.setup(dojo.moduleUrl("folio", "../../lib/audio/player.swf"), {width: 280});			
		}
	},
	getChildren: function() {
		return [this.detailsLayoutDijit];
	},
	resize: function(a, b, c) {
		this.inherited("resize", arguments);
		if (this.detailsLayoutDijit && this.detailsLayoutDijit.resize) {
			this.detailsLayoutDijit.resize(a, b, c);
		}
	},
	startup: function() {
		this.inherited("startup", arguments);
		this.detailsLayoutDijit.startup();
//		dojo.style(this.contentAreaDijit.getSplitter("top").domNode, "display", "none");
		dojo.connect(this.contentViewDijit, "show", this, function() {
			/*if (this.contentViewDijit.showing) {
				dojo.style(this.contentViewDijit.domNode, "display", "");
				dojo.style(this.contentAreaDijit.getSplitter("top").domNode, "display", "");
				dojo.style(this.imgPreviewNode, "display", "none");
			} else {
				dojo.style(this.contentViewDijit.domNode, "display", "none");
				dojo.style(this.contentAreaDijit.getSplitter("top").domNode, "display", "none");
				//Have to rely on the contentview since it is not certain that the Details have been updated yet.
				var entry = this.contentViewDijit.entry;
				if (folio.data.isWebContent(entry) && entry.getLocationType() != folio.data.LocationType.LOCAL) {
					dojo.attr(this.imgPreviewNode, "src", "http://open.thumbshots.org/image.pxf?url=" + entry.getResourceUri());
					dojo.style(this.imgPreviewNode, "display", "");
				} else {
					dojo.style(this.imgPreviewNode, "display", "none");					
				}
			}*/
			this.editContentButtonDijit.set("disabled", !this.contentViewDijit.isContentEditable()); 
			this.contentAreaDijit.resize();
            this.resize();
		});
	},
	postCreate: function() {
		this.inherited("postCreate", arguments);
		this._localize();
		dojo.connect(this.configureMenuDijit, "onExecute", this, this._embedToggled);
		//this.locShameDijit.setApplication(this.application);
		//this.extShameDijit.setApplication(this.application);
//		dojo.style(this.editContentButtonDijit.domNode, "display", "none");
	},
	
	//===================================================
	// Private methods
	//===================================================	
	_localize: function() {
		dojo.requireLocalization("folio", "details");
		this.resourceBundle = dojo.i18n.getLocalization("folio", "details");
		this.set(this.resourceBundle);
        //this.embedButtonDijit.set("label", "Embed");
	},
	_embedToggled: function() {
		setTimeout(dojo.hitch(this, function() {
			this.contentViewDijit.webInline = this.webpageCheckDijit.get("checked");
			this.contentViewDijit.pdfInline = this.pdfCheckDijit.get("checked");
			this.contentViewDijit.flashInline = this.flashCheckDijit.get("checked");
			this.contentViewDijit.imgInline = this.imageCheckDijit.get("checked");
			if (this.entry) {
				//Fake an event
				this.contentViewDijit.show(this.entry);
			}
		}), 1);
	},
	_replace: function(entry) {
		this.contentViewDijit.show(entry);
		this._replaceURL(entry);
		this._replaceMetadata(entry);
		//this._replaceContent(entry);
		this._replaceEntryInformation(entry);
		this.detailsLayoutDijit.resize();
		this._showReferents();
		
		// Fade in animation after details have been updated
		if (this.doFade) {
			dojo.fadeIn({
					node: this.domNode,
					duration:150
			}).play();			
		}
	},
	_replaceContent: function(entry) {
		//Audioplayer
		if (entry.getMimeType() == "sound/mp3"){
			dojo.style(this.detailsLayoutHead.domNode, "height", "115px");
			folio.util.details.insertAudioPlayer(this.infoCenter, entry.getResourceUri());
		} else {
			dojo.attr(this.infoCenter, "innerHTML", "");
			dojo.style(this.detailsLayoutHead.domNode, "height", "100px");
		}
	},
	_replaceMetadata: function(entry) {
		if (entry == null) {
			dojo.style(this.extInfoPaneNode, "display", "none");
			dojo.style(this.locInfoPaneNode, "display", "none");
			return;
		}
		switch (entry.getLocationType()) {
		case folio.data.LocationType.LOCAL:
			dojo.removeClass(this.contentAreaDijit.domNode, "linkReference");
			dojo.style(this.locInfoPaneNode, "display", "");
			dojo.style(this.extInfoPaneNode, "display", "none");
			this.locMDDijit.show(entry);
			break;
		case folio.data.LocationType.LINK:
			dojo.removeClass(this.contentAreaDijit.domNode, "linkReference");
			dojo.style(this.locInfoPaneNode, "display", "");
			dojo.style(this.extInfoPaneNode, "display", "none");
			this.locMDDijit.show(entry);
			break;
		case folio.data.LocationType.LINK_REFERENCE:
			dojo.addClass(this.contentAreaDijit.domNode, "linkReference");
			dojo.style(this.locInfoPaneNode, "display", "");
			dojo.style(this.extInfoPaneNode, "display", "");
			this.locMDDijit.show(entry);
			this.extMDDijit.show(entry, true);
			break;
		case folio.data.LocationType.REFERENCE:
			dojo.removeClass(this.contentAreaDijit.domNode, "linkReference");
			dojo.style(this.locInfoPaneNode, "display", "none");
			dojo.style(this.extInfoPaneNode, "display", "");
			this.extMDDijit.show(entry, true);
			break;
		}
	},
	_replaceEntryInformation: function(entry) {
		if (entry == null) {
			dojo.attr(this.createdNode, "innerHTML", "");
			dojo.attr(this.modifiedNode, "innerHTML", "");
			dojo.attr(this.creatorNode, "innerHTML", "");
			dojo.attr(this.accessNode, "innerHTML", "");
			dojo.attr(this.rssNode, "innerHTML", "");
			return;
		}
		var cre = entry.getCreationDate();
		var mod = entry.getModificationDate();
		dojo.attr(this.createdNode, "innerHTML", cre ? cre.slice(0,10) : "");
		dojo.attr(this.modifiedNode, "innerHTML", mod ? mod.slice(0,10) : "");
		var creator = entry.getCreator();
		if (creator) {
			this.application.getStore().loadEntry(creator, {}, dojo.hitch(this, function(ent) {
				dojo.attr(this.creatorNode, "innerHTML", folio.data.getLabel(ent));
			}),dojo.hitch(this, function(mesg) {
				dojo.attr(this.creatorNode, "innerHTML", "Unknown");
			}));
		} else {
			dojo.attr(this.creatorNode, "innerHTML", "Unknown");
		}
		
		if (folio.data.isListLike(entry)) {
			var rssImg = "<img src= \""+ this.application.getConfig().getIcon("RSS", "16x16") +"\"/>";
			dojo.style(this.rssWrapperNode, "display", "");
			if (folio.data.isFeed(entry)) {
				dojo.attr(this.rssNode, "innerHTML", "<a href=\""+entry.getResourceUri()+"\">"+rssImg+"</a>");
			} else {
				dojo.attr(this.rssNode, "innerHTML", "<a href=\""+entry.getContext().getBaseURI()+""+entry.getContext().getId()+"/resource/"+entry.getId()+"?syndication=rss_2.0\">"+rssImg+"</a>");
			}
		} else  {
			dojo.style(this.rssWrapperNode, "display", "none");			
		}
		
		//Check access, fix user.
		/*entry.getOwnEntry(dojo.hitch(this, function(context) {
			var private = true;
			var stmts = context.getInfo().find(context.getUri(), folio.data.SCAMSchema.WRITE);
			if (stmts.length > 1 || stmts[0].getValue() !== userEntryURI) {
				private = false;
				...
			}
			var info = entry.getInfo();
			var stmts = info.find(null, folio.data.SCAMSchema.WRITE);
			if (stmts.length >= 0) {
			
			}			
		}));*/
	},
/*	_toggleReferents: function() {
		if (this.referentsVisible) {
			this._hideReferents();
		} else {
			this._showReferents();
		}
	},*/
	_showReferents: function() {
		dojo.style(this.referentsNode, "display", "");
		this.detailsLayoutDijit.resize();
		dojo.attr(this.referentsListNode, "innerHTML", "");
		var refs = this.entry.getReferrents();
		var count = refs.length;
		this.refEntries = [];
		dojo.forEach(refs, function(ref) {
			this.application.getStore().loadEntry(ref, {limit: 0, sort: null}, dojo.hitch(this, function(refE) {
				count--;
				this.refEntries.push(refE);
				if (count == 0) {
					var first = true;
					dojo.forEach(this.refEntries, function(refEntry, index) {
							if (!first) {
								dojo.create("span", {"innerHTML": ", "}, this.referentsListNode);
							}
							first = false;
							var isParent = this._parentListUrl == refEntry.getUri();
							var node = dojo.create("a",
										{"href": this.application.getHref(this.entry, "default", refEntry), //       //refEntry.getContext().getId() + "." + refEntry.getId(),
									 	 "innerHTML": folio.data.getLabel(refEntry),
										 "class": isParent ? "" : "clickable"}, 
										this.referentsListNode);
						}, this);
					}
				this.detailsLayoutDijit.resize();
			}));
		},this);
		this.referentsVisible = true;
	},
/*	_hideReferents: function() {
		dojo.style(this.referentsNode, "display", "none");
		this.detailsLayoutDijit.resize();
		this.referentsVisible = false;
	},*/
	_replaceURL: function(entry) {
		if (entry == null) {
			dojo.attr(this.urlNode, "innerHTML", "");
		}
		var url = entry.getResourceUri();
		if (entry.getLocationType() == folio.data.LocationType.LOCAL)  {
			dojo.attr(this.urlNode, "innerHTML", "<a href=\""+url+"\" target=\"_blank\">"+entry.getContext().getId()+"/resource/"+entry.getId()+"</a>");
		} else {
			var len = 18, label = decodeURIComponent(url);
			if (label.length > (len*2+3)) {
				label = label.substring(0,len)+ " … " + label.substring(label.length-len); //ellipsis
			}
			dojo.attr(this.urlNode, "innerHTML", "<a href=\""+url+"\" target=\"_blank\">"+label+"</a>");		
		}	
	},
	_editContentClicked: function() {
		this.contentViewDijit.toggleEditMode();
		if (this.contentViewDijit.inEditMode()) {
			this.editContentButtonDijit.set("label", "Present");
		} else {
			this.editContentButtonDijit.set("label", "Edit");			
		}
	}
});


folio.entry.Details.show = function(node, entry) {
    var bb = __confolio.application.getBoundingBox();
    var width = Math.floor((bb.w < 600 ? bb.w: 600 ) * 0.70),
        height = Math.floor((bb.h < 700 ? bb.h: 700) * 0.70);
    folio.util.launchToolKitDialog(node, function(innerNode, onReady) {
        dojo.style(innerNode, {
            width: width+"px",
            height: height +"px",
            overflow: "auto",
            position: "relative"    // workaround IE bug moving scrollbar or dragging dialog
        });

        dojo.addClass(innerNode, "confolio");
        dojo.addClass(innerNode, "mainPanel");
        var details = new folio.entry.Details({
            application: __confolio.application,
            style: {"width": "100%", "height": "100%"},
            doFade: false
        }, dojo.create("div", {}, innerNode));
        details.startup();
        if (folio.data.isListLike(entry)) {
            details._parentListUrl = entry.getUri();
        } else 	if (folio.data.isContext(entry)) {
            details._parentListUrl = entry.getContext().getBaseURI()+entry.getId() +"/entry/_systemEntries";
        }
        details.editContentButtonDijit.set("label", "Edit");
        details.update(entry);
        details.contentViewDijit.show(entry);
        //Make sure that someDijit is finished rendering, or at least has some realistic size before making the following calls.
        dijit.focus(details.domNode);
        onReady();
        details.resize();
    }, {x: bb.x+bb.w-75, y: 100, noArrow: true});
};