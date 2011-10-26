/**
 * @author matthias
 */
dojo._hasResource["shame.FormTemplate"] = true;
dojo.provide("shame.FormTemplate");
dojo.require("dojo.parser");
dojo.require("dojo.data.ItemFileWriteStore");


shame.FormTemplateStoreSingleton = null;
dojo.declare("shame.FormTemplateStore", null, {
	constructor: function(server) {
		this.id2ft = {};
	},
	localeChanged: function() {
		for (var id in this.id2ft) {
			this.id2ft[id].clearAllVocabularyStores();
		}
	},
	fetch: function(ftId, callback) {
		if (this.id2ft[ftId]) {
			callback(this.id2ft[ftId]);
		} else {
		
			var self = this;
			dojo.xhrGet( {
        			url: ftId,
					handleAs: "json-comment-optional",
//        			handleAs: "json",
        			load: function(responseObject, ioArgs) {
//						console.debug("FormTemplate struct found");
						var template = new shame.FormTemplate(responseObject);
			        	self.id2ft[ftId] = template;
//						console.debug("FormTemplate constructed");
		    	    	callback(template);
          				return responseObject;
 			    	}});
		}
	},
	
	fetchRemote: function(ftURL, callback){
		if (this.id2ft[ftURL]) {
			callback(this.id2ft[ftURL]);
		} else {
			shame.FormTemplateFactoryFromURL(ftURL, dojo.hitch(this, function(template) {
				this.id2ft[ftURL] = template;
				callback(template);
			}));
		}
	}
});

/*The function holds two variables, hiddenvariable makes it possible to make exclusive method for 
 * this JSONP-solution/hack. The array keeps all the templates that has been created during this session.
 * That way the maximum numbers of calls will be the number of FormTemplates possible to use, which should
 * not be so many :-)
 */
shame.FormTemplateFactoryFromURL = function(){
	var hiddenvariabel = 0;
	var url2ft = {};
	return function(url, callback){
		if(url && url2ft[url]){
		    callback(url2ft[url]);
		} else {
			hiddenvariabel += 1;
			var headChild = dojo.doc.getElementsByTagName("head")[0];
			var element = dojo.doc.createElement("script" );
	        element.type = "text/javascript" ;
			var nfkn = dojo.hitch(this, function(obj) {
				var template = new shame.FormTemplate(obj);
		        url2ft[url]= template;
	            callback(template);
				//Explorer crashes after some time if you remove several script elements.
				if (!dojo.isIE) {
			        headChild.removeChild(element);					
				}
		        return template;
			});
			eval('annotationProfile_'+hiddenvariabel+'_=nfkn');
			element.src = url+'?jsonpref='+hiddenvariabel;
	        headChild.appendChild(element);			
		}
	};
}();

dojo.declare("shame.VocabularyStore", dojo.data.ItemFileWriteStore, {
	fetch: function() {
		//Wrong order because of bad behaviour of FilteringSelect
		arguments[0].sort = [{attribute: "n", descending: false}];
		this.inherited("fetch", arguments);
	},
	getValues: function(item, attribute){
		var valueArray = this.inherited("getValues", arguments);
		if(valueArray){
			valueArray.sort(function(a,b){
				//This assumes that there is always an "n" to be found (which is correct)
				return a["n"] > b["n"];
			});
			return valueArray;
		}
		return []; 
	}
});

dojo.declare("shame.FormTemplate", null, {
	constructor: function(struct) {
		this.struct = struct;
		this.id2Child = {};
		this.id2Variable = {};
		this.id2Vocabulary = {};
		this.root = new shame.TemplateNode(this.struct.ft, this);
		this.gp = struct.gp;
//		console.debug("FormTemplate now inited");
	},
	append: function(node) {
		this.id2Child["id"+node.getId()] = node;
	},
	getRootNode: function() {
		return this.getNode(this.struct.ft.i);
	},
	getNode: function(id) {
		return this.id2Child["id"+id];
	},
	getGraphPattern: function() {
		return this.gp;
	},
	getVariable: function(vref) {
		if (this.id2Variable[vref]) {
			return this.id2Variable[vref];
		}
		if (this.struct.vars[vref]) {
			var variable = new shame.Variable(vref, this.struct.vars[vref]);
			this.id2Variable[vref] = variable;
			return variable;		
		}
		return null;
	},
	getVocabulary: function(vocRef) {
		if (this.lang != dojo.locale) {
			this.clearAllVocabularyStores();
		}
		if (!this.vocCache[vocRef]) {
			if (this.struct.vocs[vocRef]) {
				//var voc = dojo.clone(this.struct.vocs[vocRef]);
				var voc = this.struct.vocs[vocRef];
				for (var item=0; item<voc.length; item++) {
					var hash = voc[item].d.lastIndexOf("#");
					var slash = voc[item].d.lastIndexOf("/");
					voc[item].n = shame.base.getString(voc[item], ["l-"+dojo.locale, "l-en"], hash > slash ? voc[item].d.substring(hash+1) : voc[item].d.substring(slash+1));
				}
				this.vocCache[vocRef] = voc;
			} else {
				return;
			}
		}
		return this.vocCache[vocRef];
	},
	clearAllVocabularyStores: function() {
		this.lang = dojo.locale;
		this.vocCache = {};
		this.id2Vocabulary = {};
	},
	getVocabularyStore: function(vocRef) {
		if (this.lang != dojo.locale) {
			this.clearAllVocabularyStores();
		}
		if (!this.id2Vocabulary[vocRef]) {
			var voc = dojo.clone(this.getVocabulary(vocRef));
			if (voc !== null) {
				var storestruct = {identifier: "d", label: "n", items: voc};
				var vocabulary = new shame.VocabularyStore({data: storestruct});
				this.id2Vocabulary[vocRef] = vocabulary;
			} else {
				return;
			}
		}
		return this.id2Vocabulary[vocRef];
	},
	getSizeOfVocabulary: function(vocRef) {
		if (this.struct.vocs[vocRef]) {
			return this.struct.vocs[vocRef].length;
		}
		return 0;
	}
});

