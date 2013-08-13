var profile = {
	platform: 'browser',
    basePath: '../src/',
    releaseDir: '../target',
    action: 'release',
    cssOptimize: 'comments',
    mini: true,
    optimize: 'closure',
    layerOptimize: 'closure',
    stripConsole: 'all',
    selectorEngine: 'acme',
    packages:[
        {name: "dojo", location: "../lib/dojo-src/dojo"},
        {name: "dijit", location: "../lib/dojo-src/dijit"},
        {name: "dojox", location: "../lib/dojo-src/dojox"},
		"rdfjson",
		"rforms",
		"folio",
		"se"
    ],

    layers: {
		'dojo/dojo': {
		    include: [
		    	"se/uu/ull/site/FullscreenViewStack",
				"folio/navigation/NavigationBar",
				"folio/apps/TFolio",
				"folio/apps/StartPage",
				"folio/start/Start",
				"folio/profile/Profile",
                "folio/settings/Settings",
				"folio/apps/Help",
				"folio/apps/About",
				"folio/apps/TFolio",
				"folio/security/LoginDialog",
				"dijit/Dialog",
				"dojo/back",
				"dojo/cookie",
				"folio/apps/Signup"],
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