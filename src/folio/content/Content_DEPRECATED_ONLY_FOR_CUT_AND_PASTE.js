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

dojo.provide("folio.simple.Content");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.BorderContainer");
dojo.require("folio.Application");
dojo.require("dojox.image.Lightbox");

dojo.declare("folio.simple.Content", [dijit._Widget, dijit._Templated, folio.ApplicationView], {
	templateString: "<div><iframe frameborder=\"0\" style=\"width: 100%; height: 100%\" dojoAttachPoint='infra'></iframe></div>",	
	constructor: function(args) {
	},
	getSupportedActions: function() {
		return ["showContent"];
	},
	handle: function(event) {	//Opens resource in content pane
		if (folio.data.isWebContent(event.entry)) {
			this.infra.src = event.entry.getResourceUri();
		}
	}
});

dojo.declare("folio.simple.ContentWindow", [dijit._Widget, folio.ApplicationView], {
	name: "",
	constructor: function(args) {
	},
	getSupportedActions: function() {
		return ["showContent"];
	},
	handle: function(event) {	//Opens resource in new tab/window.
		if (event.entry.isWebContent()) {
			if (this.name != undefined && this.name != "") {
				window.open(event.entry.getResourceUri(), this.name);
			} else {
				window.open(event.entry.getResourceUri());
			}
		}
	}
});


dojo.declare("folio.simple.TabbedContent", [dijit.layout.TabContainer, folio.ApplicationView], {
	constructor: function(args) {
		this.resource2tab = {};
	},
	getSupportedActions: function() {
		return ["showContent"];
	},
	handle: function(event) {
		if (event.entry.isWebContent()) {
			var resource = event.entry.getResourceUri();
			if (this.resource2tab[resource]) {
				this.selectChild(this.resource2tab[resource]);
			} else {
				var tab = new folio.simple.Content();
				tab.attr("closable", true);
				var lab = folio.data.getLabel(event.entry);
				if (!lab) {
					lab = "-";
				}
				tab.attr("title", lab);
				this.addChild(tab);
				this.selectChild(tab);
				this.resource2tab[resource] = tab;
				tab.handle(event);
			}
		}
	},
	closeChild: function(tab) {
		this.inherited("closeChild", arguments);
		for (var re in this.resource2tab) {
			if (this.resource2tab[re] == tab) {
				delete this.resource2tab[re];
			}
		}
	}
});


dojo.declare("folio.simple.ContentDialog", [dijit.Dialog,  folio.ApplicationView], {
	constructor: function(args) {
	},
	getSupportedActions: function() {
		return ["showContent"];
	},
	startup: function() {
		this.inherited("startup", arguments);
		this.doLayout=true;
		this.setContent("<div dojoType=\"folio.simple.Content\"></div>");
	},
	setApplication: function(app) {
		this.application = app;
		this._singleChild.setApplication(this.application);
	},
	handle: function(event) {
		this.titleNode.innerHTML = event.entry.getLabel();
		this._singleChild.handle(event);
		this.show();
	}
});

