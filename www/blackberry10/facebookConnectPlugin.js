/**
* Based on OpenFB by Christophe Coenraets @ccoenraets
* https://github.com/ccoenraets/OpenFB
* Copyright 2014
* Licensed under MIT
*/

var facebookConnectPluginBB10 = {

    FB_LOGIN_URL : 'https://www.facebook.com/dialog/oauth',
    FB_LOGOUT_URL : 'https://www.facebook.com/logout.php',
    FB_DIALOG_URL : 'https://www.facebook.com/dialog/',

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
		expires_in = facebookConnectPluginBB10.tokenStore['expires_in'],
        loginStatus = {};
        if (token) {
			facebookConnectPluginBB10.api("me",[], function(response){
				loginStatus.status = 'connected';
				loginStatus.authResponse = {
					userID:response.id,
					accessToken: token,
					session_Key: true,
					expiresIn: expires_in,
					sig: "..."
				}
				if (s) s(loginStatus);
				return;
			}, f);
        } else {
            loginStatus.status = 'unknown';
            if (f) f(loginStatus);
        }
        return (loginStatus);
    },

    showDialog: function (options, s, f) {
        var dialogWindow;
		var url = facebookConnectPluginBB10.FB_DIALOG_URL;
		options.redirect_uri = "https://m.facebook.com";
        // determine method chosen
		if(options.method == "feed") {	
			url = url + 'feed?app_id=' + facebookConnectPluginBB10.fbAppId + '&display=popup' + '&redirect_uri=' + options.redirect_uri;
			url = url + initFeedParameters(options);
        } else if (options.method == "share") {
			if(!options.href){
				blackberry.invoke.invoke({
				target: "Facebook",
				action: "bb.action.SHARE",
				type: "text/plain",
				data: " "
				}, s, f);
				return;
			}
			url = url + 'share?app_id=' + facebookConnectPluginBB10.fbAppId + '&display=popup&href=' + options.href + '&redirect_uri=' + options.redirect_uri;
        } else if (options.method == "share_open_graph"){  
			if(!options.action_type && !options.action_properties) {
				blackberry.invoke.invoke({
						target: "Facebook",
						action: "bb.action.SHARE",
						type: "text/plain",
						data: " "
					}, s, f);
				return;
			}
            url = url + 'share_open_graph?app_id=' + facebookConnectPluginBB10.fbAppId + '&display=popup&action_type=' + options.action_type + '&action_properties=' + options.action_properties + '&redirect_uri=' + options.redirect_uri;
        } else if (options.method == "apprequests") {
            url = url + 'apprequests?app_id=' + facebookConnectPluginBB10.fbAppId + '&message=' + options.message + '&redirect_uri=' + options.redirect_uri;
			url = url + initAppRequestsParameters(options);
		} /*else if (options.method == "send"){ 
			blackberry.invoke.invoke({
						target: "Facebook",
						action: "bb.action.COMPOSE", 
						type: "Facebook/message",
						data: "hello"
					}, s, f);
			return;
		} */else {
            // fail due to invalid method
            dialogStatus = {}
            if (f) {
                dialogStatus.status = 'Invalid method';
                f(dialogStatus);
				return;
            }
		}
		dialogWindow = window.open(url);
		window.inter = setInterval(function(){
            var result = checkRedirect(dialogWindow, options.redirect_uri);
			if (result.status == 'success') {
				window.clearInterval(inter);
				if(s && result.response){
					s(ParseDialogResponse(result.response, options.method));
				}
				dialogWindow.window.close();
			}
			if (result.status == 'error') {
				window.clearInterval(inter);
				if(f && result.errorMessage){
					f(result.errorMessage);
				}
			}
			if (result.status == 'error_code'){
				//Parse out error 
				if(f && result.response){
					f(ParseDialogError(result.response));
				}
				window.clearInterval(inter);
				dialogWindow.window.close();
			}

			}, 1000);
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
		//Wow, look how much more readable that is.
		var url = 'https://www.facebook.com/dialog/oauth?client_id=' + facebookConnectPluginBB10.fbAppId;
		url = url + '&redirect_uri=https://www.facebook.com/connect/login_success.html&response_type=token&auth_type=rerequest';
		url = url + '&scope=' + scope;
        loginWindow = window.open(url, '_blank');
        window.inter = setInterval(function() {
            var currentURL = loginWindow.window.location.href;
            var callbackURL = redirectUri;
            var inCallback = currentURL.indexOf("access_token=");
			var hasError = currentURL.indexOf("error_code=");

            // location has changed to our callback url
            if(hasError >= 0){
				if(f){
					f(ParseDialogError(currentURL))	
				}
				window.clearInterval(inter);
				loginWindow.window.close();
				return; 
			} else if (inCallback != -1) {

                // stop the interval
                window.clearInterval(inter);

                // parse the access token
                var code = currentURL;
                code = code.split('access_token=');
                code = code[1];
                code = code.split('&expires_in=');
				access_token = code[0];
				expires_In = code[1];
				//expires_In = parseInt(code[1]);
                facebookConnectPluginBB10.tokenStore.access_token = access_token;
				facebookConnectPluginBB10.tokenStore.expires_in = expires_In;
                // close the loginWindow
                loginWindow.window.close();
                facebookConnectPluginBB10.api("me",[], function(response){
				s({
					status: 'connected',
					authResponse: {
							accessToken: access_token,
							expiresIn: expires_In,
							session_key: true,
							sig: "...",
							secret: "...",
							userId: response.id
					}
				})}, f);
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
		loggedOut = false;
        if (token) {
			loggedOut = true;
            facebookConnectPluginBB10.tokenStore.removeItem('access_token');
			facebookConnectPluginBB10.tokenStore.removeItem('expires_in');
			var logoutRedirectURL = "https://www.facebook.com/";
            logoutWindow = window.open(facebookConnectPluginBB10.FB_LOGOUT_URL + '?access_token=' + token + '&next=' + logoutRedirectURL, '_blank', 'location=no');
			var runningInCordova = !!window.cordova;
			if (runningInCordova) {
                setTimeout(function() {
                    logoutWindow.close();
                }, 1000);
            }
        } else if (f) {
			f("Session not open");
		}
		
		if(loggedOut && s) {
			s("Ok");
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

function checkRedirect(currentWindow, redirect_uri) {
	try {
		var currentURL = currentWindow.window.location.href;
		var hasError = currentURL.indexOf('error_code');
		var redirectUriLength = redirect_uri.length;
		var inRedirect = currentURL.indexOf("app_");
		if (hasError >= 0){
			return {status:'error_code', response: currentURL};
		} else
		if (currentWindow.window.document.title == "Error") {
			return {status: 'error', errorMessage: "An error occurred during request"};
		}  else if (inRedirect == -1 && currentURL != 'about:blank') {
			return {status: 'success', response: currentURL};
		} else {
			return {status: 'unknown'};
		}
	} catch (error) {
        return {status: 'error', errorMessage: "User cancelled dialog"}; 
	}
}

function initAppRequestsParameters(options){
// check if object_id is set
	var parameterString = "";
	if (options.object_id) {
		parameterString = parameterString + '&object_id=' + options.object_id;
	}
	// check if 'to' is set
	if (options.to) {
		parameterString = parameterString + '&to=' + options.to;
	}
	// check for action_type
	if (options.action_type) {
		parameterString = parameterString + '&action_type=' + options.action_type;
	}   
	// check for filters
	if (options.filters) {
		parameterString = parameterString + '&filters=' + options.filters;
	}
	// check for suggestions
	if (options.suggestions) {
		parameterString = parameterString + '&suggestions=' + options.suggestions;
	}
            // check for data
    if (options.data) {
		parameterString = parameterString + '&data=' + options.data;
    }
    // check for title 
    if (options.title) {
        parameterString = parameterString + '&title=' +options.title;
    }
	return parameterString
}

function initFeedParameters(options){
	var parameterString = "";
	// check if 'to' is set
	if (options.to) {
		parameterString = parameterString + '&to=' + options.to;
	}
	if (options.from) {
		parameterstring = parameterString + '&from' + options.from;
	}
    // check for link
    if (options.link) {
		parameterString = parameterString + '&link=' + options.link;
    }
    // check for picture 
    if (options.picture) {
        parameterString = parameterString + '&picture=' +options.picture;
    }
	// check for source 
    if (options.source) {
        parameterString = parameterString + '&source=' +options.source;
    }
	// check for name
	if(options.name) {
		parameterString = parameterString + '&name=' + options.name;
	}
	// check for caption
	if(options.caption) {
		parameterString = parameterString + '&caption=' + options.caption;
	}
	// check for name
	if(options.description) {
		parameterString = parameterString + '&description=' + options.description;
	}
	if(options.ref) {
		parameterString = parameterString + '&ref=' + options.ref;
	}
	return parameterString;
}

function ParseDialogResponse(response, method){
	var ret = {};
	if(CheckForPostID(response, method)){
		var stringParts = response.split("post_id=");
		var postId = "";
		if(response.length >= 2){
			postId = stringParts[1];
			postId = postId.split("#_=_")[0];
		}	
		ret.post_id = postId;
	} else if (method == "apprequests" && response.indexOf("to") >= 0){
		var raw = response.split("?")[1];
		raw = raw.split("request=")[1];
		raw = raw.split("#_=_")[0];
		raw = raw.split("&");
		var numbers = [];
		numbers.push(raw[0]);
		for (var i = 1; i < raw.length; i++){
			numbers.push(raw[i].split("=")[1]);
		}
		ret.request = numbers[0];
		ret.to = []
		
		for (var i = 1; i < numbers.length; i++){
			ret.to.push(numbers[i]);
		}
	}
	return ret;
}
function CheckForPostID(response, method){
	var methods = ["feed", "share", "share_open_graph"];
	if(response.indexOf("post_id") == -1){
		return false;
	}
	for (var i = 0; i < methods.length; i++){
		if(methods[i] == method){
			return true;
		}
	}
	return false;
}

function ParseDialogError(response){
	var ret = {};
	var raw = response.split("?")[1];
	raw = raw.split("#_=_")[0];
	raw = raw.split("&");
	ret.error_code = raw[0].split("error_code=")[1];
	ret.error_message = raw[1].split("error_message=")[1];
	return ret;
}


module.exports = facebookConnectPluginBB10;