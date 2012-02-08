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

dojo.provide("folio.data.util");
dojo.require("dojo.io.script");

folio.data.getIconPath = function(entry) {
	return 	""+dojo.moduleUrl("folio", "icons_oxygen/"+ folio.data.getIconName(entry) +".png");
};

folio.data.getYoutubeParams = function(/* string */ url, /* function */ callback) {
	var videoT = url.match(/v=[\w-]*&{0,1}/)[0].slice(2);
	var params = null;
	if (/&/.test(videoT)) {
		videoT=videoT.slice(0,-1);
	}
	if (videoT.length > 0) {
		params = {
			videoSrc: "http://www.youtube.com/v/"+videoT+"&hl=en&fs=1",
			width: "425",
			height: "344",
			version: "8.0.0",
			flashvars: {},
			params: {allowFullScreen: "true", wmode: "transparent"},
			attributes: {}};
	}
	callback(params);
};

folio.data.getGoogleVideoParams = function(/* string */ url, /* function */ callback) {
	//console.log("folio.data.getGoogleVideoParams, url = "+ url);
	//console.log("folio.data.getGoogleVideoParams, url.match(/docid=\w*&{0,1}/) = "+ url.match(/docid=\w*&{0,1}/));
	//console.log("folio.data.getGoogleVideoParams, url.match(/docid=\w*&{0,1}/)[0] = "+ url.match(/docid=\w*&{0,1}/)[0]);
	//console.log("folio.data.getGoogleVideoParams, url.match(/docid=\w*&{0,1}/)[0].slice(6) = "+ url.match(/docid=\w*&{0,1}/)[0].slice(6));
	var videoT = url.match(/docid=\w*&{0,1}/)[0].slice(6);
	var params = null;
	if (/&/.test(videoT)) {
		videoT=videoT.slice(0,-1);
	}
	if (videoT.length > 0) {
		params = {
			videoSrc: "http://video.google.com/googleplayer.swf?docid="+videoT+"&fs=true",
			width: "400",
			height: "326",
			version: "8.0.0",
			flashvars: {},
			params: {allowFullScreen: "true", allowScriptAccess: "always"},
			attributes: {}};
	}
	callback(params);
};

folio.data.getVeohVideoParams = function(/* string */ url, /* function */ callback) {
	/*
	 * Examples of URL:s
	 */
	// http://www.veoh.com/search/videos/q/mouse#watch%3De78786PnMXYsHG
	// http://www.veoh.com/collection/s19037/watch/e78786PnMXYsHG
	// e78786PnMXYsHG
	
	//http://www.veoh.com/collection/Veoh-Editor-Picks/watch/v17342363s5mPXGgD#watch%3Dv18126051e6c3KpFx
	//http://www.veoh.com/browse/videos/category/horror/watch/v18126051e6c3KpFx
	//v18126051e6c3KpFx
	
	//console.log("folio.data.getVeohVideoParams, url = "+ url);
	//console.log("folio.data.getVeohVideoParams, url.match(/watch.\w*/i) = "+ url.match(/watch.\w*$/i));
	//console.log("folio.data.getVeohVideoParams, url.match(/watch.\w*/i)[0] = "+ url.match(/watch.\w*$/i)[0]);
	
	// Match watch followed by one of any character followed by any number of alphanumerical characters at the end of the searchstring.
	var videoT = url.match(/watch.\w*$/i)[0];
	if (/watch\//.test(videoT)) {
		videoT=videoT.slice(6);
	}
	if (/watch%3D/.test(videoT)) {
		videoT=videoT.slice(8);
	}
	//console.log("folio.data.getVeohVideoParams, videoT = "+ videoT);
	var params = null;
	if (videoT.length > 0) {
		params = {
			videoSrc: "http://www.veoh.com/static/swf/webplayer/WebPlayer.swf?version=AFrontend.5.4.2.5.1001&permalinkId="+videoT+"&player=videodetailsembedded&videoAutoPlay=0&id=anonymous",
			width: "410",
			height: "341",
			version: "8.0.0",
			flashvars: {},
			params: {allowFullScreen: "true", allowScriptAccess: "always"},
			attributes: {}};
	}
	callback(params);
};

