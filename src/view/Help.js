define([
    "dojo/_base/lang",
    "dojo/_base/declare",
    "dojo/dom-attr",
    "dojo/store/Memory",
    "dijit/layout/ContentPane", //For template
    "dijit/layout/BorderContainer", //For template
    "dijit/Tree",
    "dijit/tree/ObjectStoreModel",
    "folio/util/Widget",
    "dojo/text!./HelpTemplate.html"
], function(lang, declare, domAttr, Memory, ContentPane, BorderContainer, Tree, ObjectStoreModel, Widget, template) {
    return declare(Widget, {
        templateString: template,
        //===================================================
        // Public Attributes
        //===================================================
        initialHelpPage: "",

        //===================================================
        // Private Attributes
        //===================================================
        firstShow: true,

        //===================================================
        // Inherited methods
        //===================================================
        postCreate: function() {
            this.inherited("postCreate", arguments);

            this.application = __confolio.application;
            require(["./info/help/manifest.js"], lang.hitch(this, function(manifest) {
                this.store = new Memory({
                    data: [{id: "root", children: manifest.outline}],
                    getChildren: function(object){
                        return object.children || [];
                    },
                    get: function(id, parent) {
                        if (id === "root") {
                            return this.data[0];
                        } else if (parent) {
                            for (var i=0; i<parent.children.length;i++) {
                                var item = parent.children[i];
                                if (item.id === id) {
                                    return item;
                                } else if (item.children) {
                                    var obj = this.get(id, item);
                                    if (obj) {
                                        return obj;
                                    }
                                }
                            }
                        } else {
                            return this.get(id, this.data[0]);
                        }
                    }
                });
                this.treeModel = new ObjectStoreModel({
                    store: this.store,
                    query: {id: 'root'},
                    mayHaveChildren: function(item){
                        return "children" in item;
                    }
                });
                this.tree.set("model", this.treeModel);
            }));


            this.tree = new Tree({
                showRoot: false,
                onClick: dojo.hitch(this, function(item) {
                    //To provide history and bookmarkability
                    this.application.open("help", {"page": item.id});
                    //If no history is needed, change to the following line instead:
                    //this._show(item);
                })
            },dojo.create("div", null, this.outlineNode));
            this.tree.startup();
        },

        /**
         * Required by ViewMap to be able to set a nice breadcrumb.
         * @param {Object} params
         */
        getLabel: function(params) {
            return "Help";
        },
        show: function(params) {
            var page = params.page;
            if (this.firstShow && page == null && this.initialHelpPage != "") {
                page = this.initialHelpPage;
            }
            this.firstShow = false;

            if (page && this.store.get(page) != null) {
                this._show(this.store.get(page));
            }
        },

        //===================================================
        // Private methods
        //===================================================
        _show: function(item) {
            //Select in tree
            domAttr.set(this.helpHeaderNode, "innerHTML", item.name);
            var arr = (this.tree._itemNodeMap || this.tree._itemNodesMap)[item.id];
            if (arr && arr.length > 0) {
                this.tree.set("selectedItems", [item]);
            }

            //Open content
            this.contentDijit.set("href", "info/help/"+item.id+".html");
        }
    });
});