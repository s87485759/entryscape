define([
    "exports",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dojo/on"
], function(exports, domConstruct, domAttr, on) {

    exports.lazyLoadImage = function(node, url, done, cancel) {
        var img = domConstruct.create("img");
        on(img, "load", function() {
            domAttr.set(node, "innerHTML", "");
            domConstruct.place(img, node);
            done && done(img);
        });
        if (cancel) {
            on(img, "error", cancel);
            on(img, "abort", cancel);
        }
        domAttr.set(img, "src", url);
    };

    exports.insertCCLogos = function(entry, license) {
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
                    //TODO use config or similar to find base path to icon directory.
                    img.src = "resources/icons/cc/"+licArr[j]+"_16.png";
                    a.appendChild(img);
                }
                break;
            }
        }
    };

    exports.insertAudioPlayer = function(div, uri) {
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
});