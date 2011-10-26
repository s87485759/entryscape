dojo.provide("conxilla.style.util");

conxilla.style.normalizeRect = function (bb) {
	return {x: bb[0], y: bb[1], width: bb[2]-bb[0], height: bb[3]-bb[1]};
};

conxilla.style.transformRectangle = function(rect, moveX, moveY, scaleX, scaleY) {
        return {x: rect.x*scaleX+moveX, y: rect.y*scaleY+moveY, width: rect.width*scaleX, height: rect.height*scaleY};
};

conxilla.style.rotateAndTranslateArrow = function(arrowPath, nextToLastPoint, lastPoint) {
    var x = lastPoint.x-nextToLastPoint.x;
    var y = lastPoint.y-nextToLastPoint.y;
    angle = Math.atan2(y, x);
	angle += Math.PI; //since arrow template already points to PI radians (also avoids negative radians).
	var rot = dojox.gfx.matrix.rotate(angle);
	var trans = dojox.gfx.matrix.translate(lastPoint.x, lastPoint.y);
	var matrix = dojox.gfx.matrix.multiply(trans, rot);
	var newPath = [];
	for (var i=0;i<arrowPath.length; i++) {
		var p = dojox.gfx.matrix.multiplyPoint(matrix, arrowPath[i]);
		p.t = arrowPath[i].t;
		newPath.push(p);
	}
	return newPath;
};

conxilla.style.transformPath = function(path, moveX, moveY, scaleX, scaleY){
        var matrix = dojox.gfx.matrix;
        var mat = matrix.scaleAt(scaleX, scaleY, 0,0);
        var p = path.match(dojox.gfx.pathSvgRegExp);
        var segments = "";
        if(!p) return;
     // create segments
        var action = "";        // current action
        var oldx;
        var xIsSet = false;
        var l = p.length;
        for(var i = 0; i < l; ++i){
                var t = p[i];
                var n = parseFloat(t);
                if(isNaN(n)){
                        segments = segments.concat(t);
                } else {
                        if (!xIsSet) {
                                oldx = n;
                                xIsSet = true;
                        } else {
                                var np = dojox.gfx.matrix.multiplyPoint(mat, oldx, n);
                                segments = segments.concat(np.x+moveX," ", np.y+moveY, " ");
                                xIsSet = false;
                        }
                }
        }
        return segments;
};