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
    var ResultsList = declare([folio.data.AbstractList], {
        kns: "http://kulturarvsdata.se/ksamsok#",

        constructor: function(entry, params) {
            this.params = params;
        },

        /**
         * @abstract
         * @param offset
         * @param limit
         * @return {String} in the form of a URL.
         */
        constructSearchUrl: function(offset, limit) {
        },

        /**
         * This method is supposed to do all the heavy lifting, parsing and creating temporary entries with the metadata
         * found in the search results retrieved from the URL from constructSearchUrl.
         *
         * @abstract
         * @param {Number} offset, if we are loading a later page in a paginated response offset will be > 0.
         * @param {String} data is the string where the results are contained.
         * @return {Number} of entries that where created from the results.
         */
        parseResults: function(data, offset) {
        },

        /**
         * If the entrys external metadata is not available directly in the search result and the externalMetadataUrl
         * yields metadata in a non-standard format which requires a transformation step this method will do that
         * transformation. Implement this method to indicate that a transform is necessary and it will be done.
         * The method will be available on entries and executed in the scope of this class.
         *
         * @abstract
         * @param {folio.data.Entry} entry is the entry for which the external metadata will be set.
         * @param {String} extMetaData contains the external metadata in some format.
         * @return {rdfjson.Graph} make sure you return a Graph with the external metadata
         */
        transformExternalMetadata: function(entry, extMetaData) {
        },

        /**
         * @param resourceURI
         * @param extMdUri
         * @param extMDGraph
         * @param index
         * @returns {folio.data.Entry}
         */
        createResultEntry: function(resourceURI, extMdUri, extMDGraph, index) {
            var resultEntry = this.entry.getContext().createLinkReference(resourceURI, extMdUri, folio.data.BuiltinTypeSchema.NONE);
            resultEntry.readAccessToMetadata = true;
            resultEntry.readAccessToResource = true;
            resultEntry.externalMetadata = extMDGraph;
            //If the method has been overridden.
            if (extMDGraph == null && ResultsList.prototype.transformExteneralMetadata != this.transformExternalMetadata) {
                resultEntry._transformExtMd = lang.hitch(this, this.transformExternalMetadata);
            }
            this.childrenE[index] = resultEntry;
            return resultEntry;
        },

        loadChildren: function(limit, offset, onChildren, onError) {
            if (this._detectMissing(limit, offset)) {
                __confolio.application.getCommunicator().loadViaSCAMProxy({url: this.constructSearchUrl(offset, limit), handleAs: this.handleAs || "text", onSuccess: lang.hitch(this, function(data) {
                    var nrOfEntriesCreated = this.parseResults(data, offset);
                    if (limit == -1) {
                        this.missing = false;
                    } else {
                        delete this.missing;
                    }
                    if (nrOfEntriesCreated != limit) {
                        this.size = offset+nrOfEntriesCreated;
                        this.loadedSize = this.size;
                    } else if (this.loadedSize < offset+nrOfEntriesCreated) {
                        this.loadedSize = offset+nrOfEntriesCreated;
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
    return ResultsList;
});