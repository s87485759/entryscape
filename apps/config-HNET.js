/**
 * Confolio configuration file.
 *
 */
__confolio.addConfig({

"title":                "Hematology Confolio",
"startContext":         "1",
"showLogin":            "false",
"username":             "Donald",
"password":             "donalddonald",
"app":                  "hnetfolio.apps.HematologyTFolio",
"appModulePath":        "../../../vendor-src/hematologynet/hnetfolio",
"appModuleName":        "hnetfolio",
"unloadDialog":         false,
"build":				false,
"startButtons":         "true",
"theme":                "HematologyNewTheme",
"showTextButton": 		"false",
"possibleToCommentEntry": "false",
"floatingExpand": true,

"search.type.default":  "simple",
"search.scope.default": "context", //Not implemented... Directs the default-scope for the search  
"search.scope":         "folder,all,user", 

"aboutUrl": "themes/hematologynet/about.html",
"helpUrl": "http://www.confolio.org/wiki/HematologyNet/HematologyNet",
"supportedLanguageMap": {
		"de":"Deutsch",
        "et":"Eesti",
        "el":"Ελληνικά",
        "en":"English",
		"es":"Español",
		"hu":"Magyar",
		"no-nb":"Norsk (bokmål)",
		"pt":"Português",
		"ro":"Română",
		"ru":"Русский",
//		"sv":"Svenska",
		"zh-cn":"中文(简体)"
	},

"definitionsPath":		"definitions-HNET",
//Possible values are folder, context, all,reference and user
//Note that in order to include folder-search the type cannot be "simple"

"viewMap": {
		    "manager": "se.uu.ull.site.FullscreenViewStack",
			"controller": "hnetfolio.simple.SNavigationBar",
			"startView": "landing",
			"views": [{"name": "default", "class": "hnetfolio.apps.HematologyTFolio", "constructorParams": {"startContext": "1"}},
					  {"name": "start", "class": "folio.apps.StartPage"},
					  {"name": "profile", "class": "hnetfolio.apps.Profile"},
					  {"name": "search", "class": "folio.apps.Search"},
					  {"name": "HNETSearch", "class": "hnetfolio.apps.HNETSearch"},
					  {"name": "about", "class": "hnetfolio.apps.About"},
					  {"name": "signup", "class": "hnetfolio.apps.Signup"},
					  {"name": "landing", "class": "hnetfolio.apps.Landing"},
					  {"name": "contact", "class": "hnetfolio.apps.Contact"},
					  {"name": "disclaimer", "class": "hnetfolio.apps.Disclaimer"},
					  {"name": "HNETPartners", "class": "hnetfolio.apps.HNETPartners"},
					  {"name": "UserTerms", "class": "hnetfolio.apps.UserTerms"},
					  {"name": "CompetenceStatistics", "class": "hnetfolio.apps.CompetenceStatistics"},
					  {"name": "help", "class": "folio.apps.Help", "constructorParams": {"initialHelpPage": "intro"}}]
		}
});