dojo.declare("folio.simple.ContentViewSwitcher", [dijit.Dialog,  folio.ApplicationView], {
	widgetVar: null,
	constructor: function(args) {
	},
	getSupportedActions: function() {
		return ["showContent"];
	},
	startup: function() {
		this.inherited("startup", arguments);
		this.doLayout=true;
	},
	onCancel: function() {
		this.inherited("onCancel", arguments);
		this.setContent("");		
	},
	setApplication: function(app) {
		this.application = app;
	},
	handle: function(event) {
		if (this.widgetVar) {
			this.widgetVar.destroyRecursive();
			this.widgetVar = null;
		}
		var self = this;
		var url = event.entry.getResourceUri();
		var service = folio.data.detectService(event.entry);
		if (service) {
			switch(service.object) {
			case "flash":
				dojo.style(this.domNode, "overflow", "");
				this.setContent("<div id='flashPLayerDialog'></div>");
				dojo.style(this.domNode, "width", "450px");
				dojo.style(this.domNode, "height", "470px");
				this.show();
				dojo.style(this.domNode, "width", "");
				dojo.style(this.domNode, "height", "");

				this.widgetVar = new folio.simple.ContentFlashPlayer({url: url, service: service}, dojo.byId("flashPLayerDialog"));

				break;
			case "iframe":
				dojo.style(this.domNode, "overflow", "");
				this.setContent("<div id='iframeDialog'></div>");
				dojo.style(this.domNode, "width", "450px");
				dojo.style(this.domNode, "height", "470px");
				this.show();
				dojo.style(this.domNode, "width", "");
				dojo.style(this.domNode, "height", "");
				this.widgetVar = new folio.simple.ContentIframe({url: url, service: service}, dojo.byId("iframeDialog"));
				break;
			case "snippet":
				dojo.style(this.domNode, "overflow", "");
				this.setContent("<div id='snippetDialog'></div>");
				dojo.style(this.domNode, "width", "450px");
				dojo.style(this.domNode, "height", "470px");
				this.show();
				dojo.style(this.domNode, "width", "");
				dojo.style(this.domNode, "height", "");
				this.widgetVar = new folio.simple.ContentSnippet({url: url, service: service}, dojo.byId("snippetDialog"));
				break;
			}
		} else {
			if (event.method) {
				switch (event.method) {
				case "window":
					window.open(url);
					break;
				case "dialog":
					//Dialog with Iframe.
					this.setContent("<div dojoType=\"folio.simple.Content\"></div>");
					this._singleChild.setApplication(this.application);
			 		this.titleNode.innerHTML = folio.data.getLabel(event.entry);
					this._singleChild.handle(event);
					this.show();
				}
			} else { //Default open in separate window/tab.
				if (event.entry.getMimeType() == "text/html+snippet") {
					this.attr("href", event.entry.getResourceUri());
					this.show();
				} else {
					window.open(url);					
				}
			}
		}
	}
});
dojo.declare("folio.simple.ContentFlashPlayer", [dijit._Widget, dijit._Templated], {
	url: "",
	service: null,
	templateString: "<div><div id='flashplayer'><p></p></div></div>",
	postCreate: function() {
		this.inherited("postCreate", arguments);
		if (this.url && (this.url != "") && this.service) {
			this.service.getParameters(
				this.url,
				function (swfArgs) {
					if (swfArgs) {
						swfobject.embedSWF(
						swfArgs.videoSrc,
						"flashplayer",
						swfArgs.width,
						swfArgs.height,
						swfArgs.version,
						"../lib/swfobject/expressInstall.swf",
						swfArgs.flashvars,
						swfArgs.params,
						swfArgs.attributes);
					}
					else {
						console.log("folio.simple.ContentFlashPlayer, swfArgs == null");
					}
				}
			);
		}
	}
});

dojo.declare("folio.simple.ContentIframe", [dijit._Widget, dijit._Templated], {
	url: "",
	service: null,
	templateString: "<div style=\"width: 500px; height: 500px\"><iframe frameborder=\"0\" style=\"width: 100%; height: 100%\" src=${url}></iframe></div>"
});


dojo.declare("folio.simple.ContentSnippet", [dijit._Widget, dijit._Templated], {
	url: "",
	service: null,
	templateString: "<div><div id='contentSnippet'></div></div>",
	postMixInProperties: function() {
		this.inherited("postMixInProperties", arguments);
		if (this.url && (this.url != "") && this.service) {
			this.service.getParameters(
				this.url,
				function(param) {
					if(param) {
						var domImgNode = dojo.byId("contentSnippet");
						dojo.attr(domImgNode, "innerHTML", param.html);
					}
				}
			);
		}
	}
});

dojo.declare("folio.simple.ContentSnippetImage", [dijit._Widget, dijit._Templated], {
	url: "",
	service: null,
	templateString: "<div><img id='contentSnippetImage' src='' alt='' width='0' height='0'></img></div>",
	postMixInProperties: function() {
		this.inherited("postMixInProperties", arguments);
		if (this.url && (this.url != "") && this.service) {
			this.service.getParameters(
				this.url,
				function(param) {
					if(param) {
						var domImgNode = dojo.byId("contentSnippetImage");
						domImgNode.src = param.imageSrc;
						domImgNode.width = param.width;
						domImgNode.height = param.height;
						domImgNode.alt = param.alt;
					}
				}
			);
		}
	}
});

/*
dojo.declare("folio.simple.ContentSnippet", [dojox.image.Lightbox], {
	url: "",
	service: null,
	postMixInProperties: function() {
		this.inherited("postMixInProperties", arguments);
		if (this.url && (this.url != "") && this.service) {
			//var reqUrl = "http://flickr.com/services/rest/?method=flickr.photos.getSizes&format=json&api_key=a42a1112579b2fdb551e97b1dcf03788&photo_id=2581126130";
			//this.href = reqUrl;
			//this.show();
			var callback = dojo.hitch(this, function(params) {
				if (params) {
					console.log("ouhf ouh afouh aouhad aosduh auahdasd iuahd ifhsdf sdiuhsd fiuh ")
					this.href = params.imgageSrc;
					this.show();
				}
			});
			this.service.getParameters(url, callback);
		}
	}
});
*/

