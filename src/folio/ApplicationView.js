dojo.provide("folio.ApplicationView");

dojo.declare("folio.ApplicationView", null, {
	viewId: "", //Override
	
	constructor: function() {
		this.application = __confolio.application;
		var arr = this.getSupportedActions();
		var loadEntry = dojo.hitch(this, function(event, params) {
				this.application.getStore().loadEntry({
						entryId: params.entry, 
						contextId: params.context,
						base: this.application.getRepository()
					}, {
						limit: params.limit == undefined ? 0 : event.limit, 
						sort: null
					}, dojo.hitch(this, function(entry) {
						event.entry = entry;
						if (params.list != null) {
							this.application.getStore().loadEntry({
								entryId: params.list, 
								contextId: params.context,
								base: this.application.getRepository()
							}, {
								limit: params.limit == undefined ? 0 : event.limit, 
								sort: null
							}, dojo.hitch(this, function(entry) {
								event.list = entry;
								this.handle(event);							
							}));
						} else {
							this.handle(event);							
						}
					})
				);
		});
		dojo.forEach(arr, function(action) {
			dojo.subscribe("/confolio/"+action, dojo.hitch(this, function(action, params) {
				var event = dojo.mixin({action: action}, params);
				if ((action === "showEntry" || action === "showResourceEditor" || action === "showCreateWizard"|| action === "showMDEditor" || action === "entryAdmin" || "childrenChanged") 
					&& (params.context != null || params.entry != null)) {
					if (params.entryInstance) {
						event.entry = params.entryInstance;
						this.handle(event);
					} else {
						loadEntry(event, params);
					}
				} else if (true || action === "userChange" || action === "orderChange" || action === "localeChange" || action === "message" || action === "viewState"){
					this.handle(event);
				}
			}, action));
		}, this);
	},
	setApplication: function(application) {
//		this.application = application;
//		this._maybeApplicationViewInit();
	},
	
	postCreate: function() {
		if (this._maybeApplicationViewInit) {
			this.afterPostCreate = true;
	//		this._maybeApplicationViewInit();
		}
		this.inherited("postCreate", arguments);		
	},
	_maybeApplicationViewInit: function() {
		if (this.afterPostCreate && this.application) {
//			this.applicationViewInit();
		}
	},
	applicationViewInit: function() {
	},

	/**
	 * Override this function to deliver a relevant set of actions that this view supports.
	 * The list returned by default in this function represents all available actions.
	 * The special showView action needs not be included here, it must always be supported.
	 * Below, when a word is surrounded with underscores, e.g. _entry_, it means that it must
	 * be given in the event hash.
	 * 
	 * * changed - an _entry_ has changed.
	 * * deleted - an _entry_ has been deleted.
	 * * childrenChanged - the children of an list _entry_ has changed.
	 * * focusOn - the _entry_ is now focused, typically due to being selected in a list.
	 * * clear - clears a view
	 * * showContext - a context should be showed via a represenative _entry_, typically the special _top folder.
	 * * showEntry - an _entry_ has been selected and should be showed.
	 * * showContent - an _entry_ has been opened.
	 * * showView - an special view with _viewId_ should be showed.
	 * * message - a _message_ of some sort should be showed.
	 * * clipboardChange - a new _clip_ is available in the clipboard.
	 * * preferredLanguagesChange - the _preferredLanguages_ have been changed.
	 * * userChange - a new _user_ is now the agent, e.g. after a login.
	 * * localeChange - the locale has changed.
	 * * orderChange - the preferred order of showing list memebers has changed.
	 */
	getSupportedActions: function() {
		return ["changed", "deleted", "childrenChanged", "focusOn", "clear", 
		        "showContext", "showEntry", "showContent", "showView", "message", "clipboardChange", 
		        "preferredLanguagesChange", "userChange", "localeChange", "orderChange"];
	},

	/**
	 * Forwards the event to the handle function unless it is this view that is the source.
	 * (Avoids infinity loops for certain actions, e.g. focus.)
	 */
	rawHandle: function(event) {
		if (!(event.source && event.source == this)) {
			this.handle(event);
		}
	},
	/**
	 * Processes the given event.
	 * The event may have a range of attributes 
	 * which use are decided by a specific "action" 
	 * which may have one of the following values:
	 *  - open  (requires entry)
	 *  - changed (requires entry)
	 *  - deleted
	 *  - childrenChanged
	 *  - focus
	 *  - clear
	 *  - newUser
	 *  All but clear and newUSer actions requires an additional entry attribute.
	 *  Action newUser requires an userObject.
	 *  
	 *  If method is not overridden it tries to call a method with the name of the action.
	 */
	handle: function(event) {
		if (this[event.action]) {
			this[event.action](event);
		}
	}
});