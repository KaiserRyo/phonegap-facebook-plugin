var facebookConnectPluginBB10 = {

    FB_LOGIN_URL : 'https://www.facebook.com/dialog/oauth',
    FB_LOGOUT_URL : 'https://www.facebook.com/logout.php',

    // Store access_token in sessionStorage
    tokenStore : window.sessionStorage,

    fbAppId : 0,

    getAppId: function() {
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("load", function ()
        {
            var parser = new DOMParser();
            var doc = parser.parseFromString(xhr.responseText, "application/xml");
            x = doc.getElementsByTagName('string');
            for (i=0;i<x.length;i++)
                if (x[i].getAttribute('name') == 'FacebookAppID') {//found fb_app_id
                    facebookConnectPluginBB10.fbAppId = x[i].textContent;
                }
        });
        xhr.open("get", "config.xml", true);
        xhr.send();
    },

    getLoginStatus: function (s, f) {
        var token = facebookConnectPluginBB10.tokenStore['access_token'],
        loginStatus = {};
        if (token) {
            loginStatus.status = 'connected';
            loginStatus.authResponse = {token: token};
            if (s) s(loginStatus);
        } else {
            loginStatus.status = 'unknown';
            if (f) f(loginStatus);
        }
        return (loginStatus);
    },

    showDialog: function (options, s, f) {
        alert('Not yet implemented');
    },

    login: function (permissions, s, f) {
        var loginWindow,
            startTime,
            scope = "";

        if (facebookConnectPluginBB10.fbAppId === 0) {
            return f({status: 'unknown', error: 'Facebook App Id not set.'});
        }

        if (permissions && permissions.length > 0) {
            scope = permissions.toString();
        }

        oauthRedirectURL = "https://www.facebook.com/connect/login_success.html";

        startTime = new Date().getTime();
        redirectUri = facebookConnectPluginBB10.FB_LOGIN_URL + '?client_id=' + facebookConnectPluginBB10.fbAppId + '&redirect_uri=' + oauthRedirectURL +
            '&response_type=token&scope=' + scope;
        loginWindow = window.open('https://www.facebook.com/dialog/oauth?client_id=' + facebookConnectPluginBB10.fbAppId + '&redirect_uri=https://www.facebook.com/connect/login_success.html&response_type=token&scope=' + scope, '_blank');

        window.inter = setInterval(function() {
            var currentURL = loginWindow.window.location.href;
            var callbackURL = redirectUri;
            var inCallback = currentURL.indexOf("access_token=");

            // location has changed to our callback url
            if (inCallback != -1) {

                // stop the interval
                window.clearInterval(inter);

                // parse the access token
                var code = currentURL;
                code = code.split('access_token=');
                code = code[1];
                code = code.split('&expires_in=');
                code = code[0];
                facebookConnectPluginBB10.tokenStore.access_token = code;

                // close the loginWindow
                loginWindow.window.close();
                s({status: 'true', accessToken: code});
            }
        }, 1000);
    },

    getAccessToken: function(s, f) {
        token = facebookConnectPluginBB10.tokenStore['access_token'];
        if (token) {
            if (s) s(token);
        } else {
            if (f) f({error: 'not logged in'});
        }
        return token;
    },

    logout: function (s, f) {
        var logoutWindow,
        token = facebookConnectPluginBB10.tokenStore['access_token'];

        if (token) {
            facebookConnectPluginBB10.tokenStore.removeItem('access_token');
            logoutWindow = window.open(FB_LOGOUT_URL + '?access_token=' + token + '&next=' + logoutRedirectURL, '_blank', 'location=no');
            if (runningInCordova) {
                setTimeout(function() {
                    logoutWindow.close();
                }, 1000);
            }
        }

        if (s) {
            s({logout: 'success'});
        }
    },

    api: function (graphPath, permissions, s, f) {
        //js doesn't take additional permissions
        var method = 'GET',
        params = {},
        xhr = new XMLHttpRequest(),
        obj = {},
        url,
        urlConcat = '?';

        params['access_token'] = facebookConnectPluginBB10.tokenStore.access_token;

        if(graphPath.indexOf('?') > -1)
            urlConcat = '&';

        url = 'https://graph.facebook.com/' + graphPath + urlConcat + toQueryString(params);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    obj = JSON.parse(xhr.responseText);
                    s(obj);
                } else {
                    var error = xhr.responseText ? JSON.parse(xhr.responseText).error : {message: 'An error has occurred'};
                        obj = error;
                        f(obj);
                }
                return (obj);
            }
        };

        xhr.open(method, url, true);
        xhr.send();
    }
};

function parseQueryString(queryString) {
    var qs = decodeURIComponent(queryString),
        obj = {},
        params = qs.split('&');
    params.forEach(function (param) {
        var splitter = param.split('=');
        obj[splitter[0]] = splitter[1];
    });
    return obj;
}

function toQueryString(obj) {
    var parts = [];
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
        }
    }
    return parts.join("&");
}

module.exports = facebookConnectPluginBB10;