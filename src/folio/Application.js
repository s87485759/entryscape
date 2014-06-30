/*global define, __confolio*/
define([
    "dojo/_base/kernel",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/connect",
    "dojo/_base/array",
    "dojo/dom-geometry",
    "dojo/query",
    "dojo/_base/window",
    "dojo/i18n",
    "dojo/Deferred",
    "folio/Config",
    "folio/Messages",
    "folio/data/Communicator",
    "folio/data/Store",
    "folio/util/dialog",
    "rdforms/template/ItemStore"
], function (kernel, declare, lang, connect, array, domGeometry, query, win, i18n, Deferred, Config, Messages, Communicator, Store, dialog, ItemStore) {

    return declare(null, {

        //===================================================
        // Private attributes
        //===================================================
        user: null,
        store: null,
        communicator: null,
        preferredLanguages: ["en"],
        repository: "",

        //===================================================
        // Public API
        //===================================================
        getItemStore: function (callback) {
            if (callback) {
                if (this.itemStore) {
                    callback(this.itemStore);
                } else {
                    this.itemStoreDeferred.addCallbacks(callback);
                }
            } else {
                return this.itemStore;
            }
        },
        getDialog: function () {
            return this.dialog;
        },
        getBoundingBox: function () {
            var vm = query(".viewMap", win.body())[0];
            return domGeometry.position(vm);
        },
        getRepository: function () {
            return this.repository;
        },
        getMessages: function () {
            if (!this._messages) {
                this._messages = new Messages();
            }
            return this._messages;
        },
        setUser: function (userObj) {
            if (userObj != null && userObj.id === "_guest") {
                this.userObj = null;
                return;
            }
            this.userObj = userObj;
            if (userObj && userObj.language) {
                this.setLocale(userObj.language);
            }
            connect.publish("/confolio/userChange", [
                {user: userObj}
            ]);
        },
        getUser: function () {
            return this.userObj;
        },
        getStore: function () {
            return this.store;
        },
        getCommunicator: function () {
            return this.communicator;
        },
        getConfig: function (callback) {
            if (callback === undefined) {
                return this.config;
            } else {
                this.configDeferred.then(callback);
            }
        },
        getPreferredLanguages: function () {
            return this.preferredLanguages;
        },
        setPreferredLanguages: function (languages) {
            this.preferredLanguages = languages;
            connect.publish("/confolio/preferredLanguagesChanged", [
                {preferredLanguages: languages}
            ]);
        },
        setClipboard: function (clip) {
            this.clipboard = clip;
            connect.publish("/confolio/clipboardChange", [
                {clip: clip}
            ]);
        },
        getClipboard: function () {
            return this.clipboard;
        },
        message: function (message) {
            connect.publish("/confolio/message", [
                {message: message}
            ]);
        },
        getLocale: function () {
            return this._locale;
        },
        setLocale: function (locale) {
            this._locale = locale;
            if (kernel.locale == locale) {
                return;
            }

            kernel.locale = i18n.normalizeLocale(locale);

            //Need not explicitly require anything since this is done by all listenting views.
            /*if (!__confolio.isBuild()) {
             try {
             require()
             dojo["require"]("folio.nls.folio"+"_"+dojo.locale);	 //Written like this to avoid preparsing by dojo Shrinksafe
             } catch(e) {}
             }*/

            //window.alert("Application.setLocale: " + locale);
            /*, list
             * Need to requireLocalization since dijit code does
             * only do a requireLocalization during first load,
             * hence when locale is changed dynamically (which is
             * not formally supported by dojo) new stuff will
             * assume that the new locale is already loaded, which
             * it is not. It will do a getLocalization directly,
             * yielding an error. This problem should not appear in
             * a built version when all locale files are bundled
             * into a single file which is loaded in the step above.
             */
            //Probably this is not an issue when loading using the AMD loader.
            /*try {
             dojo.requireLocalization("dijit", "loading");
             dojo.requireLocalization("dijit", "common");
             dojo.requireLocalization("dijit.form", "Textarea");
             dojo.requireLocalization("dijit.form", "validate");
             dojo.requireLocalization("dijit.form", "ComboBox");
             dojo.requireLocalization("dojo.cldr", "gregorian");
             dojo.requireLocalization("dojo.cldr", "currency");
             dojo.requireLocalization("dojo.cldr", "number");
             } catch(e2) {}*/
            connect.publish("/confolio/localeChange", [
                {locale: locale}
            ]);
        },
        openContext: function (contextRepresentativeEntry) {
            console.log("openContext is deprecated");
        },

        /**
         * Publishes internal events without changing the url. Any GUI component may listen for these events by using
         * dojo.subscribe to a suitable event. The folio.ApplicationView encapsulates a lot of functionality for listening
         * to internal events, it is recommended to inherit from it instead of subscribing manually using dojo.subscribe.
         * All events are constructing according to the following scheme:
         * /confolio/{action} with all the params and the view as arguments in one object.
         *
         * @param {Object} action
         * @param {Object} params
         * @param {Object} view
         * @see folio.ApplicationView
         */
        publish: function (action, params, view) {
            view = view || __confolio.viewMap.getCurrentView() || "default";
            if (params.entry instanceof folio.data.Entry) {
                params.context = params.entry.getContext().getId();
                params.entry = params.entry.getId();
            }
            if (params.list instanceof folio.data.Entry) {
                params.list = params.list.getId();
            }
            connect.publish("/confolio/" + action, [lang.mixin({view: view}, params)]);
        },

        /**
         * Opens a new url which will be captured by the ViewMap which then will call the show method on the appropriate view.
         * The view may then react directly or republish the change as a new internal event using the publish mehtod above.
         *
         * @param {String} view
         * @param {Object} params
         */
        open: function (view, params) {
            window.location = __confolio.viewMap.getHashUrl(view, params);
        },
        /**
         *
         * @param {Object} entry
         * @param {String} view
         * @param {Object} list
         */
        openEntry: function (entry, view, list) {
            window.location = this.getHref(entry, view, list);
        },

        /**
         * Utility method for creating links, i.e. returns the url to set as the href attribute on A-elements.
         * When such links are clicked the same effect is achieved as calling the open method above.
         *
         * @param {Object} entry
         * @param {String} view
         * @param {Object} list
         */
        getHref: function (entry, view, list) {
            view = view || __confolio.viewMap.getCurrentView() || "default";
            if (entry instanceof folio.data.Entry) {
                if (list) {
                    return __confolio.viewMap.getHashUrl(view, {"context": entry.getContext().getId(), "entry": entry.getId(), "list": list.getId()});
                } else {
                    return __confolio.viewMap.getHashUrl(view, {"context": entry.getContext().getId(), "entry": entry.getId()});
                }
            } else {
                var eInfo = folio.data.normalizeEntryInfo(entry);
                if (list) {
                    var lInfo = folio.data.normalizeEntryInfo(list);
                    return __confolio.viewMap.getHashUrl(view, {"context": eInfo.contextId, "entry": eInfo.entryId, list: lInfo.entryId});
                } else {
                    return __confolio.viewMap.getHashUrl(view, {"context": eInfo.contextId, "entry": eInfo.entryId});
                }
            }
        },

        /**
         * Similar to getHref, but respects links.
         *
         * @param  {folio.data.Entry} entry
         * @param {Function} callback
         */
        getHrefLinkLike: function (entry, callback) {
            var resolvLinkLike = function (entry, f) {
                var f2 = function (resolvedEntry) {
                    if (folio.data.isUser(resolvedEntry) && resolvedEntry.getResource() == null) {
                        resolvedEntry.setRefreshNeeded();
                    }
                    if (resolvedEntry.needRefresh()) {
                        resolvedEntry.refresh(f);
                    } else {
                        f(resolvedEntry);
                    }
                };
                if (folio.data.isLinkLike(entry) && !folio.data.isFeed(entry) && entry.getBuiltinType() !== folio.data.BuiltinType.RESULT_LIST) {
                    folio.data.getLinkedLocalEntry(entry, function (linkedEntry) {
                        f2(linkedEntry);
                    });
                } else {
                    f2(entry);
                }
            };
            if (folio.data.isUser(entry) || folio.data.isGroup(entry)) { //Opens the homeContext of a user.
                resolvLinkLike(entry, lang.hitch(this, function (e) {
                    callback({href: this.getHref(e, "profile")});
                }));
            } else if (folio.data.isListLike(entry)) {
                resolvLinkLike(entry, lang.hitch(this, function (e) {
                    callback({href: this.getHref(e, "default")});
                }));
            } else if (folio.data.isContext(entry)) {
                resolvLinkLike(entry, lang.hitch(this, function (e) {
                    callback({href: this.getHref(e.getResourceUri() + "/resource/_top", "default")});
                }));
            } else {
                callback({href: entry.getResourceUri(), blankTarget: true});
            }
        },

        dispatch: function (params) {
            console.log("dispatch is deprecated");
            this.publish(params.action, params);
        },
        //===================================================
        // Inherited methods
        //===================================================
        /**
         * args must contain:
         * * dataDir
         * * repository
         */
        constructor: function (params) {
            lang.mixin(this, params);
            this.itemStoreDeferred = new Deferred();
            this.configDeferred = new Deferred();
            __confolio.config.definitionsPromise.then(lang.hitch(this, function (definitions) {
                this.config = new Config(__confolio.config);
                this.configDeferred.resolve(this.config);

                this.itemStore = new ItemStore();
                if (definitions.templateSources != null) {
                    this.itemStore.populate(definitions.templateSources, lang.hitch(this, function () {
                        this.itemStoreDeferred.resolve(this.itemStore);
                    }));
                } else {
                    this.itemStoreDeferred.resolve(this.itemStore);
                }
            }));

            this.communicator = Communicator; //Set up a communicator
            this.store = new Store({communicator: this.communicator}); //
            this.dialog = new dialog.StandardDialog({});
            this.dialog.startup();
        }
    });
});