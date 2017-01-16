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

 - `enableExperimental` is used to enable experimental features, they are disabled by default.

 - `shortPageTitle` is used as prefix for page title.
   Also it is rendered in sidebar header if logo is not specified

 - `modePageTitle` is used as default page title if it's not specified explicitly

 - `loginLogo` is rendered on login / signup page, if specified

 - `sidebarLogo` is rendered in sidebar header, if specified

## Configuring Terms of Service

Terms of service are located in file `views/tos/index.html`

In order to use custom Terms of Service, you may configure alias in Nginx. For example:

  location /views/tos/index.html {
    alias /var/www/waldur/tos.html;
  }
