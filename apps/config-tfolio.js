/**
 * Confolio configuration file.
 *
 */
__confolio.addConfig({

"title":	"Confolio 3-pane work view",
"app": 		"folio.apps.TFolio",
"startContext": "1",
"username": "Donald",
"password": "donalddonald",
"unloadDialog": true,
"CLI": true,
"helpUrl": "http://www.confolio.org/wiki/OrganicEdunet",
"aboutUrl": "../info/about-my.html",
"scamPath": "scam",   /*This is default, can be left out*/
"definitionsPath": "definitions",
"startButtons": "true",
"theme": "blueberry",

supportedLanguageMap: {
		"de":"Deutsch",
		"en":"English",
		"sv":"Svenska",
		"zh-cn":"中文(简体)"
},
"viewMap": {
		"manager": "se.uu.ull.site.FullscreenViewStack",
			"controller": "folio.navigation.NavigationBar",
			"startView": "start",
			"views": [{"name": "default", "class": "folio.apps.TFolio", "constructorParams": {"startContext": "1"}},
					  {"name": "start", "class": "folio.apps.StartPage"},
					  {"name": "profile", "class": "folio.apps.Profile"},
					  {"name": "search", "class": "folio.apps.Search"},
					  {"name": "about", "class": "folio.apps.About"},
					  {"name": "signup", "class": "folio.apps.Signup"},
					  {"name": "help", "class": "folio.apps.Help", "constructorParams": {"initialHelpPage": "intro"}}]
		}
});