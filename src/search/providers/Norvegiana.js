/*global define, __confolio*/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "folio/util/Widget",
    "folio/search/ResultsList",
    "rdfjson/Graph",
    "rdfjson/converters"
], function (declare, lang, array, Widget, ResultsList, Graph, converters) {

    var List = declare(ResultsList, {

        constructSearchUrl: function(offset, limit) {
            return "http://kulturnett2.delving.org/organizations/kulturnett/api/search?format=json&query="+this.params.term;
        },

        _extractValue: function(fields, key) {
            var arr = fields[key];
            if (arr && arr.length > 0) {
                return arr[0];
            }
        },
        _NS: {
            "musip": "http://www.musip.nl/",
            "tib": "http://www.thuisinbrabant.nl/namespace",
            "itin": "http://www.thuisinbrabant.nl/namespace",
            "drup": "http://www.itin.nl/drupal",
            "abc": "http://www.ab-c.nl/",
            "dc": "http://purl.org/dc/elements/1.1/",
            "delving": "http://www.delving.eu/schemas/",
            "ese": "http://www.europeana.eu/schemas/ese/",
            "abm": "http://schemas.delving.eu/abm/",
            "raw": "http://delving.eu/namespaces/raw",
            "europeana": "http://www.europeana.eu/schemas/ese/",
            "dcterms": "http://purl.org/dc/terms/",
            "icn": "http://www.icn.nl/",
            "aff": "http://schemas.delving.eu/aff/"
        },

        parseResults: function(data, offset) {
            var result = array.forEach(data.result.items, lang.hitch(this, function(row, index) {
                var fields = row.item.fields;
                var id = fields.delving_hubId[0];
                var resourceUri = "http://kulturnett2.delving.org/organizations/kulturnett/api/search?id="+id;
                var extMdUri = resourceUri;

                var graph = new Graph();
                for (var key in fields) if (fields.hasOwnProperty(key)) {
                    var values = fields[key];
                    var arr = key.split("_");
                    var ns = this._NS[arr[0]] || "";
                    var prop = ns + arr[1];
                    for (var i=0;i<values.length;i++) {
                        var value = values[i];
                        if (/^https+:\/\//.test(value)) {
                            graph.create(resourceUri, prop, value);
                        } else {
                            graph.create(resourceUri, prop, {value: value, type: "literal"});
                        }
                    }
                }
                var childE = this.createResultEntry(resourceUri, extMdUri, graph, offset+index);
                childE.setRepresentationType(folio.data.RepresentationType.NAMED_RESOURCE);

                //Fix some temporary local metadata
                var locMd = childE.getLocalMetadata();
                locMd.create(resourceUri, folio.data.DCTermsSchema.TITLE, {type: "literal", value: this._extractValue(fields, "dc_title") || ""});
                locMd.create(resourceUri, folio.data.DCTermsSchema.DESCRIPTION, {type: "literal", value: this._extractValue(fields, "dc_description") || ""});
                locMd.create(resourceUri, folio.data.RDFSSchema.SEEALSO, {type: "literal", value: this._extractValue(fields, "europeana_isShownAt") || ""});
                var thumb =   this._extractValue(fields, "delving_thumbnail");
                var fullimage = this._extractValue(fields, "europeana_isShownBy");
                if (thumb || fullimage) {
                    var nstmt = locMd.create(resourceUri, "http://schema.org/image");
                    if (thumb) {
                        locMd.create(nstmt.getValue(), "http://schema.org/thumbnail", thumb);
                    }
                    if (fullimage) {
                        locMd.create(nstmt.getValue(), "http://schema.org/contentUrl", fullimage);
                    }
                }
            }));
            return data.result.items.length;
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