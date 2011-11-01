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

dojo.provide("folio.main.Aggregate");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.StackContainer");
dojo.require("folio.Application");
dojo.require("dojox.image.Lightbox");
dojo.require("folio.util.details");
dojo.require("folio.editor.AnnotationProfileEditor");
dojo.require("folio.simple.List");
dojo.require("folio.simple.Content");
dojo.require("dojox.layout.ExpandoPane");

dojo.declare("folio.main.Aggregate", [dijit.layout._LayoutWidget, dijit._Templated, folio.ApplicationView], {
	attributeMap: dojo.mixin(dojo.clone(dijit.layout.ContentPane.prototype.attributeMap), {
	}),
	templatePath: dojo.moduleUrl("folio.main", "AggregateTemplate.html"),
	widgetsInTemplate: true, //Because Details has subwidgets
	constructor: function(args) {
	},
	getSupportedActions: function() {
		//console.log("Details.getSupportedActions");
		return ["showContext", "showContent", "showEntry", "userChange", "localeChange"];
	},
	postCreate: function() {
		this.containerNode = this.domNode;
		this.inherited("postCreate", arguments);
	},
	startup: function() {
		this.inherited("startup", arguments);
		this.started = true;
		if (this.application != undefined) {
			this._setApplication();
		}
		this.localize();
		this.resize();
	},
	resize: function(size) {
		this.bc.resize(size);
		if (this.listView) {
			this.listView.resize();			
		}
	},
	
	setApplication: function() {
		this.inherited("setApplication", arguments);
		if (this.started) {
			this._setApplication();
		}
	},
	_setApplication: function() {
		this.locShame.setApplication(this.application);
		this.extShame.setApplication(this.application);
	},
	handle: function(event) {	//Opens resource in content pane
		this.event = event;
		switch (event.action) {
			case "focusOn":
			case "showContext":
			case "showContent":
			case "showEntry":
				if (this.entry === event.entry) {
					return;
				}
			case "changed":
				this.entry = event.entry;
			// Fade out content to make changes
				dojo.fadeOut({
					node: this.domNode,
					duration:150,
					onEnd: dojo.hitch(this, this._replace, event.entry)
				}).play();
				break;
			case "localeChange":
				this.localize();
				break;
		}
	},
	localize: function() {
		dojo.requireLocalization("folio", "aggregate");
		this.resourceBundle = dojo.i18n.getLocalization("folio", "aggregate");
		this.attr(this.resourceBundle);
	},
	_replace: function(entry) {
		this._replaceDetails(entry);
		this._replaceMetadata(entry);
		this._replaceContent(entry);
		dojo.fadeIn({
				node: this.domNode,
				duration:150
		}).play();
	},
	_replaceDetails: function(entry) {		
		// Get the type of the entry corresponding to the icon
		var entryPath = this.application.getConfig().getIcon(entry);
		//Set the details titlefield
		var title = folio.data.getLabel(entry);
		this.labelPane.titleNode.innerHTML="<b>"+title+"<b>";		
		// Add some kind of icon. Use thumbnail if avaliable
		var ih = "<img src= \""+ entryPath +"\"></img>";
		if (folio.data.isLinkLike(entry)) {
			ih += "<img style=\"position:absolute;left:0\" src=\""+ dojo.moduleUrl("folio", "icons_oxygen/link.png") +"\"></img>";
		}
		this.iconDiv.innerHTML = ih;
		folio.util.details.insertCCLogos(entry, this.licenseDiv);		
	},
	_replaceMetadata: function(entry) {
		switch (entry.getLocationType()) {
		case folio.data.LocationType.LOCAL:
			dojo.style(this.locInfoPaneNode, "display", "");
			dojo.style(this.extInfoPaneNode, "display", "none");
			this.locShame.updateSHAME(entry, false);
			break;
		case folio.data.LocationType.LINK:
			dojo.style(this.locInfoPaneNode, "display", "");
			dojo.style(this.extInfoPaneNode, "display", "none");
			this.locShame.updateSHAME(entry, false);
			break;
		case folio.data.LocationType.LINK_REFERENCE:
			dojo.style(this.locInfoPaneNode, "display", "");
			dojo.style(this.extInfoPaneNode, "display", "");
			this.locShame.updateSHAME(entry, false);
			this.extShame.updateSHAME(entry, true);
			break;
		case folio.data.LocationType.REFERENCE:
			dojo.style(this.locInfoPaneNode, "display", "none");
			dojo.style(this.extInfoPaneNode, "display", "");
			this.extShame.updateSHAME(entry, true);
			break;
		}
	},
	_replaceContent: function(entry) {
		if (folio.data.isListLike(entry) || folio.data.isContext(entry)) {
			this.stackView.selectChild(this.listView);
		} else {
			this.stackView.selectChild(this.contentPaneView);
			var service = folio.data.detectService(entry);
			if (service) {
				switch(service.object) {
				case "flash":				
					this.contentPaneView.setContent("<div id='flashPLayerView'></div>");
					this.widgetVar = new folio.simple.ContentFlashPlayer({url: entry.getResourceUri(), service: service}, dojo.byId("flashPLayerView"));
					break;
				case "iframe":
					this.contentPaneView.setContent("<iframe frameborder=\"0\" style=\"width: 100%; height: 100%\" src=\""+entry.getResourceUri()+"\"></iframe>");
					break;
				case "snippet":
					this.contentPaneView.attr("href", entry.getResourceUri());
					break;
				}
			} else {
				if (folio.data.isWebContent(entry)) {
					var mt = entry.getMimeType();
					if (mt == "text/html+snippet") {
						this.contentPaneView.attr("href", entry.getResourceUri());						
					} if (mt != undefined && mt.indexOf("image") == 0) {
						this.contentPaneView.setContent("<img src=\""+entry.getResourceUri()+"\"></img>");
					} if (mt == "sound/mp3") {
						//Fails for some reason, ask Anders for help on this.
						this.contentPaneView.setContent("<div style=\"clear: both; width: 100%;padding-left: 5px; padding-top: 5px;\"></div>");
						folio.util.details.insertAudioPlayer(this.contentPaneView.containerNode.firstChild, entry.getResourceUri());						
					} else {
						this.contentPaneView.setContent("<iframe frameborder=\"0\" style=\"width: 100%; height: 100%\" src=\""+entry.getResourceUri()+"\"></iframe>");						
					}
				} else {
					this.contentPaneView.setContent(this.resourceBundle.contentNotDigitalResource);
				}
			}
		}
	}
});