dojo.declare("shame.Variable", null, {
	constructor: function(id, struct) {
		this.id = id;
		this.struct = struct;
	},
	isLiteral: function() {
		return this.struct.nt.charAt(1) == 'L';
	},
	isResource: function() {
		return this.struct.nt.charAt(1) == 'R';
	},
	isBlank: function () {
		return this.struct.nt == "BR";
	},
	isURI: function () {
		return this.struct.nt == "UR";
	},
	isDatatype: function () {
		return this.struct.nt == "DL";
	},
	getDatatype: function () {
		return this.struct.dt;
	},
	requiresLanguage: function () {
		return this.struct.nt == "LL";
	},
	forbiddsLanguage: function() {
		var nt = this.struct.nt;
		return !this.isLiteral() || nt == "OL" || nt == "DL";
	}
});

dojo.declare("shame.TemplateNode", null, {
	constructor: function(struct, template) {
		this.struct = struct;
//		console.debug("TemplateNode of type "+struct.t+" with id: "+struct.i);
		this.template = template;
		this.template.append(this);
		this.children = [];
		if (typeof struct.c != "undefined") {
			for (var i in struct.c) {
				var childNode;
				child = struct.c[i];
				this.children.push(new shame.TemplateNode(child, template));
			}
		}
	},
	getChildren: function() {
		return this.children;
	},
	getType: function() {
		return this.struct.t;
	},
	isGroup: function() {
		return this.struct.t=="group";
	},
	isChoice: function() {
		return this.struct.t == "choice";
	},
	isText: function() {
		return this.struct.t == "text";
	},
	getStyles: function() {
		if (this.struct.s) {
			return this.struct.s;
		}
		return [];
	},
	hasStyle: function(style) {
		return dojo.indexOf(this.getStyles(), style) != -1;
	},
	getVariableRef: function() {
		return this.struct.v;
	},
	getVariable: function() {
		if (this.struct.v) {
			return this.template.getVariable(this.struct.v);
		}
		return null;
	},
	getId: function() {
		return this.struct.i;
	},
	getTemplate: function() {
		return this.template;
	},
	hasVocabulary: function() {
		return this.struct.voc && this.getTemplate().getVocabulary(this.struct.voc) !== null;
	},
	getVocabulary: function() {
		return this.getTemplate().getVocabulary(this.struct.voc);
	},
	getVocabularyStore: function() {
		return this.getTemplate().getVocabularyStore(this.struct.voc);
	},
	getSizeOfVocabulary: function() {
		return this.getTemplate().getSizeOfVocabulary(this.struct.voc);
	},
	hasLabel: function() {
		return this.struct.l != "undefined";
	},
	hasDescription: function() {
		return this.struct.d != "undefined";		
	},
	getLabel: function(langs) {
		if (this.struct.l) {
			return shame.base.getString(this.struct.l, langs);
		}
		return null;
	},
	getDescription: function(langs) {
		if (this.struct.d) {
			return shame.base.getString(this.struct.d, langs);
		}
		return null;
	},
	getMinOccurence: function() {
		if (typeof this.struct.min != "undefined") {
			return parseInt(this.struct.min, 10);
		}
		return 0;
	},
	getMaxOccurence: function() {
		if (typeof this.struct.max != "undefined") {
			return parseInt(this.struct.max, 10);
		}
		return null;
	},
	isMaxOccurenceBounded: function() {
		return typeof this.struct.max != "undefined";
	},
	getPreferredOccurence: function() {
		if (typeof this.struct.pref != "undefined") {
			return parseInt(this.struct.pref, 10);
		}
		if (this.struct.type == "group") {
			return 0;
		}
		return 1;
	}
});