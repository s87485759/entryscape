/*global define, __confolio*/
define(["dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-construct",
    "dojo/on",
    "dojo/query",
    "rdfjson/Graph",
    "rdfjson/converters",
    "folio/data/List",
    "folio/data/Constants",
    "folio/util/Dialog",
    "folio/editor/RFormsPresenter",
    "dojox/xml/parser"
], function(declare, lang, construct, on, query, Graph, converters, List, Contstants, Dialog, RFormsPresenter, xml) {

    /**
     * Shows profile information, group membership, access to portfolios and folders, and latest material.
     * The profile information includes username, home portfolio and user profile metadata.
     */
    return declare([folio.data.AbstractList], {
        constructor: function(entry, params) {
            this.params = params;
            this.user = __confolio.application.getUser();
            if (this.user && this.user.homecontext) {
                this.homeContext = this.user.homecontext;
            }
        },
        constructSearchUrl: function() {
            //return "europeanatest.json";
            var types = "";
            if(this.params.types.length !== 0){
                if(this.params.types.length > 1){
                    types = (this.params.term != null ? "+AND+": "")+"(";
                    for(i in this.params.types){
                        types += "europeana_type:"+this.params.types[i];
                        if(i < this.params.types.length-1){
                            types += "+OR+";
                        }
                    }
                    types += ")";
                } else if(this.params.types.length === 1){
                    types = (this.params.term != null ? "+AND+": "")+"europeana_type:"+this.params.types[0];
                }
            }
            return "http://kulturarvsdata.se/ksamsok/api?x-api=test&method=search&hitsPerPage=50&query=item%3D\""+this.params.term+"\"";
            //return "http://api.europeana.eu/api/opensearch.rss?searchTerms="+this.params.term+types+"&wskey=BYOXSVLSSU";
        },
        loadChildren: function(limit, offset, onChildren, onError) {
            if (this._detectMissing(limit, offset)) {
                __confolio.application.getCommunicator().loadViaSCAMProxy({url: this.constructSearchUrl(), handleAs: "text", onSuccess: lang.hitch(this, function(xmlStr) {
                    var dom = xml.parse(xmlStr);
                    var result = query("RDF", dom).forEach(lang.hitch(this, function(node, index) {
                        var g = converters.rdfxml2graph(node);
                        var kns = "http://kulturarvsdata.se/ksamsok#";
                        var resourceURI = g.find(null, kns+ "ksamsokVersion")[0].getSubject();
                        var link = xml.innerXML(query("representation[format=\"RDF\"]", node)[0].childNodes[0]);
                        var childE = this.entry.getContext().createLinkReference(resourceURI, link, folio.data.BuiltinTypeSchema.NONE);
                        childE.readAccessToMetadata = true;
                        childE.readAccessToResource = true;
                        childE.externalMetadata = g;

                        //Fix some temporary local metadata
                        childE.localMetadata.create(resourceURI, folio.data.DCSchema.TITLE, {type: "literal", value: g.findFirstValue(resourceURI, kns+"itemLabel") || "No label found"});
                        childE.localMetadata.create(resourceURI, folio.data.DCSchema.DESCRIPTION, {type: "literal", value: "a description"});

                        childE._constructPreview = lang.hitch(this, function(ent, node) {
                            var prepareDialog = function(newNode, onReady) {
                                var pres = new RFormsPresenter({}, construct.create("div", null, newNode));
                                pres.show(ent, true);
                                //Make sure that someDijit is finished rendering, or at least has some realistic size before makeing the next call.
                                dijit.focus(pres.domNode);
                                onReady();
                            };
                            folio.util.connectToolKitDialog(node, prepareDialog);
                        }, childE);

                        if (this.homeContext) {
                            childE._addToFolio = lang.hitch(this, function(ent, node) {
                                on(node, "click", lang.hitch(this, function() {

                                    var context = __confolio.application.getStore().getContextById(this.homeContext);

                                    __confolio.application.getCommunicator().loadViaSCAMProxy({
                                        url: ent.getExternalMetadataUri(),
                                        from: "europeana",
                                        onSuccess: function(data) {
                                            var graph = new rdfjson.Graph(lang.clone(data));
                                            var stmts = graph.find(null, folio.data.DCSchema.TITLE, null);
                                            var resourceURI = stmts[0].getSubject();
                                            context.createEntry({
                                                    cachedExternalMetadata: data,
                                                    params: {
                                                        listURI: context.getBase()+context.getId()+"/entry/_top",
                                                        resource: encodeURIComponent(resourceURI),
                                                        "cached-external-metadata": encodeURIComponent(ent.getExternalMetadataUri()),
                                                        representationType: "informationresource",
                                                        locationType: "reference",
                                                        builtinType: "none"
                                                    }
                                                },
                                                function() {
                                                    alert("Item added to your portfolio.");
                                                },
                                                function(mesg) {
                                                    alert("Something went wrong, sorry in Beta mode here.\nTest with another item.");
                                                });
                                        }
                                    });
                                }));
                            }, childE);
                        }


                        this.childrenE[offset+index] = childE;

                    }));
                    if (limit == -1) {
                        this.missing = false;
                    } else {
                        delete this.missing;
                    }
                    if (result.length != offset+limit) {
                        this.size = offset+result.length;
                        this.loadedSize = this.size;
                    } else {
                        this.loadedSize = result.length;
                    }

                    onChildren(this._getChildrenSlice(offset, limit));
                })});
            } else {
                onChildren(this._getChildrenSlice(offset, limit));
            }
        },
        canBeSorted: function() {
            return false;
        },
        isSorted: function() {
            return false;
        }
    });
});