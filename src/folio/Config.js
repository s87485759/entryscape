/*global define, __confolio*/
define([
    "dojo/_base/declare",
    "dojo/_base/lang"
], function (declare, lang) {
    /**
     * Holds the configurations for Confolio, both loaded attributes
     * and utility functions against these attributes.
     *
     * Most of the public attributes and their default values are here listed
     * for informative purposes only as the default values are needed before
     * this class has been instantiated. Hence, this class should be kept in
     * sync with any changes made to the bootstrap.js file.
     */
    return declare(null, {
        //===================================================
        // Public Attributes
        //===================================================
        "title": "Confolio",
        "startContext": "1",
        "showLogin": "false",
        "username": "",
        "password": "",
        "unloadDialog": true,
        "scamPath": "scam",
        "definitionsPath": "definitions",
        "CLI": false,
        "app": "folio.apps.Default",

        //===================================================
        // Public API
        //===================================================
        /**
         * Fetches an absolute URL to an icon, or relative to the webapplication, e.g. the /trunk/apps directory.
         * @param keyOrEntry
         * @param resolution
         * @returns {*}
         */
        getIcon: function (keyOrEntry, resolution) {
            if (lang.isString(keyOrEntry)) {
                return this.getIconInResolution(this.definitions.specialIcons[keyOrEntry], resolution);
            } else {
                return this.getIconInResolution(this._getAttr(keyOrEntry, "icon"), resolution);
            }
        },
        getIconInResolution: function (iconStruct, resolution) {
            if (resolution != null && iconStruct[resolution]) {
                return iconStruct.base + resolution + "/" + iconStruct.filename;
            }
            return iconStruct.base + iconStruct.filename;
        },

        /**
         * Uses the definitions part of the config-example to look up a suitable
         * Metadata form template for presenting the metadata of the given entry.
         * A Metadata form template consists of an array of id/properties to use,
         * typically they should be used as a basis for constructing an rforms Template.
         * An example of a MetadataProfile:
         * [
         *        "http://purl.org/dc/terms/title",
         *        "http://purl.org/dc/terms/description"]
         * ]
         *
         * @param {Object} keyOrEntry that the MetadataProfile should be used for.
         * @param {String} forMDOrigin the origin of the metadata to detect the template for,
         * allowed values are "local", "external" or "both", if undefined "local" will be assumed.
         * @return {Array} a MetadataProfile for the given entry.
         */
        getTemplate: function (keyOrEntry, forMDOrigin) {
            return    this._getAttr(keyOrEntry, "template", forMDOrigin);
        },

        getLabelTemplate: function (entry, forMDOrigin) {
            return    this._getAttr(entry, "labelTemplate", forMDOrigin);
        },

        /**
         * Uses the definitions part of the config-example to look up the default
         * MetadataProfile for presenting the local metadata.
         *
         * @return {Object} the default MetadataProfile given in the definitions-file.
         */
        getDefaultTemplate: function () {
            return this._getDefaults("template");
        },

        getMPLanguages: function () {
            if (this.definitions.MPLanguages) {
                return this.definitions.MPLanguages;
            }
        },

        getTemplateForApplicationType: function (type) {
            return (this._ATIdx[type] || {}).template || this._getDefaults("template");
        },

        getLabelTemplateForApplicationType: function (type) {
            return (this._ATIdx[type] || {}).labelTemplate || this._getDefaults("labelTemplate");
        },

        getComments: function () {
            return this.definitions.comments;
        },

        getApplicationTypes: function() {
            var arr = [];
            for (var key in this._ATIdx) if (this._ATIdx.hasOwnProperty(key)) {
                arr.push(this._ATIdx[key]);
            }
            return arr;
        },

        //===================================================
        // Inherited methods
        //===================================================
        constructor: function (params) {
            lang.mixin(this, params);
            this._index();
        },

        //===================================================
        // Private methods
        //===================================================

        /**
         * Fetches an attribute for an entry according to the following priority:
         * 1) Potential definitions for a specific service
         * 2) Potential definitions for any application specific types.
         * 3) Potential definitions for the graph type, e.g. Context, List, Graph etc.
         * 4) Potential definitions for the entry type, e.g. link, reference etc.
         * 5) The default definitions.
         *
         * @param entry
         * @param attr
         * @param {String} atFrom wherefrom the application types should be detected, allowed values are "local", "external" and "both".
         * @returns {*}
         * @private
         */
        _getAttr: function (entry, attr, atFrom) {
            return    this._getFromServices(entry, attr) ||
                this._getFromAT(entry, attr, atFrom) ||
                this._getFromGT(entry, attr) ||
                this._getFromET(entry, attr) ||
                this._getDefaults(attr);
        },

        /**
         * TODO
         */
        _getFromServices: function (services2values, entry) {
        },

        /**
         * Fetches an attribute on the GraphType of the entry (former BuiltinType), that is,
         * if there is anything in the definitions for this GraphType.
         *
         * @param entry
         * @param attr
         * @returns {*}
         * @private
         */
        _getFromGT: function (entry, attr) {
            var gt = entry.getBuiltinType();
            var key = folio.data.getKey(folio.data.BuiltinType, gt);
            var obj = this._GTIdx[key];
            if (obj != null && obj.hasOwnProperty(attr)) {
                return obj[attr];
            }

        },

        /**
         * Fetches an attribute based on the EntryType of the Entry (former LocationType), that is,
         * if there is anything in the definitions for this EntryType.
         * @param entry
         * @param {String} attr
         * @returns {*}
         * @private
         */
        _getFromET: function (entry, attr) {
            var lt = entry.getLocationType();
            var key = folio.data.getKey(folio.data.LocationType, lt);
            var obj = this._ETIdx[key];
            if (obj != null && obj.hasOwnProperty(attr)) {
                return obj[attr];
            }
        },

        /**
         * Fetches the attribute based on the mimetype for the entry.
         * First it tries to match the entire mimetype, then it splits away after the ';' character, then after the '+' character and lastly after the '/' character.
         *
         * @param entry
         * @param attr the attribute we are looking for
         * @returns {*}
         * @private
         */
        _getFromMT: function (entry, attr) {
            var valid = function (value) {
                return value != null && value[attr] != null
            }
            var mt = entry.getMimeType();
            var val = this._MTIdx[mt];
            if (valid(val)) {
                return val[attr];
            }
            if (mt.indexOf(";") > 0) {
                mt = mt.substring(0, mt.indexOf(";"));
                var val = this._MTIdx[mt];
                if (valid(val)) {
                    return val[attr];
                }
            }
            if (mt.indexOf("+") > 0) {
                mt = mt.substring(0, mt.indexOf("+"));
                var val = this._MTIdx[mt];
                if (valid(val)) {
                    return val[attr];
                }
            }
            if (mt.indexOf("/") > 0) {
                mt = mt.substring(0, mt.indexOf("/"));
                var val = this._MTIdx[mt];
                if (valid(val)) {
                    return val[attr];
                }
            }
        },

        /**
         * Fetches the attribute based on the application type provided in the definitions that matches the entry.
         * If the entry has more than one application types that the attribute from the application type with
         * the highest priority is choosen.
         *
         * @param entry
         * @param prop the attribute to fetch, typically template, labelTemplate, namedResource, and icon.
         * @param {String} atFrom wherefrom the application types should be detected, allowed values are "local", "external" and "both".
         * @returns {*} the value for the given attr.
         * @private
         */
        _getFromAT: function (entry, attr, atFrom) {
            var statements = [];

            if (atFrom === "local" || atFrom === "both" || atFrom == null) {
                var md = entry.getLocalMetadata();
                if (md != null) {
                    statements = md.find(entry.getResourceUri(), folio.data.RDFSchema.TYPE);
                }
            }

            if (atFrom === "external" || atFrom === "both") {
                var emd = entry.getExternalMetadata();
                if (emd != null) {
                    statements = statements.concat(emd.find(entry.getResourceUri(), folio.data.RDFSchema.TYPE));
                }
            }
            var priority = -Infinity, value;
            for (var i = 0; i < statements.length; i++) {
                var uri = statements[i].getValue();

                var obj = this._ATIdx[uri];
                if (obj != null && obj.hasOwnProperty(attr)) {
                    if (value == null
                        || priority < (obj.priority || -Infinity)) {
                        value = obj[attr];
                        priority = obj.priority || -Infinity;
                    }
                }
            }
            return value;
        },
        _getDefaults: function (attr) {
            return this._defaults[attr];
        },

        _index: function () {
            var i, j, obj, result = {};
            var arr = this.definitions.applictionTypeSets || [];
            for (i = 0; i < arr.length; i++) {
                var set = arr[i].types;
                for (j = 0; j < set.length; j++) {
                    obj = set[j];
                    obj.uri = this._expand(obj.uri);
                    this._fillBlanks(obj, arr[i].typeSetCommon);
                    result[obj.uri] = obj;
                }
            }
            this._ATIdx = result;
            this._MTIdx = this.definitions.mediaTypes || {};
            this._ETIdx = this.definitions.entryTypes || {};
            this._GTIdx = this.definitions.graphTypes || {};
            this._defaults = this.definitions.defaults || {};
        },
        _fillBlanks: function (fillIn, fillFrom) {
            if (fillFrom != null) {
                for (key in fillFrom) {
                    if (fillFrom.hasOwnProperty(key) && !fillIn.hasOwnProperty(key)) {
                        fillIn[key] = fillFrom[key];
                    }
                }
            }
        },
        _expand: function (nsuri) {
            var arr = nsuri.split(":");
            if (arr.length === 2 && this.definitions.namespaces[arr[0]] != null) {
                return this.definitions.namespaces[arr[0]] + arr[1];
            }
            return nsuri;
        }
    });
});
