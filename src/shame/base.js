/**
 * @author matthias
 */
dojo._hasResource["shame.base"] = true;
dojo.provide("shame.base");
dojo.require("dojo.parser");
dojo.require("dijit.form.ComboBox");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dijit.form.FilteringSelect");


shame.base.URIRegExp = "((http|https|ftp):\/\/)?((.*?):(.*?)@)?([a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])((\.[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])*)(:([0-9]{1,5}))?((\/.*?)(\\?(.*?))?(\#(.*))?)?";

shame.base.langdata = {
	identifier: "code",
	items: [
		{code: "", "l-en": ""},
		{code: "l-en", "l-en": "English", "l-sv": "Engelska", "l-de": "English", "l-fr": "Anglais", "l-es": "Inglés", "l-it": "Inglese", "l-gr": "Αγγλικά"},
		{code: "l-sv", "l-en": "Swedish", "l-sv": "Svenska", "l-de": "Swedish", "l-fr": "Suédois", "l-es": "Sueco", "l-it": "Svedese", "l-gr": "Σουηδικά"},
		{code: "l-de", "l-en": "German", "l-sv": "Tyska", "l-de": "Deutch", "l-fr": "Allemand", "l-es": "Alemán", "l-it": "Tedesco", "l-gr": "ερμανικά"},
		{code: "l-es", "l-en": "Spanish", "l-sv": "Spanska", "l-de": "Spanich", "l-fr": "Espagnol", "l-es": "Español", "l-it": "Spagnolo", "l-gr": "Ισπανικά"},
		{code: "l-el", "l-en": "Greek", "l-sv": "Grekiska"},
		{code: "l-ru", "l-en": "Russian"},
		{code: "l-no", "l-en": "Norwegian"},
		{code: "l-hu", "l-en": "Hungarian"},
		{code: "l-ro", "l-en": "Romanian"},
		{code: "l-et", "l-en": "Estonian"},
		{code: "l-pt", "l-en": "Portuguese"},
		{code: "l-fr", "l-en": "French"},
		{code: "l-da", "l-en": "Danish"},
		{code: "l-nl", "l-en": "Dutch"},
		{code: "l-fi", "l-en": "Finnish"},
		{code: "l-it", "l-en": "Italian"},
		{code: "l-pl", "l-en": "Polish"},
		{code: "l-cs", "l-en": "Czech"},
		{code: "l-sk", "l-en": "Slovak"},
		{code: "l-bg", "l-en": "Bulgarian"},
		{code: "l-tr", "l-en": "Turkish"},
		{code: "l-hi", "l-en": "Hindi"},
		{code: "l-zh", "l-en": "Chinese"},
		{code: "l-sl", "l-en": "Slovenian"}			
	]
};

/*
{code: "l-it", "l-en": "Italian", "l-sv": "Italienska", "l-de": "Italienisch", "l-fr": "Italien", "l-es": "Italiano", "l-it": "Italiano", "l-gr": "Ιταλικά"},
{code: "l-fr", "l-en": "French", "l-sv": "Franska", "l-de": "Französisch", "l-fr": "Français", "l-es": "Francés", "l-it": "Francese", "l-gr": "αλλικά"},
{code: "l-ca", "l-en": "Catalan"},
{code: "l-eo", "l-en": "Esperanto"}
*/

dojo.declare("shame.OrderedLanguageStore", dojo.data.ItemFileReadStore, {
	fetch: function() {
		//Wrong order because of bad behaviour of FilteringSelect
		arguments[0].sort = [{attribute: "l-en", descending: false}];
		this.inherited("fetch", arguments);
	}
});

shame.base.langStore = new shame.OrderedLanguageStore({data: shame.base.langdata});

//Could not make the alphabetical sorting without making a class that extended the ItemFileReadStore
//Guess there is a better way to do it?
//shame.base.langStore = new dojo.data.ItemFileReadStore({data: shame.base.langdata, sort: [{attribute: "l-en"}]});

shame.base.appendLanguageInput = function(container, lang, formNode, variable) {
	var select = document.createElement("select");
	select.className = "shameLangCell";
	container.appendChild(select);
	var selel = new dijit.form.FilteringSelect({disabled: formNode.isDisabled(), store: shame.base.langStore, autoComplete: true, searchAttr: "l-en"}, select);
	if (formNode.hasLanguage()) {
		selel.attr("value", formNode.getLanguage());
	} else {
		selel.attr("value", "");
	}
	selel.onChange = function (newvalue) {
		formNode.setLanguage(newvalue);
	};
}

