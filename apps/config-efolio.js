/**
 * Confolio configuration file.
 *
 */
__confolio.addConfig({

"title":	"Embeddable Confolio",
"startContext": "1",
"username": "Donald",
"password": "donalddonald",
"showLogin": "true",
"unloadDialog": "true",
"CLI": "false",
"possibleToCommentEntry": "true",
"helpUrl": "http://www.confolio.org/wiki/OrganicEdunet",
"aboutUrl": "../info/about-my.html",
"scamPath": "scam",   /*This is default, can be left out*/
"definitionsPath": "definitions",
"startButtons": "true",
"theme": "default",

supportedLanguageMap: {
		"de":"Deutsch",
		"en":"English",
		"sv":"Svenska",
		"zh-cn":"中文(简体)"
},
"viewMap": {
		"manager": "se.uu.ull.site.FullscreenViewStack",
			"controller": "folio.navigation.NavigationBarSlim",
			"controllerConstructorParams": {"minimal": true},
			"startView": "start",
			"views": [{"name": "default", "class": "folio.apps.EFolio", "constructorParams": {"startContext": "1"}, "initInDom": true},
					  {"name": "start", "class": "folio.apps.StartPage", "constructorParams": {"twoColumn": false}},
					  {"name": "profile", "class": "folio.apps.Profile", "constructorParams": {"twoColumn": false}},
					  {"name": "search", "class": "folio.apps.Search1Column"},
					  {"name": "about", "class": "folio.apps.About"},
					  {"name": "signup", "class": "folio.apps.Signup"},
					  {"name": "help", "class": "folio.apps.Help", "constructorParams": {"initialHelpPage": "intro"}}]
		}
});