dojo.declare("folio.simple.ContentYouTube", [dijit._Widget, dijit._Templated], {
	url: "",
	video: "",
	templateString: "<div>"
	  +"<object width=\"425\" height=\"344\">"
  		+"<param name=\"movie\" value=\"http://www.youtube.com/v/${video}&hl=en&fs=1\"></param>"
  		+"<param name=\"allowFullScreen\" value=\"true\"></param>"
  		+"<embed src=\"http://www.youtube.com/v/${video}&hl=en&fs=1\" type=\"application/x-shockwave-flash\" allowfullscreen=\"true\" width=\"425\" height=\"344\">"
  		+"</embed>"
  	 +"</object>"
	+"</div>",
	postMixInProperties: function() {
		this.inherited("postMixInProperties", arguments);
		if (this.video == "") {
			this.video=this.url.match(/v=\w*&{0,1}/)[0].slice(2);
			if (/&/.test(this.video)) {
				this.video=this.video.slice(0,-1);
			}
		}
	}
});

dojo.declare("folio.simple.ContentGoogleVideo", [dijit._Widget, dijit._Templated], {
	url: "",
	video: "",
	templateString: "<div>"
		+"<embed id=\"VideoPlayback\""
			+"src=\"http://video.google.com/googleplayer.swf?docid=${video}&fs=true\""
			+"style=\"width:400px;height:326px\" allowFullScreen=\"true\"" 
			+"allowScriptAccess=\"always\" type=\"application/x-shockwave-flash\"></embed>"
	+"</div>",
	postMixInProperties: function() {
		this.inherited("postMixInProperties", arguments);
		if (this.video == "") {
			this.video=this.url.match(/docid=\w*&{0,1}/)[0].slice(6);
			if (/&/.test(this.video)) {
				this.video=this.video.slice(0,-1);
			}
		}
	}
});


dojo.declare("folio.simple.ContentFlickrSlideshow", [dijit._Widget, dijit._Templated], {
	url: "",
	user: "",
	set: "",
	templateString: "<div style=\"width: 500px; height: 500px\"><iframe frameborder=\"0\" style=\"width: 100%; height: 100%\" " +
			"src=\"http://flickr.com/photos/${user}/sets/${set}/show/\"></iframe></div>",	
	postMixInProperties: function() {
		this.inherited("postMixInProperties", arguments);
		var pieces = this.url.split("/");
		this.user = pieces[4];
		this.set = pieces[6];
	}
});

dojo.declare("folio.simple.ContentFlickrImage", [dojox.image.Lightbox], {
	url: "",
	image: "",
	api_key: "a42a1112579b2fdb551e97b1dcf03788",
	postMixInProperties: function() {
		this.inherited("postMixInProperties", arguments);
//Example		"http://flickr.com/photos/hannesebner/2581126130/sizes/m";
		var pieces = this.url.split("/");
		this.user = pieces[4];
		this.image = pieces[5];
		var reqUrl = "http://flickr.com/services/rest/?method=flickr.photos.getSizes&format=json&api_key="+this.api_key+"&photo_id="+this.image;
		var element = dojo.doc.createElement("script" );
	    element.type = "text/javascript" ;
	    element.src = reqUrl;
		jsonFlickrApi = dojo.hitch(this, function(obj) {
			this.href = obj.sizes.size[3].source;
			this.show();
		    dojo.doc.getElementsByTagName("head")[0].removeChild(element);
		});
	    dojo.doc.getElementsByTagName("head")[0].appendChild(element);
	}
});

dojo.declare("folio.simple.ContentSlideshare", [dijit._Widget, dijit._Templated], {
	url: "",
	video: "",
	templateString: "<div style=\"width:425px;text-align:left\">" +
				"<object style=\"margin:0px\" width=\"425\" height=\"355\">" +
				"<param name=\"movie\" value=\"http://static.slideshare.net/swf/ssplayer2.swf?doc=${video}&stripped_title=usability-vs-software-development-processes-presentation\"/>" +
				"<param name=\"allowFullScreen\" value=\"true\"/><param name=\"allowScriptAccess\" value=\"always\"/>" +
				"<embed src=\"http://static.slideshare.net/swf/ssplayer2.swf?doc=${video}\" type=\"application/x-shockwave-flash\" " +
				"allowscriptaccess=\"always\" allowfullscreen=\"true\" width=\"425\" height=\"355\"></embed>"
	+"</div>",
	postMixInProperties: function() {
	this.inherited("postMixInProperties", arguments);
	if (this.video == "") {
		this.video=this.url.match(/doc=.*&{0,1}/)[0].slice(4);
		if (/&/.test(this.video)) {
			this.video=this.video.slice(0,-1);
		}
	}
}
});

//http://s3.amazonaws.com/slideshare/ssplayer.swf?id=10108&doc=the-future-of-technology-and-education-9876

//Special support for other video sites like: vimeo.com,