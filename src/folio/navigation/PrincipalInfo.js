/*global dojo, dijit, folio*/
dojo.provide("folio.navigation.PrincipalInfo");
dojo.require("dijit._Widget");
dojo.require("dijit.layout.StackContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit._Templated");
dojo.require("dijit.form.TextBox");
dojo.require("folio.list.SearchList");
dojo.require("folio.editor.RFormsPresenter");


/**
 * Shows principal information in the form of a picture, a name and a description.
 * There is also some buttons to swith between folder, profile and settings views.
 */
dojo.declare("folio.navigation.PrincipalInfo", [dijit._Widget, dijit._Templated], {
	//===================================================
	// Public Attributes
	//===================================================
	view: "",

	//===================================================
	// Inherited Attributes
	//===================================================
	templatePath: dojo.moduleUrl("folio.navigation", "PrincipalInfoTemplate.html"),
	
	//===================================================
	// I18n attributes
	//===================================================
	
	//===================================================
	// Inherited methods
	//===================================================
	postCreate: function() {
		this.inherited("postCreate", arguments);
		this.application = __confolio.application;		
	},

	show: function(entry) {
		this.entry = entry;
		delete this.homeContext;
		var hc = this.entry.getHomeContext();
		if (hc != null) {
			this.application.getStore().loadEntry(hc, 
					{},
					dojo.hitch(this, function(homeContext) {
						this.homeContext = homeContext;
						this._showPrincipalPicture();
						this._showPrincipalInfo();
						this._showButtons();	
					}));
		} else {
			this._showPrincipalPicture();
			this._showPrincipalInfo();
			this._showButtons();	
		}
	},

	//===================================================
	// Private methods
	//===================================================
	_showPrincipalPicture: function() {
		dojo.attr(this.principalPictureNode, "innerHTML", "");
		var imageUrl = folio.data.getFromMD(this.entry, folio.data.FOAFSchema.IMAGE);
		if (imageUrl != null) {
			if (imageUrl.indexOf(this.application.getRepository()) === 0) {
				imageUrl = imageUrl+"?request.preventCache="+(new Date()).getTime();			
			}
		}
		var config = this.application.getConfig();
		var backup = folio.data.isUser(this.entry) ? ""+config.getIcon("user_picture_frame") : ""+config.getIcon("group_picture_frame");
		if (window.location.href.indexOf("cookieMonster=true") !== -1) {
			dojo.create("img", {src: "http://www.northern-pine.com/songs/images/cookie.gif"}, this.principalPictureNode);
		} else {
			dojo.create("img", {src: imageUrl || backup}, this.principalPictureNode);
		}
	},

	_showButtons: function() {
		dojo.attr(this.principalIconsNode, "innerHTML", "");
		if (this.homeContext || this.entry.isResourceModifiable()) {
			if (this.view === "profile") {
				dojo.create("span", {"class": "icon24 home disabled"}, this.principalIconsNode);
			} else {
				dojo.create("a", {"class": "icon24 home", href: this.application.getHref(this.entry, "profile")}, this.principalIconsNode);
			}
			if (this.homeContext) {
				if (this.view === "default") {
					dojo.create("span", {"class": "icon24 folder disabled"}, this.principalIconsNode);		
				} else {
					var name = folio.data.getLabelRaw(this.homeContext) || this.homeContext.alias || this.homeContext.getId();
					dojo.create("a", {"class": "icon24 folder", title: name, href: this.application.getHref(this.application.getRepository()+this.homeContext.getId()+"/entry/_top", "default")}, this.principalIconsNode);
				}
			}
			if (this.entry.isResourceModifiable()) {
				if (this.view === "settings") {
					dojo.create("span", {"class": "icon24 settings disabled"}, this.principalIconsNode);				
				} else {
					dojo.create("a", {"class": "icon24 settings", href: this.application.getHref(this.entry, "settings")}, this.principalIconsNode);				
				}				
			}
		}
	},
	
	_showPrincipalInfo: function() {
		//User name
		var name = folio.data.getLabelRaw(this.entry) || this.entry.resource.name;
		dojo.attr(this.principalNameNode, "innerHTML", name);
		
		//User plan/description
		var desc = this.entry.get(folio.data.FOAFSchema.PLAN) || 
			folio.data.getDescription(this.entry) ||
			(this.homeContext ? folio.data.getDescription(this.homeContext) : "");
		dojo.attr(this.principalDescriptionNode, "innerHTML", desc);
		
		var email = this.entry.get(folio.data.FOAFSchema.MBOX);
		if (email != null && this.application.getUser() != null) {
			dojo.attr(this.emailNode, "href", email);
			dojo.attr(this.emailNode, "title", email);
			dojo.style(this.emailNode, "display", "");
		} else {
			dojo.style(this.emailNode, "display", "none");			
		}

		var homepage = this.entry.get(folio.data.FOAFSchema.HOMEPAGE);
		if (homepage != null) {
			dojo.attr(this.homepageNode, "href", homepage);			
			dojo.attr(this.homepageNode, "title", homepage);
			dojo.style(this.homepageNode, "display", "");
		} else {
			dojo.style(this.homepageNode, "display", "none");			
		}

		//In case the quota is given, displays both the actual size + percentage used
		if (this.homeContext && this.homeContext.quota && this.homeContext.quota.quotaFillLevel !== undefined){
			var quota =" ("+folio.data.bytesAsHumanReadable(this.homeContext.quota.quotaFillLevel);
			if (this.homeContext.quota.quota !== -1) {
				quota +="/" + folio.data.bytesAsHumanReadable(this.homeContext.quota.quota) +
						", " +
						folio.data.percentageCalculator(this.homeContext.quota.quotaFillLevel, this.homeContext.quota.quota) +
						")";
			} else {
				quota += ")";
			}
			dojo.attr(this.homeContextQuotaNode, "innerHTML", quota);
		} else {
			dojo.attr(this.homeContextQuotaNode, "innerHTML", "");
		}
	}
});