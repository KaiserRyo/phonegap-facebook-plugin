# Facebook Requirements and Set-Up [Blackberry10]

To use this plugin you will need to make sure you've registered your Facebook app with Facebook and have an `APP_ID` [https://developers.facebook.com/apps](https://developers.facebook.com/apps).

This plugin was built from a Micro-Library for facebook [https://github.com/ccoenraets/OpenFB]

## Install

This plugin requires [Cordova CLI](http://cordova.apache.org/docs/en/4.0.0/guide_cli_index.md.html).

To install the plugin in your app, execute the following (replace variables where necessary):

```sh
# Create initial Cordova app
$ cordova create myApp
$ cd myApp/
$ cordova platform add browser

# Remember to replace APP_ID and APP_NAME variables
$ cordova plugin add https://github.com/Wizcorp/phonegap-facebook-plugin/ --variable APP_ID="123456789" --variable APP_NAME="myApplication"
```

## Setup

- You must change the Content-Security-Policy  in your project `index.html` to look like this:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self' data: gap: https://ssl.gstatic.com 'unsafe-eval'; style-src 'self' 'unsafe-inline'; media-src *; connect-src local: 'self' http://localhost:8472 https://graph.facebook.com/" >
```

- In your facebook application 

1. Select **Settings**

1. Select **Advanced**

1. Under **Client OAuth Settings** enable **WebOAuth Login**

1. In the Valid **OAuth redirect URIs** add [https://www.facebook.com/connect/login_success.html]

1. At bottom select **Save Changes**

##Blackberry Notes

-Login
Any requests for permissions must be handled with login:

'''
facebookConnectPluginBB10.login(["user_friends", "email", "public_profile"],app.successHandler, app.errorHandler)
'''

For more information see: [https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow]
-Get Login Status:

For more information refer to

-Show a Dialog
Send Dialog is not supported because of mobile limitation: [https://developers.facebook.com/docs/sharing/reference/send-dialog]
-The Graph API
Permissions are handled strictly with Login, so parameter should always be empty:
'''
facebookConnectPluginBB10.api("me?fields=permissions", [],app.successHandler, app.errorHandler)
'''
-Events:
Not supported because it is only supported by Android and iOS platforms