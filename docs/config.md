# Configuration options

Configuration options are separated from the application source code and are stored in JSON files.
After application assets have been loaded, but before application is bootstrapped,
configuration files are loaded and their options are merged together with default settings.
They are specified in /scripts/configs/base-config.js

There are three environments: development, staging and production.
For development and staging environments configuration options are stored in two files:
/scripts/configs/custom-config.json and /scripts/configs/mode-config.json
For production environment settings are stored in single file: /scripts/configs/config.json

## White-labeling

There are several white-labeling options:

 - `shortPageTitle` is used as prefix for page title.
   Also it is rendered in sidebar header if logo is not specified

 - `modePageTitle` is used as default page title if it's not specified explicitly

 - `loginLogo` is rendered on login / signup page, if specified

 - `sidebarLogo` is rendered in sidebar header, if specified
