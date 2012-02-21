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

dojo.provide("folio.editor.UserEditor");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Button");
dojo.require("folio.editor.ResourceEditor");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.BorderContainer");
dojo.require("folio.editor.RFormsEditorPlain");

dojo.declare("folio.editor.UserEditor", [dijit._Widget, dijit._Templated, folio.editor.ResourceEditor], {
	attributeMap: dojo.mixin(dojo.clone(dijit.layout.ContentPane.prototype.attributeMap), {
		userNameLabel: {node: "userNameLabel", type: "innerHTML"},
		passwdLabel: {node: "passwdLabel", type: "innerHTML"},
		passwd2Label: {node: "passwd2Label", type: "innerHTML"},
		languageLabel: {node: "languageLabel", type: "innerHTML"}
	}),
	userNameLabel: "",
	passwdLabel: "",
	passwd2Label: "",
	
	changeSettingsButtonLabel: "",
	cancelButtonLabel: "",
	msgCurrentUsername: "",
	msgPwdNoMatch: "",
	msgUserChangeSuccess: "",
	msgUserChangeFailure: "",
	passwordLength: "",
	
	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("folio", "editor/UserEditorTemplate.html"),
	constructor: function(args) {
	},
	postCreate: function() {
		this.inherited("postCreate", arguments);
		this.localize();
	},
	startup: function() {
		this.inherited("startup", arguments);
		this.bc.startup(arguments);
		/*this.CompProfileCreated = false;
		if(this.CPContentPane){
			dojo.connect(this.UserProfileTabs, "selectChild", dojo.hitch(this, function(child){
			if(!this.CompProfileCreated && child.dojoAttachPoint === 'CPContentPane'){
			   this.CompProfileCreated = true;
               this._fixCompetenceTab();
			}
        }));
       }*/
	},
	resize: function() {
		this.bc.resize(arguments);
	},
	localize: function() {
		dojo.requireLocalization("folio", "userEditor");
		this.resourceBundle = dojo.i18n.getLocalization("folio", "userEditor");
		this.set(this.resourceBundle);
		
		if (this.UserProfileTabs.tablist.hasChildren()) {
			this.UserProfileTabs.tablist.getChildren()[0].set("label", this.resourceBundle.accountLabel);
			this.UserProfileTabs.tablist.getChildren()[1].set("label", this.resourceBundle.profileLabel);
		}
	},
	setApplication: function(application) {
		this.application = application;

		folio.create.getCreateLanguages(this.application.getConfig());
		this.langStore = new dojo.data.ItemFileReadStore({'data':{'identifier': 'id',
                                                     'label': 'label',
                                                      'items': folio.create.createLanguages
         }});
		this.languageSelect.searchAttr = 'label';
		this.languageSelect.set("store", this.langStore);
		
		//Perhaps move out the code below to a seperate function
		this.store = application.getStore();
		var obj = {base: application.repository, 
		                 contextId: "_principals", 
						 entryId: application.getUser().id}
		this.store.loadEntry({base: application.repository, 
		                 contextId: "_principals", 
						 entryId: application.getUser().id,
						 forceRefresh: true}, 
						 {},
						 dojo.hitch(this, function(entry){
						 	var node = dojo.create("div");
							this.FOAFAPContentPane.set("content", node);
						 	this.entry = entry;
							this.apPlain = new folio.editor.RFormsEditorPlain({},node);
							this.apPlain.setIncludeLevel("recommended");
							//this.FOAFAPContentPane.set('content', this.apPlain);
							this.apPlain.show(new rdfjson.Graph(this.entry.getLocalMetadata().exportRDFJSON()), this.entry, this.entry.getResourceUri());
		}));
		//this.apPlain.setGraph(this.entry.getLocalMetadata(), userAP);//'http://tomcat.knowware.nada.kth.se/formulator/formlet/oefoaf');
	},
	/*_fixCompetenceTab :function(){
			var relations = this.entry.getRelation();
			var relList = relations[this.entry.getResourceUri()];
			//TODO, Fix here with /resource and stuff...
			var key;
			var hasComp = false;
			for (key in relList){
				for (var relationIndex in relList[key]) {
				   if (relList[key][relationIndex] === "sc:aboutPerson") {
					   hasComp = true;
					   relEntryURI = key;
				       break;
				   }
				}
			}
			
			this.CompetenceEntry;
			this.CPPlain = new folio.editor.AnnotationProfileEditorPlain();
							
			if(hasComp){
				var entryObj = folio.data.normalizeEntryInfo(relEntryURI);
			    entryObj.refreshMe = true;
				this.store.loadEntry(entryObj, {},  dojo.hitch(this, function(result) {
					this.CompetenceEntry = result;
					this.CPContentPane.set('content',this.CPPlain);
					this.CPPlain.setGraph(result.getLocalMetadata(), 'http://tomcat.knowware.nada.kth.se/formulator/formlet/HnetPPSec1');//'http://localhost:8080/formulator/formlet/HnetPPSec1');	
				    this.CPPlain.recommendedChange(); //Sets the editor to include the Recommended elements
				}),
				dojo.hitch(this, function(result){
					this.CPContentPane.set('content',"Failed getting Profile");
				}));      	
			}else{
			   	var metadata = {"sc:aboutPerson": {"@id": this.entry.getResourceUri()} };
				var homeContext = this.store.getContext(this.entry.entryInfo.base+this.entry.getResource().homecontext)
				var co = {"context": homeContext};
				co.metadata = metadata;
				homeContext.createEntry(co, dojo.hitch(this, function(result) {
					this.CompetenceEntry = result;
					this.CPContentPane.set('content',this.CPPlain);
					this.CPPlain.setGraph(result.getLocalMetadata(), 'http://tomcat.knowware.nada.kth.se/formulator/formlet/HnetPPSec1');//'http://localhost:8080/formulator/formlet/HnetPPSec1');
			        this.CPPlain.recommendedChange(); //Sets the editor to include the Recommended elements
			        this.entry.setRefreshNeeded();
				}),
				dojo.hitch(function(result){
					this.CPContentPane.set('content',"Failed to create Profile");
				}));
			}

	},*/
	handle: function(event) {
		this.userEntry = event.entry;
		this.userEntry.refresh(dojo.hitch(this, function(){
			this.user = this.userEntry.getResource();
			this.clear();	
		}));
		//this.setMessage("Current username is "+this.user.name);
		//this.setMessage(this.msgCurrentUsername + this.user.name);
	},
	clear: function() {
		this.userNameField.set("value", this.user.name);
		this.passwdField.set("value", "");
		this.passwdField2.set("value", "");
		this.languageSelect.set("value", this.user.language? this.user.language : "");
	},
	setMessage: function(message) {
		this.userMessage.innerHTML=message;
	},
	cancelClicked: function() {
		if (this.onFinish) {
			this.onFinish();
		}
	},
	changeClicked: function() {
		var newUserData = {name: this.userNameField.get("value")};
		var pw = this.passwdField.get("value"); 
		var userLang = this.languageSelect.getValue();
		if (pw) {
			if (pw.length < 8){
				this.setMessage(this.passwordLength);
				this.UserProfileTabs.selectChild(this.UserProfileContentPane);
				return;
			} else if (pw != this.passwdField2.get("value")) {
				this.setMessage(this.msgPwdNoMatch);
				this.passwdField2.set("value", "");
				return;
			}
			newUserData.password = pw;
		}
		if (userLang && userLang != 'no_select'){
			newUserData.language = userLang;
			this.application.setLocale(userLang);
		} else { //User has chosen to not have a preferred language, choose lang of the browser
			if ( navigator ) {
				if ( navigator.language ) {
					this.application.setLocale(navigator.language);
				}
				else if ( navigator.browserLanguage ) {
					this.application.setLocale(navigator.browserLanguage);
				}
				else if ( navigator.systemLanguage ) {
					this.application.setLocale(navigator.systemLanguage);
				}
				else if ( navigator.userLanguage ) {
					this.application.setLocale(navigator.userLanguage);
    			} else {
					this.application.setLocale("en");
				}
			}
		}
		
		var userResource = dojo.clone(this.userEntry.getResource());
		this.userEntry.getContext().communicator.saveJSON(this.userEntry.getResourceUri(), newUserData,
				dojo.hitch(this, function(data) {
					this.user = data;
					this.clear();
					//this.setMessage("User successfully changed. You have to reload your browser and log in again.");
					this.setMessage(this.msgUserChangeSuccess);
					this.userEntry.resource = userResource;
					this.userEntry.getResource().name = newUserData.name; //Should we use .user or .name? In NavigationBar the .user is used to get the username...
					this.userEntry.getResource().user = newUserData.name;
					if (newUserData.language) {
						this.userEntry.getResource().language = newUserData.language;						
					}
					this.application.setUser(dojo.mixin({}, this.userEntry.getResource(), {id: this.userEntry.getId()}));
					//this.application.dispatch({action: "change", entry: this.userEntry});
					if(newUserData.password){//Note: This can be removed if cookies are used!
						var loginDialog = new folio.security.LoginDialog({
							application: this.application
						});
						loginDialog.setAuthentication(newUserData.name, newUserData.password);
						loginDialog.destroyRecursive();
						var tmp = this.apPlain.getMetadata();
						this.userEntry.getContext().communicator.saveJSON(this.userEntry.getLocalMetadataUri(),tmp);
					}
					this.userEntry.setRefreshNeeded();
				}),
				dojo.hitch(this, function(mesg) {
					//this.setMessage("User not changed due to: "+mesg);
					this.setMessage(this.msgUserChangeFailure + mesg);
					this.clear();
				})
		);
		if (!newUserData.password) { //This is done in the callback if the password is set, note that this is not necessary with cookie-auth
			var tmp = this.apPlain.getMetadata();
			this.userEntry.getContext().communicator.saveJSON(this.userEntry.getLocalMetadataUri(), tmp);
			this.userEntry.setRefreshNeeded();
		}
		if (this.onFinish) {
			this.onFinish();
		}
		
	},
	_setChangeSettingsButtonLabelAttr: function(value) {
		this.changeSettingsButton.set("label", value);
		this.changeSettingsButtonLabel = value;
	},
	_setCancelButtonLabelAttr: function(value) {
		this.cancelButton.set("label", value);
		this.cancelButtonLabel = value;
	}
});
