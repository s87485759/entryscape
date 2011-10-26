/*
 * Copyright (c) 2007-2010
 *
 * This file is part of Confolio.
 *
 * Confolio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Confolio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Confolio. If not, see <http://www.gnu.org/licenses/>.
 */

dojo.provide("jdil.Namespaces");

dojo.declare("jdil.Namespaces", null, {
	constructor: function(args){
		this.namespaces = args.namespaces ? args.namespaces : {};
		this.parent = args.parent;
		if (args.url) {
			var self = this;
			var xhrArgs = {
				url: args.url,
				handleAs: "json-comment-optional",
				sync: true
			};
			var d = dojo.xhrGet(xhrArgs);
	//		var d = dojo.io.script.get(xhrArgs);
			d.addCallback(function(data) {dojo.mixin(self.namespaces, data)});
		}
	},
	getAbbreviations: function() {
		var arr;
		if (this.parent) {
			arr = parent.getAbbreviations();
		} else {
			arr = [];
		}
		for (var ns in this.nanamespaces) {
			arr.push(ns);
		}
		return arr;
	},
	get: function(ns) {
		var expanded = this.namespaces[ns];
		if (expanded) {
			return expanded;
		} else if (this.parent) {
			return this.parent.get(ns);
		}
	},
	getCanonicalURI: function(nsuri) { //Converts a namedspaced uri back to canonical form ?
		if (nsuri.indexOf(":") > -1) {
			var arr = nsuri.split(":");
			var expand = this.get(arr[0]);
			if (expand == undefined) {
				throw("'"+nsuri + "'\n is not recognized as a valid URL and if '" + arr[0] 
				+ "' is a namespace, I cannot find a suitable expansion for it.");
			}
			return expand+arr[1];
		}
		return nsuri;
	},
	getNamespacedURI: function(uri) {	//Converts an uri to the match in testdata.namespaces
		for (var ns in this.namespaces) {
			var namespace = this.namespaces[ns];
			if (uri.substring(0,namespace.length)==namespace) {
				return ns+":"+uri.substring(namespace.length);
				//return "/"+ns+"/"+uri.substring(namespace.length); //Really, really ugly
			}
		}
		if (this.parent) {
			return this.parent.getNamespacedURI(uri);
		}
		return uri;
	}
});

//jdil.uriRegexp = new RegExp("^" + dojox.validate.regexp.url({allowLocal: true, scheme: true}) + "$", "i");
jdil.uriRegexpStr = "(https?|ftps?)\\://(((?:(?:[\\da-zA-Z](?:[-\\da-zA-Z]{0,61}[\\da-zA-Z])?)\\.)*(?:[a-zA-Z](?:[-\\da-zA-Z]{0,6}[\\da-zA-Z])?)\\.?)|(((\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])|(0[xX]0*[\\da-fA-F]?[\\da-fA-F]\\.){3}0[xX]0*[\\da-fA-F]?[\\da-fA-F]|(0+[0-3][0-7][0-7]\\.){3}0+[0-3][0-7][0-7]|(0|[1-9]\\d{0,8}|[1-3]\\d{9}|4[01]\\d{8}|42[0-8]\\d{7}|429[0-3]\\d{6}|4294[0-8]\\d{5}|42949[0-5]\\d{4}|429496[0-6]\\d{3}|4294967[01]\\d{2}|42949672[0-8]\\d|429496729[0-5])|0[xX]0*[\\da-fA-F]{1,8}|([\\da-fA-F]{1,4}\\:){7}[\\da-fA-F]{1,4}|([\\da-fA-F]{1,4}\\:){6}((\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5]))|localhost)(\\:\\d+)?(/(?:[^?#\\s/]+/)*(?:[^?#\\s/]+(?:\\?[^?#\\s]*)?(?:#[0-9A-Za-z][\\w%.:-]*)?)?)?";
jdil.uriRegexp = new RegExp("^" + jdil.uriRegexpStr + "$", "i");
jdil.uriRegexpSimpleStr = "(https?|ftps?)\\://";
jdil.uriRegexpSimple = new RegExp("^" + jdil.uriRegexpSimpleStr, "i");
jdil.isURI = function(uri) {
	return jdil.uriRegexp.test(uri);
};
jdil.isURI_simple = function(uri) {
	return jdil.uriRegexpSimple.test(uri);
};
jdil.isURI_old = function(uri) {
	if (uri) {
	return (uri.indexOf("http://") == 0) 
		|| (uri.indexOf("ftp://") == 0)
		|| (uri.indexOf("https://") == 0); //Really ugly check, improve...
	}
	else {
		return 0;
	}
};