folio.data.getVimeoVideoParams = function(/* string */ url, /* function */ callback) {
	console.log("folio.data.getVimeoVideoParams, start");
	var videoT = url.match(/vimeo\.com\/\d+/i)[0].slice(10);
	console.log("folio.data.getVimeoVideoParams, videoT = "+ videoT);
	var params = null;
	if (videoT.length > 0) {
		params = {
			videoSrc: "http://vimeo.com/moogaloop.swf?clip_id="+videoT+"&amp;server=vimeo.com&amp;show_title=1&amp;show_byline=1&amp;show_portrait=0&amp;color=&amp;fullscreen=1",
			width: "400",
			height: "225",
			version: "8.0.0",
			flashvars: {},
			params: {allowFullScreen: "true", allowScriptAccess: "always"},
			attributes: {}};
	}
	callback(params);
};

folio.data.getAftonbladetVideoParams = function(/* string */ url, /* function */ callback) {
	var pieces = url.split("/");
	var srcString = "http://www.aftonbladet.se/svn/tv/flash/satelliteUnified.swf?aid=http%3A%2F%2Fwww.aftonbladet.se%2Fwebbtv%2F";
	for (i = 4; i<pieces.length; i++) {
		srcString += pieces[i];
		if (i < pieces.length - 1) {
			srcString += "%2F";
		}
		else {
			srcString += "%3Fservice%3Dtv&mid=http%3A%2F%2Fwww.aftonbladet.se%2Fwebbtv%2F%3Fservice%3Dtv%26menu%3Dtrue&cid=webbtv_";
		}
		console.log("folio.data.getAftonbladetVideoParams,  pieces["+i+"] = \"" + pieces[i] +"\"");
	}
	srcString += pieces[4];
	console.log("folio.data.getAftonbladetVideoParams, srcString="+srcString);
	var params = null;
	params = {
		videoSrc: srcString,
		width: "425",
		height: "240",
		version: "8.0.0",
		flashvars: {},
		params: {allowFullScreen: "true", allowScriptAccess: "always"},
		attributes: {}};
	callback(params);
};

folio.data.getMetacafeVideoParams = function(/* string */ url, /* function */ callback) {
	console.log("folio.data.getMetacafeVideoParams, url="+url);
	var videoT = url.match(/metacafe\.com\/watch\/.*/i)[0].slice(19);
	console.log("folio.data.getMetacafeVideoParams, videoT="+videoT);
	// if the string ends with a forward slash - remove it
	if (/\/$/.test(videoT)) {
		videoT=videoT.slice(0,-1);
	}
	console.log("folio.data.getMetacafeVideoParams, videoT="+videoT);
	var params = null;
	if (videoT.length > 0) {
		params = {
			videoSrc: "http://www.metacafe.com/fplayer/"+videoT+".swf",
			width: "400",
			height: "345",
			version: "8.0.0",
			flashvars: {},
			params: {allowFullScreen: "true"},
			attributes: {}};
	}
	callback(params);
};

folio.data.getMyspaceVideoParams = function(/* string */ url, /* function */ callback) {
	var videoT = url.match(/videoid=\d*/i)[0].slice(8);
	console.log("folio.data.getMyspaceVideoParams, videoT="+videoT);
	var searchString = "";
	var params = null;
	if (videoT.length > 0) {
		params = {
			videoSrc: "http://mediaservices.myspace.com/services/media/embed.aspx/m="+videoT+",t=1,mt=video,searchID="+searchString+",primarycolor=,secondarycolor=",
			width: "425",
			height: "360",
			version: "8.0.0",
			flashvars: {},
			params: {allowFullScreen: "true", wmode: "transparent"},
			attributes: {}};
	}
	callback(params);
};

