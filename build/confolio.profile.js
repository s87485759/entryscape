dependencies = {
   layers: [
                  {
				  	 name: "../folio/folio.js",
            		 resourceName: "folio.folio",
                     layerDependencies: [
                     ],
                     dependencies: [
                		"folio.foliolayer"
            		 ]
        		  }
    ],
    prefixes: [
        [ "dijit", "../dijit" ],
        [ "dojox", "../dojox" ],
        [ "se", "../../../src/se" ],
        [ "folio", "../../../src/folio" ],
        [ "rdfjson", "../../../src/rdfjson" ],
        [ "rforms", "../../../src/rforms" ]
    ]
}