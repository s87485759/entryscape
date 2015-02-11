/*global define, __confolio*/
define(["dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array"
], function (declare, lang, array) {

    /**
     * TODO Works poorly, wait until new data API is in place.
     * FDO stands for File and Directory Operations, inspiration comes from the POSIX standard.
     */
    return declare(null, {

        //===================================================
        // Public Attributes
        //===================================================
        /** Array of entries, e.g. [_contexts/entry/1, 1/entry/_top, 1/entry/folder1, 1/entry/folder2]
         Note that the the corresponding dropdown list is from entries [_contexts/entry/_all, 1/entry/_systemEntries, 1/entry/_top, 1/entry/folder1]
         */
        stack: [],
        current: null,
        code: {"SUCCESS": 1,
            "FAILURE": -1},

        //===================================================
        // Public API
        //===================================================
        /** Supports going down into subdirectories, one level up via '..' ,
         * and up to the root when not giving any argument.
         * @param {String} directory, only undefined, '..' or a subdirectory in the form of the entryId is accepted.
         * @param {Function} callback, the callback that will be called after success or failure.
         */
        cd: function (directory, callback) {
            if (directory === undefined) {
                this.cdEntryUri(this.stack[0].getUri(), callback);
            } else {
                var entryUri = this._resolveEntry(directory);
                if (entryUri !== undefined) {
                    this.cdEntryUri(entryUri, callback);
                } else {
                    callback(this.code.FAILURE);
                }
            }
        },
        /**
         * Same as #cd but with the Uri of the entry as parameter.
         * Should be implemented in subclasses.
         * @param {Object} entryUri
         */
        cdEntryUri: function (entryUri, callback) {
        },
        /**
         * @param {Object} callback, called with an array of childentries of the current working directory,
         * if something goes wrong it will be called with no arguments.
         */
        ls: function (callback) {
            if (this.current) {
                folio.data.getAllChildren(this.current, callback, function () {
                    callback();
                });
            } else {
                callback();
            }
        },
        /**
         * @return the currect working directory as an entry.
         */
        wd: function () {
            return this.current;
        },
        /**
         * gets an entry from a string, which may be on the form:
         * <ul><li>entryid - corresponds to the entry with that id in the context we are in now.</li>
         * <li>contextid.entryid - identifies an entry via contextid and entryid.</li>
         * <li>uri - a full entryUri</li>
         * <li>.. - the parent folder</li></ul>
         * @param {String} entryStr identifying an entry.
         * @param {Function} callback function called with the entry as only parameter,
         * called without parameter if no entry can be found for the entryStr.
         */
        getEntry: function (entryStr, callback) {
            var entryUri = this._resolveEntry(entryStr);
            if (entryUri !== undefined) {
                this.application.getStore().loadEntry(entryUri, {limit: 0, sort: null}, callback, function () {
                    callback();
                });
            } else {
                callback();
            }
        },

        //===================================================
        // Private methods
        //===================================================
        _resolveEntry: function (entryStr) {
            if (entryStr === "..") {
                var cind = array.indexOf(this.stack, this.current);
                if (cind > 0) {
                    return this.stack[cind - 1].getUri();
                }
            } else {
                var dotSplit = entryStr.split(".");
                if (dotSplit.length == 1) {
                    if (this._acceptableEntryId(dotSplit[0])) {
                        return this._getEntryUri(this.current.getContext().getId(), dotSplit[0]);
                    } else if (this._acceptableEntryUri(dotSplit[0])) {
                        return dotSplit[0];
                    }
                } else if (dotSplit.length == 2
                    && this._acceptableEntryId(dotSplit[0])
                    && this._acceptableEntryId(dotSplit[1])) {
                    return this._getEntryUri(dotSplit[0], dotSplit[1]);
                } else if (this._acceptableEntryUri(entryStr)) {
                    return entryStr;
                }
            }
        },
        _getEntryUri: function (contextId, entryId) {
            return folio.data.normalizeEntryInfo({base: this.current.getContext().getBase(), contextId: contextId, entryId: entryId}).entryUri;
        },
        _acceptableEntryId: function (id) {
            return (lang.isString(id) && id.charAt(0) === '_')
                || !isNaN(parseInt(id));
        },
        _acceptableEntryUri: function (uri) {
            return uri.indexOf(this.current.getContext().getBase()) == 0;
        }
    });
});