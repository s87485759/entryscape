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

dojo.provide("folio.util.details");
dojo.require("folio.data.Entry");

folio.util.details.insertCCLogos = function(entry, license) {
	license.innerHTML="";
	var graph = entry.getLocalMetadata();
	var objs = graph.getObjectAsArray(folio.data.DCTermsSchema.RIGHTS);
	for (var i=0;i<objs.length;i++) {
			if (!objs[i]["@isBlank"]) {
				continue;
			}
			var lic = graph.getFirstObjectValue(folio.data.RDFSchema.VALUE, objs[i]);
			//var lic="http://creativecommons.org/licenses/by-nc-nd/3.0/";
			var licStart = "http://creativecommons.org/licenses/";
			if (lic !== undefined && lic.indexOf(licStart) === 0) {
				lic = lic.substring(licStart.length).split("/")[0];
				var licArr = lic.split("-");//["by", "nc-eu", "sa"];
				var a = document.createElement("a");
				a.href = "http://creativecommons.org/licenses/"+lic+"/3.0/";
				a.target = "_blank";
				license.appendChild(a);
				for (var j=0;j<licArr.length;j++) {
					var img = document.createElement("img");
					img.src = dojo.moduleUrl("folio", "icons_cc/"+licArr[j]+"_16.png");
					a.appendChild(img);
				}
				break;
			}
		}
};

folio.util.details.insertAudioPlayer = function(div, uri) {
			/* Flash player settings
			 * See: http://wpaudioplayer.com/standalone
			 */
			// Background
			var bgC = "E1D9CD";
			// Speaker icon/Volume control background
			var leftbgC = "BF9F73";
			// Speaker icon
			//var lefticonC = "333333";
			// Volume track
			//var voltrackC = "F2F2F2";	
			//	Volume slider
			//var volsliderC = "666666";
			//	Play/Pause button background
			var rightbgC = "BF9F73";
			//	Play/Pause button background (hover state)
			var rightbghoverC = "BF9F73";
			//	Play/Pause icon
			//var righticonC = "333333";
			//	Play/Pause icon (hover state)
			//var righticonhoverC = "FFFFFF";
			//	Loading bar
			var loaderC = "BF9F73";
			//	Loading/Progress bar track backgrounds
			//var trackC = "FFFFFF";
			//	Progress track
			//var trackerC = "DDDDDD";
			//	Progress bar border
			//var borderC = "CCCCCC";
			//	Previous/Next skip buttons
			//var skipC = "666666";
			//	Text
			//var textC = "333333";
			
			div.innerHTML = "<p id=\"audioplayer_1\" >Download flash to listen</p>";
			AudioPlayer.embed("audioplayer_1",
				{width: 290,
					soundFile: uri,
				bg: bgC,
				leftbg: leftbgC,
				rightbg: rightbgC,
				rightbghover: rightbghoverC,
				loader: loaderC});
};
