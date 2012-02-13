__confolio = {};
__confolio.initConfig = function() {
	//__confolio.DEBUG = window.location.search.match("(\\?|\\&)debug=true($|\\&)") !== null;
	__confolio.config = {};		
	__confolio.addQuery = function(){
		var pairs = window.location.search.substring(1).split("&"), pair;
		if (pairs.length == 1 && pairs[0] === "") {return}
		for (var i = 0; i < pairs.length; i++) {
			pair = pairs[i].split("=");
			__confolio.config[pair[0]] = pair[1];
		}
	};
	__confolio.addQuery();
	__confolio.configNotLoaded = true;
	__confolio.addConfig = function(conf){
	__confolio.configNotLoaded = false;
		for (var key in conf) {
			__confolio.config[key] = conf[key];
		}
		__confolio.addQuery(); // let config from URL query override config file
		document.title = __confolio.config["title"];
		var appModuleName = __confolio.config["appModuleName"] != null ? "-"+__confolio.config["appModuleName"] : "";
		var cssPath = __confolio.isBuild() ? "target"+appModuleName: "src";
		var linktg = document.createElement('link');
		linktg.type = 'text/css';
		linktg.rel = 'stylesheet';
		linktg.href = "../"+cssPath+"/folio/apps/clean.css";
		document.getElementsByTagName('head')[0].appendChild(linktg);
		
		linktg = document.createElement('link');
		linktg.type = 'text/css';
		linktg.rel = 'stylesheet';
		linktg.href = "themes/" + (__confolio.config["theme"] || "blueish") + "/style.css";
		document.getElementsByTagName('head')[0].appendChild(linktg);
	};
	//Load external config if explicitly given as parameter or if not inline.  
	if (__confolio.config["config"] !== undefined || __confolio.inlineConfig === undefined) {
		var config = __confolio.config["config"] ? (__confolio.config["config"] + ".js") : "config.js";
		document.write('<script src="', config, '" type="text/javascript"><\/script>');
	} else {
		__confolio.addConfig(__confolio.inlineConfig);
	}
};

__confolio.isDebug = function() {
	return ""+__confolio.config["debug"] == "true";
};
__confolio.isBuild = function() {
	return ""+__confolio.config["build"] == "true";
};

__confolio.initDojo = function(){
	if (__confolio.configNotLoaded) {
		__confolio.failedLoadingConfig();
		return;
	}

	djConfig = {
		isDebug: __confolio.isDebug(),
		debugAtAllCosts: false, //__confolio.isDebug(),
		parseOnLoad: false,
		usePlainJson: true,
		extraLocale: ["ROOT"]
	};
	
	var libs = ["dojo/dojo.js"]; 
	if (__confolio.isDebug() && !__confolio.isBuild()) {
		// Including the compressed DataGrid explicitly; uncompressed is not working with debug
//		libs.push("dojox/grid/DataGrid.js");
	}	
	if (__confolio.isBuild()) {
		libs.push("folio/folio.js");
	}
	var appModuleName = __confolio.config["appModuleName"] != null ? "-"+__confolio.config["appModuleName"] : "";
	var jsPath = __confolio.isBuild() ? "../target"+appModuleName+"/" : "../lib/dojo/";
	var debugExt = __confolio.isDebug() ? ".uncompressed.js" : "";

	for (var i = 0;i<libs.length;i++) {
		document.write('<script src="', jsPath + libs[i] + debugExt, '" type="text/javascript"><\/script>');		
	}
	
	//"dojo/back.js" - Never with the debugExtension (.uncompressed.js)
	//document.write('<script src="', jsPath + "dojo/back.js", '" type="text/javascript"><\/script>');	
};

__confolio.addJSLibs = function(libs) {
	for (var i =0;i<libs.length;i++) {
		document.write('<script src="'+libs[i]+'" type="text/javascript"><\/script>');			
	}
};

__confolio.initializeLoadIndicator = function(nodeId){
	if (__confolio.configNotLoaded) {
		return;
	}

	var nr = 0;
	var step = 0;
	var loadedIndicator = dojo.byId(nodeId);
	dojo.connect(dojo, "provide", function(str){
		dojo.attr(loadedIndicator, "innerHTML", "&nbsp;Loading:&nbsp;&nbsp;" + str);
		nr++;
		if (nr > 41) {
			nr = 0;
			step++;
			dojo.style(loadedIndicator, "width", "" + step * 10 + "%");
		}
	});
};

