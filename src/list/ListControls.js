/*global define, __confolio*/
define(["dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/connect",
    "dojo/topic",
    "dojo/query",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/form/FilteringSelect",
    "dojo/store/Memory",
    "dojo/text!./ListControlsTemplate.html"
], function(declare, lang, connect, topic, query, domClass, style, construct, attr,
            _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, FilteringSelect, Memory, template) {

return declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
    templateString: template,
	bigSep: "&nbsp;&nbsp;&nbsp;",
	smallSep: "&nbsp;",
	previous: "<",
	next: ">",
	start: "<<",
	end: ">>",
	maybeMore: "&hellip;",
    order: "title",

    postCreate: function() {
        this.inherited("postCreate", arguments);
        connect.subscribe("/confolio/localeChange", lang.hitch(this, this.localize));
        this.application = __confolio.application;
        this.localize();
    },
    localize: function() {
        dojo.requireLocalization("folio", "list");
        this.resourceBundle = dojo.i18n.getLocalization("folio", "list");
        attr.set(this.sortLabelNode, "innerHTML", this.resourceBundle.sortLabel);
        this.orderChanger.set("store", new Memory({
            data: [{id:"none", label: this.resourceBundle.sortByNone},
                {id:"title", label: this.resourceBundle.sortByTitle},
                {id:"titleD", label: this.resourceBundle.sortByTitleReverse},
                {id:"modified", label: this.resourceBundle.sortByModified},
                {id:"modifiedD", label: this.resourceBundle.sortByModifiedReverse}]
        }));
        this.orderChanger.set("value", this.order);
    },

    setListViewer: function(listGUI) {
      this.listGUI = listGUI;
    },
	update: function(list, atPage) {
        attr.set(this.itemCountNode, "innerHTML", "");
        var nr = folio.data.getChildCount(this.listGUI.list);
        var childCount = this.resourceBundle.items+":&nbsp;"+(nr != undefined ? nr : "?");
        dojo.create("span", {"class": "sortCls", style: {"verticalAlign": "middle", "margin-right": "1em"}, "innerHTML": childCount}, this.itemCountNode);

        this.atPage = atPage;
		if (this.list !== list) {
			this.list = list;
			if (list.isPaginated()) {
				style.set(this.pagination, "display", "");
				this.generatePageNumbers();
				this.updateLook();
			} else {
				style.set(this.pagination, "display", "none");
			}
		} else {
			this.updateLook();
		}
	},
	generatePageNumbers: function() {
		var startC = this.atPage-3 < 1 ? 1 : this.atPage-3;
		var endC = startC+8 < this.list.getNumberOfPages() ? startC+8 : this.list.getNumberOfPages();
		var numbers = startC == 1 ? "" : "&hellip;&nbsp;"; 
		numbers +="<span>"+startC+"</span>";
		for(var i=startC+1;i<=endC;i++) {
			numbers += "&nbsp;<span>"+i+"</span>";
		}
		this.pagPagesNode.innerHTML = numbers;
	},
	updateLook : function() {
		domClass.toggle(this.domNode, "atStart", this.atPage == 0);
		domClass.toggle(this.domNode, "unknownSize", this.list.getSize() == undefined);
		domClass.toggle(this.domNode, "atEnd", this.list.getSize() != undefined && this.atPage == this.list.getNumberOfPages()-1);
		query("span", this.pagPagesNode).forEach(lang.hitch(this, function(node, i) {
			domClass.toggle(node, "selectedPage", parseInt(node.innerHTML)-1 == this.atPage);
		}));
	},
	pagStart: function(e) {
		e.stopPropagation();
		if (this.atPage == 0) {
			return;
		}
		this.list = null;
		this.listGUI.showPage(0);
	},
	pagPrev: function(e) {
		e.stopPropagation();
		if (this.atPage == 0) {
			return;
		}
		this.list = null;
		this.listGUI.showPage(this.atPage-1);
	},
	pagPages: function(e) {
		e.stopPropagation();
		if (domClass.contains(e.target.parentNode, "pagPages") && e.target.tagName == "SPAN") {
			this.list = null;
			this.listGUI.showPage(parseInt(e.target.innerHTML)-1);
		}
	},
	pagNext: function(e) {
		e.stopPropagation();
		if (this.list == null || (this.list.getSize() != undefined && this.atPage == this.list.getNumberOfPages()-1)) {
			return;
		}
		this.list = null;
		this.listGUI.showPage(this.atPage+1);
	},
	pagEnd: function(e) {
		e.stopPropagation();
		if (this.list == null || (this.list.getSize() == undefined || this.atPage+1 == this.list.getNumberOfPages())) {
			return;
		}
		var i = this.list.getNumberOfPages()-1;
		this.list = null;
		this.listGUI.showPage(i);
	},
    _orderChange: function() {
        if (this.order == this.orderChanger.get("value")) {
            return;
        }
        this.order = this.orderChanger.get("value");
        switch(this.order) {
            case "title":
                this.application.getCommunicator().setSort({sortBy: "title", prio: "List"});
                break;
            case "modified":
                this.application.getCommunicator().setSort({sortBy: "modified", prio: "List"});
                break;
            case "titleD":
                this.application.getCommunicator().setSort({sortBy: "title", prio: "List", descending: true});
                break;
            case "modifiedD":
                this.application.getCommunicator().setSort({sortBy: "modified", prio: "List", descending: true});
                break;
            case "none":
                this.application.getCommunicator().setSort({});
        }
        topic.publish("/confolio/orderChange", [{}]);
    }
});
});