folio.data.getTv4PlayVideoParams = function(/* string */ url, /* function */ callback) {
	var videoT = url.match(/videoId=\d\.\d*/i)[0].slice(8);
	console.log("folio.data.getTv4PlayVideoParams, videoT="+videoT);
	var params = null;
	if (videoT.length > 0) {
		params = {
			videoSrc: "http://tv4play.se/polopoly_fs/1.939636!approot/embedvideo.swf?videoId="+videoT,
			width: "475",
			height: "349",
			version: "8.0.0",
			flashvars: {},
			params: {allowFullScreen: "true", allowScriptAccess: "always", base: "http://tv4play.se/polopoly_fs/1.939636!approot/embedvideo.swf"},
			attributes: {}};
	}
	callback(params);
};

folio.data.getSlideshareParams = function(/* string */ url, /* function */ callback) {
	/* ?? */
};

folio.data.getFlickrImageParams = function(/* string */ url, /* function */ callback) {
	this.callbackFunc = callback;
	console.log("folio.data.getFlickrImageParams 1");
	var pieces = url.split("/");
	var user = pieces[4];
	var image = pieces[5];
	var reqUrl = "http://flickr.com/services/rest/?method=flickr.photos.getSizes&format=json&api_key=a42a1112579b2fdb551e97b1dcf03788&photo_id="+image;
	var element = dojo.doc.createElement("script" );
    element.type = "text/javascript" ;
    element.src = reqUrl;
    console.log("folio.data.getFlickrImageParams 2");
    jsonFlickrApi = dojo.hitch(this, function(obj) {
		var params = {url: obj.sizes.size[3].source, width: obj.sizes.size[3].width, height: obj.sizes.size[3].height, alt: ""};
		params.html = "<img src='"+obj.sizes.size[3].source+"'></img>";
		console.log("folio.data.getFlickrImageParams 3");
		this.callbackFunc(params);
	    dojo.doc.getElementsByTagName("head")[0].removeChild(element);
	});
    console.log("folio.data.getFlickrImageParams 4");
    dojo.doc.getElementsByTagName("head")[0].appendChild(element);
};

folio.data.getViaOEmbed = function(url, callback) {
	var jsonpArgs = {
            url: "http://api.embed.ly/1/oembed",
            callbackParamName: "callback",
            content: {url: url, key: "34856b2a3d0911e190fc4040d3dc5c07"},
			load: callback,
            error: function(error) {}
	};
	dojo.io.script.get(jsonpArgs);
}

folio.data.services = [
		{service: "youtube",
			type: "video",
			object: "flash",
			regexp: /youtube\.com.*v=/i,
			getParameters: folio.data.getYoutubeParams},
		{service: "google",
			type: "video",
			object: "flash",
			regexp: /video\.google\.com.*docid=/i,
			getParameters: folio.data.getGoogleVideoParams},
		{service: "veoh",
			type: "video",
			object: "flash",
			regexp: /veoh\.com\/.*watch/i,
			getParameters: folio.data.getVeohVideoParams},
		{service: "vimeo",
			type: "video",
			object: "flash",
			regexp: /vimeo\.com\/\d+/i,
			getParameters: folio.data.getVimeoVideoParams},
		{service: "aftonbladet",
			type: "video",
			object: "flash",
			regexp: /aftonbladet\.se\/webbtv/i,
			getParameters: folio.data.getAftonbladetVideoParams},
		{service: "metacafe",
			type: "video",
			object: "flash",
			regexp: /metacafe\.com\/watch/i,
			getParameters: folio.data.getMetacafeVideoParams},
		{service: "myspace",
			type: "video",
			object: "flash",
			regexp: /vids\.myspace\.com.*videoid/i,
			getParameters: folio.data.getMyspaceVideoParams},
		{service: "tv4 play",
			type: "video",
			object: "flash",
			regexp: /tv4play\.se\/.*videoId=/i,
			getParameters: folio.data.getTv4PlayVideoParams},
		{service: "slideshare",
			type: "presentation",
			object: "snippet",
			regexp: /\.slideshare\.net/i,
			getParameters: folio.data.getViaOEmbed},
		{service: "flickr",
			type: "images",
			object: "iframe",
			regexp: /flickr\.com\/photos\/\w+\/sets/i},
		{service: "flickr",
			type: "image",
			object: "image",
			regexp: /flickr\.com\/photos\/\w+\/\w+/i,
			getParameters: folio.data.getViaOEmbed}, //folio.data.getFlickrImageParams},
		{service: "googlecal",
			type: "calendar",
			object: "iframe",
			regexp: /google\.com\/calendar\/embed/i},
		{service: "wikipedia",
			type: "webpage",
			object: "snippet",
			regexp: /\.wikipedia.org\/wiki/i,
			getParameters: folio.data.getViaOEmbed},
		{service: "amazon",
		    type: "image",
			object: "image",
			regexp: /amazon\./i,
			getParameters: folio.data.getViaOEmbed}
	];