__confolio.start = function(loadIndicatorId, splashId){
	if (__confolio.configNotLoaded) {
		var splash = document.getElementById(splashId);
		splash.style.display = "none";
		return;
	}
	if (!__confolio.isBuild()) {
		dojo.registerModulePath("folio", "../../../src/folio");
		dojo.registerModulePath("jdil", "../../../src/jdil");
		dojo.registerModulePath("rdfjson", "../../../src/rdfjson");
		dojo.registerModulePath("rforms", "../../../src/rforms");
		dojo.registerModulePath("se", "../../../src/se");
	}
	var appModulePath = __confolio.config["appModulePath"];
	var appModuleName = __confolio.config["appModuleName"];
	if(appModuleName && appModulePath){
		dojo.registerModulePath(appModuleName, appModulePath);
	}
	if (__confolio.config.viewMap == null) {
		var startContext = __confolio.config["startContext"] || "1";
		__confolio.config.viewMap = {
			manager: "se.uu.ull.site.FullscreenViewStack",
			controller: "folio.navigation.NavigationBar",
			startView: "default",
			views: [{"name": "default", "class": "folio.apps.TFolio", "constructorParams": {"startContext": startContext}}],
			hierarchies: [{ "scope": "main",
							"view": "default"
						  }
						 ]
		};
	}
	
	dojo.require("dojo.parser");
	dojo.require("folio.Application");
	//Make sure all classes in viewMap is loaded.
	dojo.require(__confolio.config.viewMap.manager);
	__confolio.config.viewMap.controller && dojo.require(__confolio.config.viewMap.controller);
/*	dojo.forEach(__confolio.config.viewMap.views, function(viewDef) {
		dojo.require(viewDef["class"]);
	});*/
	
	dojo.require("folio.security.LoginDialog");
	dojo.require("dijit.Dialog");
	dojo.require("dojo.cookie");
	dojo.addOnLoad(function(){
		var scamPath = __confolio.config["scamPath"] || "scam";
		dojo.cookie("scamSimpleLogin", null, {
			path: "/"+scamPath+"/",
			expires: -1
		}); // Reset login
		var loadedIndicator = dojo.byId(loadIndicatorId);
		dojo.attr(loadedIndicator, "innerHTML", "&nbsp;Building application");
		dojo.parser.parse();
		dojo.fadeOut({
			node: splashId,
			onEnd: function(){
				// hide it completely after fadeout
				dojo.style(splashId, "display", "none");
			}
		}).play();
		
		//asynhronous loading of definitions. Use getDefinitions with a callback.
		var deferred = new dojo.Deferred();
		var definitionsPath = (__confolio.config["definitionsPath"] || "definitions") + ".js";
		dojo.xhrGet({
			url: definitionsPath,
			handleAs: "json-comment-optional",
			headers: {"Accept": "application/json",
						"Content-type": "application/json; charset=UTF-8"},
			load: function(data) {
				__confolio.config["definitions"] = data;
				deferred.callback(data);
			},
			error: function() {
				alert("Error in configuration, cannot load the definitions from "+ definitionsPath);
			}
		});
		__confolio.config.getDefinitions = function(callback) {
			deferred.addCallbacks(callback);
		};
		
		
		__confolio.application = new folio.Application({
			dataDir: "../data/",
			repository: window.location.protocol + "//" + window.location.host + "/" + scamPath + "/"
		});
		
		__confolio.application.getConfig(function() {
			__confolio.viewMap = se.uu.ull.site.init(__confolio.config.viewMap, dojo.create("div", null, dojo.body()));			
		});
		
/*		var eval("var appCls = " + appClsStr + ";");
		var application = new appCls({
			dataDir: "../data/",
			repository: window.location.protocol + "//" + window.location.host + "/" + scamPath + "/",
			startContext: startContext
		});*/
		var username = __confolio.config["username"] || "";
		var password = __confolio.config["password"] || "";
		var cookieValue = dojo.cookie("scamSimpleLogin");
		if (cookieValue != null ||__confolio.config["showLogin"] === "true") {
			new folio.security.LoginDialog({
				application: __confolio.application,
				userName: username,
				password: password
			}).show();
		}
//		application.placeAt(dojo.body(), 0);
//		application.startup();
		if (!__confolio.isDebug() && __confolio.config["unloadDialog"] === "true") {
			__confolio.addOnUnloadDialog();
		}
	});
};

__confolio.ignoreUnloadDialog = function() {
	__confolio._ignoreUnloadDialog = (new Date()).getTime();
};
__confolio.addOnUnloadDialog = function() {
	if (__confolio.configNotLoaded) {
		return;
	}

	var unloadMsg = "";
	var bu = function (e, f) {
		if (__confolio._ignoreUnloadDialog != null && ((new Date()).getTime() - __confolio._ignoreUnloadDialog) < 300) {
			delete __confolio._ignoreUnloadDialog;
			return;
		}
    	var e = e || window.event;

	    // For IE and Firefox prior to version 4
    	if (e) {
        	e.returnValue = unloadMsg;
    	}

	    // For Safari
    	return unloadMsg;
	};
	
	if (window.body) {
		window.body.onbeforeunload = bu; // IE
	} else {
		window.onbeforeunload = bu; // FX 
	}
};

/**
 * Used to redirect old html-files that we have used. For example Default.html
 * the parameter stringToRemove tells the method where to cut of the path-part of the URL
 */
__confolio.relocate = function(/*String*/ stringToRemove, /*String*/ config) {
	var urlProtocol = window.location.protocol+"//";
	var urlHost = window.location.host;
	var pathName = window.location.pathname;
	//Do stuff with pathname...
	var urlHash = window.location.hash;
	if(pathName.lastIndexOf("-debug.html")>0){
		var isDebug = true;
	}
	if (pathName && pathName.length > 0) {
		if (stringToRemove && stringToRemove.length > 0) {
			pathName = pathName.substring(0, pathName.lastIndexOf(stringToRemove));
		}
		else {
			pathName = pathName.substring(0, pathName.lastIndexOf("/") + 1);
		}
		pathName += isDebug ? "?debug=true":"";
	}
	window.location.replace(urlProtocol+urlHost+pathName+(config ? "?config="+config : "")+urlHash);
};

__confolio.failedLoadingConfig = function() {
	document.write("<div style='font-size: x-large;margin: 2em;'><h1>No configuration file choosen.</h1><p>By default Confolio loads the apps/config.js configuration file. "+
	"The recommendation is to copy one of the provided configuration files, for example /apps/config-tfolio.js, and modify it to suit your needs.</p>"+
	"<p>You can also experiment (or just easily switch between different configurations) by appending ?config=name to the index.html, see <a href='index.html?config=config-tfolio'>here how this would look like</a>. "+
	"Note that 'name' is the name of a configuration file in the apps catalogue without the .js extention.</p>"+
	"<p>See <a href='../README.html'>../README.html</a> for more information on how to deploy Confolio.</p></div>");
};
