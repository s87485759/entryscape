define([], function() {
    return [{
            "id" : "local",
            "name": "EntryScape",
            "description": "Local search in EntryScape",
            "detailsClass": "folio/search/LocalSearch",
            "resultsClass": "folio/list/SearchList",
            "logo": "providers/entryscape.png"
        },
        {
            "id": "soch",
            "name": "SOCH",
            "description": "Remote search via the Swedish Open Cultural Heritage (SOCH) service",
            "detailsClass": "folio/search/providers/SOCH",
            "resultsClass": "folio/search/ResultView",
            "logo": "providers/soch.png"
        },
        {
            "id": "kulturnav",
            "name": "Kulturnav",
            "description": "KulturNav is a Nordic Terminology Server for Museums and Cultural Heritage Organizations.",
            "detailsClass": "folio/search/providers/Kulturnav",
            "resultsClass": "folio/search/ResultView",
            "logo": "providers/kulturnav.png"
        },
        {
            "id": "norvegiana",
            "name": "Norvegiana",
            "description": "Norvegiana er en datamodell, en database (datalager) og en webservice med formål å gjøre kulturarvsinformasjon lettere tilgjengelig.",
            "detailsClass": "folio/search/providers/Norvegiana",
            "resultsClass": "folio/search/ResultView"
        },
        {
            "id": "dbpedia",
            "name": "DBPedia",
            "description": "Querying Wikipedia like a Database.",
            "detailsClass": "folio/search/providers/DBPedia",
            "resultsClass": "folio/search/ResultView"
        }
    ];
});