folio.data.detectService = function(entry) {
	var url = entry.getResourceUri();
		
	for (var nr=0; nr<folio.data.services.length; nr++) {
		if (folio.data.services[nr].regexp.test(url)) {
			//console.log("folio.data.detectService, found service: "+folio.data.services[nr].service);
			return folio.data.services[nr];
		}
	}
};

folio.data.getIconName = function(entry) {	
	var bt = entry.getBuiltinType();
	var link = folio.data.isLink(entry);
	if (bt == folio.data.BuiltinType.NONE) {
		// If refering to use a thumbshot as icon
		if (folio.data.isWebContent(entry) && entry.getLocationType() != folio.data.LocationType.LOCAL) {
			var service = folio.data.detectService(entry);
			if (service) {
				switch(service.type) {
				case "video":
					return "video";
				case "presentation":
					return "presentation";
				case "image":
					return "image";
				case "images":
					return "images";
				case "calendar":
					return "calendar";
				}
			}
			return "html";
		} else {
			var mimetype = entry.getMimeType();
			if (mimetype) {
				var mainType = mimetype.indexOf("/") != -1 ? mimetype.split("/")[0] : mimetype;
				switch(mainType) {
				case "video":
					return "video";
				case "presentation":
					return "presentation";
				case "image":
					return "image";
				case "images":
					return "images";
				case "calendar":
					return "calendar";
				case "text":
					return "text_plain";
				case "sound":
					return "audio_basic";
				}
			}
			return "image";
		}
	} else {
		if (entry.getId() == "_top") {
			return "folder_home";
		}
		switch (bt) {
		case folio.data.BuiltinType.LIST:
			if (link) {
				return "folder_network";
			} else {
				return "folder";
			}
			break;
		case folio.data.BuiltinType.RESULT_LIST:
			//var mimetype = entry.getMimeType();
			if (folio.data.isFeed(entry)) {
				return "rss";
			}
			return "find"; //TODO Combine with folder...
		case folio.data.BuiltinType.USER:
			return "user";
		case folio.data.BuiltinType.GROUP:
			return "users2";
		case folio.data.BuiltinType.CONTEXT:
			return "book";
		case folio.data.BuiltinType.SYSTEM_CONTEXT:
			return "book2";
		}
	}
	return "unknown";
};

