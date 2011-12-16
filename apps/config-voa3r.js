/**
 * Confolio configuration file.
 *
 */
__confolio.addConfig({

"title":	"VOA3R Confolio",
"app": 		"folio.apps.TFolio",
"startContext": "1",
"unloadDialog": false,
"CLI": false,
"build": true,
"scamPath": "scam",   /*This is default, can be left out*/
"definitionsPath": "definitions-voa3r",
"startButtons": "false",
"theme": "voa3r",
"showTextButton": "false",
"possibleToCommentEntry": "false",

"supportedLanguageMap": {
                "de":"Deutsch",
                "bg":"Български език",
                "et":"Eesti",
                "el":"Ελληνικά",
                "en":"English",
                "es":"Español",
                "fr":"Français",
                "hi":"हिनदी / Hindī",
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
"viewMap": {
		"manager": "se.uu.ull.site.FullscreenViewStack",
			"controller": "folio.navigation.NavigationBar",
			"startView": "default",
			"views": [{"name": "default", "class": "folio.apps.TFolio", "constructorParams": {"startContext": "1"}},
					  {"name": "start", "class": "folio.apps.StartPage"},
					  {"name": "profile", "class": "folio.apps.Profile"},
					  {"name": "search", "class": "folio.apps.Search"},
					  {"name": "about", "class": "folio.apps.About"},
					  {"name": "signup", "class": "folio.apps.Signup"},
					  {"name": "help", "class": "folio.apps.Help", "constructorParams": {"initialHelpPage": "intro"}}]
		}
});
