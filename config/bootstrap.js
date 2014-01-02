__confolio = {};
__confolio.initConfig = function() {
	__confolio.config = {};
	var addQuery = function(){
		var pairs = window.location.search.substring(1).split("&"), pair;
		if (pairs.length == 1 && pairs[0] === "") {return}
		for (var i = 0; i < pairs.length; i++) {
			pair = pairs[i].split("=");
			__confolio.config[pair[0]] = pair[1];
		}
	};
	addQuery();
	__confolio.configNotLoaded = true;
	__confolio.addConfig = function(conf){
	__confolio.configNotLoaded = false;
		for (var key in conf) {
			__confolio.config[key] = conf[key];
		}
		addQuery(); // let config from URL query override config file
		document.title = __confolio.config["title"];
		var appModuleName = __confolio.config["appModuleName"] != null ? "-"+__confolio.config["appModuleName"] : "";
		var cssPath = __confolio.isBuild() ? "target"+appModuleName: "src";
		var linktg = document.createElement('link');
		linktg.type = 'text/css';
		linktg.rel = 'stylesheet';
		linktg.href = cssPath+"/folio/apps/clean.css";
		document.getElementsByTagName('head')[0].appendChild(linktg);
		
		linktg = document.createElement('link');
		linktg.type = 'text/css';
		linktg.rel = 'stylesheet';
		linktg.href = "resources/themes/" + (__confolio.config["theme"] || "blueish") + "/style.css";
		document.getElementsByTagName('head')[0].appendChild(linktg);
	};
	//Load external config if explicitly given as parameter or if not inline.  
	if (__confolio.config["config"] !== undefined || __confolio.inlineConfig === undefined) {
		var config = __confolio.config["config"] ? (__confolio.config["config"] + ".js") : "config.js";
		document.write('<script src="config/', config, '" type="text/javascript"><\/script>');
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

	dojoConfig = {
		isDebug: __confolio.isDebug(),
		parseOnLoad: false,
		usePlainJson: true,
		async: false,
		extraLocale: ["ROOT"]
	};
	
	var libs = ["dojo/dojo.js"]; 
	var jsPath = __confolio.isBuild() ? "target/" : "lib/dojo/";
	var debugExt = __confolio.isDebug() ? ".uncompressed.js" : "";

	for (var i = 0;i<libs.length;i++) {
		document.write('<script src="', jsPath + libs[i] + debugExt, '" type="text/javascript"><\/script>');		
	}
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
/*	var loadedIndicator = dojo.byId(nodeId);
	dojo.connect(dojo, "provide", function(str){
		dojo.attr(loadedIndicator, "innerHTML", "&nbsp;Loading:&nbsp;&nbsp;" + str);
		nr++;
		if (nr > 41) {
			nr = 0;
			step++;
			dojo.style(loadedIndicator, "width", "" + step * 10 + "%");
		}
	});*/
};

__confolio.start = function(loadIndicatorId, splashId){
	if (__confolio.configNotLoaded) {
		var splash = document.getElementById(splashId);
		splash.style.display = "none";
		return;
	}
	if(!__confolio.isBuild()){ //No splash-screen if the application is build
		var splash = document.getElementById(splashId);
		splash.style.display = "block";
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
	
	
	var deps = ["dojo/request",
	            "dojo/parser",
	            "dojo/query",
	            "dojo/dom",
	            "dojo/dom-attr",
	            "dojo/dom-style",
	            "dojo/_base/fx",
	            "dojo/_base/window",
	            "dojo/Deferred",
                "dojo/promise/all",
	            "folio/Application",
	         	"se/uu/ull/site/ViewMap",
                "folio/security/authorize",
	     		"folio/security/LoginDialog",
	     		"dijit/Dialog"];
	//Make sure the specified manager is loaded.
	deps.push(__confolio.config.viewMap.manager);
	//If a controller is specified, load it
	__confolio.config.viewMap.controller && deps.push(__confolio.config.viewMap.controller);
	
	require(deps, function(request, parser, query, dom, attr, style, fx, win, Deferred, all, Application, ViewMap, authorize, LoginDialog, Dialog, Manager) {
		var scamPath = __confolio.config["scamPath"] || "scam";
/*		cookie("scamSimpleLogin", null, {
			path: "/"+scamPath+"/",
			expires: -1
		}); // Reset login*/
		var loadedIndicator = dojo.byId(loadIndicatorId);
		attr.set(loadedIndicator, "innerHTML", "&nbsp;Building application");
		parser.parse();
		if (!__confolio.isBuild()) {
			fx.fadeOut({
				node: splashId,
				onEnd: function(){
					// hide it completely after fadeout
					dojo.style(splashId, "display", "none");
				}
			}).play();
		}
		//asynhronous loading of definitions. Use getDefinitions with a callback.
		var definitionsPath = "config/"+(__confolio.config["definitionsPath"] || "definitions") + ".json";
		var def = request.get(definitionsPath, {
			handleAs: "json",
			headers: {"Accept": "application/json",
					  "Content-type": "application/json; charset=UTF-8"}
		}).then(
			function(data) {
				__confolio.config["definitions"] = data;
				return data;
			},
			function() {
				alert("Error in configuration, cannot load the definitions from "+ definitionsPath);
			});
        var bdef = request.get("./config/baseDefinitions.json", {
            handleAs: "json",
            headers: {"Accept": "application/json",
                "Content-type": "application/json; charset=UTF-8"}
        }).then(
            function(data) {
                __confolio.config["baseDefinitions"] = data;
                return data;
            },
            function() {
                alert("Error in configuration, cannot load base definitions from ./baseDefinitions.json");
            });
        __confolio.config.definitionsPromise = all({definitions: def, baseDefinitions: bdef});

		__confolio.application = new Application({
			repository: window.location.protocol + "//" + window.location.host + "/" + scamPath + "/"
		});
		
		__confolio.application.getConfig(function() {
			__confolio.viewMap = Manager.create(__confolio.config.viewMap, dojo.create("div", null, win.body()));
			var vm = query(".viewMap", win.body())[0];
			style.set(vm, {"position": "relative", "margin-left": "auto", "margin-right": "auto"});
			if (__confolio.config.minwidth != null) {
				var minw = parseInt(__confolio.config.minwidth);
				style.set(vm, {"min-width": ""+minw+"px"});
			}
			if (__confolio.config.minwidth != null) {
				var maxw = parseInt(__confolio.config.maxwidth);
				style.set(vm, {"max-width": ""+maxw+"px"});
			}
		});
        var username = __confolio.config["username"] || "";
		var password = __confolio.config["password"] || "";


        if (__confolio.config["showLogin"] === "true") {
            (new LoginDialog({
                application: __confolio.application,
                userName: username,
                password: password
            })).show();
        } else {
            authorize.loadAuthorizedUser();
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
	document.write("<div style='font-size: x-large;margin: 2em;'><h1>No configuration file choosen.</h1><p>By default EntryScape loads the config/config.js configuration file. "+
	"The recommendation is to make a copy of config/config-default.js, and modify it to suit your needs.</p>"+
	"<p>You can also experiment (or just easily switch between different configurations) by appending ?config=name to the index.html, see <a href='index.html?config=config-default'>here how this would look like</a>. "+
	"Note that 'name' is the name of a configuration file in the apps catalogue without the .js extention.</p>"+
	"<p>See <a href='README.md'>README</a> for more information on how to deploy EntryScape.</p></div>");
};