folio.data.normalizeEntryInfo = function(entryInfo) {
	// summary: generates an object containing base, entryId, contextId, entryUri, and infoUri (entryUri + ?includeAll)
	// from either a generic uri or base + entryId + contextId.
	if (typeof entryInfo == "object") {
		if (entryInfo.normalized) {
			return entryInfo;
		}
		var ids = (entryInfo.entryId !== undefined && entryInfo.contextId !== undefined);
		if ((!ids || !entryInfo.entryUri) && (entryInfo.uri || entryInfo.entryUri )) {
			folio.data._normalizeEntryInfo(entryInfo);
		} else if (ids && entryInfo.base) {
			//entryInfo.entryUri = entryInfo.base+entryInfo.contextId+"/entry/"+entryInfo.entryId;
			if (typeof entryInfo.contextId === "object" && entryInfo.contextId.id) {
				entryInfo.entryUri = entryInfo.base + entryInfo.contextId.id + "/entry/" + entryInfo.entryId; //+"_stub" for local testdata
			}
			else {
				entryInfo.entryUri = entryInfo.base + entryInfo.contextId + "/entry/" + entryInfo.entryId;
			}
			entryInfo.infoUri = entryInfo.entryUri+"?includeAll";
		} else {
			throw("EntryInfo Object neither contains an URI or neccessary attributes to construct one");
		}
		entryInfo.normalized = true;
		return entryInfo;
	} else if (dojo.isString(entryInfo)) {
		entryInfo = {uri: entryInfo};
		folio.data._normalizeEntryInfo(entryInfo);
		entryInfo.normalized = true;
		return entryInfo;
	}
	throw("EntryInfo must be a String (a URI) or an Object.");
};
folio.data._normalizeEntryInfo = function(entryInfo) {
	var arr;
	if (entryInfo.uri) {
		arr = entryInfo.uri.split("/");
	} else {
		arr = entryInfo.entryUri.split("/");
	} 
	//else {
	//	arr = entryInfo.infoUri.split("/");
	//}
	entryInfo.entryId = arr[arr.length-1];
	entryInfo.contextId = arr[arr.length-3];
	arr.pop();arr.pop();arr.pop();
	entryInfo.base = arr.join("/")+"/"; // "/"+ to get base as base
	//entryInfo.entryUri = entryInfo.base+entryInfo.contextId+"/entry/"+entryInfo.entryId;
	//In case the entry-URI is a direct Context-URI the different parts 
	//ends up wrong and for that reason the first "if" is needed.
	if (entryInfo.base && entryInfo.base === "http://") {
		var lastBasePart; //The last part is lost (i.e. "/scam/ in the default setting)
		var arrContext;
		if (entryInfo.uri) {
			arrContext = entryInfo.uri.split("/");
		} else {
			arrContext = entryInfo.entryUri.split("/");
		} 
		lastBasePart = "/"+arrContext[arrContext.length-2]+"/";
		entryInfo.base += entryInfo.contextId + lastBasePart;
		entryInfo.contextId = "_contexts";
		entryInfo.entryUri = entryInfo.base + entryInfo.contextId + "/entry/" + entryInfo.entryId; //+"_stub" for local testdata
		entryInfo.infoUri = entryInfo.base + entryInfo.contextId + "/entry/" + entryInfo.entryId + "?includeAll";
	}
	else {
		entryInfo.entryUri = entryInfo.base + entryInfo.contextId + "/entry/" + entryInfo.entryId; //+"_stub" for local testdata
		entryInfo.infoUri = entryInfo.base + entryInfo.contextId + "/entry/" + entryInfo.entryId + "?includeAll";
	}
};
/*
 * This method returns a string that is "human readable" for the integer that is the input.
 * The method will return a string ending with B, kB, MB, GB, TB or PB. The returned string
 * will only return one decimal, the rest will be cut off.  
 */
