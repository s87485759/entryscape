dependencies = {
	layers: [
		{
			name: "../shame/shame.js",
			resourceName: "shame.shame",
			layerDependencies: [
			],
			dependencies: [
				"shame.shamelayer"
			]
		},
		{
			name: "../folio/folio.js",
			resourceName: "folio.folio",
			layerDependencies: [
				"../shame/shame.js"
			],
			dependencies: [
				"folio.foliolayer"
			]
		}
	],
	prefixes: [
		[ "dijit", "../dijit" ],
		[ "dojox", "../dojox" ],
		[ "se", "../../../../../src/se" ],
		[ "folio", "../../../../../src/folio" ],
		[ "shame", "../../../../../src/shame" ],
		[ "jdil", "../../../../../src/jdil"],
		[ "rdfjson", "../../../../../src/rdfjson"],
		[ "rforms", "../../../../../src/rforms"]		
	]
}
