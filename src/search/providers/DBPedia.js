/*global define, __confolio*/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "folio/util/Widget",
    "folio/search/ResultsList",
    "rdfjson/converters"
], function (declare, lang, array, Widget, ResultsList, converters) {

    var List = declare(ResultsList, {
        kns: "http://kulturarvsdata.se/ksamsok#",
        sns: "http://schema.org/",
        extMdAccept: "application/rdf+xml",
        extMdHandle: "text",

        constructSearchUrl: function(offset, limit) {
            return "http://lookup.dbpedia.org/api/search/KeywordSearch?QueryClass=&QueryString="+this.params.term;
        },

        parseResults: function(data, offset) {
            var result = array.forEach(data.results, lang.hitch(this, function(row, index) {
                var resourceUri = row.uri;
                var extMdUri = row.uri.replace("http://dbpedia.org/resource", "http://dbpedia.org/data");
                var childE = this.createResultEntry(resourceUri, extMdUri, null, offset+index);

                //Fix some temporary local metadata
                var locMd = childE.getLocalMetadata();
                locMd.create(resourceUri, folio.data.DCTermsSchema.TITLE, {type: "literal", value: row.label});
                locMd.create(resourceUri, folio.data.DCTermsSchema.TITLE, {type: "literal", value: row.description});
            }));
            return data.length;
        },
        transformExternalMetadata: function(entry, extMetaData) {
            return converters.rdfxml2graph(extMetaData);
        }
    });


    return declare(Widget, {
        getSearchDetails: function() {
            return {
                search: function(parameters) {
                    new List(parameters);
                }
            };
        }
    });
});