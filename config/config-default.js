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
"CLI": "false",
"possibleToCommentEntry": "true",
"helpUrl": "http://www.confolio.org/wiki/OrganicEdunet",
"aboutUrl": "info/about-my.html",
"scamPath": "store",   /*This is default, can be left out*/
"definitionsPath": "definitions",
"startButtons": "true",
"theme": "default",
"showCreateObjectButton": "false",

supportedLanguageMap: {
		"de":"Deutsch",
		"en":"English",
		"sv":"Svenska",
		"zh-cn":"中文(简体)"
},
"viewMap": {
		"manager": "se/uu/ull/site/FullscreenViewStack",
			"controller": "folio/navigation/NavigationBar",
			"startView": "start",
			"views": [
                {"name": "default", "class": "folio/apps/TFolio", "constructorParams": {"startContext": "2"}, "initInDom": true},
                {"name": "start", "class": "folio/start/Start"},
                {"name": "profile", "class": "folio/profile/Profile"},
                {"name": "settings", "class": "folio/settings/Settings"},
                {"name": "search", "class": "folio/search/Search"},
                {"name": "about", "class": "folio/view/About"},
                {"name": "signup", "class": "folio/view/Signup"},
                {"name": "slides", "class": "folio/view/Slides"},
                {"name": "ldbrowser", "class": "folio/view/LDBrowser"},
                {"name": "account", "class": "folio/security/Account"},
                {"name": "help", "class": "folio/view/Help", "constructorParams": {"initialHelpPage": "intro"}}
            ]}
});