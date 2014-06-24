/*global define*/
define(["dojo/_base/declare", 
	"dojo/_base/lang", 
	"dojo/on",
	"dojo/aspect", 
	"dojo/dom-class", 
	"dojo/dom-construct",
	"dijit/focus",
	"rdforms/view/Chooser",
	"dijit/form/TextBox",
	"folio/list/SearchList",
	"rdforms/model/system"],
function(declare, lang, on, aspect, domClass, construct, focusUtil, Chooser, TextBox, SearchList, system) {


var EntryChooser = declare(Chooser, {
	//===================================================
	// Inherited methods
	//===================================================
	postCreate: function() {
		this.inherited("postCreate", arguments);
		var search = new TextBox({trim: true, lowercase: true}, construct.create("div", null, this.selectionNode));
		domClass.add(search.domNode, "searchField");
		focusUtil.focus(search.focusNode);
		var results = new SearchList({}, construct.create("div", null, this.selectionNode));
		aspect.after(results._list, "focusedEntry", lang.hitch(this, function(entry) {
			this._selectChoice({value: entry.getUri(), label: {en: folio.data.getLabel(entry)}, description: {en: folio.data.getDescription(entry)}});
		}));
		var t;
		var doSearch = lang.hitch(this, function() {
			var v = search.get("value");
			if (v != null && v.length > 2) {
				var constraints = this.binding.getItem().getConstraints();
				if (constraints != null && constraints[folio.data.RDFSchema.TYPE] != null) {
					v = "literal:" + encodeURIComponent(v.replace(/:/g,"\\:")) + "+AND+rdfType:" + (encodeURIComponent(constraints[folio.data.RDFSchema.TYPE].replace(/:/g,"\\:")));
				}
				results.show({term: v, queryType: "solr"});
			}
		});
		on(search, "keyUp", lang.hitch(this, function() {
			if (t != null) {
				clearTimeout(t);
			}
			t = setTimeout(doSearch, 300);
		}));
		
		//this.bc.startup();
	}
});

system.getChoice = function(item, value) {
	var obj = {"value": value};
	var store = __confolio.application.getStore();
	var context = store.getContextFor(value);
	var entry = context.getEntryFromEntryURI(value);
	if (entry != null) {
		obj.label = {en: folio.data.getLabel(entry)};
		obj.description = {en: folio.data.getDescription(entry)};
	} else {
		obj.label = {"en": "Loading...", "sv": "Laddar..."};
		obj.load =	function(onSuccess, onFailure) {
						store.loadEntry(value, {}, function(e) {
							delete obj.load;
							obj.label = {en: folio.data.getLabel(e)};
							obj.description = {en: folio.data.getDescription(e)};
							onSuccess(obj);
						}, onFailure);
			};
	}
	return obj;
};

system.openChoiceSelector = function(binding, callback) {
	var ec = new EntryChooser({binding: binding, done: callback});
	ec.startup();
	ec.show();
};
	return EntryChooser;
});