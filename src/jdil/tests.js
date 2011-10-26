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
dojo.require("jdil.Namespaces");

jdil.tests.setup = function(){ // setUp
	       	jdil.tests.res1  = "http://scam4.org/3/entry/1";
        	jdil.tests.res2  = "ex:res2";
        	jdil.tests.res3  = "ex:res3";
            jdil.tests.graphsrc = {
    "@id": "http://scam4.org/3/entry/1",
    "dcterms:created": {
      "@datatype": "http://www.w3.org/2001/XMLSchema#dateTime",
      "@value": "2008-07-17T14:15:00.366+02:00"
    },
    "dcterms:modified": {
      "@datatype": "http://www.w3.org/2001/XMLSchema#dateTime",
      "@value": "2008-07-17T14:15:00.402+02:00"
    },
    "sc:resource": {
      "@id": "http://scam4.org/3/list/1",
      "rdf:type": {"@id": "sc:List"}
    },
    "sc:metadata": {"@id": "http://scam4.org/3/metadata/1"}
  };
  jdil.tests.namespaces = new jdil.Namespaces({namespaces: {
  	sc: "http://scam.sf.net/schema#",
 rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
 rdfs: "http://www.w3.org/2000/01/rdf-schema#",
 foaf: "http://xmlns.com/foaf/0.1/", 
 xsd: "http://www.w3.org/2001/XMLSchema#",
 dc: "http://purl.org/dc/elements/1.1/",
 dcterms: "http://purl.org/dc/terms/",
 lom: "http://ltsc.ieee.org/rdf/lomv1p0/lom#",
 lomvoc: "http://ltsc.ieee.org/rdf/lomv1p0/vocabulary#",
 owl: "http://www.w3.org/2002/07/owl#",
 oelrt: "http://organic-edunet.eu/LOM/rdf/voc#LearningResourceType-",
 voc: "http://example.com/scam/voc/",
 oeowl: "http://www.semanticweb.org/ontologies/2008/8/Ontology1222276003796.owl#"
  }});
//			console.log(jdil.tests.graphsrc["info"]);
            jdil.tests.graph = new jdil.EditableGraph(jdil.tests.graphsrc, jdil.tests.namespaces);

            jdil.tests.resource_root = jdil.tests.graph.getRoot();
			jdil.tests.resource1 = jdil.tests.graph.get(jdil.tests.res1);
            jdil.tests.resource2 = jdil.tests.graph.get(jdil.tests.res2);
            jdil.tests.resource3 = jdil.tests.graph.get(jdil.tests.res3);

};

doh.registerGroup("jdil.tests.Graph",
        [
                function rootResource(t){
                console.debug(jdil.tests.resources_root);
                  t.t(jdil.tests.resource_root);
                //	t.t(jdil.tests.resource1);
                //	t.t(jdil.tests.resource1 === jdil.tests.resource_root);
               	//	t.t(jdil.tests.resource1["@id"] == jdil.tests.res1);
                },
                function subResources(t){
                //	t.t(jdil.tests.resource2);
                //	t.t(jdil.tests.resource2["@id"] == jdil.tests.res2);
                },
                function starredSubResources(t) {
                //	t.t(jdil.tests.resource3);
                //	t.t(jdil.tests.resource3["@id"] == jdil.tests.res3);
                },
                function directPropertyToResource(t) {
                //	t.t(jdil.tests.graph.getFirstObject("dcterms:subject") === jdil.tests.resource2);
                //	t.t(jdil.tests.graph.getFirstObject("foaf:friend") === jdil.tests.resource3);
                },
                function repeatedProperties(t) {
			    //    var enemies = jdil.tests.graph.getObject("foaf:enemy");
			    //    t.t(enemies[0] === jdil.tests.resource2 && enemies[1] === jdil.tests.resource3);
                },
                function directPropertyToData(t){
				//	t.t(jdil.tests.graph.getFirstObjectValue("dcterms:title") == "Folder 1");
				//	t.t(jdil.tests.graph.getCanonicalFirstObject("dcterms:title")["@value"] == "Folder 1");
				/*	t.t(jdil.tests.graph.getCanonicalObject("dcterms:title")["@value"] == "A title");
					t.t(jdil.tests.graph.getFirstObjectValue("dcterms:description") == "A description");
					t.t(jdil.tests.graph.getFirstObject("dcterms:description")["@language"] == "en");
					t.t(jdil.tests.graph.getCanonicalFirstObject("dcterms:description")["@language"] == "en");
					t.t(jdil.tests.graph.getCanonicalFirstObject("dcterms:description")["@language"] == "en"); */
                }
        ],
        jdil.tests.setup,
        function(){ // tearDown
        }
);
/*
doh.register("jdil.tests.EditableGraph",
        [{name: "remove singe statement",
			setUp: jdil.tests.setup,
			runTest: function(){
				//Works to remove statement once.
                doh.t(jdil.tests.graph.remove(jdil.tests.res1, "dcterms:subject", jdil.tests.resource2));
               	doh.f(jdil.tests.graph.remove(jdil.tests.res1, "dcterms:subject", jdil.tests.resource2));
				//resource is not available via that property anymore
               	doh.t(jdil.tests.graph.getFirstObject("dcterms:subject") !== jdil.tests.resource2);
				//Resource is still available since it is referred from the foaf:enemy property.
               	doh.t(jdil.tests.graph.get(jdil.tests.res2));
               	var enemies = jdil.tests.graph.getObject("foaf:enemy");
			    doh.t(enemies[0] === jdil.tests.resource2 && enemies[1] === jdil.tests.resource3);
			}
		},{name: "remove single statement when property is repeated",
			setUp: jdil.tests.setup,
			runTest: function(){
				doh.t(jdil.tests.graph.remove(jdil.tests.res1, "foaf:enemy", jdil.tests.resource2));
                doh.f(jdil.tests.graph.remove(jdil.tests.res1, "dcterms:enemy", jdil.tests.resource2));
				doh.t(jdil.tests.graph.getFirstObject("dcterms:subject") === jdil.tests.resource2);
			    doh.t(jdil.tests.graph.getObject("foaf:enemy") === jdil.tests.resource3);
			}
		},{name: "remove a resource",
			setUp: jdil.tests.setup,
			runTest: function(){
				doh.t(jdil.tests.graph.removeResource(jdil.tests.resource2));
				doh.t(jdil.tests.graph.getFirstObject("dcterms:subject") !== jdil.tests.resource2);				
				doh.f(jdil.tests.graph.get(jdil.tests.res2));
			}
		},{name: "remove a resource recursively",
			setUp: jdil.tests.setup,
			runTest: function(){
				doh.t(jdil.tests.graph.removeResource(jdil.tests.resource1, true));
				doh.f(jdil.tests.graph.get(jdil.tests.res1));
			}
		}]
); */