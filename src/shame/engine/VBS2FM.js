/**
 * @author matthias
 */
dojo.provide("shame.engine.VBS2FM");

shame.engine.VBS2FM.convert = function(vbs, template) {
	var root = template.getRootNode();
	return {r: root.getId(), 
			d: vbs.value,
			c: shame.engine.VBS2FM.getChildren(vbs, root)};
}
shame.engine.VBS2FM.getChildren = function(vbc, tnode) {
	var tchildren = tnode.getChildren();
	var result = [];
	for (var i=0; i<tchildren.length;i++) {
		var tchild = tchildren[i];
		var variable = tchild.getVariable();
		if (!variable) {
			result.push({r: tchild.getId(), c: shame.engine.VBS2FM.getChildren(vbc, tchild)});
		} else {
			var vbChildren = shame.engine.VBS2FM.getVBForVariable(vbc, variable);
			for (var j=0; j<vbChildren.length;j++) {
				var vb = vbChildren[j];
				var childResult = {r: tchild.getId(), d: vb.value};
				if (tchild.getType() == "group" && vb.children) {
					childResult.c = shame.engine.VBS2FM.getChildren(vb, tchild);
					result.push(childResult);
				}else if(tchild.getType()=="choice"){
					var vStore = tchild.getVocabularyStore();
					var fcn = function (items, request) {
						for (var i=0; i<items.length;i++) {
							var item = items[i];
							if (vb.value.v == vStore.getValue(item, "d")){
								result.push(childResult);
							}
						}
						if(result.length < 1){
							childResult.onlyForPresentation = true;
							result.push(childResult);
						}
					}
					vStore.fetch({onComplete: fcn});
				}else{
				   result.push(childResult);
				}
			}
		}
	}
	return result;
}
shame.engine.VBS2FM.getVBForVariable = function(vbc, variable) {
	var results = [];
	if (vbc.variable == variable.id) {
		results.push(vbc);
	} else if(vbc.children) {
		for (var i=0;i<vbc.children.length;i++) {
			if (vbc.children[i].variable == variable.id) {
				results.push(vbc.children[i]);
			}
		}
	}
	if (results.length == 0 && vbc.children) {
		for (var i=0;i<vbc.children.length;i++) {
			if (vbc.children[i].children != undefined) {
				results = shame.engine.VBS2FM.getVBForVariable(vbc.children[i].children, variable);
				if (results.length != 0) {
					return results;
				}
			}
		}
	}
	return results;
}