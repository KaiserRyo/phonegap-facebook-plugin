/*
 * @author Ally Ogilvie
 * @copyright Wizcorp Inc. [ Incorporated Wizards ] 2014
 * @file - facebookConnectPlugin.js
 * @about - JavaScript interface for PhoneGap bridge to Facebook Connect SDK
 *
 *
 */

if (!window.cordova) {

    var facebookConnectPlugin = {

        getLoginStatus: function (s, f) {
            //cordova.exec(s, f, "FacebookConnectPlugin", "getLoginStatus", []);
        },

        showDialog: function (options, s, f) {
            //cordova.exec(s, f, "FacebookConnectPlugin", "showDialog", [options]);
        },

        login: function (permissions, s, f) {
            //cordova.exec(s, f, "FacebookConnectPlugin", "login", permissions);
        },

        getAccessToken: function(s, f) {
            //cordova.exec(s, f, "FacebookConnectPlugin", "getAccessToken", []);
        },

        logout: function (s, f) {
            //cordova.exec(s, f, "FacebookConnectPlugin", "logout", []);
        },

        api: function (graphPath, permissions, s, f) {
            //cordova.exec(s, f, "FacebookConnectPlugin", "graphApi", [graphPath, permissions]);
        },

        // Browser wrapper API ONLY
        browserInit: function(appId, version) {
            if (!version) {
                version = "v2.0";
            }
            FB.init({
                appId      : appId,
                xfbml      : true,
                version    : version
            })
        }
    };

    // Bake in the JS SDK if not native
    window.document.addEventListener("load", function () {
        console.log("boot browser");
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) { return; }
            js = d.createElement(s);
            js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        } (document, 'script', 'facebook-jssdk'));

    }, false);

} else if ("blackberry10" == cordova.platformId) {

    //init
    document.addEventListener("deviceready", function () {
        facebookConnectPluginBB10.getAppId();
    }, false);

    var facebookConnectPlugin = {
        getLoginStatus: function (s, f) {
            facebookConnectPluginBB10.getLoginStatus(s, f);
        },

        showDialog: function (options, s, f) {
            facebookConnectPluginBB10.showDialog(options, s, f);
        },

        login: function (permissions, s, f) {
            facebookConnectPluginBB10.login(permissions, s, f);
        },

        getAccessToken: function(s, f) {
            facebookConnectPluginBB10.getAccessToken(s,f);
        },

        logout: function (s, f) {
            facebookConnectPluginBB10.logout(s, f);
        },

        api: function (graphPath, permissions, s, f) {
            facebookConnectPluginBB10.api(graphPath, permissions, s, f);
        }
    };

    module.exports = facebookConnectPlugin;

} else {

    var exec = require("cordova/exec");

    var facebookConnectPlugin = {

        getLoginStatus: function (s, f) {
            cordova.exec(s, f, "FacebookConnectPlugin", "getLoginStatus", []);
        },

        showDialog: function (options, s, f) {
            cordova.exec(s, f, "FacebookConnectPlugin", "showDialog", [options]);
        },

        login: function (permissions, s, f) {
            cordova.exec(s, f, "FacebookConnectPlugin", "login", permissions);
        },

        logEvent: function(name, params, valueToSum, s, f) {
            // Prevent NSNulls getting into iOS, messes up our [command.argument count]
            if (!params && !valueToSum) {
                cordova.exec(s, f, "FacebookConnectPlugin", "logEvent", [name]);
            } else if (params && !valueToSum) {
                cordova.exec(s, f, "FacebookConnectPlugin", "logEvent", [name, params]);
            } else if (params && valueToSum) {
                cordova.exec(s, f, "FacebookConnectPlugin", "logEvent", [name, params, valueToSum]);
            } else {
                f("Invalid arguments");
            }
        },

        logPurchase: function(value, currency, s, f) {
            cordova.exec(s, f, "FacebookConnectPlugin", "logPurchase", [value, currency]);
        },

        getAccessToken: function(s, f) {
            cordova.exec(s, f, "FacebookConnectPlugin", "getAccessToken", []);
        },

        logout: function (s, f) {
            cordova.exec(s, f, "FacebookConnectPlugin", "logout", []);
        },

        api: function (graphPath, permissions, s, f) {
            if (!permissions) permissions = [];
            cordova.exec(s, f, "FacebookConnectPlugin", "graphApi", [graphPath, permissions]);
        }
    };

    module.exports = facebookConnectPlugin;
}
