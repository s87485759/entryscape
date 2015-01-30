var profile = {
	platform: 'browser',
    basePath: '../libs/',
    releaseDir: '../target',
    action: 'release',
    cssOptimize: 'comments',
    mini: true,
    optimize: 'closure',
    layerOptimize: 'closure',
    stripConsole: 'all',
    selectorEngine: 'acme',
    packages:[
        "dojo",
        "dijit",
        "dojox",
		"rdfjson",
		"rdforms",
        "spa",
        "di18n",
        {name: "folio", location: "../src"}
    ],

    layers: {
		'dojo/dojo': {
		    include: [
		    	"spa/init",
                "spa/Site",
                "folio/Application",
				"folio/navigation/NavigationBar",
				"folio/apps/TFolio",
				"folio/start/Start",
				"folio/profile/Profile",
                "folio/settings/Settings",
				"folio/view/Help",
				"folio/view/About",
				"folio/apps/TFolio",
                "folio/security/Account",
				"folio/security/LoginDialog",
                "folio/search/Search",
				"dijit/Dialog",
				"dojo/back",
				"dojo/cookie"],
			boot: true,
			customBase: true
		}
    },

    staticHasFeatures: {
		'dojo-trace-api': 0,
		'dojo-log-api': 0,
		'dojo-publish-privates': 1,
		'dojo-sync-loader': 1,
		'dojo-xhr-factory': 0,
		'dojo-test-sniff': 0
    }
};