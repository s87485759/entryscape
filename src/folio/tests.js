/*
 * Copyright (c) 2007-2010
 *
 * This file is part of Confolio.
 *
 * Confolio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Confolio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Confolio. If not, see <http://www.gnu.org/licenses/>.
 */

dojo.registerModulePath("jdil","../../web/jdil");
dojo.provide("folio.tests");
dojo.require("doh.runner");
dojo.require("folio.data.Store");
dojo.require("folio.data.Communicator");
dojo.require("folio.data.Entry");
dojo.require("jdil.Namespaces");
dojo.require("jdil.EditableGraph");

/*
Tests functions in Webroot/folio. Make sure you have the latest versions( from the svn ) of lib/utils/doh/runner.html and runner.js. 
*/


// Set up sets up data for the tests
folio.tests.setup = function(){ // setUp
			folio.tests.baseUri = "http://localhost:8080"
			folio.tests.isLoaded = true;
			folio.tests.startEntry = "/rest/3/entry/1";
			folio.tests.com = folio.data.Communicator;
			folio.tests.nss = new jdil.Namespaces({url: "/Confolio/WebRoot/testdata/namespaces", namespaces: {rest: "rest/3/"}});
			folio.tests.store = new folio.data.Store({communicator: folio.tests.com, namespaces: folio.tests.nss});
			folio.tests.store.loadEntry(folio.tests.startEntry, {},
				function() { folio.tests.isLoaded = true },		// onEntry
				function() { folio.tests.isLoaded = false }		// onError 
			);	
			folio.tests.xhrArgs =	{ url: folio.tests.startEntry + "?includeAll", handleAs: "json-comment-optional" }; 
};

// Test reading of file
doh.registerGroup("folio.tests.ReadFile",
        [{name: "Load portfolio",
			setUp: folio.tests.setup,
			runTest: function(){
				doh.assertTrue(folio.tests.isLoaded);
			}
		}]
);

// Test manipulation
doh.registerGroup("folio.tests.ManipulateJson",
		[{name: "Check resources before removement",
			//setUp: folio.tests.setup,
			runTest: function(){
				var d = dojo.xhrGet(folio.tests.xhrArgs);
				console.log("xhr running")
				d.addCallback(function(response){
					d.resp= response;
				})
				//doh.assertTrue(d.resp == false);
			}	
			
		},
		{name: "Remove Entry",
			//setUp: folio.tests.setup,
			runTest: function(){
				doh.assertTrue(true);
			}
		}]
);
