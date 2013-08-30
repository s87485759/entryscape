/*global define, __confolio*/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "folio/util/Widget",
    "folio/search/ResultsList",
    "rdfjson/converters"
], function (declare, lang, array, Widget, ResultsList, converters) {



    var KNList = declare(ResultsList, {
        kns: "http://kulturarvsdata.se/ksamsok#",
        sns: "http://schema.org/",
        handleAs: "json",

        constructSearchUrl: function(offset, limit) {
            var url = "http://kulturnav.org/api/search/";
            if (this.params.term) {
                url += this.params.term+"/";
            }
            url += ""+offset+"/"+limit;
            return url;
        },

        parseResults: function(data, offset) {
            var result = array.forEach(data, lang.hitch(this, function(row, index) {
                var resourceUri = "http://kulturnav.org/"+row.uuid;  //TODO still resource in path.
                var extMdUri = resourceUri+"?format=application/rdf%2Bxml"; //accept header not carried through proxy currently.
                var childE = this.createResultEntry(resourceUri, extMdUri, null, offset+index);
                childE._transformExtMd = function(str) {
                    return converters.rdfxml2graph(str);
                };
                childE._handleExtMdAs = "text";

                //Fix some temporary local metadata
                var locMd = childE.getLocalMetadata();

                label = row.caption ? row.caption.no || row.caption.sv || row.caption.dk || row.caption.fi : "No label found";
                locMd.create(resourceUri, folio.data.DCSchema.TITLE, {type: "literal", value: label});
            }));
            return data.length;
        }
    });


    return declare(Widget, {
        templateString: "<div></div>",
        nls: [],
        //===================================================
        // Public Hooks
        //===================================================
        onChange: function() {
        },

        //===================================================
        // Public API
        //===================================================
        getSearchDetails: function() {
            return {
                search: lang.hitch(this, function(parameters) {
                    var base = this.application.getRepository();
                    var tmpContext = this.application.getStore().getContext(base+"_tmp");
                    var entry = tmpContext.createLocal(folio.data.BuiltinTypeSchema.RESULT_LIST);
                    entry.list = new KNList(entry, parameters);
                    parameters.onSuccess(entry);
                })
            };
        }
    });
});