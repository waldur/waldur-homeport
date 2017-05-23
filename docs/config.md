# Configuration guide

Configuration options are separated from the application source code and are stored in JSON files.
After application assets have been loaded, but before application is bootstrapped,
configuration files are loaded and their options are merged together with default settings.

## Configuration files:

 - /scripts/components/configs/base-config.js - default configuration settings.

 - /scripts/components/configs/modes/stable.js - stable mode configuration settings.

 - /scripts/components/configs/modes/experimental.js - experimental mode configuration settings.

 - /scripts/components/configs/config.json - custom configuration settings.

Please follow [Administration guide](https://opennode.atlassian.net/wiki/display/WD/HomePort+configuration) to learn more.