folio.data.bytesAsHumanReadable = function(/*Integer*/ nrOfBytes, /*boolean*/ includeSpace){
	if(!nrOfBytes){
		return "0";
	}
	
	var returnString = "";
	var unitUsed = "";
	if(nrOfBytes<0){
		nrOfBytes = 0;
	}
	if(nrOfBytes<1024){
		return nrOfBytes+" B"
	} else if(nrOfBytes >= 1024 && nrOfBytes<1048576){ //Between 2^10 and 2^20 
		returnString = (nrOfBytes/1024).toFixed(1);
		unitUsed = "kB";
	} else if (nrOfBytes >= 1048576 && nrOfBytes < 1073741824){ //Between 2^20 and 2^30
		returnString = (nrOfBytes/1048576).toFixed(1);
		unitUsed = "MB";
	} else if (nrOfBytes >= 1073741824 && nrOfBytes < 1099511627776){ //Between 2^30 and 2^40
		returnString = (nrOfBytes/1073741824).toFixed(1);
		unitUsed = "GB";
	} else if(nrOfBytes >= 1099511627776 && nrOfBytes < 1125899906842624){ //Between 2^40 and 2^50
		returnString = (nrOfBytes/1099511627776).toFixed(1);
		unitUsed = "TB";
	} else {
		returnString = (nrOfBytes/1125899906842624).toFixed(1);
		unitUsed = "PB";
	}
	var lastDotZeroIndex = returnString.lastIndexOf(".0");
	if(lastDotZeroIndex !== -1){
		returnString = returnString.substring(0, lastDotZeroIndex)
	}
	if (includeSpace) {
		return returnString + " " + unitUsed;
	}
	return returnString+unitUsed;
};
folio.data.humanReadableToBytes = function (/*Number*/ number,/*String*/ unit){
	if(!unit || number == undefined){
		//TODO: Try to extract from argument number
		return number;
	}
	if(unit.toUpperCase() === "B"){
		return number;
	} else if(unit.toUpperCase() === "KB"){
		return number*1024;
	} else if(unit.toUpperCase() === "MB"){
		return number*1048576;
	} else if(unit.toUpperCase() === "GB"){
		return number*1073741824;
	} else if(unit.toUpperCase() === "TB") {
		return number*1099511627776;
	} else if(unit.toUpperCase() === "PB") {
		return number*1125899906842624;
	} else {
		return null;
	}
}
/*
 * Returns a string with the percentage calculated from the input
 * Only one decimal will be returned, everything else is cut off
 */
folio.data.percentageCalculator = function(/*Number*/ numerator, /*Number*/ denominator){
	var rtValue = (numerator/denominator*100).toFixed(1);
	
	var lastDotZeroIndex = rtValue.lastIndexOf(".0");
	if(lastDotZeroIndex !== -1){
		rtValue = rtValue.substring(0, lastDotZeroIndex)
	}
	return rtValue+"%"
};

folio.data.uriRegexpStr = "(https?|ftps?)\\://(((?:(?:[\\da-zA-Z](?:[-\\da-zA-Z]{0,61}[\\da-zA-Z])?)\\.)*(?:[a-zA-Z](?:[-\\da-zA-Z]{0,6}"+
				"[\\da-zA-Z])?)\\.?)|(((\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])|(0[xX]0*[\\da-fA-F]?[\\da-fA-F]\\.){3}0[xX]0*"+
				"[\\da-fA-F]?[\\da-fA-F]|(0+[0-3][0-7][0-7]\\.){3}0+[0-3][0-7][0-7]|(0|[1-9]\\d{0,8}|[1-3]\\d{9}|4[01]\\d{8}|42[0-8]\\d{7}|429[0-3]\\d{6}|4294[0-8]"+
				"\\d{5}|42949[0-5]\\d{4}|429496[0-6]\\d{3}|4294967[01]\\d{2}|42949672[0-8]\\d|429496729[0-5])|0[xX]0*[\\da-fA-F]{1,8}|([\\da-fA-F]{1,4}\\:){7}"+
				"[\\da-fA-F]{1,4}|([\\da-fA-F]{1,4}\\:){6}((\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5]))|localhost)(\\:\\d+)?"+
				"(/(?:[^?#\\s/]+/)*(?:[^?#\\s/]*(?:\\?[^?#\\s]*)?(?:#[0-9A-Za-z_%/-][\\w%/.:-]*)?)?)?";
folio.data.uriRegexp = new RegExp("^" + folio.data.uriRegexpStr + "$", "i");
folio.data.uriRegexpSimpleStr = "(https?|ftps?)\\://";
folio.data.uriRegexpSimple = new RegExp("^" + folio.data.uriRegexpSimpleStr, "i");
folio.data.isURI = function(uri) {
	return folio.data.uriRegexp.test(uri);
};
folio.data.isURI_simple = function(uri) {
	return folio.data.uriRegexpSimple.test(uri);
};
folio.data.isURI_old = function(uri) {
	if (uri) {
	return (uri.indexOf("http://") == 0) 
		|| (uri.indexOf("ftp://") == 0)
		|| (uri.indexOf("https://") == 0); //Really ugly check, improve...
	}
	else {
		return 0;
	}
};