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

dojo.provide("jdil.tests");
dojo.require("doh.runner");
dojo.require("jdil.Graph");
dojo.require("jdil.EditableGraph");

jdil.tests.setup = function(){ // setUp
	       	jdil.tests.res1  = "ex:res1";
        	jdil.tests.res2  = "ex:res2";
        	jdil.tests.res3  = "ex:res3";
            jdil.tests.graphsrc = {"@id": jdil.tests.res1,
            					"dc:title": "A title",
            					"dc:description": {"@value": "A description", "@language": "en"},
            					"dc:subject": {"@id": jdil.tests.res2},
            					"*foaf:friend": jdil.tests.res3,
            					"*foaf:enemy": [jdil.tests.res2, jdil.tests.res3]};
            jdil.tests.graph = new jdil.EditableGraph(jdil.tests.graphsrc);
            jdil.tests.resource_root = jdil.tests.graph.getRoot();
			jdil.tests.resource1 = jdil.tests.graph.get(jdil.tests.res1);
            jdil.tests.resource2 = jdil.tests.graph.get(jdil.tests.res2);
            jdil.tests.resource3 = jdil.tests.graph.get(jdil.tests.res3);
};

doh.registerGroup("jdil.tests.Graph",
        [
                function rootResource(t){
                	t.t(jdil.tests.resource1);
                	t.t(jdil.tests.resource1 === jdil.tests.resource_root);
               		t.t(jdil.tests.resource1["@id"] == jdil.tests.res1);
                },
                function subResources(t){
                	t.t(jdil.tests.resource2);
                	t.t(jdil.tests.resource2["@id"] == jdil.tests.res2);
                },
                function starredSubResources(t) {
                	t.t(jdil.tests.resource3);
                	t.t(jdil.tests.resource3["@id"] == jdil.tests.res3);
                },
                function directPropertyToResource(t) {
                	t.t(jdil.tests.graph.getFirstObject("dc:subject") === jdil.tests.resource2);
                	t.t(jdil.tests.graph.getFirstObject("foaf:friend") === jdil.tests.resource3);
                },
                function repeatedProperties(t) {
			        var enemies = jdil.tests.graph.getObject("foaf:enemy");
			        t.t(enemies[0] === jdil.tests.resource2 && enemies[1] === jdil.tests.resource3);
                },
                function directPropertyToData(t){
					t.t(jdil.tests.graph.getFirstObjectValue("dc:title") == "A title");
					t.t(jdil.tests.graph.getCanonicalFirstObject("dc:title")["@value"] == "A title");
					t.t(jdil.tests.graph.getCanonicalObject("dc:title")["@value"] == "A title");
					t.t(jdil.tests.graph.getFirstObjectValue("dc:description") == "A description");
					t.t(jdil.tests.graph.getFirstObject("dc:description")["@language"] == "en");
					t.t(jdil.tests.graph.getCanonicalFirstObject("dc:description")["@language"] == "en");
					t.t(jdil.tests.graph.getCanonicalFirstObject("dc:description")["@language"] == "en");
                }
        ],
        jdil.tests.setup,
        function(){ // tearDown
        }
);

doh.register("jdil.tests.EditableGraph",
        [{name: "remove singe statement",
			setUp: jdil.tests.setup,
			runTest: function(){
				//Works to remove statement once.
                doh.t(jdil.tests.graph.remove(jdil.tests.res1, "dc:subject", jdil.tests.resource2));
               	doh.f(jdil.tests.graph.remove(jdil.tests.res1, "dc:subject", jdil.tests.resource2));
				//resource is not available via that property anymore
               	doh.t(jdil.tests.graph.getFirstObject("dc:subject") !== jdil.tests.resource2);
				//Resource is still available since it is referred from the foaf:enemy property.
               	doh.t(jdil.tests.graph.get(jdil.tests.res2));
               	var enemies = jdil.tests.graph.getObject("foaf:enemy");
			    doh.t(enemies[0] === jdil.tests.resource2 && enemies[1] === jdil.tests.resource3);
			}
		},{name: "remove single statement when property is repeated",
			setUp: jdil.tests.setup,
			runTest: function(){
				doh.t(jdil.tests.graph.remove(jdil.tests.res1, "foaf:enemy", jdil.tests.resource2));
                doh.f(jdil.tests.graph.remove(jdil.tests.res1, "dc:enemy", jdil.tests.resource2));
				doh.t(jdil.tests.graph.getFirstObject("dc:subject") === jdil.tests.resource2);
			    doh.t(jdil.tests.graph.getObject("foaf:enemy") === jdil.tests.resource3);
			}
		},{name: "remove a resource",
			setUp: jdil.tests.setup,
			runTest: function(){
				doh.t(jdil.tests.graph.removeResource(jdil.tests.resource2));
				doh.t(jdil.tests.graph.getFirstObject("dc:subject") !== jdil.tests.resource2);				
				doh.f(jdil.tests.graph.get(jdil.tests.res2));
			}
		},{name: "remove a resource recursively",
			setUp: jdil.tests.setup,
			runTest: function(){
				doh.t(jdil.tests.graph.removeResource(jdil.tests.resource1, true));
				doh.f(jdil.tests.graph.get(jdil.tests.res1));
			}
		}]
);