shame.base.appendSingleLanguageInput = function(container, formNode, variable) {
	var span = document.createElement("span");
	span.className = "shameLangCell";
	container.appendChild(span);
	shame.base.langStore.fetchItemByIdentity({identity: formNode.getLanguage(), onItem: function(item) {
		if (item) { //Since fetchItemByIdentity calls onItem with null when not found (i.e. languages not in the list above).
			span.innerHTML=shame.base.langStore.getValue(item, "l-en");
		}
		}});
}



shame.base.appendLanguageInput2 = function(container, lang, formNode, variable) {
	var select = document.createElement("select");
	container.appendChild(select);
	var presetLang = formNode.hasLanguage() ? formNode.getLanguage() : null;
	if (!variable.requiresLanguage()) {
		var option = document.createElement("option");
		select.appendChild(option);
		option.value = "";
		option.appendChild(document.createTextNode(""));		
	}
	for (i in shame.base.languages) {
		var option = document.createElement("option");
		select.appendChild(option);
		option.value = shame.base.languages[i];
		var langMap = shame.base.languagesMap[lang];
		if (!langMap) {
			langMap = shame.base.languagesMap.en;
		}
		var inner = langMap[shame.base.languages[i]];
		if (!inner) {
			inner = shame.base.languages[i];
		}
		option.appendChild(document.createTextNode(inner));
		if (presetLang == shame.base.languages[i]) {
			option.selected = true;
		}
	}
	dojo.connect(select, "onchange", function(event) {
		formNode.setLanguage(event.target.value);
	});
}

shame.base.isParent = function(nodeChild, nodeParent) {
	var cp = nodeChild;
	while (cp != null) {
		if (cp == nodeParent) {
			return true;
		}
	}
	return false;
}

shame.base.getChildFromEvent = function(event, children) {
	var nodeElement = event.target;
	for (i in children) {
		if (shame.base.isParent(children[i], nodeElement)) {
			return i;
		}
	}
}

//Not used currently.
shame.base.getStringFromItem = function(store, item, languages, defaultStr) {
	var l;
	for (var i=0;	 i<languages.length; i++) {
		var value = store.getValue(item, langString[languages[i]]);
		if (value != undefined) {
			return value;
		}
	}
	
	var value = store.getValue(item, "l-en");
	if (value != undefined) {
		return value;
	}

	var value = store.getValue(item, "l");
	if (value != undefined) {
		return value;
	}
	
	var attrs = store.getAttributes(item);
	for (var i=0; i<attrs.length; i++) {
		if (attrs[i].indexOf("l-") == 0) {
			return store.getValue(item, attrs[i]);
		}
	}
	
	if (defaultStr == undefined) {
		return "";
	}
	return defaultStr;
}
shame.base.getString = function(langString, languages, defaultStr) {
	var l;
	for (var i=0; i<languages.length; i++) {
		if (langString[languages[i]] != undefined) {
			return langString[languages[i]];
		}
	}
	
	if (langString["l-en"]) {
		return langString["l-en"];
	}

	if (langString["l"]) {
		return langString["l"];
	}
	
	for (first in langString) {
		if (first.indexOf("l-") == 0) {
			return langString[first];			
		}
	}
	
	if (defaultStr == undefined) {
		return "";
	}
	return defaultStr;
}

shame.base.getValue = function(struct) {
	if (dojo.isString(struct.d)) {
		return struct.d;
	} else if (struct.d.v === undefined) {
		return "";
	} else {
		return struct.d.v;			
	}
};

shame.base.hasLanguage = function(struct) {
	return struct.d.l != undefined;
}

shame.base.wrapLength = 15;

String.prototype.wordWrap = function(m, b, c){
    var i, j, l, s, r;
    if(m < 1)
        return this;
    for(i = -1, l = (r = this.split("\n")).length; ++i < l; r[i] += s)
        for(s = r[i], r[i] = ""; s.length > m; r[i] += s.slice(0, j) + ((s = s.slice(j)).length ? b : ""))
            j = c == 2 || (j = s.slice(0, m + 1).match(/\S*(\s)?$/))[1] ? m : j.input.length - j[0].length
            || c == 1 && m || j.input.length + (j = s.slice(m).match(/^\S*/)).input.length;
    return r.join("\n");
};
