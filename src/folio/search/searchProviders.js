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
            "description": "hepp hopp",
            "detailsClass": "folio/search/providers/Kulturnav",
            "resultsClass": "folio/search/ResultView",
            "logo": "providers/kulturnav.png"
        }
    ];
});
