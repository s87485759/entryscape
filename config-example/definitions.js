define({
    "+namespaces": {
        "skos": "http://www.w3.org/2004/02/skos/core#"
    },

    "+applictionTypeSets": [
        {
            "typeSetCommon": {
                "template": ["entryscape:dcterms-medium"],
                "labeltemplate": "dcterms:title",
                "artifact": false,
                "link": true,
                "file": true,
                "advanced": false
            },
            "types": [
                {
                    "uri": "skos:Concept",
                    "label": {"en": "Concept"},
                    "icon": {"base": "resources/icons/own/", "filename": "concept.png", "16x16": true, "24x24": true, "32x32": true},
                    "template": ["skos:Concept"],
                    "labelTemplate": "skos:prefLabel",
                    "artifact": true,
                    "file": false,
                    "link": false,
                    "advanced": true
                },
                {
                    "uri": "skos:ConceptScheme",
                    "label": {"en": "Concept collection"},
                    "icon": {"base": "resources/icons/freeware/", "filename": "dictionary.png", "16x16": true},
                    "template": ["skos:ConceptScheme"],
                    "artifact": true,
                    "file": false,
                    "link": false,
                    "advanced": true
                }
            ]
        }
    ],

    "+templateSources": [
        "resources/rforms/SOCH.json",
        "resources/rforms/SKOS.json",
        "resources/rforms/kulturnav.json"
    ]
})