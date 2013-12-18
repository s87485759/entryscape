/*global define, __confolio*/
define([
    "exports"
], function (exports) {

    var setUser = function(data) {
        var application = __confolio.application;
        application.getStore().clearCache();
        application.setUser(typeof data.id !== "undefined" && data.user !== "_guest" ? data : null);
    };

    exports.cookieAuth = function(userName, password, maxage) {
        var application = __confolio.application;
        var data = {
            "auth_username": userName,
            "auth_password": password,
            "auth_maxage": maxage != null ? maxage : 604800 //in seconds, 86400 is default and corresponds to a day.
        };
        return application.getCommunicator().POST(application.repository + "auth/cookie", data).then(
            exports.loadAuthorizedUser,
            function(mesg) {
                setUser({message: mesg});
            }
        );
    };
    exports.loadAuthorizedUser = function() {
        var application = __confolio.application;
        return application.getCommunicator().GET(application.repository + "auth/user").then(
            setUser,
            function(mesg) {
                setUser({message: mesg});
            }
        );
    };
    exports.unAuthorizeUser = function() {
        var application = __confolio.application;
        return application.getCommunicator().GET(application.repository + "auth/logout").then(
            function() {
                application.setUser(null);
            });
    };
    exports.providers = [
        {
            id: "google",
            name: "Google",
            desc: "Sign in with Google as openId provider."
        }, {
            id: "yahoo",
            name: "Yahoo",
            desc: "Sign in with Yahoo as openId provider."
        }
    ];
});
