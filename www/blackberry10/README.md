# Facebook Requirements and Set-Up [Blackberry10]

To use this plugin you will need to make sure you've registered your Facebook app with Facebook and have an `APP_ID` [https://developers.facebook.com/apps](https://developers.facebook.com/apps).

This plugin was based on a Micro-Library for facebook called [openFB] (https://github.com/ccoenraets/OpenFB)

## Install

This plugin requires [Cordova CLI](http://cordova.apache.org/docs/en/4.0.0/guide_cli_index.md.html).

To install the plugin in your app, execute the following (replace variables where necessary):

```sh
# Create initial Cordova app
$ cordova create myApp
$ cd myApp/
$ cordova platform add blackberry10

# Remember to replace APP_ID and APP_NAME variables
$ cordova plugin add https://github.com/blackberry/phonegap-facebook-plugin --variable APP_ID="123456789" --variable APP_NAME="myApplication"
```

## Setup

###Content Security Policy Configuration: 
You must change the `meta` tag for Content-Security-Policy in the `index.html` to look like this:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self' data: gap: https://ssl.gstatic.com 'unsafe-eval'; style-src 'self' 'unsafe-inline'; media-src *; connect-src local: 'self' http://localhost:8472 https://graph.facebook.com/" >
```

###Facebook Application Configuration:
1. Select **Settings**

1. Select **Advanced**

1. Under **Client OAuth Settings** enable **WebOAuth Login**

1. In the Valid **OAuth redirect URIs** add https://www.facebook.com/connect/login_success.html

1. At bottom select **Save Changes**

##Blackberry 10 API Notes

For all API calls use `facebookConnectPluginBB10` instead of `facebookConnectPlugin`

###Login

Multiple permission requests are allowed and can only be added when calling Login.

For example:
```
facebookConnectPluginBB10.login(["user_friends", "email", "public_profile"], function(response) {console.log(response)},  function(response) {console.log(response)})
```

For more information see: [Facebook Manual Login Documentation] (https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow)

###Get Status

Success function:
Most useful fields are `authResposne` are `userID`, `accessToken`, and `expiresIn` this is the same for login success function as well

###Show a Dialog
Send Dialog is not supported.  [Send Dialog Documentation](https://developers.facebook.com/docs/sharing/reference/send-dialog)

###The Graph API
Permissions are handled strictly with Login, so permissions parameter should always be `[]`.

For example:
```
facebookConnectPluginBB10.api("me", [], function(response) {console.log(response)},  function(response) {console.log(response)})
```
###Events:
Not supported for Blackberry10 because there is no [API](https://developers.facebook.com/docs/app-events)

