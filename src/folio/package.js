var profile = (function(){
    var testResourceRe = /\/tests\//;
    var ignoreResourceRe = /\/main\//;
    return {
        resourceTags: {
	    test: function(filename, mid) {
                return testResourceRe.test(mid) || ignoreResourceRe.test(mid);
	    },
	    ignore: {
	    	test: function(filename, mid) {
                return ignoreResourceRe.test(mid);	    		
	    	}
	    }/*,
	    amd: function(filename, mid) {
                return /\.js$/.test(filename) && !testResourceRe.test(mid);
        }*/
        }
    };
})();