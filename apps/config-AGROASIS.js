/**
 * Confolio configuration file.
 *
 */
__confolio.addConfig({

"title":                "Organic.Edunet Community Portal - AGROASIS",
"startContext":         "34",
"showLogin":            false,
"unloadDialog":		false,
"app":                  "folio.apps.oe.Agroasis",
"appModulePath":        "oe",
"theme":                "agroasis",
"helpUrl": "http://www.confolio.org/wiki/OrganicEdunet",
"aboutUrl": "themes/organic/about.html",
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
"search.scope":         "folder,all,reference"
//Possible values are folder, context, all,reference and user
//Note that in order to include folder-search the type cannot be "simple"

});
