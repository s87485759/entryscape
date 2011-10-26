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
        [ "folio", "../../../src/folio" ],
        [ "shame", "../../shame-src" ],
		[ "jdil", "../../../src/jdil"]		
    ]
}