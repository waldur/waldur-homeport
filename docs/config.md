# Configuration guide

Configuration options are separated from the application source code and are stored in JSON files.
After application assets have been loaded, but before application is bootstrapped,
configuration files are loaded and their options are merged together with default settings.

## Configuration files:

 - /scripts/configs/base-config.js - default configuration settings.

 - /scripts/configs/modes/stable.js - stable mode configuration settings.

 - /scripts/configs/modes/experimental.js - experimental mode configuration settings.

 - /scripts/configs/config.json - custom configuration settings.

## Configuration options

 - `apiEndpoint` - Waldur MasterMind REST API server address.

 - `enableExperimental` is used to enable experimental features, they are disabled by default.

 - `SENTRY_DSN` should contain valid Data Source Name in order to connect Sentry.

## Authentication methods

There are several authentication methods available:

 - LOCAL_SIGNIN - allows to sign in using username and password.

 - LOCAL_SIGNUP - allows to sign up using username and password.

 - SOCIAL_SIGNUP - allows to sign in and sign up using either Google or Facebook OAuth.
   It is implemented using Satellizer plugin.

 - ESTONIAN_ID - allows to sign in and sign up using either Estonian ID card or Mobile ID.
   It is implemented using Waldur OpenID plugin.

In order to enable or disable authentication methods, you should use the following options:

 - `authenticationMethods` should contain list of enabled authentication methods.
    By default all of them are enabled.

 - `googleClientId` - ID of Google application used for OAuth authentication.
    It is required if you use SOCIAL_SIGNUP method.

 - `facebookClientId` - ID of Facebook application used for OAuth authentication.
    It is required if you use SOCIAL_SIGNUP method.

 - `GoogleAnalyticsID` - Google Analytics ID, used for tracking, if specified, disabled by default.

## White-labeling

 - `shortPageTitle` is used as prefix for page title.
   Also it is rendered in sidebar header if logo is not specified

 - `modePageTitle` is used as default page title if it's not specified explicitly

 - `loginLogo` is rendered on login / signup page, if specified

 - `sidebarLogo` is rendered in sidebar header, if specified

## Configuring flat pages

 - Terms of Service are located in file `views/tos/index.html`

 - Privacy Statement is located in file `views/policy/privacy.html`

In order to customize it, you may configure alias in Nginx. For example:

  location /views/tos/index.html {
    alias /var/www/waldur/tos.html;
  }

  location /views/policy/privacy.html {
    alias /var/www/waldur/privacy.html;
  }
