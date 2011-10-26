/*global dojo, conxilla*/
dojo.provide("conxilla.model.tests.data");
dojo.require("conxilla.terms");

conxilla.model.tests.map1Uri = "http://example.org/about";
conxilla.model.tests.map1 = {
    "_:layer1" : {
        "http://conzilla.org/terms/layout#layerIn" 		: [ { "value" : conxilla.model.tests.map1Uri, "type" : "uri" } ]
    },
 
    "_:layout1" : {
        "http://conzilla.org/terms/layout#layoutIn"		: [ { "value" : "_:layer1", "type" : "bnode" } ],
		"http://conzilla.org/terms/layout#path"			: [ { "value" : "[{t: 'M', x: 200, y:120}, {t: 'L', x: 300, y: 120}, {t: 'L', x: 300, y:320}, {t: 'L', x: 400, y: 320}]", "type" : "literal"} ],
		"http://conzilla.org/terms/layout#box"			: [ { "value" : "{width: 150, height: 40, x: 320, y: 200}", "type" : "literal"} ],
		"http://conzilla.org/terms/layout#type"			: [ { "value" : "kindof", "type" : "literal"} ]
    },
    "_:layout2" : {
        "http://conzilla.org/terms/layout#layoutIn"		: [ { "value" : "_:layer1", "type" : "bnode" } ],
		"http://conzilla.org/terms/layout#type"			: [ { "value" : "activity", "type" : "literal"} ],
		"http://conzilla.org/terms/layout#box"			: [ { "value" : "{width: 100, height: 40, x: 100, y: 100}", "type" : "literal"} ]
    },
    "_:layout3" : {
        "http://conzilla.org/terms/layout#layoutIn"		: [ { "value" : "_:layer1", "type" : "bnode" } ],
		"http://conzilla.org/terms/layout#type"			: [ { "value" : "process", "type" : "literal"} ],
		"http://conzilla.org/terms/layout#box"			: [ { "value" : "{width: 150, height: 40, x: 400, y: 300}", "type" : "literal"} ]
    }
};
