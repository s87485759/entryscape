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
    var addCSS = function(url) {
        var linktg = document.createElement('link');
        linktg.type = 'text/css';
        linktg.rel = 'stylesheet';
        linktg.href = url;
        document.getElementsByTagName('head')[0].appendChild(linktg);
    };

	addQuery();
	__confolio.configNotLoaded = true;
	__confolio.addConfig = function(conf){
        __confolio.configNotLoaded = false;
        for (var key in conf) if (conf.hasOwnProperty(key)) {
            __confolio.config[key] = conf[key];
        }
        addQuery(); // let config-example from URL query override config-example file
        document.title = __confolio.config["title"];
        addCSS((__confolio.isBuild() ? "target" : "src" ) +"/folio/apps/clean.css");
		addCSS("resources/themes/" + (__confolio.config["theme"] || "blueish") + "/style.css");
	};

	//Load external config-example if explicitly given as parameter or if not inline.
	if (__confolio.config["config"] !== undefined || __confolio.inlineConfig === undefined) {
		var config = __confolio.config["config"] ? "-"+__confolio.config["config"] : "";
		document.write('<script src="config', config, '/config.js" type="text/javascript"><\/script>');
	} else {
		__confolio.addConfig(__confolio.inlineConfig);
	}
};   //End of initConfig

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
	var jsPath;
    if (__confolio.isBuild()) {
        jsPath = "target/";
    } else {
        jsPath = "libs/";
        dojoConfig.packages = [
            {name: "folio", location: "../../src/folio" },
            {name: "se", location: "../../src/se" }
        ];
    }
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
	var appModulePath = __confolio.config["appModulePath"];
	var appModuleName = __confolio.config["appModuleName"];
	if(appModuleName && appModulePath){
		dojo.registerModulePath(appModuleName, appModulePath);
	}

    var viewMap = {
        manager: __confolio.config.viewManager || "se/uu/ull/site/FullscreenViewStack",
        controller: __confolio.config.viewController || "folio/navigation/NavigationBar",
        startView: __confolio.config.startView || "default",
        views: __confolio.config.views || [{
            "name": "default",
            "class": "folio.apps.TFolio"
        }]
    }

	var deps = [
        "dojo/_base/lang",
        "dojo/parser",
        "dojo/query",
        "dojo/dom",
        "dojo/dom-attr",
        "dojo/dom-style",
        "dojo/_base/fx",
        "dojo/_base/window",
        "dojo/Deferred",
        "folio/Application",
        "se/uu/ull/site/ViewMap",
        "folio/security/authorize",
        "folio/security/LoginDialog",
        "dijit/Dialog"];
    //Make sure the specified manager is loaded.
	deps.push(viewMap.manager);
	//If a controller is specified, load it
	viewMap.controller && deps.push(viewMap.controller);
	
	require(deps, function(lang, parser, query, dom, attr, style, fx, win, Deferred, Application, ViewMap, authorize, LoginDialog, Dialog, Manager) {
		var storePath = __confolio.config["storePath"] || "store";
		var loadedIndicator = dojo.byId(loadIndicatorId);
		attr.set(loadedIndicator, "innerHTML", "&nbsp;Building application");
		parser.parse();
		if (!__confolio.isBuild()) {
			fx.fadeOut({
				node: splashId,
				onEnd: function(){
					// hide it completely after fadeout
					style.set(splashId, "display", "none");
				}
			}).play();
		}

        var d = new Deferred();
        __confolio.config.definitionsPromise = d.promise;
        require(__confolio.config.definitions, function() {
            var defs = Array.prototype.slice.call(arguments); //Convert to regular array
            var res = defs[0];
            for (var i=1;i<defs.length;i++) {
                var def = defs[i];
                for (var key in def) if (def.hasOwnProperty(key)) {
                    if (key[0] !== '+') { //Replace this attribute
                        res[key] = def[key];
                    } else { //Append by joining arrays or mixin of objects.
                        var rkey = key.substr(1);
                        if (lang.isArray(def[key])) {
                            res[rkey] = (res[rkey] || []).concat(def[key]);
                        } else {
                            res[rkey] = res[rkey] || {};
                            lang.mixin(res[rkey], def[key]);
                        }
                    }
                }
            }
            __confolio.config.definitions = res;
            d.resolve(res);
        }, function() {
            d.reject("Failed loading definitions");
        });

		__confolio.application = new Application({
			repository: window.location.protocol + "//" + window.location.host + "/" + storePath + "/"
		});
		
		__confolio.application.getConfig(function() {
			__confolio.viewMap = Manager.create(viewMap, dojo.create("div", null, win.body()));
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

        if (__confolio.config["showLogin"] === "true") {
            (new LoginDialog({
                application: __confolio.application,
                userName: __confolio.config["username"] || "",
                password: __confolio.config["password"] || ""
            })).show();
        } else {
            authorize.loadAuthorizedUser();
        }

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

__confolio.failedLoadingConfig = function() {
	document.write("<div style='font-size: x-large;margin: 2em;'><h1>No configuration file choosen.</h1><p>By default EntryScape loads the config/config.js configuration file. "+
        "The recommendation is to make a copy of config-example/config.js, and modify it to suit your needs.</p>"+
        "<p>You can also experiment (or just easily switch between different configurations) by appending ?config=example to the index.html, " +
        "see <a href='index.html?config=example'>here how this would look like</a>.<br>"+
        "That is, if you provide a config name of 'foo' the config file loaded will be 'config-foo/config.js'.</p>"+
	"<p>See <a href='../../README.md'>README</a> for more information on how to deploy EntryScape.</p></div>");
};
