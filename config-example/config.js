/**
 * Confolio configuration file.
 *
 */
__confolio.addConfig({
    "title":	"EntryScape",
    "username": "Donald",
    "password": "donalddonald",
    "showLogin": "false",
    "unloadDialog": "false",
    "possibleToCommentEntry": "true",
    "helpUrl": "http://www.confolio.org/wiki/OrganicEdunet",
    "aboutUrl": "info/about-my.html",
    "storePath": "store",   /*This is default, can be left out*/
    "definitions": ["resources/definitions.js", "config-example/definitions.js"],
    "startButtons": "true",
    "theme": "default",
    "supportedLanguageMap": {
        "de":"Deutsch",
        "en":"English",
        "sv":"Svenska"
    },

    "startView": "start",
    "views": [
        {"name": "start", "class": "folio/start/Start"},
        {"name": "default", "class": "folio/apps/TFolio", "initInDom": true},
        {"name": "profile", "class": "folio/profile/Profile"},
        {"name": "settings", "class": "folio/settings/Settings"},
        {"name": "search", "class": "folio/search/Search"},
        {"name": "about", "class": "folio/view/About"},
        {"name": "slides", "class": "folio/view/Slides"},
        {"name": "ldbrowser", "class": "folio/view/LDBrowser"},
        {"name": "account", "class": "folio/security/Account"},
        {"name": "help", "class": "folio/view/Help", "constructorParams": {"initialHelpPage": "intro"}}
    ]
});