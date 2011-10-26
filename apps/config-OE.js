/**
 * Confolio configuration file.
 *
 */
__confolio.addConfig({

"title":                "Organic.Edunet Confolio",
"app":					"folio.apps.TFolio",
"startContext":         "1",
"showLogin":            false,
"showCreateCondition": 	"true",
"forceNextInCreate": 	"true",
"showTextButton":		"false",
"unloadDialog":			false,
"helpUrl": 				"http://www.confolio.org/wiki/OrganicEdunet",
"aboutUrl": 			"themes/organic/about.html",
"supportedLanguageMap": {
		"de":"Deutsch",
		"bg":"Български език",
		"et":"Eesti",
		"el":"Ελληνικά",
		"en":"English",
		"es":"Español",
		"fr":"Français",
		"hi":"हिन्दी / Hindī",
		"hu":"Magyar",
		"no-nb":"Norsk (bokmål)",
		"pt":"Português",
		"ro":"Română",
		"ru":"Русский",
		"sl":"Slovenščina",
		"sv":"Svenska",
		"tr":"Türkçe",
		"zh-cn":"中文(简体)"
	},

"search.type.default":  "simple", //Currently only simple and solr are possible options
"search.scope.default": "context", //Not implemented... Directs the default-scope for the search  
"search.scope":         "folder,all,reference",
"theme":                "organic",
"definitionsPath":		"definitions-OE",
//Possible values are folder, context, all,reference and user
//Note that in order to include folder-search the type cannot be "simple"
"viewMap": {
		"manager": "se.uu.ull.site.FullscreenViewStack",
			"controller": "folio.navigation.NavigationBar",
			"startView": "start",
			"views": [{"name": "default", "class": "folio.apps.TFolio", "constructorParams": {"startContext": "1"}},
					  {"name": "start", "class": "folio.apps.StartPage"},
					  {"name": "search", "class": "folio.apps.Search"},
					  {"name": "profile", "class": "folio.apps.Profile"},
					  {"name": "about", "class": "folio.apps.About"},
					  {"name": "help", "class": "folio.apps.Help", "constructorParams": {"initialHelpPage": "intro"}}]
		}

});
