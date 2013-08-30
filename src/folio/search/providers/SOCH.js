/*global define, __confolio*/
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/connect",
    "dojo/_base/array",
    "dojo/query",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dojo/store/Memory",
    "folio/util/Widget",
    "folio/search/ResultsList",
    "dojox/xml/parser",
    "rdfjson/converters",
    "dijit/form/FilteringSelect",
    "dojox/form/RangeSlider",
    "dijit/form/VerticalRuleLabels",
    "dijit/form/VerticalRule",
    "dijit/form/RadioButton", //For template
    "dojox/form/BusyButton",  //For template
    "dojo/text!./SOCHTemplate.html"
], function (declare, lang, connect, array, query, domClass, style, construct, attr, Memory, Widget, ResultsList, xml, converters,
             FilteringSelect, VerticalRangeSlider, VerticalRuleLabels, VerticalRule, RadioButton, BusyButton, template) {



    var SOCHList = declare(ResultsList, {
        kns: "http://kulturarvsdata.se/ksamsok#",
        sns: "http://schema.org/",

        constructSearchUrl: function(offset, limit) {
            var url = "http://kulturarvsdata.se/ksamsok/api?x-api=metasol43856&method=search&hitsPerPage=20";
            if (offset != null) {
                url += "&startRecord="+offset;
            }
            url += "&query=";
            var terms = [];
            if (this.params.term) {
                terms.push("item%3D\""+this.params.term+"\"");
            }
            if (this.params.toTime) {
                terms.push("create_toTime>%3D"+this.params.toTime);
            }
            if (this.params.fromTime) {
                terms.push("create_fromTime<%3D"+this.params.fromTime);
            }
            if (this.params.itemType) {
                terms.push("itemType=\""+this.params.itemType+"\"");
            }

            return url + terms.join("+and+");
        },

        parseResults: function(data, offset) {
            var dom = xml.parse(data);
            var counter = 0;
            var result = query("RDF", dom).forEach(lang.hitch(this, function(node, index) {
                var extMdGraph = converters.rdfxml2graph(node);
                var extMdUri = xml.innerXML(query("representation[format=\"RDF\"]", node)[0].childNodes[0])
                var resourceUri = extMdGraph.find(null, this.kns+ "ksamsokVersion")[0].getSubject();
                var childE = this.createResultEntry(resourceUri, extMdUri, extMdGraph, offset+index);
                childE.setRepresentationType(folio.data.RepresentationType.NAMED_RESOURCE);

                //Fix some temporary local metadata
                var locMd = childE.getLocalMetadata();

                locMd.create(resourceUri, folio.data.DCTermsSchema.TITLE, {type: "literal", value: extMdGraph.findFirstValue(resourceUri, this.kns+"itemLabel") || "No label found"});
                locMd.create(resourceUri, folio.data.DCTermsSchema.DESCRIPTION, {type: "literal", value: "a description"});
                var sa = extMdGraph.findFirstValue(resourceUri, this.kns+"url");
                if (sa) {
                    locMd.create(resourceUri, folio.data.RDFSSchema.SEEALSO, sa);
                }
                array.forEach(extMdGraph.find(resourceUri, this.kns+"image"), function(ostmt) {
                    var thumb = extMdGraph.findFirstValue(ostmt.getValue(), this.kns+"thumbnailSource");
                    var url = extMdGraph.findFirstValue(ostmt.getValue(), this.kns+"highresSource") || extMdGraph.findFirstValue(ostmt.getValue(), this.kns+"lowresSource");

                    if (thumb || url) {
                        var nstmt = locMd.create(resourceUri, this.sns+"image");
                        if (thumb) {
                            locMd.create(nstmt.getValue(), this.sns+"thumbnail", thumb);
                        }
                        if (url) {
                            locMd.create(nstmt.getValue(), this.sns+"contentUrl", url);
                        }
                    }
                }, this);

                counter++;
            }));
            return counter;
        }
    });


    return declare(Widget, {
        templateString: template,
        nls: [],
        ITNS: "http://kulturarvsdata.se/resurser/EntityType#",
        itemTypeMap: {
            "Bearbetning/interaktiv resurs": "interactiveResource",
            "Bok": "book",
            "Byggnad": "building",
            "Dokument": "document",
            "Film/video": "video",
            "Foto": "photo",
            "Grupp": "group",
            "Historisk händelse": "event",
            "Karta": "map",
            "Koncept": "concept",
            "Konstverk": "art",
            "Kulturlämning": "monument",
            "Kulturmiljö": "culturallandscape",
            "Ljud": "sound",
            "Miljö": "site",
            "Objekt/föremål": "object",
            "Organisation": "organization",
            "Person": "person",
            "Ritning": "blueprint",
            "Samling": "collection",
            "Teckning": "drawing",
            "Utställning": "display"
        },
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
                search: dojo.hitch(this, this._search)
            };
        },
        //===================================================
        // Private methods
        //===================================================
        postCreate: function() {
            this.inherited("postCreate", arguments);
            var data = [{id: "alla", name: "alla"}];
            for (var key in this.itemTypeMap) if (this.itemTypeMap.hasOwnProperty(key)) {
                data.push({id: key, name: key});
            }
            var store = new Memory({data: data});
            this._itemTypeFS = new FilteringSelect({store: store, value: "alla", style:{width: "100px"}}, construct.create("div", null, this._itemTypesSelect));
        },
        userChange: function() {
            if (this.user) {
            } else {
            }
        },
        _sliderChanged: function() {
            var range = this._slider.get("value");
            this._fromTime.set("value", range[0] == 2000 ? "-" : range[0]);
            this._toTime.set("value", range[1] == 0 ? "-" : range[1]);
        },

        _getSortOrder: function() {
            var sort = this.sortChangerDijit.get("value");
            var ascending = this.ascendingDijit.get("value");
            if (sort !== "title") {
                return sort+"+"+(ascending ? "asc" : "desc");
            } else { //Hack since asc and desc does not work with title.
                return sort;
            }
        },

        _search: function(parameters) {
            var base = this.application.getRepository();
            var fromTime = this._fromTime.get("value"), toTime = this._toTime.get("value"), itemType = this._itemTypeFS.get("value");
            if (fromTime != "-") {
                parameters.fromTime = parseInt(fromTime);
            }
            if (toTime != "-") {
                parameters.toTime = parseInt(toTime);
            }
            if (itemType != "alla") {
                parameters.itemType = itemType
            }

            var tmpContext = this.application.getStore().getContext(base+"_tmp");
            var entry = tmpContext.createLocal(folio.data.BuiltinTypeSchema.RESULT_LIST);
            entry.list = new SOCHList(entry, parameters);
            parameters.onSuccess(entry);
        }
    });
});